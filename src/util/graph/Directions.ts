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
import * as CampusGraph from './CampusGraph';

// Types
import { Description, Icon } from '../../../typings/global';
import { Destination } from '../../../typings/university';
import { Path } from './Navigation';
import { default as Node, Type as NodeType } from './Node';
import { Graph, Edge, EdgeDirection } from './CampusGraph';

/** Information on step by step navigation. */
export interface Step extends Description {
  key: string;  // Unique key to identify each step
  icon?: Icon;  // Icon to represent the step
}

/** Container for results of requesting directions between two destinations. */
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

/** Number of missed halls between two points. */
interface MissedHalls {
  left: number;     // Number of missed hallways on the left
  right: number;    // Number of missed hallways on the right
  straight: number; // Number of straight ahead missed halls
}

/** Properties on a part of a path */
interface PathProps extends MissedHalls {
  distance: number;       // Distance travelled on the current straight path
  intersection: boolean;  // True if passing through an intersection, false otherwise
}

interface PathExtension {
  steps: Step[];      // Steps to take
  nodeSkips: number;  // Number of nodes to skip
}

/** Constant for 10 metres. */
const TEN_METRES = 10;

/** Key for a report button step. */
export const REPORT_STEP_KEY = 'report';

/**
 * Convert a distance to metres.
 *
 * @param {number} distance distance in generic units
 * @returns {number} distance in metres
 */
