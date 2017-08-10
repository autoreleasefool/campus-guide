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

import { Destination } from '../../../typings/university';

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
  source: Node | undefined;
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
function _getCachedNodeOrBuild(id: string, building: string, formats: Map<string, string>): Node {
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
  if (node.getType() === NodeType.Elevator) {
    graph.extra.set(node, {
      additional: rawNode.split(','),
    });
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
          const node = _getCachedNodeOrBuild(graphComponents[0], building, graph.format);
          _parseAndAppendEdges(node, graph, graphComponents[1]);
          break;
        }
        case GraphParseState.Nodes: {
          const node = _getCachedNodeOrBuild(graphComponents[0], building, graph.format);
          _parseAndAppendNode(node, graph, graphComponents[1]);
          break;
        }
        case GraphParseState.Excluded: {
          const nodeA = _getCachedNodeOrBuild(graphComponents[0], building, graph.format);
          const nodeB = _getCachedNodeOrBuild(graphComponents[1], building, graph.format);
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
 * @param {Destination}   start  path start
 * @param {Destination}   target path end
 * @param {BuildingGraph} graph  graph to generate path from
 */
export function findShortestPathBetween(start: Destination, target: Destination, graph: BuildingGraph): Path {
  const visited = new FastPriorityQueue(partialPathComparator);
  const partialPaths = new Map<Node, PartialPath>();
  const unvisited = new Set(graph.adjacencies.keys());

  // Setup initial node
  const startNode = _getCachedNodeOrBuild(`R${start.room || start.shorthand}`, start.shorthand, graph.format);
  let currentNode = startNode;
  let currentNodeState = { dist: 0, source: undefined };
  partialPaths.set(currentNode, currentNodeState);

  // Setup target node
  const targetNode = _getCachedNodeOrBuild(`R${target.room || target.shorthand}`, target.shorthand, graph.format);
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
