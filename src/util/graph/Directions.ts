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

import * as DirectionTranslations from './DirectionTranslations';
import * as Navigation from './Navigation';
import * as Translations from '../Translations';
import * as TextUtils from '../TextUtils';

// Types
import { Description, Icon } from '../../../typings/global';
import { Destination } from '../../../typings/university';
import { BuildingGraph, Edge, EdgeDirection, Path } from './Navigation';
import { default as Node, Type as NodeType } from './Node';

/** Information on step by step navigation. */
export interface Step extends Description {
  key: string;  // Unique key to identify each step
  icon?: Icon;  // Icon to represent the step
}

export interface DirectionResults {
  showReport: boolean;  // True indicates an error was encountered and an option to report should appear
  steps: Step[];        // Steps to between two destinations.
}

/** Possible directions for path traversal. */
export enum Direction {
  Left = 0,
  Right = 1,
  Straight = 2,
}

/** Constant for 10 metres. */
const TEN_METRES = 10;

/**
 * Convert a distance to metres.
 *
 * @param {number} distance distance in generic units
 * @returns {number} distance in metres
 */
function _distanceToMetres(distance: number): number {
  return Math.min(Math.floor(distance * Navigation.OUTER_UNIT_TO_M / TEN_METRES), 1) * TEN_METRES;
}

/**
 * Given two directions of edges, will return the Direction one would have to turn to change from
 * one path to the other.
 *
 * @param {EdgeDirection} firstDirection  the current facing direction
 * @param {EdgeDirection} secondDirection the desired direction
 * @returns {Direction} the direction to turn
 */
function _getTurningDirection(firstDirection: EdgeDirection, secondDirection: EdgeDirection): Direction {

  /* tslint:disable no-multi-spaces */
  /* Better to line up statements */

  if (
      (firstDirection === EdgeDirection.Down  && secondDirection === EdgeDirection.Left) ||
      (firstDirection === EdgeDirection.Up    && secondDirection === EdgeDirection.Right) ||
      (firstDirection === EdgeDirection.Left  && secondDirection === EdgeDirection.Up) ||
      (firstDirection === EdgeDirection.Right && secondDirection === EdgeDirection.Down)) {
    return Direction.Right;
  } else if (
      (firstDirection === EdgeDirection.Down  && secondDirection === EdgeDirection.Right) ||
      (firstDirection === EdgeDirection.Up    && secondDirection === EdgeDirection.Left) ||
      (firstDirection === EdgeDirection.Left  && secondDirection === EdgeDirection.Down) ||
      (firstDirection === EdgeDirection.Right && secondDirection === EdgeDirection.Up)) {
    return Direction.Left;
  }

  /* tslint:enable no-multi-spaces */

  return Direction.Straight;
}

/**
 * Count the number of halls skipped when walking a certain direction down a hallway.
 *
 * @param {Edge[]}        adjacentEdges the edges being passed
 * @param {EdgeDirection} direction     the current travelling direction
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

/**
 * Provides translated direction to exit a room.
 *
 * @param {Node}          room          the room to exit
 * @param {EdgeDirection} exitDirection the facing direction from exiting the room
 * @param {EdgeDirection} nextDirection the desired continuing direction
 * @returns {Step} directions to exit the room
 */
function _exitRoom(
    room: Node,
    exitDirection: EdgeDirection,
    nextDirection: EdgeDirection): Step {
  const turningDirection = _getTurningDirection(exitDirection, nextDirection);
  const translations = DirectionTranslations.translateExitRoom(room, turningDirection);

  return {
    description_en: Translations.getDescription(translations, 'en'),
    description_fr: Translations.getDescription(translations, 'fr'),
    key: `exitRoom_${room}`,
  };
}

/**
 * Provides translated directions to enter a building.
 *
 * @param {Node}          outdoorNode          node which building is being entered from
 * @param {Node}          door                 the door of the building to enter
 * @param {EdgeDirection} approachingDirection direction the user is walking past the building
 * @param {EdgeDirection} doorDirection        direction the user must turn to enter the building
 * @param {EdgeDirection} enteredDirection     direction the user is facing upon entering the building
 * @param {EdgeDirection} continuingDirection  direction the user must turn to proceed to their destination
 * @param {number}        distance             total distance travelled along the preceding path/street
 * @param {BuildingGraph} graph                building graph
 * @returns {Step[]} steps to enter a building from the street
 */
