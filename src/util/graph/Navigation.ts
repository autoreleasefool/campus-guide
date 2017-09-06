/**
 *
 * @license
 * Copyright (C) 2016-2017 Joseph Roque
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author Joseph Roque
 * @created 2017-08-03
 * @file Navigation.ts
 * @description Search graphs and create directions.
 */

import * as Configuration from '../Configuration';
import FastPriorityQueue from 'fastpriorityqueue';
import { default as Node, Type as NodeType } from './Node';

/** Possible states for parsing graphs. */
enum GraphParseState {
  Format = '[FORMAT]',
  Edges = '[EDGES]',
  Excluded = '[EXCLUDED]',
  Nodes = '[NODES]',
  Streets = '[STREETS]',
  None = 'NONE',
}

/** Intermediate interface for building a path. */
interface PartialPath {
  dist: number;
  node: Node | undefined;
}

/** Pair of doors and the distance associated with them, for sorting. */
interface DoorPair {
  exit: Node;       // Exit from the first building
  entrance: Node;   // Entrance to the second building
  distance: number; // Distance between the two doors
}

/** Possible directions that edges travel. */
export enum EdgeDirection {
  Down = 'D',
  Left = 'L',
  Right = 'R',
  Up = 'U',
}

/** Graph edge details. */
export interface Edge {
  node: Node;
  direction: EdgeDirection;
  distance: number;
  accessible: boolean;
}

/** Graph information for determining steps. */
export interface BuildingGraph {
  adjacencies: Map<Node, Edge[]>;
  excluded: Map<Node, Set<Node>>;
  exits: Set<Node>;
  extra: Map<Node, any>;
  format: Map<string, string>;
  streets: Map<string, string>;
}

/** A path from a start to a target destination. */
export interface Path {
  distance: number;
  edges: Edge[];
  source: Node;
}

/** Compare two paths. */
const partialPathComparator = (a: PartialPath, b: PartialPath): boolean => {
  return a.dist < b.dist;
};

/** Compare two door pairs. */
const doorPairingComparator = (a: DoorPair, b: DoorPair): boolean => {
  return a.distance < b.distance;
};

/** Node instances cached by their ID. */
const graphNodeCache = new Map<string, Node>();

/** Ratio of units outside to 10m */
export const OUTER_UNIT_TO_M = 1.7;
/** Ratio of units inside to 10m */
export const INNER_UNIT_TO_M = 0.29;

/**
 * Get a node from the cache if available, or build it and add it to the cache.
 *
 * @param id       node ID
 * @param building building the node is in
 * @param formats  additional formatting rules
 */
export function getCachedNodeOrBuild(id: string, building: string, formats: Map<string, string>): Node {
  const nodeId = Node.buildId(id, building);
  const node = graphNodeCache.has(nodeId)
      ? graphNodeCache.get(nodeId)
      : new Node(nodeId, building, formats);
  graphNodeCache.set(nodeId, node);

  return node;
}

/**
 * Parse a graph formatting rule and add it to the existing graph.
 *
 * @param {BuildingGraph} graph     building graph to add node to
 * @param {string}        rawFormat the rule details to parse
 */
function _parseAndAppendGraphFormat(graph: BuildingGraph, rawFormat: string): void {
  const elements = rawFormat.split('=');
  graph.format.set(elements[0], elements[1]);
}

/**
 * Parse a list of Edge and add them to the existing graph.
 *
 * @param {Node}          node     the node connected to the edges
 * @param {string}        building the building which the graph belongs to
 * @param {BuildingGraph} graph    building graph to add edges to
 * @param {string}        rawEdges the edge details to parse
 */
function _parseAndAppendEdges(node: Node, building: string, graph: BuildingGraph, rawEdges: string): void {
  const connections: Edge[] = graph.adjacencies.has(node) ? graph.adjacencies.get(node) : [];

  // Add doors to the graph
  if (node.getType() === NodeType.Door) {
    graph.exits.add(node);
  }

  const edges = rawEdges.split(',');
  for (const edge of edges) {
    const edgeElements = edge.split(':');

    /* tslint:disable no-magic-numbers */
    connections.push({
      accessible: edgeElements[3] === 'T',
      direction: edgeElements[1] as EdgeDirection,
      distance: parseInt(edgeElements[2]),
      node: getCachedNodeOrBuild(edgeElements[0], building, graph.format),
    });
    /* tslint:enable no-magic-numbers */
  }

  graph.adjacencies.set(node, connections);
}

