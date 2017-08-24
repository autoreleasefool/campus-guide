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
import * as FastPriorityQueue from 'fastpriorityqueue';
import { default as Node, Type as NodeType } from './Node';

/** Possible states for parsing graphs. */
enum GraphParseState {
  Format = '[FORMAT]',
  Edges = '[EDGES]',
  Excluded = '[EXCLUDED]',
  Nodes = '[NODES]',
  None = 'NONE',
}

/** Intermediate interface for building a path. */
interface PartialPath {
  dist: number;
  node: Node | undefined;
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

/** Graph information for determing steps. */
export interface BuildingGraph {
  adjacencies: Map<Node, Edge[]>;
  excluded: Map<Node, Set<Node>>;
  exits: Set<Node>;
  extra: Map<Node, any>;
  format: Map<string, string>;
}

/** A path from a start to a target destination. */
export interface Path {
  distance: number;
  edges: Edge[];
  source: Node;
}

/** Compare two paths */
const partialPathComparator = (a: PartialPath, b: PartialPath): boolean => {
  return a.dist < b.dist;
};

/** Node instances cached by their ID. */
const graphNodeCache = new Map<string, Node>();

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
 * @param {BuildingGraph} graph    building graph to add edges to
 * @param {string}        rawEdges the edge details to parse
 */
function _parseAndAppendEdges(node: Node, graph: BuildingGraph, rawEdges: string): void {
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
      node,
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
    case NodeType.Elevator:
    case NodeType.Street:
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

// startNode, targetNode, distances.get(targetNode), previous, graph);

/**
 * Get the path from a start node to a target node.
 *
 * @param startNode  starting node
 * @param targetNode target node
 * @param distance   distance of path
 * @param previous   node which led to another node
 * @param graph      adjacency graph
 */
function _rebuildPath(
    startNode: Node,
    targetNode: Node,
    distance: number,
    previous: Map<Node, Node>,
    graph: BuildingGraph): Path {
  const path: Path = {
    distance,
    edges: [],
    source: startNode,
  };

  let currentNode = targetNode;
  while (currentNode != undefined) {
    for (const edge of graph.adjacencies.get(currentNode)) {
      if (edge.node === currentNode) {
        currentNode = previous.get(currentNode);
        path.edges.push(edge);
        break;
      }
    }
  }

  path.edges.reverse();

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
    };

    const rawGraph = await Configuration.getTextFile(`/${building}_graph.txt`);
    const elements = rawGraph.split('\n');

    let state = GraphParseState.None;
    for (const element of elements) {
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
          _parseAndAppendEdges(node, graph, graphComponents[1]);
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
          break;
        }
        default:
          // Do nothing
      }

      graphs.set(building, graph);
    }
  }

  return graphs;
}

/**
 * Find the shortest path in a graph between two nodes.
 *
 * @param {Node}          startNode  path start
 * @param {Node}          targetNode path end
 * @param {BuildingGraph} graph      graph to generate path from
 */
export function findShortestPathBetween(startNode: Node, targetNode: Node, graph: BuildingGraph): Path {
  const targetSet: Set<Node> = new Set();
  targetSet.add(targetNode);
  const paths = findShortestPathsBetween(startNode, targetSet, graph);

  return paths.get(targetNode);
}

/**
 * Given a starting node, returns the shortest path from the starting node to each of the target nodes.
 * See https://github.com/mburst/dijkstras-algorithm/blob/524c76fd26e2d522d9d53e2acb10fc72ea99e266/dijkstras.js#L1
 *
 * @param {Node}          startNode   starting node for paths
 * @param {Set<Node>}     targetNodes set of nodes to reach
 * @param {BuildingGraph} graph       graph of building with edges and distances
 * @returns {Map<Node, Path>} mapping from the target node to the path to it from the starting node
 */
export function findShortestPathsBetween(
    startNode: Node,
    targetNodes: Set<Node>,
    graph: BuildingGraph): Map<Node, Path> {
  const paths: Map<Node, Path> = new Map();

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

  let targetsFound = 0;
  while (!nodes.isEmpty()) {
    const smallest = nodes.poll();

    if (targetNodes.has(smallest)) {
      targetsFound += 1;
      if (targetsFound === targetNodes.size) {
        break;
      }
    }

    if (smallest == undefined || distances.get(smallest) === Infinity) {
      continue;
    }

    for (const neighbor of graph.adjacencies.get(smallest)) {
      const alt = distances.get(smallest) + neighbor.distance;
      if (alt < distances.get(neighbor.node)) {
        distances.set(neighbor.node, alt);
        previous.set(neighbor.node, smallest);
        nodes.add({ dist: alt, node: neighbor.node });
      }
    }
  }

  for (const node of targetNodes) {
    paths.set(node, _rebuildPath(startNode, node, distances.get(node), previous, graph));
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
 */
export function getShortestPathAcross(
    startToExits: Map<Node, Path>,
    exitsToTarget: Map<Node, Path>,
    distancesBetweenExits: Map<Node, Map<Node, number>>,
    graphs: Map<string, BuildingGraph>): Path {

  let exitNode: Node;
  let entranceNode: Node;
  let minimumDistance = Infinity;
  for (const exit of startToExits.keys()) {
    for (const entrance of exitsToTarget.keys()) {
      let pathDistance = startToExits.get(exit).distance;
      pathDistance += exitsToTarget.get(entrance).distance;
      pathDistance += distancesBetweenExits.get(exit).get(entrance);
      if (pathDistance < minimumDistance) {
        minimumDistance = pathDistance;
        exitNode = exit;
        entranceNode = entrance;
      }
    }
  }

  const firstPathComponent = startToExits.get(exitNode);
  const outerPath = findShortestPathBetween(exitNode, entranceNode, graphs.get('OUT'));
  const secondPathComponent = exitsToTarget.get(entranceNode);

  return {
    distance: firstPathComponent.distance + outerPath.distance + secondPathComponent.distance,
    edges: firstPathComponent.edges.concat(outerPath.edges, secondPathComponent.edges),
    source: firstPathComponent.source,
  };
}