function _enterBuilding(
    outdoorNode: Node,
    door: Node,
    approachingDirection: EdgeDirection,
    doorDirection: EdgeDirection,
    enteredDirection: EdgeDirection,
    continuingDirection: EdgeDirection,
    distance: number,
    graph: BuildingGraph): Step[] {
  const passingDirection = _getTurningDirection(approachingDirection, doorDirection);
  const turningDirection = _getTurningDirection(enteredDirection, continuingDirection);
  const distanceInMetres = _distanceToMetres(distance);

  const translations = DirectionTranslations.translateEnterBuilding(
    passingDirection,
    turningDirection,
    distanceInMetres,
    outdoorNode,
    graph,
    door
  );

  const steps: Step[] = [];
  for (let i = 0; i < translations.length; i++) {
    steps.push({
      description_en: Translations.getDescription(translations[i], 'en'),
      description_fr: Translations.getDescription(translations[i], 'fr'),
      key: `enterBuilding_${door}_${i}`,
    });
  }

  return steps;
}

/**
 * Provides translated directions to exit a building.
 *
 * @param {Node}          door          the door of the building to exit
 * @param {EdgeDirection} exitDirection the facing direction from exiting the door
 * @param {EdgeDirection} nextDirection the desired continuing direction
 * @returns {Step} steps to exit the building
 */
function _exitBuilding(
    door: Node,
    exitDirection: EdgeDirection,
    nextDirection: EdgeDirection): Step {
  const turningDirection = _getTurningDirection(exitDirection, nextDirection);
  const translations = DirectionTranslations.translateExitBuilding(door, turningDirection);

  return {
    description_en: Translations.getDescription(translations, 'en'),
    description_fr: Translations.getDescription(translations, 'fr'),
    key: `exitBuilding_${door}`,
  };
}

/**
 * Provides translated directions to enter a staircase or elevator, change floors, and exit.
 *
 * @param {Node}     door     the door to pass through
 * @param {Edge}     exitEdge the facing edge from exiting the room
 * @param {Edge}     nextEdge the desired continuing edge
 * @returns {Step[]} steps to go to a floor
 */
function _changeFloors(
    node: Node,
    exitEdge: Edge,
    nextEdge: Edge): Step[] {

  const turningDirection = _getTurningDirection(exitEdge.direction, nextEdge.direction);
  const translations = DirectionTranslations.translateChangingFloors(node, exitEdge.node, turningDirection);

  const steps: Step[] = [];
  for (let i = 0; i < translations.length; i++) {
    steps.push({
      description_en: Translations.getDescription(translations[i], 'en'),
      description_fr: Translations.getDescription(translations[i], 'fr'),
      key: `changeFloor_${node}_${i}`,
    });
  }

  return steps;
}

/**
 * Provides translated directions to enter a room.
 *
 * @param {Edge}     previousEdge the last edge before the room
 * @param {Edge}     roomEdge     the edge to enter the room
 * @returns {Step} instruction to enter a room
 */
function _enterRoom(previousEdge: Edge, roomEdge: Edge): Step {
  const turningDirection = _getTurningDirection(previousEdge.direction, roomEdge.direction);
  const translations = DirectionTranslations.translateEnterRoom(roomEdge.node, turningDirection);

  return {
    description_en: Translations.getDescription(translations, 'en'),
    description_fr: Translations.getDescription(translations, 'fr'),
    key: `enterRoom_${roomEdge.node}`,
  };
}

/**
 * Creates directions to turn down a hallway.
 *
 * @param {Node}      hallNode            node of hall to turn at
 * @param {Direction} direction           the direction to turn
 * @param {number}    missedHalls         number of missed halls in the turning direction
 * @param {number}    missedStraightHalls number of missed halls at the end of the hallway
 * @returns {Step} the directions for a user to turn down a hall
 */