/**
 * Parse a Node and add it to the existing graph.
 *
 * @param {Node}          node     the node to add
 * @param {BuildingGraph} graph    building graph to add node to
 * @param {string}        rawNode  the node details to parse
 */
function _parseAndAppendNode(node: Node, graph: BuildingGraph, rawNode: string): void {
  switch (node.getType()) {
    case NodeType.Intersection:
    case NodeType.Street:
    case NodeType.Door:
      graph.extra.set(node, rawNode);
      break;
    default:
      // does nothing
  }
}

/**
 * Parse an excluded edge and add it to the existing graph.
 *
 * @param {Node}          nodeA the first excluded node
 * @param {Node}         nodeB the second excluded node
 * @param {BuildingGraph} graph building  graph to add exclusion to
 */
function _parseAndAppendExcludedNode(nodeA: Node, nodeB: Node, graph: BuildingGraph): void {
  const excluded = graph.excluded.has(nodeA) ? graph.excluded.get(nodeA) : new Set<Node>();
  excluded.add(nodeB);
  graph.excluded.set(nodeA, excluded);
}

/**
 * Parse a street name and add it to the existing graph.
 *
 * @param id
 * @param streetName
 */
function _parseAndAppendStreet(id: string, streetName: string, graph: BuildingGraph): void {
  graph.streets.set(id, streetName);
}

/**
 * Get the path from a start node to a target node.
 *
 * @param {Node}           startNode  starting node
 * @param {Node}           targetNode target node
 * @param {number}         distance   distance of path
 * @param {Map<Node,Node>} previous   node which led to another node
 * @param {BuildingGraph}  graph      adjacency graph
 * @param {boolean}        reverse    true to build a path from target to start
 */
function _rebuildPath(
    startNode: Node,
    targetNode: Node,
    distance: number,
    previous: Map<Node, Node>,
    graph: BuildingGraph,
    reverse: boolean): Path {
  const path: Path = {
    distance,
    edges: [],
    source: startNode,
  };

  let currentNode = targetNode;
  let previousNode = previous.get(targetNode);
  while (previousNode != undefined) {
    if (reverse) {
      for (const edge of graph.adjacencies.get(currentNode)) {
        if (edge.node === previousNode) {
          currentNode = previousNode;
          previousNode = previous.get(currentNode);
          path.edges.push(edge);
        }
      }
    } else {
      for (const edge of graph.adjacencies.get(previousNode)) {
        if (edge.node === currentNode) {
          currentNode = previousNode;
          previousNode = previous.get(currentNode);
          path.edges.push(edge);
          break;
        }
      }
    }
  }

  if (reverse) {
    path.source = targetNode;
  } else {
    path.edges.reverse();
  }

  return path;
}

/**
 * Gets the requested set of BuildingGraph instances, mapped to their shorthands.
 *
 * @param {Set<string>} buildings set of building identifiers
 * @returns {Promise<Map<BuildingGraph>>} map of building shorthands to BuildingGraphs
 */
export async function getBuildingGraphs(buildings: Set<string>): Promise<Map<string, BuildingGraph>> {
  const graphs: Map<string, BuildingGraph> = new Map();
  for (const building of buildings) {
    const graph: BuildingGraph = {
      adjacencies: new Map(),
      excluded: new Map(),
      exits: new Set(),
      extra: new Map(),
      format: new Map(),
      streets: new Map(),
    };

    const rawGraph = await Configuration.getTextFile(`/${building}_graph.txt`);
    const elements = rawGraph.split('\n');

    let state = GraphParseState.None;
    for (const element of elements) {
      if (element.length === 0) {
        continue;
      }

      // Handle state switch
      if (element.charAt(0) === '[') {
        switch (element) {
          case GraphParseState.Format:
            state = GraphParseState.Format;
            break;
          case GraphParseState.Edges:
            state = GraphParseState.Edges;
            break;
          case GraphParseState.Excluded:
            state = GraphParseState.Excluded;
            break;
          case GraphParseState.Nodes:
            state = GraphParseState.Nodes;
            break;
          case GraphParseState.Streets:
            state = GraphParseState.Streets;
            break;
          default:
            state = GraphParseState.None;
        }
        continue;
      }

      // If no state was set, skip element
      if (state === GraphParseState.None) {
        continue;
      }

      const graphComponents = element.split('|');

      switch (state) {
        case GraphParseState.Format:
          _parseAndAppendGraphFormat(graph, element);
          break;
        case GraphParseState.Edges: {
          const node = getCachedNodeOrBuild(graphComponents[0], building, graph.format);
          _parseAndAppendEdges(node, building, graph, graphComponents[1]);
          break;
        }
        case GraphParseState.Nodes: {
          const node = getCachedNodeOrBuild(graphComponents[0], building, graph.format);
          _parseAndAppendNode(node, graph, graphComponents[1]);
          break;
        }
        case GraphParseState.Excluded: {
          const nodeA = getCachedNodeOrBuild(graphComponents[0], building, graph.format);
          const nodeB = getCachedNodeOrBuild(graphComponents[1], building, graph.format);
          _parseAndAppendExcludedNode(nodeA, nodeB, graph);
          _parseAndAppendExcludedNode(nodeB, nodeA, graph);
          break;
        }
        case GraphParseState.Streets: {
          _parseAndAppendStreet(graphComponents[0], graphComponents[1], graph);
          break;
        }
        default:
          // Do nothing
      }
    }
    graphs.set(building, graph);
  }

  return graphs;
}

