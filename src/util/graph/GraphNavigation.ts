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
 * @file GraphNavigation.ts
 * @description Search graphs and create directions.
 */

import * as Configuration from '../Configuration';
import * as FastPriorityQueue from 'fastpriorityqueue';
import { default as GraphNode, NodeType } from './GraphNode';

import { Destination } from '../../../typings/university';

/** Possible directions that edges travel. */
enum EdgeDirection {
  Down = 'D',
  Left = 'L',
  Right = 'R',
  Up = 'U',
}

/** Possible directions for path traversal. */
enum Direction {
  Left,
  Right,
  Straight,
}

/** Possible states for parsing graphs. */
enum GraphParseState {
  Format = '[FORMAT]',
  Edges = '[EDGES]',
  Excluded = '[EXCLUDED]',
  Nodes = '[NODES]',
  None = 'NONE',
}

/** Graph edge details. */
interface GraphEdge {
  node: GraphNode;
  direction: EdgeDirection;
  distance: number;
  accessible: boolean;
}

/** Graph information for determing steps. */
export interface BuildingGraph {
  adjacencies: Map<GraphNode, GraphEdge[]>;
  excluded: Map<GraphNode, Set<GraphNode>>;
  exits: Set<GraphNode>;
  extra: Map<GraphNode, any>;
  format: Map<string, string>;
}

/** A path from a start to a target destination. */
interface Path {
  distance: number;
  edges: GraphEdge[];
  source: GraphNode;
}

/** Intermediate interface for building a path. */
interface PartialPath {
  dist: number;
  source: GraphNode | undefined;
}

/** Compare two paths */
const partialPathComparator = (a: PartialPath, b: PartialPath): boolean => {
  return a.dist < b.dist;
};

/** GraphNode instances cached by their ID. */
const graphNodeCache = new Map<string, GraphNode>();

/**
 * Get a node from the cache if available, or build it and add it to the cache.
 *
 * @param id       node ID
 * @param building building the node is in
 * @param formats  additional formatting rules
 */
function getCachedNodeOrBuild(id: string, building: string, formats: Map<string, string>): GraphNode {
  const nodeId = GraphNode.buildId(id, building);
  const node = graphNodeCache.has(nodeId)
      ? graphNodeCache.get(nodeId)
      : new GraphNode(nodeId, building, formats);
  graphNodeCache.set(nodeId, node);

  return node;
}

/**
 * Parse a graph formatting rule and add it to the existing graph.
 *
 * @param {BuildingGraph} graph     building graph to add node to
 * @param {string}        rawFormat the rule details to parse
 */
function parseAndAppendGraphFormat(graph: BuildingGraph, rawFormat: string): void {
  const elements = rawFormat.split('=');
  graph.format.set(elements[0], elements[1]);
}

/**
 * Parse a list of GraphEdge and add them to the existing graph.
 *
 * @param {GraphNode}     node     the node connected to the edges
 * @param {BuildingGraph} graph    building graph to add edges to
 * @param {string}        rawEdges the edge details to parse
 */
