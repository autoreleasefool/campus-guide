/**
 *
 * @license
 * Copyright (C) 2018 Joseph Roque
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
 * @created 2018-01-03
 * @file CampusGraph.ts
 * @description Graph of rooms of a building, or buildings of a campus.
 */

// Imports
import * as Configuration from '../Configuration';
import { getCachedNodeOrBuild } from './Navigation';

// Types
import { Coordinate } from '../../../typings/global';
import { default as Node, Type as NodeType } from './Node';

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

/** Possible states for parsing graphs. */
enum GraphParseState {
  Format = '[FORMAT]',
  Edges = '[EDGES]',
  Excluded = '[EXCLUDED]',
  Nodes = '[NODES]',
  Streets = '[STREETS]',
  Campus = '[CAMPUS]',
  None = 'NONE',
}

export interface Graph {
  /** List of edges which connect a Node to others in the graph. */
  adjacencies: Map<Node, Edge[]>;

  /** Name or ID of the campus the building is on. */
  campus: string;

  /** Mapping of Node to a set of nodes which paths exist to, but are closed. */
  excluded: Map<Node, Set<Node>>;

  /** Set of doors in the graph, mapped to their coordinates outside. */
  exits: Map<Node, Coordinate>;

  /** Set of rules for parsing details in the map. */
  formattingRules: Map<string, string>;

  /** Mapping of intersection nodes to the street names which they are positioned on. */
  intersections: Map<Node, string>;

  /** Mapping of street IDs to their names. */
  streetNames: Map<string, string>;

  /** Set of streets in the graph, mapped to their street name IDs. */
  streets: Map<Node, string>;
}

/**
 * Get the graph parsing state from a string.
 *
 * @param {string} line indicates new state
 * @returns {GraphParseState} the state in the string
 */
function _getGraphState(line: string): GraphParseState {
  switch (line) {
    case GraphParseState.Format:
      return GraphParseState.Format;
    case GraphParseState.Edges:
      return GraphParseState.Edges;
    case GraphParseState.Excluded:
      return GraphParseState.Excluded;
    case GraphParseState.Nodes:
      return GraphParseState.Nodes;
    case GraphParseState.Streets:
      return GraphParseState.Streets;
    case GraphParseState.Campus:
      return GraphParseState.Campus;
    default:
      return GraphParseState.None;
  }
}

/**
 * Parse a building campus.
 *
 * @param {Graph}  graph  building graph to add node to
 * @param {string} campus campus of the building
 */
function _parseAndSetCampus(graph: Graph, campus: string): void {
  graph.campus = campus;
}

/**
 * Parse a graph formatting rule and add it to the existing graph.
 *
 * @param {Graph}  graph     building graph to add node to
 * @param {string} rawFormat the rule details to parse
 */
function _parseAndAppendGraphFormat(graph: Graph, rawFormat: string): void {
  const elements = rawFormat.split('=');
  graph.formattingRules.set(elements[0], elements[1]);
}

/**
 * Parse a list of Edge and add them to the existing graph.
 *
 * @param {Node}   node     the node connected to the edges
 * @param {string} building the building which the graph belongs to
 * @param {Graph}  graph    building graph to add edges to
 * @param {string} rawEdges the edge details to parse
 */
function _parseAndAppendEdges(node: Node, building: string, graph: Graph, rawEdges: string): void {
  const connections: Edge[] = graph.adjacencies.has(node) ? graph.adjacencies.get(node) : [];

  // Add doors to the graph if not already present
  if (node.getType() === NodeType.Door && !graph.exits.has(node)) {
    graph.exits.set(node, { x: 0, y: 0 });
  }

  const edges = rawEdges.split('%');
  for (const edge of edges) {
    const edgeElements = edge.split(':');

    /* tslint:disable no-magic-numbers */
    connections.push({
      accessible: edgeElements[3] === 'T',
      direction: edgeElements[1] as EdgeDirection,
      distance: parseInt(edgeElements[2]),
      node: getCachedNodeOrBuild(edgeElements[0], building, graph.formattingRules),
    });
    /* tslint:enable no-magic-numbers */
  }

  graph.adjacencies.set(node, connections);
}

/**
 * Parse a Node and add it to the existing graph.
 *
 * @param {Node}   node     the node to add
 * @param {Graph}  graph    building graph to add node to
 * @param {string} rawNode  the node details to parse
 */