function _turnDownNthHall(
      hallNode: Node,
      direction: Direction,
      missedHalls: number,
      missedStraightHalls: number): Step {
  if (direction !== Direction.Left && direction !== Direction.Right) {
    throw new Error(`Invalid turning direction: ${direction}`);
  }

  const translations = DirectionTranslations.translateTurnDownNthHall(
    direction,
    missedHalls,
    missedStraightHalls
  );

  return {
    description_en: Translations.getDescription(translations, 'en'),
    description_fr: Translations.getDescription(translations, 'fr'),
    key: `nthHall_${hallNode}`,
  };
}

/**
 * Creates directions to turn down a street outside.
 *
 * @param {Node}          currentNode      the current path/street being travelled down
 * @param {Node}          nextNode         the path/street to turn onto
 * @param {EdgeDirection} currentDirection the direction of the last path/street
 * @param {EdgeDirection} nextDirection    the direction of the next path/street
 * @param {number}        distance         distance to walk down the street before turning
 * @param {BuildingGraph} graph            building graph
 * @returns {Step} the directions for a user to turn down a street
 */
function _turnDownStreet(
    currentNode: Node,
    nextNode: Node,
    currentDirection: EdgeDirection,
    nextDirection: EdgeDirection,
    distance: number,
    graph: BuildingGraph): Step {
  const turningDirection = _getTurningDirection(currentDirection, nextDirection);
  const distanceInMetres = _distanceToMetres(distance);
  const translations = DirectionTranslations.translateTurnDownStreet(
    currentNode,
    nextNode,
    turningDirection,
    distanceInMetres,
    graph
  );

  return {
    description_en: Translations.getDescription(translations, 'en'),
    description_fr: Translations.getDescription(translations, 'fr'),
    key: `turnDownStreet_${currentNode}`,
  };
}

/**
 * Provides directions for a user to cross an intersection.
 *
 * @param {Node}          previousEdge     the current path/street being travelled down
 * @param {Node}          intersectionNode the intersection to cross
 * @param {Node}          nextEdge         the street/path after the intersection
 * @param {number}        distance         distance travelled on current path to reach intersection
 * @param {BuildingGraph} graph            the graph, for retrieving street names
 * @returns {string[]} instructions for crossing an intersection
 */
function _crossIntersection(
    previousEdge: Edge,
    intersectionEdge: Edge,
    nextEdge: Edge,
    distance: number,
    graph: BuildingGraph): Step[] {
  const distanceInMetres = _distanceToMetres(distance);
  const turningDirection = _getTurningDirection(previousEdge.direction, intersectionEdge.direction);
  const nextDirection = _getTurningDirection(intersectionEdge.direction, nextEdge.direction);
  const translations = DirectionTranslations.translateCrossIntersection(
    previousEdge,
    intersectionEdge,
    nextEdge,
    turningDirection,
    nextDirection,
    distanceInMetres,
    graph
  );

  const steps: Step[] = [];
  for (let i = 0; i < translations.length; i++) {
    steps.push({
      description_en: Translations.getDescription(translations[i], 'en'),
      description_fr: Translations.getDescription(translations[i], 'fr'),
      key: `crossIntersection_${intersectionEdge.node}_${i}`,
    });
  }

  return steps;
}

/**
 * Build step-by-step directions to travel along a path.
 *
 * @param {Path|undefined}            path     the path to follow
 * @param {Map<string, BuildingGraph} graphs   graphs which the path was built from
 * @returns {Step[]} a list of directions
 */