/**
 * Find the shortest path in a graph between two nodes.
 *
 * @param {Node}          startNode  path start
 * @param {Node}          targetNode path end
 * @param {BuildingGraph} graph      graph to generate path from
 * @param {boolean}       accessible true to force an accessible path, false for any path
 * @param {boolean}       reverse    true to return path from target to start
 * @returns {Path|undefined} the path between the startNode and targetNode, or undefined if
 *                           there isn't one
 */
export function findShortestPathBetween(
    startNode: Node,
    targetNode: Node,
    graph: BuildingGraph,
    accessible: boolean,
    reverse: boolean): Path | undefined {
  const targetSet: Set<Node> = new Set();
  targetSet.add(targetNode);
  const paths = findShortestPathsBetween(startNode, targetSet, graph, accessible, reverse);

  return paths.get(targetNode);
}

/**
 * Given a starting node, returns the shortest path from the starting node to each of the target nodes.
 * See https://github.com/mburst/dijkstras-algorithm/blob/524c76fd26e2d522d9d53e2acb10fc72ea99e266/dijkstras.js#L1
 *
 * @param {Node}          startNode   starting node for paths
 * @param {Set<Node>}     targetNodes set of nodes to reach
 * @param {BuildingGraph} graph       graph of building with edges and distances
 * @param {boolean}       accessible true to force an accessible path, false for any path
 * @param {boolean}       reverse    true to return path from target to start
 * @returns {Map<Node, Path>} mapping from the target node to the path to it from the starting node
 */
export function findShortestPathsBetween(
    startNode: Node,
    targetNodes: Set<Node>,
    graph: BuildingGraph,
    accessible: boolean,
    reverse: boolean): Map<Node, Path> {
  const paths: Map<Node, Path> = new Map();
  const targetsFound: Set<Node> = new Set();

  const nodes = new FastPriorityQueue(partialPathComparator);
  const distances: Map<Node, number> = new Map();
  const previous: Map<Node, Node> = new Map();

  for (const node of graph.adjacencies.keys()) {
    if (node === startNode) {
      distances.set(node, 0);
      nodes.add({ dist: 0, node });
    } else {
      distances.set(node, Infinity);
      nodes.add({ dist: Infinity, node });
    }
  }

  while (!nodes.isEmpty()) {
    const smallest = nodes.poll();

    if (smallest == undefined || distances.get(smallest.node) === Infinity) {
      continue;
    }

    if (targetNodes.has(smallest.node) && !targetsFound.has(smallest.node)) {
      targetsFound.add(smallest.node);
      if (targetsFound.size === targetNodes.size) {
        break;
      }
    }

    for (const neighbor of graph.adjacencies.get(smallest.node)) {
      if (neighbor.node.getType() === NodeType.Room && !targetNodes.has(neighbor.node)) {
        // Optimization: You'll never have to pass through a room to get to another room, so skip nodes
        // that aren't targets
        continue;
      }

      if ((accessible && !(neighbor.accessible || neighbor.node.isAccessible()))
          || graph.excluded.has(smallest.node) && graph.excluded.get(smallest.node).has(neighbor.node)) {
        // Skip non-accessible edges when the user wants an accessible route, and skip
        // routes which are closed.
        continue;
      }

      const alt = distances.get(smallest.node) + neighbor.distance;
      if (alt < distances.get(neighbor.node)) {
        distances.set(neighbor.node, alt);
        previous.set(neighbor.node, smallest.node);
        nodes.add({ dist: alt, node: neighbor.node });
      }
    }
  }

  for (const node of targetNodes) {
    if (targetsFound.has(node)) {
      paths.set(node, _rebuildPath(startNode, node, distances.get(node), previous, graph, reverse));
    }
  }

  return paths;
}