function parseAndAppendGraphEdges(node: GraphNode, graph: BuildingGraph, rawEdges: string): void {
  const connections: GraphEdge[] = graph.adjacencies.has(node) ? graph.adjacencies.get(node) : [];

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
 * Parse a GraphNode and add it to the existing graph.
 *
 * @param {GraphNode}     node     the node to add
 * @param {BuildingGraph} graph    building graph to add node to
 * @param {string}        rawNode  the node details to parse
 */
function parseAndAppendGraphNode(node: GraphNode, graph: BuildingGraph, rawNode: string): void {
  if (node.getType() === NodeType.Elevator) {
    graph.extra.set(node, {
      additional: rawNode.split(','),
    });
  }
}

/**
 * Parse an excluded edge and add it to the existing graph.
 *
 * @param {GraphNode}     nodeA the first excluded node
 * @param {GraphNode}     nodeB the second excluded node
 * @param {BuildingGraph} graph building graph to add exclusion to
 */
function parseAndAppendExcludedNode(nodeA: GraphNode, nodeB: GraphNode, graph: BuildingGraph): void {
  const excluded = graph.excluded.has(nodeA) ? graph.excluded.get(nodeA) : new Set<GraphNode>();
  excluded.add(nodeB);
  graph.excluded.set(nodeA, excluded);
}

/**
 * Gets the requested set of BuildingGraph instances, mapped to their shorthands.
 *
 * @param {Set<string>} buildings set of building identifiers
 * @returns {Promise<Map<BuildingGraph>>} map of building shorthands to BuildingGraphs
 */
async function getBuildingGraphs(buildings: Set<string>): Promise<Map<string, BuildingGraph>> {
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
          parseAndAppendGraphFormat(graph, element);
          break;
        case GraphParseState.Edges: {
          const node = getCachedNodeOrBuild(graphComponents[0], building, graph.format);
          parseAndAppendGraphEdges(node, graph, graphComponents[1]);
          break;
        }
        case GraphParseState.Nodes: {
          const node = getCachedNodeOrBuild(graphComponents[0], building, graph.format);
          parseAndAppendGraphNode(node, graph, graphComponents[1]);
          break;
        }
        case GraphParseState.Excluded: {
          const nodeA = getCachedNodeOrBuild(graphComponents[0], building, graph.format);
          const nodeB = getCachedNodeOrBuild(graphComponents[1], building, graph.format);
          parseAndAppendExcludedNode(nodeA, nodeB, graph);
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
 * @param {Destination}   start  path start
 * @param {Destination}   target path end
 * @param {BuildingGraph} graph  graph to generate path from
 */
function findShortestPathBetween(start: Destination, target: Destination, graph: BuildingGraph): Path {
  const visited = new FastPriorityQueue(partialPathComparator);
  const partialPaths = new Map<GraphNode, PartialPath>();
  const unvisited = new Set(graph.adjacencies.keys());

  // Setup initial node
  const startNode = new GraphNode(`R${start.room || start.shorthand}`, start.shorthand, graph.format);
  let currentNode = startNode;
  let currentNodeState = { dist: 0, source: undefined };
  partialPaths.set(currentNode, currentNodeState);

  // Setup target node
  const targetNode = new GraphNode(`R${target.room || target.shorthand}`, target.shorthand, graph.format);
  let targetFound = false;

  while (!targetFound && unvisited.size > 0 && currentNode != undefined) {
    for (const neighbor of graph.adjacencies.get(currentNode)) {
      const currentNeighborState = partialPaths.get(neighbor.node);
      const neighborDistance = currentNodeState.dist + neighbor.distance;
      if (currentNeighborState != undefined) {
        if (currentNeighborState.dist > neighborDistance) {
          currentNeighborState.dist = neighborDistance;
          currentNeighborState.source = currentNode;
        }
      } else {
        partialPaths.set(neighbor.node, { dist: neighbor.distance, source: currentNode });
        visited.add({ dist: neighborDistance, source: neighbor.node });
      }

      if (neighbor.node === targetNode) {
        targetFound = true;
        break;
      }
    }

    unvisited.delete(currentNode);
    currentNode = visited.poll().source;
    currentNodeState = partialPaths.get(currentNode);
  }

  const path: Path = {
    distance: 0,
    edges: [],
    source: startNode,
  };

  currentNode = targetNode;
  while (currentNode != undefined) {
    const partialPath = partialPaths.get(currentNode);
    path.distance += partialPath.dist;
    for (const edge of graph.adjacencies.get(partialPath.source)) {
      if (edge.node === currentNode) {
        path.edges.push(edge);
        break;
      }
    }
  }

  path.edges.reverse();

  return path;
}

/**
 * Count the number of halls skipped when walking a certain direction down a hallway.
 *
 * @param {GraphEdge[]}   adjacentEdges the edges being passed
 * @param {EdgeDirection} direction     the current traveling direction
 * @returns {object} l, r, and s, representing the number of missed left, right and straight hallways
 */
function countMissedHalls(adjacentEdges: GraphEdge[], direction: EdgeDirection): { l: number; r: number; s: number } {
  let left = 0;
  let right = 0;
  let straight = 0;

  for (const edge of adjacentEdges) {
    if (edge.node.getType() !== NodeType.Hallway) {
      continue;
    }

    if (edge.direction === direction) {
      straight += 1;
      continue;
    }

    switch (direction) {
      case EdgeDirection.Down:
        if (edge.direction === EdgeDirection.Left) {
          right += 1;
        } else if (edge.direction === EdgeDirection.Right) {
          left += 1;
        }
        break;
      case EdgeDirection.Up:
        if (edge.direction === EdgeDirection.Right) {
          right += 1;
        } else if (edge.direction === EdgeDirection.Left) {
          left += 1;
        }
        break;
      case EdgeDirection.Left:
        if (edge.direction === EdgeDirection.Up) {
          right += 1;
        } else if (edge.direction === EdgeDirection.Down) {
          left += 1;
        }
        break;
      case EdgeDirection.Right:
        if (edge.direction === EdgeDirection.Down) {
          right += 1;
        } else if (edge.direction === EdgeDirection.Up) {
          left += 1;
        }
        break;
      default:
        throw new Error(`Invalid edge direction '${direction}'`);
    }
  }

  return { l: left, r: right, s: straight };
}

/**
 * Build step-by-step directions to travel along a path.
 *
 * @param {Path} path the path to follow
 * @returns {string[]} a list of directions
 */
function buildDirectionsFromPath(path: Path, graphs: Map<string, BuildingGraph>): string[] {
  const directions: string[] = [];
  const totalEdges = path.edges.length;

  let currentDirection: Direction | undefined;
  let missedLeftHalls = 0;
  let missedRightHalls = 0;
  let missedStraightHalls = 0;

  for (let i = 0; i < totalEdges; i++) {
    const nextNode = path.edges[i].node;
    let nextDirection = Direction.Straight;

    if (i < totalEdges - 2) {

      const nextNodeType = nextNode.getType();
      if (nextNodeType === NodeType.Elevator || nextNodeType === NodeType.Stairs) {
        const typeName = nextNodeType === NodeType.Elevator ? 'Elevator' : 'Staircase';
        directions.push(`Take ${typeName} ${nextNode.getName()} `);
        continue;
      }

      /* tslint:disable no-multi-spaces */
      /* Better to line up statements */

      if (
          (path.edges[i].direction === EdgeDirection.Down  && path.edges[i + 1].direction === EdgeDirection.Left) ||
          (path.edges[i].direction === EdgeDirection.Up    && path.edges[i + 1].direction === EdgeDirection.Right) ||
          (path.edges[i].direction === EdgeDirection.Left  && path.edges[i + 1].direction === EdgeDirection.Up) ||
          (path.edges[i].direction === EdgeDirection.Right && path.edges[i + 1].direction === EdgeDirection.Down)) {
        nextDirection = Direction.Right;
      } else if (
          (path.edges[i].direction === EdgeDirection.Down  && path.edges[i + 1].direction === EdgeDirection.Right) ||
          (path.edges[i].direction === EdgeDirection.Up    && path.edges[i + 1].direction === EdgeDirection.Left) ||
          (path.edges[i].direction === EdgeDirection.Left  && path.edges[i + 1].direction === EdgeDirection.Down) ||
          (path.edges[i].direction === EdgeDirection.Right && path.edges[i + 1].direction === EdgeDirection.Up)) {
        nextDirection = Direction.Left;
      }

      /* tslint:enable no-multi-spaces */

      const previousNode = i === 0 ? path.source : path.edges[i - 1].node;
      if (previousNode.getType() === NodeType.Room) {
        const roomCommand =
            nextDirection === Direction.Left ? 'turn left' :
            nextDirection === Direction.Right ? 'turn right' :
            'proceed straight';
        directions.push(`Exit ${previousNode.getName()} and ${roomCommand}.`);
      }

      if (nextDirection === currentDirection) {
        const skippedNode = path.edges[i].node;
        const adjacentEdges = graphs.get(skippedNode.getBuilding()).adjacencies.get(skippedNode);
        const missedHalls = countMissedHalls(adjacentEdges, path.edges[i].direction);
        missedLeftHalls += missedHalls.l;
        missedRightHalls += missedHalls.r;
        missedStraightHalls += missedHalls.s;
      } else {
        currentDirection = nextDirection;
      }
    }
  }

  return directions;
}

/**
 * Get a list of steps to travel between two destinations.
 *
 * @param {Destination} start  the starting point for directions
 * @param {Destination} target the ending point for directions
 * @returns {Promise<string[]>} a list of directions between the destinations
 */
export async function getDirectionsBetween(start: Destination, target: Destination): Promise<string[]> {
  // Get set of building graphs to request
  const buildingGraphRequests: Set<string> = new Set();
  buildingGraphRequests.add(start.shorthand);
  buildingGraphRequests.add(target.shorthand);
  if (start.shorthand !== target.shorthand) {
    buildingGraphRequests.add('OUTER');
  }

  const graphs = await getBuildingGraphs(buildingGraphRequests);

  let path: Path;
  if (start.shorthand === target.shorthand) {
    path = findShortestPathBetween(start, target, graphs.get(start.shorthand));
  } else {
    // findShortestPathAcrossBuildings([start], [target], graphs);
    throw new Error ('Method not implemented');
  }

  return buildDirectionsFromPath(path, graphs);
}