function _parseAndAppendNode(node: Node, graph: Graph, rawNode: string): void {
  switch (node.getType()) {
    case NodeType.Intersection:
      graph.intersections.set(node, rawNode);
      break;
    case NodeType.Street:
      graph.streets.set(node, rawNode);
      break;
    case NodeType.Door:
      graph.exits.set(node, {
        x: parseFloat(rawNode.split(',')[0]),
        y: parseFloat(rawNode.split(',')[1]),
      });
      break;
    default:
      // does nothing
  }
}

/**
 * Parse an excluded edge and add it to the existing graph.
 *
 * @param {Node}  nodeA the first excluded node
 * @param {Node}  nodeB the second excluded node
 * @param {Graph} graph building  graph to add exclusion to
 */
function _parseAndAppendExcludedNode(nodeA: Node, nodeB: Node, graph: Graph): void {
  const excluded = graph.excluded.has(nodeA) ? graph.excluded.get(nodeA) : new Set<Node>();
  excluded.add(nodeB);
  graph.excluded.set(nodeA, excluded);
}

/**
 * Parse a street name and add it to the existing graph.
 *
 * @param {string} id         id of the street
 * @param {string} streetName translated street names
 */
function _parseAndAppendStreet(id: string, streetName: string, graph: Graph): void {
  graph.streetNames.set(id, streetName);
}

/**
 * Gets the requested set of Graph instances, mapped to their shorthands.
 *
 * @param {Set<string>} buildings set of building identifiers
 * @returns {Promise<Map<Graph>>} map of building shorthands to Graphs
 */
export async function getGraphs(buildings: Set<string>): Promise<Map<string, Graph>> {
  const graphs: Map<string, Graph> = new Map();
  for (const building of buildings) {
    const buildingAsGraph = building.replace(/[\s/]+/g, '');
    const rawGraph = await Configuration.getTextFile(`/${buildingAsGraph}_graph.txt`);
    const graph: Graph = {
      adjacencies: new Map(),
      campus: 'main',
      excluded: new Map(),
      exits: new Map(),
      formattingRules: new Map(),
      intersections: new Map(),
      streetNames: new Map(),
      streets: new Map(),
    };

    const lines = rawGraph.split('\n');

    let state = GraphParseState.None;
    for (const line of lines) {
      if (!line || line.length === 0) {
        continue;
      }

      // Handle state switch
      if (line.charAt(0) === '[') {
        state = _getGraphState(line);
        continue;
      }

      // If no state was set, skip element
      if (state === GraphParseState.None) {
        continue;
      }

      const graphComponents = line.split('|');

      switch (state) {
        case GraphParseState.Format:
          _parseAndAppendGraphFormat(graph, line);
          break;
        case GraphParseState.Edges: {
          const node = getCachedNodeOrBuild(graphComponents[0], building, graph.formattingRules);
          _parseAndAppendEdges(node, building, graph, graphComponents[1]);
          break;
        }
        case GraphParseState.Nodes: {
          const node = getCachedNodeOrBuild(graphComponents[0], building, graph.formattingRules);
          _parseAndAppendNode(node, graph, graphComponents[1]);
          break;
        }
        case GraphParseState.Excluded: {
          const nodeA = getCachedNodeOrBuild(graphComponents[0], building, graph.formattingRules);
          const nodeB = getCachedNodeOrBuild(graphComponents[1], building, graph.formattingRules);
          _parseAndAppendExcludedNode(nodeA, nodeB, graph);
          _parseAndAppendExcludedNode(nodeB, nodeA, graph);
          break;
        }
        case GraphParseState.Streets: {
          _parseAndAppendStreet(graphComponents[0], graphComponents[1], graph);
          break;
        }
        case GraphParseState.Campus: {
          _parseAndSetCampus(graph, line);
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
 * Get all the doors to a set of buildings from a graph.
 *
 * @param {Graph}       graph     graph with doors
 * @param {Set<string>} buildings building shorthands to look for
 * @returns {Map<string, Set<Node>>} map of building shorthands to their exits
 */
export function getDoorsForBuildings(graph: Graph, buildings: Set<string>): Map<string, Set<Node>> {
  const doors: Map<string, Set<Node>> = new Map();

  graph.exits.forEach((_: Coordinate, key: Node) => {
    if (buildings.has(key.getBuilding())) {
      if (!doors.has(key.getBuilding())) {
        doors.set(key.getBuilding(), new Set());
      }

      doors.get(key.getBuilding()).add(key);
    }
  });

  return doors;
}