function _buildDirectionsFromPath(
    path: Path | undefined,
    graphs: Map<string, BuildingGraph>): Step[] {
  if (path == undefined) {
    throw new Error('Path is not defined');
  }

  const directions: Step[] = [];
  const totalEdges = path.edges.length;

  let missedLeftHalls = 0;
  let missedRightHalls = 0;
  let missedStraightHalls = 0;
  let distanceToTravel = 0;
  let passingThroughIntersection = false;

  let currentNode = path.source;
  let nextPath = path.edges[0];
  let nextNextPath = path.edges[1];

  // Initial directions, to exit starting room/building
  switch (currentNode.getType()) {
    case NodeType.Room:
      directions.push(_exitRoom(currentNode, nextPath.direction, nextNextPath.direction));
      break;
    case NodeType.Door:
      directions.push(_exitBuilding(currentNode, nextPath.direction, nextNextPath.direction));
      break;
    default:
      throw new Error('Cannot provide directions from nodes which are not doors or rooms');
  }

  currentNode = nextPath.node;
  for (let i = 1; i < totalEdges - 1; i++) {
    currentNode = path.edges[i - 1].node;
    nextPath = path.edges[i];
    nextNextPath = path.edges[i + 1];

    const nextDirection = _getTurningDirection(nextPath.direction, nextNextPath.direction);

    if (nextNextPath.node.getType() === NodeType.Room) {
      directions.push(_enterRoom(nextPath, nextNextPath));
      break;
    }

    // When going to the same node type, count various properties to report when changing directions
    // or buildings/nodes
    if (currentNode.getType() === nextPath.node.getType() || passingThroughIntersection) {
      passingThroughIntersection = false;
      switch (currentNode.getType()) {

        case NodeType.Hallway:
          if (nextDirection === Direction.Straight) {
            const skippedNode = nextPath.node;
            const adjacentEdges = graphs.get(skippedNode.getBuilding()).adjacencies.get(skippedNode);
            const missedHalls = _countMissedHalls(adjacentEdges, nextPath.direction);
            missedLeftHalls += missedHalls.l;
            missedRightHalls += missedHalls.r;
          } else {
            const skippedNode = nextPath.node;
            const adjacentEdges = graphs.get(skippedNode.getBuilding()).adjacencies.get(skippedNode);
            const missedHalls = _countMissedHalls(adjacentEdges, nextPath.direction);
            missedStraightHalls += missedHalls.s;

            let relevantMissedHalls: number;
            switch (nextDirection) {
              case Direction.Left: relevantMissedHalls = missedLeftHalls; break;
              case Direction.Right: relevantMissedHalls = missedRightHalls; break;
              default: throw new Error(`Invalid direction for turn: ${nextDirection}`);
            }

            directions.push(_turnDownNthHall(nextPath.node, nextDirection, relevantMissedHalls, missedStraightHalls));
            missedLeftHalls = 0;
            missedRightHalls = 0;
            missedStraightHalls = 0;
          }
          break;

        case NodeType.Path:
        case NodeType.Street:
          if (nextNextPath.node.getType() === NodeType.Door) {
            distanceToTravel += nextPath.distance;
            break;
          }

          let previousNode = currentNode;
          if (currentNode.getType() === NodeType.Intersection) {
            previousNode = path.edges[i - 2].node;
          }
          if (nextDirection !== Direction.Straight) {
            directions.push(
              _turnDownStreet(
                previousNode,
                nextPath.node,
                nextPath.direction,
                nextNextPath.direction,
                distanceToTravel + nextPath.distance,
                graphs.get('OUT')
              )
            );
            distanceToTravel = 0;
          }
          distanceToTravel += nextPath.distance;
          break;

        case NodeType.Intersection:
          for (const dir of _crossIntersection(
              path.edges[i - 1],
              nextPath,
              nextNextPath,
              distanceToTravel + nextPath.distance,
              graphs.get('OUT'))) {
            directions.push(dir);
          }
          distanceToTravel = 0;
          break;

        default:
          // Does nothing
      }
    } else {
      // When entering a new node type, report the steps
      switch (nextPath.node.getType()) {

        case NodeType.Street:
        case NodeType.Path:
          if (nextNextPath.node.getType() === NodeType.Door) {
            distanceToTravel += nextPath.distance;
            break;
          }

          // When entering a street or path, from a path or street, respectively
          if (currentNode.getType() === NodeType.Street || currentNode.getType() === NodeType.Path) {
            directions.push(
              _turnDownStreet(
                currentNode,
                nextPath.node,
                nextPath.direction,
                nextNextPath.direction,
                distanceToTravel + nextPath.distance,
                graphs.get('OUT')
              )
            );
            distanceToTravel = 0;
          } else if (currentNode.getType() === NodeType.Door) {
            directions.push(
              _turnDownStreet(
                currentNode,
                nextPath.node,
                nextPath.direction,
                nextNextPath.direction,
                nextPath.distance,
                graphs.get('OUT')
              )
            );
          } else {
            distanceToTravel += nextPath.distance;
          }
          break;

        case NodeType.Intersection:
          distanceToTravel += nextPath.distance;
          passingThroughIntersection = true;
          break;

        case NodeType.Door:
          if (currentNode.isOutside()) {
            for (const dir of _enterBuilding(
                currentNode,
                nextPath.node,
                path.edges[i - 1].direction,
                path.edges[i].direction,
                path.edges[i + 1].direction,
                path.edges[i + 2].direction,
                distanceToTravel + nextPath.distance,
                graphs.get('OUT'))) {
              directions.push(dir);
            }
            distanceToTravel = 0;
          } else {
            directions.push(
              _exitBuilding(
                nextPath.node,
                path.edges[i + 1].direction,
                path.edges[i + 2].direction
              )
            );
          }
          break;

        case NodeType.Elevator:
        case NodeType.Stairs:
          for (const dir of _changeFloors(
              nextPath.node,
              path.edges[i + 1],
              path.edges[i + 2])) {
            directions.push(dir);
          }
          break;

        default:
          // Does nothing
      }
    }
  }

  return directions;
}

