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

// Imports
import FastPriorityQueue from 'fastpriorityqueue';
import { default as Node, Type as NodeType } from './Node';

// Types
import { Graph, Edge } from './CampusGraph';

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
/** Maximum number of floors before stairs become unreasonable */
const MAX_FLOOR_DIFF_FOR_STAIRS = 2;
/** Penalty to elongate paths which are not ideal, but still possible. */
const NAVIGATION_PENALTY = 10000;

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
 * Get the path from a start node to a target node.
 *
 * @param {Node}           startNode  starting node
 * @param {Node}           targetNode target node
 * @param {number}         distance   distance of path
 * @param {Map<Node,Node>} previous   node which led to another node
 * @param {Graph}          graph      adjacency graph
 * @param {boolean}        reverse    true to build a path from target to start
 */
function _rebuildPath(
    startNode: Node,
    targetNode: Node,
    distance: number,
    previous: Map<Node, Node>,
    graph: Graph,
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
 * Find the shortest path in a graph between two nodes.
 *
 * @param {Node}    startNode  path start
 * @param {Node}    targetNode path end
 * @param {Graph}   graph      graph to generate path from
 * @param {boolean} accessible true to force an accessible path, false for any path
 * @param {boolean} reverse    true to return path from target to start
 * @returns {Path|undefined} the path between the startNode and targetNode, or undefined if
 *                           there isn't one
 */
export function findShortestPathBetween(
    startNode: Node,
    targetNode: Node,
    graph: Graph,
    accessible: boolean,
    reverse: boolean): Path | undefined {
  const targetSet: Set<Node> = new Set();
  targetSet.add(targetNode);

  const paths = findShortestPathsBetween(startNode, targetSet, graph, accessible, reverse);

  return paths.get(targetNode);
}

/**
 * Given a path, determine if a staircase or elevator was previously taken on the path, in the current building.
 *
 * @param {string}          building the building to check
 * @param {Map<Node, Node>} previous mapping of nodes to previous node in the path
 * @param {Node}            start    starting point of the search
 */
function _pathContainsPreviousFloorChange(building: string, previous: Map<Node, Node>, start: Node): boolean {
  let currentNode = start;
  while (currentNode && building === currentNode.getBuilding()) {
    if (currentNode.getType() === NodeType.Elevator || currentNode.getType() === NodeType.Stairs) {
      return true;
    }
    currentNode = previous.get(currentNode);
  }

  return false;
}

/**
 * Given a starting node, returns the shortest path from the starting node to each of the target nodes.
 * See https://github.com/mburst/dijkstras-algorithm/blob/524c76fd26e2d522d9d53e2acb10fc72ea99e266/dijkstras.js#L1
 *
 * @param {Node}      startNode   starting node for paths
 * @param {Set<Node>} targetNodes set of nodes to reach
 * @param {Graph}     graph       graph of building with edges and distances
 * @param {boolean}   accessible true to force an accessible path, false for any path
 * @param {boolean}   reverse    true to return path from target to start
 * @returns {Map<Node, Path>} mapping from the target node to the path to it from the starting node
 */
export function findShortestPathsBetween(
    startNode: Node,
    targetNodes: Set<Node>,
    graph: Graph,
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

  const firstTargetNode = targetNodes.values().next().value;

  if (startNode.getType() === NodeType.Door && firstTargetNode.getBuilding() === startNode.getBuilding()) {
    targetNodes = new Set();
    targetNodes.add(startNode);
    targetsFound.add(startNode);
  } else {
    while (!nodes.isEmpty()) {
      const smallest: PartialPath = nodes.poll();

      if (smallest == undefined || distances.get(smallest.node) === Infinity) {
        continue;
      }

      if (targetNodes.has(smallest.node) && !targetsFound.has(smallest.node)) {
        targetsFound.add(smallest.node);
        if (targetsFound.size === targetNodes.size) {
          break;
        }
      }

      for (const neighbour of graph.adjacencies.get(smallest.node)) {
        if (neighbour.node.getType() === NodeType.Room && !targetNodes.has(neighbour.node)) {
          // Optimization: You'll never have to pass through a room to get to another room, so skip nodes
          // that aren't targets
          continue;
        }

        if ((accessible && !(neighbour.accessible || neighbour.node.isAccessible()))
            || graph.excluded.has(smallest.node) && graph.excluded.get(smallest.node).has(neighbour.node)) {
          // Skip non-accessible edges when the user wants an accessible route, and skip
          // routes which are closed.
          continue;
        }

        let alt = distances.get(smallest.node) + neighbour.distance;

        // If node is a staircase and neighbour is more than X floors away, add extra weight
        if (smallest.node.getType() === NodeType.Stairs) {
          const diff = Math.abs(previous.get(smallest.node).getFloorInt() - neighbour.node.getFloorInt());
          if (diff > MAX_FLOOR_DIFF_FOR_STAIRS) {
            alt += NAVIGATION_PENALTY;
          }
        }

        // Add penalty to taking stairs and elevator in same building, should only need one
        if ((neighbour.node.getType() === NodeType.Stairs || neighbour.node.getType() === NodeType.Elevator)
            && _pathContainsPreviousFloorChange(neighbour.node.getBuilding(), previous, smallest.node)) {
          alt += NAVIGATION_PENALTY;
        }

        if (alt < distances.get(neighbour.node)) {
          distances.set(neighbour.node, alt);
          previous.set(neighbour.node, smallest.node);
          nodes.add({ dist: alt, node: neighbour.node });
        }
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
 * @param {Set<Node>} firstDoors  first set of doors
 * @param {Set<Node>} secondDoors second set of doors
 * @param {Graph}     graph       graph information
 * @returns {Map<Node,Map<Node,number>>} map from first set of doors to second set, to the distances between
 */
export function findDistancesBetweenDoors(
    firstDoors: Set<Node>,
    secondDoors: Set<Node>,
    graph: Graph): Map<Node, Map<Node, number>> {
  const distances: Map<Node, Map<Node, number>> = new Map();
  for (const firstDoor of firstDoors) {
    const firstDoorDistances: Map<Node, number> = new Map();
    distances.set(firstDoor, firstDoorDistances);
    for (const secondDoor of secondDoors) {
      const firstDoorPosition = graph.exits.get(firstDoor);
      const secondDoorPosition = graph.exits.get(secondDoor);
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
 * Builds the best path possible between two nodes across multiple graphs.
 *
 * @param {Map<Node, Path>}              startToExits          shortest paths from the start node to each exit
 * @param {Map<Node, Path>}              exitsToTarget         shortest paths from the target node to each exit
 * @param {Map<Node, Map<Node, number>>} distancesBetweenExits distances between each pair of building entrances
 * @param {Map<string, Graph>}           graphs                graphs for each building
 * @param {boolean}                      accessible            true to force an accessible path, false for any path
 * @param {boolean}                      shortest              true for shortest path, false for easiest to follow
 * @returns {Path|undefined} the shortest path between the nodes, or undefined if there are no possible paths
 */
export function getBestPathAcross(
    startToExits: Map<Node, Path>,
    exitsToTarget: Map<Node, Path>,
    distancesBetweenExits: Map<Node, Map<Node, number>>,
    graphs: Map<string, Graph>,
    accessible: boolean,
    shortest: boolean): Path | undefined {
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

      let distance = 0;
      if (shortest) {
        distance = exitPath.distance * INNER_UNIT_TO_M;
        distance += entrancePath.distance * INNER_UNIT_TO_M;
        distance += distancesBetweenExits.get(exit).get(entrance) * OUTER_UNIT_TO_M;
      } else {
        distance = parseInt(exit.getName()) + parseInt(entrance.getName());
      }

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