/**
 * Given two sets of doors and their coordinates, get all of the distances between each combination of doors.
 *
 * @param {Set<Node>}     firstDoors  first set of doors
 * @param {Set<Node>}     secondDoors second set of doors
 * @param {BuildingGraph} graph       graph information
 * @returns {Map<Node,Map<Node,number>>} map from first set of doors to second set, to the distances between
 */
export function findDistancesBetweenDoors(
    firstDoors: Set<Node>,
    secondDoors: Set<Node>,
    graph: BuildingGraph): Map<Node, Map<Node, number>> {
  const distances: Map<Node, Map<Node, number>> = new Map();
  const positions: Map<Node, { x: number; y: number }> = new Map();

  const getDoorPosition = (door: Node): { x: number; y: number } => {
    let doorPosition = positions.get(door);
    if (doorPosition == undefined) {
      const rawPosition = graph.extra.get(door).split(',');
      doorPosition = { x: parseFloat(rawPosition[0]), y: parseFloat(rawPosition[0]) };
      positions.set(door, doorPosition);
    }

    return doorPosition;
  };

  for (const firstDoor of firstDoors) {
    const firstDoorDistances: Map<Node, number> = new Map();
    distances.set(firstDoor, firstDoorDistances);
    for (const secondDoor of secondDoors) {
      const firstDoorPosition = getDoorPosition(firstDoor);
      const secondDoorPosition = getDoorPosition(secondDoor);
      const distance = Math.sqrt(
        Math.pow(secondDoorPosition.x - firstDoorPosition.x, 2)
        + Math.pow(secondDoorPosition.y - firstDoorPosition.y, 2)
      );

      firstDoorDistances.set(secondDoor, distance);
    }
  }

  return distances;
}

/**
 * Builds the shortest path possible between two nodes across multiple graphs.
 *
 * @param {Map<Node, Path>}              startToExits          shortest paths from the start node to each exit
 * @param {Map<Node, Path>}              exitsToTarget         shortest paths from the target node to each exit
 * @param {Map<Node, Map<Node, number>>} distancesBetweenExits distances between each pair of building entrances
 * @param {Map<string, BuildingGraph>}   graphs                graphs for each building
 * @param {boolean}                      accessible            true to force an accessible path, false for any path
 * @returns {Path|undefined} the shortest path between the nodes, or undefined if there are no possible paths
 */
export function getShortestPathAcross(
    startToExits: Map<Node, Path>,
    exitsToTarget: Map<Node, Path>,
    distancesBetweenExits: Map<Node, Map<Node, number>>,
    graphs: Map<string, BuildingGraph>,
    accessible: boolean): Path | undefined {

  const doorPairings = new FastPriorityQueue(doorPairingComparator);

  for (const exit of startToExits.keys()) {
    for (const entrance of exitsToTarget.keys()) {
      // TODO: adjust path distances inside buildings to give less weight than those outside
      const exitPath = startToExits.get(exit);
      const entrancePath = exitsToTarget.get(entrance);
      if (exitPath == undefined || entrancePath == undefined) {
        // Path could not be found between the start and door, possibly because it's closed,
        // possibly because the user wants it to be accessible
        continue;
      }

      let distance = exitPath.distance * INNER_UNIT_TO_M;
      distance += entrancePath.distance * INNER_UNIT_TO_M;
      distance += distancesBetweenExits.get(exit).get(entrance) * OUTER_UNIT_TO_M;

      doorPairings.add({
        distance,
        entrance,
        exit,
      });
    }
  }

  let doors: DoorPair = doorPairings.poll();
  while (doors != undefined) {
    const outerPath = findShortestPathBetween(doors.exit, doors.entrance, graphs.get('OUT'), accessible, false);
    if (outerPath == undefined) {
      doors = doorPairings.poll();
      continue;
    }

    const firstPathComponent = startToExits.get(doors.exit);
    const secondPathComponent = exitsToTarget.get(doors.entrance);

    return {
      distance: firstPathComponent.distance + outerPath.distance + secondPathComponent.distance,
      edges: firstPathComponent.edges.concat(outerPath.edges, secondPathComponent.edges),
      source: firstPathComponent.source,
    };
  }

  return undefined;
}