function _distanceToMetres(distance: number): number {
  return Math.max(Math.floor(distance * Navigation.OUTER_UNIT_TO_M / TEN_METRES), 1) * TEN_METRES;
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
 * @returns {MissedHalls} the number of missed left, right and straight hallways
 */
function _countMissedHalls(adjacentEdges: Edge[], direction: EdgeDirection): MissedHalls {
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

  return { left, right, straight };
}

/**
 * Provides translated direction to exit a room.
 *
 * @param {Node}          room          the room to exit
 * @param {EdgeDirection} exitDirection the facing direction from exiting the room
 * @param {EdgeDirection} nextDirection the desired continuing direction
 * @returns {Step} directions to exit the room
 */
function _exitRoom(room: Node, exitDirection: EdgeDirection, nextDirection: EdgeDirection): Step {
  const turningDirection = _getTurningDirection(exitDirection, nextDirection);
  const translations = DirectionTranslations.translateExitRoom(room, turningDirection);

  return {
    description_en: Translations.getDescription(translations, 'en'),
    description_fr: Translations.getDescription(translations, 'fr'),
    key: `exitRoom_${room}`,
  };
}

/**
 * Provides translated directions to exit a building.
 *
 * @param {Node}          door          the door of the building to exit
 * @param {EdgeDirection} exitDirection the facing direction from exiting the building
 * @param {EdgeDirection} nextDirection the desired continuing direction
 * @returns {Step} steps to exit the building
 */
function _exitBuilding(door: Node, exitDirection: EdgeDirection, nextDirection: EdgeDirection): Step {
  const turningDirection = _getTurningDirection(exitDirection, nextDirection);
  const translations = DirectionTranslations.translateExitBuilding(door, turningDirection);

  return {
    description_en: Translations.getDescription(translations, 'en'),
    description_fr: Translations.getDescription(translations, 'fr'),
    key: `exitBuilding_${door}`,
  };
}

/**
 * Provides translated directions to enter a room.
 *
 * @param {Edge}    currentEdge      the last edge before the room
 * @param {Edge}    nextEdge         the edge to enter the room
 * @param {boolean} overrideStraight force the text to indicate the door is directly ahead
 * @returns {Step} instruction to enter a room
 */
function _enterRoom(currentEdge: Edge, nextEdge: Edge, overrideStraight: boolean): Step {
  const turningDirection = overrideStraight
      ? Direction.Straight
      : _getTurningDirection(currentEdge.direction, nextEdge.direction);
  const translations = DirectionTranslations.translateEnterRoom(nextEdge.node, turningDirection);

  return {
    description_en: Translations.getDescription(translations, 'en'),
    description_fr: Translations.getDescription(translations, 'fr'),
    key: `enterRoom_${nextEdge.node}`,
  };
}

/**
 * Provides translated directions to enter a building.
 *
 * @param {PathProps}     pathProps            path properties to use and update
 * @param {Node}          outdoorNode          node which building is being entered from
 * @param {Node}          door                 the door of the building to enter
 * @param {EdgeDirection} approachingDirection direction the user is walking past the building
 * @param {EdgeDirection} doorDirection        direction the user must turn to enter the building
 * @param {EdgeDirection} enteredDirection     direction the user is facing upon entering the building
 * @param {EdgeDirection} continuingDirection  direction the user must turn to proceed to their destination
 * @param {Graph}         graph                building graph
 * @returns {Step[]} steps to enter a building from the street
 */
function _enterBuilding(
    pathProps: PathProps,
    outdoorNode: Node,
    door: Node,
    approachingDirection: EdgeDirection,
    doorDirection: EdgeDirection,
    enteredDirection: EdgeDirection,
    continuingDirection: EdgeDirection,
    graph: Graph): Step[] {
  const passingDirection = _getTurningDirection(approachingDirection, doorDirection);
  const turningDirection = _getTurningDirection(enteredDirection, continuingDirection);
  const distanceInMetres = _distanceToMetres(pathProps.distance);

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

  pathProps.distance = 0;

  return steps;
}

/**
 * Provides translated directions to enter a building, or its lobby.
 *
 * @param {Edge}    currentEdge      the last edge before the room
 * @param {Edge}    nextEdge         the edge to enter the room
 * @param {boolean} overrideStraight force the text to indicate the door is directly ahead
 * @returns {Step} instruction to enter a building or lobby
 */
function _arriveBuildingDestination(currentEdge: Edge, nextEdge: Edge, overrideStraight: boolean): Step {
  const turningDirection = overrideStraight
      ? Direction.Straight
      : _getTurningDirection(currentEdge.direction, nextEdge.direction);

  const translations = currentEdge.node.isOutside()
      ? DirectionTranslations.translateEnterBuildingDestination(
        nextEdge.node,
        turningDirection
      )
      : DirectionTranslations.translateBuildingLobbyDestination(
        nextEdge.node,
        turningDirection
      );

  return {
    description_en: Translations.getDescription(translations, 'en'),
    description_fr: Translations.getDescription(translations, 'fr'),
    key: `enterBuilding_${nextEdge.node}`,
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
 * @param {PathProps}     pathProps        path properties to use and update
 * @param {Node}          currentNode      the current path/street being travelled down
 * @param {Node}          nextNode         the path/street to turn onto
 * @param {EdgeDirection} currentDirection the direction of the last path/street
 * @param {EdgeDirection} nextDirection    the direction of the next path/street
 * @param {BuildingGraph} graph            building graph
 * @returns {Step} the directions for a user to turn down a street
 */
function _turnDownStreet(
    pathProps: PathProps,
    currentNode: Node,
    nextNode: Node,
    currentDirection: EdgeDirection,
    nextDirection: EdgeDirection,
    graph: Graph): Step {
  const turningDirection = _getTurningDirection(currentDirection, nextDirection);
  const distanceInMetres = _distanceToMetres(pathProps.distance);
  const translations = DirectionTranslations.translateTurnDownStreet(
    currentNode,
    nextNode,
    turningDirection,
    distanceInMetres,
    graph
  );

  pathProps.distance = 0;

  return {
    description_en: Translations.getDescription(translations, 'en'),
    description_fr: Translations.getDescription(translations, 'fr'),
    key: `turnDownStreet_${currentNode}`,
  };
}

/**
 * Provides directions for a user to cross an intersection.
 *
 * @param {PathProps} pathProps        path properties to use and update
 * @param {Node}      previousEdge     the current path/street being travelled down
 * @param {Node}      intersectionNode the intersection to cross
 * @param {Node}      nextEdge         the street/path after the intersection
 * @param {number}    distance         distance travelled on current path to reach intersection
 * @param {Graph}     graph            the graph, for retrieving street names
 * @returns {Step[]} instructions for crossing an intersection
 */
function _crossIntersection(
    pathProps: PathProps,
    previousEdge: Edge,
    intersectionEdge: Edge,
    nextEdge: Edge,
    graph: Graph): Step[] {
  const distanceInMetres = _distanceToMetres(pathProps.distance);
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

  pathProps.distance = 0;

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
 * Provides directions for user to take a set of stairs outside.
 *
 * @param {PathProps} pathProps   path properties to use and update
 * @param {Node}      currentNode the node before the steps
 * @param {Edge}      currentEdge the current path/street being travelled down
 * @param {}
 * @returns {Step} instructions for taking steps outside
 */
function _takeOutdoorSteps(pathProps: PathProps, currentNode: Node, currentEdge: Edge, graph: Graph): Step {
  const distanceInMetres = _distanceToMetres(pathProps.distance);
  const translations = DirectionTranslations.translateTakeOutdoorSteps(
    currentNode,
    currentEdge,
    distanceInMetres,
    graph
  );

  pathProps.distance = 0;

  return {
    description_en: Translations.getDescription(translations, 'en'),
    description_fr: Translations.getDescription(translations, 'fr'),
    key: `takeOutdoorSteps_${currentEdge.node}`,
  };
}

/**
 * Parse first node and edges for the first step between two points.
 *
 * @param {Node}   node        starting node
 * @param {Edge}   currentEdge outgoing edge from starting node
 * @param {Edge}   nextEdge    following edge
 * @param {Step[]} directions  list of directions
 */
function _pushFirstStep(node: Node, currentEdge: Edge, nextEdge: Edge, directions: Step[]): void {
  switch (node.getType()) {
    case NodeType.Room:
      directions.push(_exitRoom(node, currentEdge.direction, nextEdge.direction));
      break;
    case NodeType.Door:
      directions.push(_exitBuilding(node, currentEdge.direction, nextEdge.direction));
      break;
    default:
      throw new Error('Cannot provide directions from nodes which are not doors or rooms');
  }
}

/**
 * Update path properties along the path.
 *
 * @param {PathProps}          pathProps   path properties to use and update
 * @param {Path}               path        the path being traversed
 * @param {number}             pathIndex   current index in the path
 * @param {Node}               currentNode current node in the path
 * @param {Edge}               currentEdge current edge in the path
 * @param {Edge}               nextEdge    next edge in the path
 * @param {Map<string, Graph>} graphs      graphs which the path was built from
 * @returns {PathExtension} steps to add to the final directions
 */
function _extendPath(
    pathProps: PathProps,
    path: Path,
    pathIndex: number,
    currentNode: Node,
    currentEdge: Edge,
    nextEdge: Edge,
    graphs: Map<string, Graph>): PathExtension {
  const steps: Step[] = [];
  let nodeSkips = 0;

  const nextDirection = _getTurningDirection(currentEdge.direction, nextEdge.direction);

  switch (currentNode.getType()) {
    case NodeType.Hallway:
      if (nextDirection === Direction.Straight) {
        const skippedNode = currentEdge.node;
        const adjacentEdges = graphs.get(skippedNode.getBuilding()).adjacencies.get(skippedNode);
        const missedHalls = _countMissedHalls(adjacentEdges, currentEdge.direction);

        pathProps.left += missedHalls.left;
        pathProps.right += missedHalls.right;
      } else {
        const skippedNode = currentEdge.node;
        const adjacentEdges = graphs.get(skippedNode.getBuilding()).adjacencies.get(skippedNode);
        const missedHalls = _countMissedHalls(adjacentEdges, currentEdge.direction);

        pathProps.straight += missedHalls.straight;

        let missed: number;
        switch (nextDirection) {
          case Direction.Left: missed = pathProps.left; break;
          case Direction.Right: missed = pathProps.right; break;
          default: throw new Error(`Invalid direction for turn: ${nextDirection}`);
        }

        steps.push(_turnDownNthHall(currentEdge.node, nextDirection, missed, pathProps.straight));

        pathProps.left = 0;
        pathProps.right = 0;
        pathProps.straight = 0;
      }
      break;
    case NodeType.Path:
    case NodeType.Street:
      if (nextEdge.node.getType() === NodeType.Door) {
        pathProps.distance += currentEdge.distance;
        // FIXME: distance
        break;
      }

      if (nextDirection !== Direction.Straight) {
        steps.push(
          _turnDownStreet(
            pathProps,
            currentNode,
            currentEdge.node,
            currentEdge.direction,
            nextEdge.direction,
            graphs.get('OUT')
          )
        );

        if (currentEdge.node.getType() !== nextEdge.node.getType()) {
          nodeSkips += 1;
          // FIXME: distance
          pathProps.distance += nextEdge.distance;
        }
      }

      // FIXME: check this
      pathProps.distance += currentEdge.distance;
      break;
    case NodeType.Intersection:
      // FIXME: distance
      pathProps.distance += currentEdge.distance;
      for (const step of _crossIntersection(
        pathProps,
        path.edges[pathIndex - 2],
        path.edges[pathIndex - 1],
        nextEdge,
        graphs.get('OUT')
      )) {
        steps.push(step);
      }
      break;
    default:
      // Does nothing
  }

  return { steps, nodeSkips };
}

/**
 * Update path properties and describe steps to enter a new path.
 *
 * @param {PathProps}          pathProps   path properties to use and update
 * @param {Path}               path        the path being traversed
 * @param {number}             pathIndex   current index in the path
 * @param {Node}               currentNode current node in the path
 * @param {Edge}               currentEdge current edge in the path
 * @param {Edge}               nextEdge    next edge in the path
 * @param {Map<string, Graph>} graphs      graphs which the path was built from
 * @returns {PathExtension} steps to add to the final directions
 */
function _startNewPath(
    pathProps: PathProps,
    path: Path,
    pathIndex: number,
    currentNode: Node,
    currentEdge: Edge,
    nextEdge: Edge,
    graphs: Map<string, Graph>): PathExtension {
  const steps: Step[] = [];
  let nodeSkips = 0;

  switch (currentEdge.node.getType()) {
    case NodeType.Door:
      if (currentNode.isOutside()) {
        // FIXME: distance
        pathProps.distance += currentEdge.distance;
        for (const step of _enterBuilding(
          pathProps,
          currentNode,
          currentEdge.node,
          path.edges[pathIndex - 1].direction,
          path.edges[pathIndex].direction,
          path.edges[pathIndex + 1].direction,
          path.edges[pathIndex + 2].direction,
          graphs.get('OUT')
        )) {
          steps.push(step);
        }
      } else {
        steps.push(_exitBuilding(currentEdge.node, nextEdge.direction, path.edges[pathIndex + 2].direction));
      }
      break;
    case NodeType.Elevator:
    case NodeType.Stairs:
        for (const step of _changeFloors(
          currentEdge.node,
          path.edges[pathIndex + 1],
          path.edges[pathIndex + 2])) {
        steps.push(step);
      }
      break;
    case NodeType.Path:
    case NodeType.Street:
      if (nextEdge.node.getType() === NodeType.Door) {
        // FIXME: add distance
        pathProps.distance += currentEdge.distance;
        break;
      }

      // FIXME: going from outdoor steps to here should do nothing, probably
      if (currentNode.getType() === NodeType.OutdoorSteps) {
        break;
      }

      // FIXME: distance
      pathProps.distance += currentEdge.distance;
      steps.push(
        _turnDownStreet(
          pathProps,
          currentEdge.node,
          nextEdge.node,
          currentEdge.direction,
          nextEdge.direction,
          graphs.get('OUT')
        )
      );

      if (currentEdge.node.getType() !== nextEdge.node.getType()) {
        nodeSkips += 1;
        // FIXME: distance
        pathProps.distance += nextEdge.distance;
      }
      break;
    case NodeType.Intersection:
      // FIXME: distance
      pathProps.distance += currentEdge.distance;
      pathProps.intersection = true;
      break;
    case NodeType.OutdoorSteps:
      pathProps.distance += currentEdge.distance;
      steps.push(
        _takeOutdoorSteps(
          pathProps,
          currentNode,
          currentEdge,
          graphs.get('OUT')
        )
      );
      break;
    default:
      // Does nothing
  }

  return { steps, nodeSkips };
}

/**
 * Build step-by-step directions to travel along a path.
 *
 * @param {Path|undefined}     path     the path to follow
 * @param {Map<string, Graph>} graphs   graphs which the path was built from
 * @returns {Step[]} a list of directions
 */
function _buildDirectionsFromPath(path: Path | undefined, graphs: Map<string, Graph>): Step[] {
  if (path == undefined || path.edges.length < 2) {
    throw new Error('Path is not properly defined');
  }

  const directions: Step[] = [];
  const totalEdges = path.edges.length;

  let currentNode = path.source;
  let currentEdge = path.edges[0];
  let nextEdge = path.edges[1];

  const pathProps: PathProps = {
    distance: 0,
    intersection: false,
    left: 0,
    right: 0,
    straight: 0,
  };

  _pushFirstStep(currentNode, currentEdge, nextEdge, directions);

  for (let i = 1; i < totalEdges - 1; i++) {
    currentNode = path.edges[i - 1].node;
    currentEdge = path.edges[i];
    nextEdge = path.edges[i + 1];

    // Two nodes away from the target is when the final step is taken
    if (nextEdge === path.edges[totalEdges - 1]) {
      if (nextEdge.node.getType() === NodeType.Room) {
        directions.push(_enterRoom(currentEdge, nextEdge, currentNode.getType() !== NodeType.Hallway));
        break;
      } else if (nextEdge.node.getType() === NodeType.Door) {
        directions.push(_arriveBuildingDestination(
          currentEdge,
          nextEdge,
          currentNode.getType() !== NodeType.Hallway
              && currentNode.getType() !== NodeType.Street
              && currentNode.getType() !== NodeType.Path
        ));
        break;
      }
    }

    // When going to the same node type, count various properties
    if (currentNode.getType() === currentEdge.node.getType() || pathProps.intersection) {
      pathProps.intersection = false;
      const extendedPath = _extendPath(pathProps, path, i, currentNode, currentEdge, nextEdge, graphs);
      i += extendedPath.nodeSkips;
      for (const step of extendedPath.steps) {
        directions.push(step);
      }
    } else {
      // When entering a new node type, report the steps
      const newPath = _startNewPath(pathProps, path, i, currentNode, currentEdge, nextEdge, graphs);
      i += newPath.nodeSkips;
      for (const step of newPath.steps) {
        directions.push(step);
      }
    }
  }

  // Special case when leaving room, then entering room/door right beside
  if (totalEdges === 2) {
    if (nextEdge === path.edges[totalEdges - 1]) {
      if (path.edges[totalEdges - 1].node.getType() === NodeType.Room) {
        directions.push(_enterRoom(undefined, undefined, true));
      } else if (path.edges[totalEdges - 1].node.getType() === NodeType.Door) {
        directions.push(_arriveBuildingDestination(undefined, undefined, true));
      }
    }
  }

  return directions;
}

/**
 * Returns an appropriate error result for directions.
 *
 * @param {Destination} start      the starting point for directions
 * @param {Destination} target     the ending point for directions
 * @param {boolean} accessible true for accessible paths, false for any path
 * @param {any}     err        the error that occurred
 * @returns {DirectionResults} an error return state
 */
function _directionsError(
    start: Destination,
    target: Destination,
    accessible: boolean,
    differentCampuses: boolean,
    err: any): DirectionResults {
  const errorMessage = differentCampuses
    ? 'no_path_between_campuses'
    : accessible ? 'no_accessible_path_found' : 'no_path_found';

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
      {
        key: REPORT_STEP_KEY,
      },
    ],
  };
}

/**
 * Find the best path between two points in different buildings.
 *
 * @param {Destination}       start      the starting point for directions
 * @param {Destination}       target     the ending point for directions
 * @param {Map<string,Graph>} graphs     graphs of the buildings
 * @param {boolean}           accessible true to force accessible paths, false for any path
 * @param {boolean}           shortest   true to get the shortest path, false for the most easily followable
 * @returns {Path|undefined} the path between the points, or undefined if path could not be found
 */
function _getBestPathAcrossBuildings(
    start: Destination,
    target: Destination,
    graphs: Map<string, Graph>,
    accessible: boolean,
    shortest: boolean): Path | undefined {
  const startGraph = graphs.get(start.shorthand);
  const targetGraph = graphs.get(target.shorthand);
  const outdoorGraph = graphs.get('OUT');

  const doors = CampusGraph.getDoorsForBuildings(outdoorGraph, new Set([start.shorthand, target.shorthand]));
  const startDoors = doors.get(start.shorthand);
  const targetDoors = doors.get(target.shorthand);
  const exitDistances = Navigation.findDistancesBetweenDoors(startDoors, targetDoors, outdoorGraph);

  let startNodes: Node[] = [];
  let targetNodes: Node[] = [];

  // Either get the starting node (if a room is specified), or all of the doors of the building as starting nodes
  if (start.room) {
    startNodes.push(Navigation.getCachedNodeOrBuild(
      `R${start.room}`,
      start.shorthand,
      startGraph.formattingRules
    ));
  } else {
    startNodes = [...startDoors];
    startNodes.sort();
  }

  // Either get the target node (if a room is specified), or all of the doors of the building as target nodes
  if (target.room) {
    targetNodes.push(Navigation.getCachedNodeOrBuild(
      `R${target.room}`,
      target.shorthand,
      targetGraph.formattingRules
    ));
  } else {
    targetNodes = [...targetDoors];
    targetNodes.sort();
  }

  if (startNodes.length === 1 && targetNodes.length === 1) {
    // Find the shortest/bet path between two rooms and return
    const startToExits = Navigation.findShortestPathsBetween(
      startNodes[0],
      startDoors,
      startGraph,
      accessible,
      false
    );
    const exitsToTarget = Navigation.findShortestPathsBetween(
      targetNodes[0],
      targetDoors,
      targetGraph,
      accessible,
      true
    );

    return Navigation.getBestPathAcross(startToExits, exitsToTarget, exitDistances, graphs, accessible, shortest);
  } else {
    // Find the best path, when there are multiple possible starting points (doors)
    let startNodeIdx = 0;
    let targetNodeIdx = 0;

    let path: Path|undefined;

    while (path == undefined && startNodeIdx < startNodes.length && targetNodeIdx < targetNodes.length) {
      const startToExits = Navigation.findShortestPathsBetween(
        startNodes[startNodeIdx],
        startDoors,
        startGraph,
        accessible,
        false
      );
      const exitsToTarget = Navigation.findShortestPathsBetween(
        targetNodes[targetNodeIdx],
        targetDoors,
        targetGraph,
        accessible,
        true
      );

      path = Navigation.getBestPathAcross(startToExits, exitsToTarget, exitDistances, graphs, accessible, shortest);

      if (path == undefined) {
        if ((startNodeIdx <= targetNodeIdx || targetNodeIdx >= targetNodes.length - 1)
            && startNodeIdx < startNodes.length - 1) {
          startNodeIdx += 1;
        } else {
          targetNodeIdx += 1;
        }
      }
    }

    return path;
  }
}

/**
 * Find the shortest path between two points in the same building.
 *
 * @param {Destination} start      the starting point for directions
 * @param {Destination} target     the ending point for directions
 * @param {Graph}       graph      graph of the building which the path is in
 * @param {boolean}     accessible true to force accessible paths, false for any path
 * @returns {Path|undefined} the path between the points, or undefined if path could not be found
 */
function _getPathInBuilding(
    start: Destination,
    target: Destination,
    graph: Graph,
    accessible: boolean): Path | undefined {
  let path: Path | undefined;

  const startNode = Navigation.getCachedNodeOrBuild(
    start.room ? `R${start.room}` : `D1`,
    start.shorthand,
    graph.formattingRules
  );

  const targetNode = Navigation.getCachedNodeOrBuild(
    target.room ? `R${target.room}` : `D1`,
    target.shorthand,
    graph.formattingRules
  );

  path = Navigation.findShortestPathBetween(startNode, targetNode, graph, accessible, false);

  return path;
}

/**
 * Add the starting point and destination to the steps, with appropriate formatting.
 *
 * @param {Step[]}      steps  List of directions between start and target
 * @param {Destination} start  the starting point for directions
 * @param {Destination} target the ending point for directions
 */
function _padStepsWithStartAndTarget(steps: Step[], start: Destination, target: Destination): void {
  // Get English/French directions from the given path
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
}

/**
 * Get a list of steps to travel between two destinations.
 *
 * @param {Destination} start      the starting point for directions
 * @param {Destination} target     the ending point for directions
 * @param {boolean}     accessible true to force accessible paths, false for any path
 * @param {boolean}     shortest   true to get shortest possible route, false for easiest
 * @returns {Promise<DirectionResults>} a list of directions between the destinations
 */
export async function getDirectionsBetween(
    start: Destination,
    target: Destination,
    accessible: boolean,
    shortest: boolean): Promise<DirectionResults> {
  const inSingleBuilding = start.shorthand === target.shorthand;

  // Get set of building graphs to request
  const graphRequests: Set<string> = new Set();
  graphRequests.add(start.shorthand);
  graphRequests.add(target.shorthand);

  if (!inSingleBuilding) {
    graphRequests.add('OUT');
  }

  let graphs: Map<string, Graph>;
  try {
    graphs = await CampusGraph.getGraphs(graphRequests);
  } catch (err) {
    return _directionsError(start, target, accessible, false, err);
  }

  // TODO: remove when directions can be done between campuses
  if (graphs.get(start.shorthand).campus !== graphs.get(target.shorthand).campus) {
    return _directionsError(start, target, accessible, true, undefined);
  }

  const path: Path = inSingleBuilding
      ? _getPathInBuilding(start, target, graphs.get(start.shorthand), accessible)
      : _getBestPathAcrossBuildings(start, target, graphs, accessible, shortest);

  let steps: Step[];
  try {
    steps = _buildDirectionsFromPath(path, graphs);
  } catch (err) {
    return _directionsError(start, target, accessible, false, err);
  }

  _padStepsWithStartAndTarget(steps, start, target);

  return {
    showReport: false,
    steps,
  };
}
