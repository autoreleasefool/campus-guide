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
 * @file Directions.ts
 * @description Generate directions between points in graphs.
 */

import * as Navigation from './Navigation';
import * as TextUtils from '../TextUtils';
import { default as Translations, Language } from '../Translations';

// Types
import { Destination } from '../../../typings/university';
import { BuildingGraph, Edge, EdgeDirection, Path } from './Navigation';
import { Type as NodeType } from './Node';

/** Possible directions for path traversal. */
enum Direction {
  Left,
  Right,
  Straight,
}

/**
 * Count the number of halls skipped when walking a certain direction down a hallway.
 *
 * @param {Edge[]}        adjacentEdges the edges being passed
 * @param {EdgeDirection} direction     the current traveling direction
 * @returns {object} l, r, and s, representing the number of missed left, right and straight hallways
 */
function _countMissedHalls(adjacentEdges: Edge[], direction: EdgeDirection): { l: number; r: number; s: number } {
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

// function _exitRoom(room: Node, exitEdge: GraphEdge, nextEdge: GraphEdge): string {
//   const roomCommand =
// }

/**
 * Build step-by-step directions to travel along a path.
 *
 * @param {Path}                      path     the path to follow
 * @param {Map<string, BuildingGraph} graphs   graphs which the path was built from
 * @param {Language}                  language language to return directions in
 * @returns {string[]} a list of directions
 */
function _buildDirectionsFromPath(path: Path, graphs: Map<string, BuildingGraph>, language: Language): string[] {
  const directions: string[] = [];
  const totalEdges = path.edges.length;

  let currentDirection: Direction | undefined;
  let missedLeftHalls = 0;
  let missedRightHalls = 0;
  let missedStraightHalls = 0;

  // let nextPath = path.edges[0];
  // let nextNextPath = path.edges[1];

  // exitRoom(path.source, nextPath, nextNextPath);

  for (let i = 0; i < totalEdges; i++) {
    const nextNode = path.edges[i].node;
    let nextDirection = Direction.Straight;

    if (i < totalEdges - 2) {

      const nextNodeType = nextNode.getType();
      if (nextNodeType === NodeType.Elevator || nextNodeType === NodeType.Stairs) {
        const typeName = Translations.get(language, nextNodeType === NodeType.Elevator ? 'elevator' : 'staircase');
        const nextNextNodeFloor = TextUtils.getOrdinal(path.edges[i + 2].node.getFloor());
        directions.push(`Take ${typeName} ${nextNode.getName()} to the ${nextNextNodeFloor} floor.`);
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
        const missedHalls = _countMissedHalls(adjacentEdges, path.edges[i].direction);
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
 * @param {Destination} start    the starting point for directions
 * @param {Destination} target   the ending point for directions
 * @param {Language}    language the language to return directions in
 * @returns {Promise<string[]>} a list of directions between the destinations
 */
export async function getDirectionsBetween(
    start: Destination,
    target: Destination,
    language: Language): Promise<string[]> {
  // Get set of building graphs to request
  const buildingGraphRequests: Set<string> = new Set();
  buildingGraphRequests.add(start.shorthand);
  buildingGraphRequests.add(target.shorthand);
  if (start.shorthand !== target.shorthand) {
    buildingGraphRequests.add('OUTER');
  }

  const graphs = await Navigation.getBuildingGraphs(buildingGraphRequests);

  let path: Path;
  if (start.shorthand === target.shorthand) {
    path = Navigation.findShortestPathBetween(start, target, graphs.get(start.shorthand));
  } else {
    // findShortestPathAcrossBuildings([start], [target], graphs);
    throw new Error ('Method not implemented');
  }

  return _buildDirectionsFromPath(path, graphs, language);
}