/**
 * Get a list of steps to travel between two destinations.
 *
 * @param {Destination} start      the starting point for directions
 * @param {Destination} target     the ending point for directions
 * @param {boolean}     accessible true to force accessible paths, false for any path
 * @param {Language}    language   the language to return directions in
 * @returns {Promise<DirectionResults>} a list of directions between the destinations
 */
export async function getDirectionsBetween(
    start: Destination,
    target: Destination,
    accessible: boolean): Promise<DirectionResults> {
  // Get set of building graphs to request
  const buildingGraphRequests: Set<string> = new Set();
  buildingGraphRequests.add(start.shorthand);
  buildingGraphRequests.add(target.shorthand);
  if (start.shorthand !== target.shorthand) {
    buildingGraphRequests.add('OUT');
  }

  const graphs = await Navigation.getBuildingGraphs(buildingGraphRequests);
  const startGraph = graphs.get(start.shorthand);
  const targetGraph = graphs.get(target.shorthand);
  const outdoorGraph = graphs.get('OUT');

  const startNode = Navigation.getCachedNodeOrBuild(
    start.room ? `R${start.room}` : `D1`,
    start.shorthand, startGraph.format
  );
  const targetNode = Navigation.getCachedNodeOrBuild(
    target.room ? `R${target.room}` : `D1`,
    target.shorthand, targetGraph.format
  );

  let path: Path;
  if (start.shorthand === target.shorthand) {
    if (start.room != undefined) {
      path = Navigation.findShortestPathBetween(startNode, targetNode, startGraph, accessible, false);
    }
  } else {
    const startToExits = Navigation.findShortestPathsBetween(
      startNode,
      startGraph.exits,
      startGraph,
      accessible,
      false
    );

    const exitsToTarget = Navigation.findShortestPathsBetween(
      targetNode,
      targetGraph.exits,
      targetGraph,
      accessible,
      true
    );

    const exitDistances = Navigation.findDistancesBetweenDoors(startGraph.exits, targetGraph.exits, outdoorGraph);
    path = Navigation.getShortestPathAcross(startToExits, exitsToTarget, exitDistances, graphs, accessible);
  }

  // Get English/French directions from the given path
  let steps: Step[];
  try {
    steps = _buildDirectionsFromPath(path, graphs);
  } catch (err) {
    const errorMessage = accessible ? 'no_accessible_path_found' : 'no_path_found';

    return {
      showReport: true,
      steps: [
        {
          description_en: Translations.get(errorMessage, 'en'),
          description_fr: Translations.get(errorMessage, 'fr'),
          icon: {
            class: 'material',
            name: 'error',
          },
          key: errorMessage,
        },
      ],
    };
  }

  const startString = TextUtils.destinationToString(start);
  const targetString = TextUtils.destinationToString(target);

  // Add starting point to beginning of directions
  steps.unshift({
    description: startString,
    icon: {
      class: 'material',
      name: 'my-location',
    },
    key: `destination_${startString}`,
  });

  // Add ending point to end of directions
  steps.push({
    description: targetString,
    icon: {
      class: 'material',
      name: 'place',
    },
    key: `target_${targetString}`,
  });

  return {
    showReport: false,
    steps,
  };
}
