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
import * as Translations from '../Translations';
import * as TextUtils from '../TextUtils';
import { Language } from '../Translations';

// Types
import { Description, Icon } from '../../../typings/global';
import { Destination } from '../../../typings/university';
// import { BuildingGraph, Edge, EdgeDirection, Path } from './Navigation';
import { Path } from './Navigation';
// import { default as Node, Type as NodeType } from './Node';

/** Information on step by step navigation. */
export interface Step extends Description {
  key: string;  // Unique key to identify each step
  icon?: Icon;  // Icon to represent the step
}

export interface DirectionResults {
  showReport: boolean;  // True indicates an error was encountered and an option to report should appear
  steps: Step[];        // Steps to between two destinations.
}

// /** Possible directions for path traversal. */
// enum Direction {
//   Left = 0,
//   Right = 1,
//   Straight = 2,
// }

// /**
//  * Get the translated name of a node type.
//  *
//  * @param {NodeType} type     the type of node
//  * @param {Language} language language to return translation in
//  * @returns {string} the translated name
//  */
// function _getNodeTypeName(type: NodeType, language: Language): string {
//   switch (type) {
//     case NodeType.Door: return `${language}: Door`;
//     case NodeType.Room: return `${language}: Room`;
//     case NodeType.Stairs: return `${language}: Staircase`;
//     case NodeType.Elevator: return `${language}: Elevator`;
//     case NodeType.Hallway: return `${language}: Hallway`;
//     default: throw new Error(`Invalid node type: ${type}`);
//   }
// }

// /**
//  * Get the street name of a Street node, translated to the given language.
//  *
//  * @param {Node}     node       street node
//  * @param {string}   streetInfo street name string
//  * @param {Language} language   language to return name in
//  * @returns {string} name of the street
//  */
// function _getNodeStreetName(node: Node, streetInfo: string, language: Language): string {
//   if (node.getType() !== NodeType.Street) {
//     throw new Error('Cannot get street name of non-street nodes');
//   }

//   const translation = language === 'en' ? 0 : 1;
//   const translatedName = streetInfo.split(',');

//   return translatedName[translation];
// }

// /**
//  * Given two directions of edges, will return the Direction one would have to turn to change from
//  * one path to the other.
//  *
//  * @param {EdgeDirection} firstDirection  the current facing direction
//  * @param {EdgeDirection} secondDirection the desired direction
//  * @returns {Direction} the direction to turn
//  */
// function _getTurningDirection(firstDirection: EdgeDirection, secondDirection: EdgeDirection): Direction {

//   /* tslint:disable no-multi-spaces */
//   /* Better to line up statements */

//   if (
//       (firstDirection === EdgeDirection.Down  && secondDirection === EdgeDirection.Left) ||
//       (firstDirection === EdgeDirection.Up    && secondDirection === EdgeDirection.Right) ||
//       (firstDirection === EdgeDirection.Left  && secondDirection === EdgeDirection.Up) ||
//       (firstDirection === EdgeDirection.Right && secondDirection === EdgeDirection.Down)) {
//     return Direction.Right;
//   } else if (
//       (firstDirection === EdgeDirection.Down  && secondDirection === EdgeDirection.Right) ||
//       (firstDirection === EdgeDirection.Up    && secondDirection === EdgeDirection.Left) ||
//       (firstDirection === EdgeDirection.Left  && secondDirection === EdgeDirection.Down) ||
//       (firstDirection === EdgeDirection.Right && secondDirection === EdgeDirection.Up)) {
//     return Direction.Left;
//   }

//   /* tslint:enable no-multi-spaces */

//   return Direction.Straight;
// }

// /**
//  * Count the number of halls skipped when walking a certain direction down a hallway.
//  *
//  * @param {Edge[]}        adjacentEdges the edges being passed
//  * @param {EdgeDirection} direction     the current traveling direction
//  * @returns {object} l, r, and s, representing the number of missed left, right and straight hallways
//  */
// function _countMissedHalls(adjacentEdges: Edge[], direction: EdgeDirection): { l: number; r: number; s: number } {
//   let left = 0;
//   let right = 0;
//   let straight = 0;

//   for (const edge of adjacentEdges) {
//     if (edge.node.getType() !== NodeType.Hallway) {
//       continue;
//     }

//     if (edge.direction === direction) {
//       straight += 1;
//       continue;
//     }

//     switch (direction) {
//       case EdgeDirection.Down:
//         if (edge.direction === EdgeDirection.Left) {
//           right += 1;
//         } else if (edge.direction === EdgeDirection.Right) {
//           left += 1;
//         }
//         break;
//       case EdgeDirection.Up:
//         if (edge.direction === EdgeDirection.Right) {
//           right += 1;
//         } else if (edge.direction === EdgeDirection.Left) {
//           left += 1;
//         }
//         break;
//       case EdgeDirection.Left:
//         if (edge.direction === EdgeDirection.Up) {
//           right += 1;
//         } else if (edge.direction === EdgeDirection.Down) {
//           left += 1;
//         }
//         break;
//       case EdgeDirection.Right:
//         if (edge.direction === EdgeDirection.Down) {
//           right += 1;
//         } else if (edge.direction === EdgeDirection.Up) {
//           left += 1;
//         }
//         break;
//       default:
//         throw new Error(`Invalid edge direction '${direction}'`);
//     }
//   }

//   return { l: left, r: right, s: straight };
// }

// /**
//  * Provides translated direction to exit a room.
//  *
//  * @param {Node}          room          the room to exit
//  * @param {EdgeDirection} exitDirection the facing direction from exiting the room
//  * @param {EdgeDirection} nextDirection the desired continuing direction
//  * @param {Language}      language      language to return translation in
//  */
// function
// _exitRoom(room: Node, exitDirection: EdgeDirection, nextDirection: EdgeDirection, language: Language): string {
//   const turningDirection = _getTurningDirection(exitDirection, nextDirection);
//   let turningCommand: string;
//   switch (turningDirection) {
//     case Direction.Left: turningCommand = 'turn left'; break;
//     case Direction.Right: turningCommand = 'turn right'; break;
//     case Direction.Straight: turningCommand = 'proceed straight'; break;
//     default: throw new Error(`Invalid direction: ${turningDirection}`);
//   }

//   // TODO: translate
//   return `${language}: Exit ${room.getName()} and ${turningCommand}.`;
// }

// /**
//  * Provides translated directions to enter a building.
//  *
//  * @param {Node}          door                 the door of the building to enter
//  * @param {EdgeDirection} approachingDirection direction the user is walking past the building
//  * @param {EdgeDirection} doorDirection        direction the user must turn to enter the building
//  * @param {EdgeDirection} enteredDirection     direction the user is facing upon entering the building
//  * @param {EdgeDirection} continuingDirection  direction the user must turn to proceed to their destination
//  * @param {Language}      language             language to return translation in
//  */
// function _enterBuilding(
//   door: Node,
//   approachingDirection: EdgeDirection,
//   doorDirection: EdgeDirection,
//   enteredDirection: EdgeDirection,
//   continuingDirection: EdgeDirection,
//   language: Language): string[] {
//   const passingDirection = _getTurningDirection(approachingDirection, doorDirection);
//   let passingCommand: string;
//   switch (passingDirection) {
//     case Direction.Left: passingCommand = 'on your left'; break;
//     case Direction.Right: passingCommand = 'on your right'; break;
//     case Direction.Straight: passingCommand = 'directly ahead'; break;
//     default: throw new Error(`Invalid direction: ${passingDirection}`);
//   }

//   const turningDirection = _getTurningDirection(enteredDirection, continuingDirection);
//   let turningCommand: string;
//   switch (turningDirection) {
//     case Direction.Left: turningCommand = 'turn left'; break;
//     case Direction.Right: turningCommand = 'turn right'; break;
//     case Direction.Straight: turningCommand = 'proceed straight'; break;
//     default: throw new Error(`Invalid direction: ${turningDirection}`);
//   }

//   // TODO: translate
//   return [
//     `${language}: ${door.getBuilding()} will be ${passingCommand}`,
//     `${language}: Enter ${door.getBuilding()} (through door ${door.getName()}) and ${turningCommand}.`,
//   ];
// }

// /**
//  * Provides translated directions to exit a buildimng.
//  *
//  * @param {Node}          door          the door of the building to exit
//  * @param {EdgeDirection} exitDirection the facing direction from exiting the door
//  * @param {EdgeDirection} nextDirection the desired continuing direction
//  * @param {Language}      language      language to return translation in
//  */
// function _exitBuilding(
//     door: Node,
//     exitDirection: EdgeDirection,
//     nextDirection: EdgeDirection,
//     language: Language): string {
//   const turningDirection = _getTurningDirection(exitDirection, nextDirection);
//   let turningCommand: string;
//   switch (turningDirection) {
//     case Direction.Left: turningCommand = 'turn left'; break;
//     case Direction.Right: turningCommand = 'turn right'; break;
//     case Direction.Straight: turningCommand = 'proceed straight'; break;
//     default: throw new Error(`Invalid direction: ${turningDirection}`);
//   }

//   // TODO: translate
//   return `${language}: Exit ${door.getBuilding()} (through door ${door.getName()}) and ${turningCommand}.`;
// }

// /**
//  * Provides translated directions to enter a staircase or elevator, change floors, and exit.
//  *
//  * @param {Node}     door     the door to pass through
//  * @param {Edge}     exitEdge the facing edge from exiting the room
//  * @param {Edge}     nextEdge the desired continuing edge
//  * @param {Language} language language to return translation in
//  */
// function _changeFloors(
//     node: Node,
//     exitEdge: Edge,
//     nextEdge: Edge,
//     language: Language): string[] {
//   const nodeName = `${_getNodeTypeName(node.getType(), language)} ${node.getName()}`;
//   TODO: if elevator doesn't have name?
//   Can't use elevator name, since they're just random numbers Staircase names are okay

//   const turningDirection = _getTurningDirection(exitEdge.direction, nextEdge.direction);
//   let turningCommand: string;
//   switch (turningDirection) {
//     case Direction.Left: turningCommand = 'turn left'; break;
//     case Direction.Right: turningCommand = 'turn right'; break;
//     case Direction.Straight: turningCommand = 'proceed straight'; break;
//     default: throw new Error(`Invalid direction: ${turningDirection}`);
//   }

//   const directions: string[] = [];
//   directions.push(`${language}: Enter ${nodeName}`);
//   directions.push(`${language}: Take ${nodeName} to the ${TextUtils.getOrdinal(exitEdge.node.getFloor())} floor.`);
//   directions.push(`${language}: Exit ${nodeName} and ${turningCommand}.`);

//   //  TODO: translate
//   return directions;
// }

// /**
//  * Provides translated directions to enter a room.
//  *
//  * @param {Edge}     previousEdge the last edge before the room
//  * @param {Edge}     roomEdge     the edge to enter the room
//  * @param {Language} language     language to return the translation in
//  * @returns {string} instructions to enter a room
//  */
// function _enterRoom(previousEdge: Edge, roomEdge: Edge, language: Language): string {
//   const nodeName = `${_getNodeTypeName(roomEdge.node.getType(), language)} ${roomEdge.node.getName()}`;

//   const turningDirection = _getTurningDirection(previousEdge.direction, roomEdge.direction);
//   let turningCommand: string;
//   switch (turningDirection) {
//     case Direction.Left: turningCommand = 'on your left'; break;
//     case Direction.Right: turningCommand = 'on your right'; break;
//     case Direction.Straight: turningCommand = 'directly ahead'; break;
//     default: throw new Error(`Invalid direction: ${turningDirection}`);
//   }

//   // TODO: translate
//   return `${language}: ${nodeName} will be ${turningDirection}.`;
// }

// /**
//  * Creates directions to turn down a hallway.
//  *
//  * @param {Direction} direction           the direction to turn
//  * @param {number}    missedHalls         number of missed halls in the turning direction
//  * @param {number}    missedStraightHalls number of missed halls at the end of the hallway
//  * @param {Language}  language            language to return direction in
//  * @returns {string} the directions for a user to turn down a hall
//  */
// function _turnDownNthHall(
//       direction: Direction,
//       missedHalls: number,
//       missedStraightHalls: number,
//       language: Language): string {
//   if (direction !== Direction.Left && direction !== Direction.Right) {
//     throw new Error(`Invalid turning direction: ${direction}`);
//   }

//   const dirString = (direction === Direction.Left) ? 'left' : 'right';
//   const instruction = (missedStraightHalls === 0)
//       ? `Walk to the end of the hall and turn ${dirString}`
//       : `Turn down the ${TextUtils.getOrdinal(missedHalls + 1)} hallway on your ${dirString}`;

//   // TODO: translate
//   return `${language}: ${instruction}.`;
// }

// /**
//  * Creates directions to turn down a street outside.
//  *
//  * @param {Node}      streetNode     the current street being travelled down
//  * @param {Node}      nextStreetNode the street to turn onto
//  * @param {Direction} direction      the direction to turn
//  * @param {number}    distance       distance to walk down the street before turning
//  * @param {Language}  language       language to return direction in
//  * @returns {string} the directions for a user to turn down a street
//  */
// function _turnDownStreet(
//     streetNode: Node,
//     nextStreetNode: Node,
//     direction: Direction,
//     distance: number,
//     nodeInfo: Map<Node, any>,
//     language: Language): string {
//   if (direction !== Direction.Left && direction !== Direction.Right) {
//     throw new Error(`Invalid turning direction: ${direction}`);
//   }

// 6 units is 10m

//   const dirString = (direction === Direction.Left) ? 'left' : 'right';
//   const streetName = _getNodeStreetName(streetNode, nodeInfo.get(streetNode), language);
//   const nextStreetName = _getNodeStreetName(nextStreetNode, nodeInfo.get(nextStreetNode), language);

//   // TODO: translate
//   return `${language}: Walk approximately ${distance}m along ${streetName}`
//       + ` and turn ${dirString} onto ${nextStreetName}.`;
// }

// /**
//  * Build step-by-step directions to travel along a path.
//  *
//  * @param {Path}                      path     the path to follow
//  * @param {Map<string, BuildingGraph} graphs   graphs which the path was built from
//  * @param {Language}                  language language to return directions in
//  * @returns {string[]} a list of directions
//  */
// function _buildDirectionsFromPath(path: Path, graphs: Map<string, BuildingGraph>, language: Language): string[] {
//   const directions: string[] = [];
//   const totalEdges = path.edges.length;

//   let currentDirection: Direction | undefined;
//   let missedLeftHalls = 0;
//   let missedRightHalls = 0;
//   let missedStraightHalls = 0;
//   let distanceToTravel = 0;
//   let passingThroughIntersection = false;

//   let currentNode = path.source;
//   let nextPath = path.edges[0];
//   let nextNextPath = path.edges[1];

//   directions.push(_exitRoom(currentNode, nextPath.direction, nextNextPath.direction, language));
//   currentNode = nextPath.node;

//   for (let i = 1; i < totalEdges - 1; i++) {
//     currentNode = path.edges[i - 1].node;
//     nextPath = path.edges[i];
//     nextNextPath = path.edges[i + 1];

//     const nextDirection = _getTurningDirection(nextPath.direction, nextNextPath.direction);

//     if (currentNode.getType() === nextPath.node.getType() || passingThroughIntersection) {
//       passingThroughIntersection = false;
//       switch (currentNode.getType()) {
//         case NodeType.Hallway:
//           if (nextDirection === currentDirection) {
//             const skippedNode = nextPath.node;
//             const adjacentEdges = graphs.get(skippedNode.getBuilding()).adjacencies.get(skippedNode);
//             const missedHalls = _countMissedHalls(adjacentEdges, nextPath.direction);
//             missedLeftHalls += missedHalls.l;
//             missedRightHalls += missedHalls.r;
//             missedStraightHalls += missedHalls.s;
//           } else {
//             let missedHalls: number;
//             switch (nextDirection) {
//               case Direction.Left: missedHalls = missedLeftHalls; break;
//               case Direction.Right: missedHalls = missedRightHalls; break;
//               default: throw new Error(`Invalid direction for turn: ${nextDirection}`);
//             }

//             directions.push(_turnDownNthHall(nextDirection, missedHalls, missedStraightHalls, language));
//           }
//           break;
//         case NodeType.Path:
//         case NodeType.Street:
//           distanceToTravel += nextPath.distance;
//           if (nextDirection !== currentDirection) {
//             // streetNode: Node,
//             // nextStreetNode: Node,
//             // direction: Direction,
//             // distance: number,
//             // nodeInfo: Map<Node, any>,
//             // language: Language)
//             directions.push(
//               _turnDownStreet(
//                 nextDirection, distanceToTravel, language));
//           }
//           break;
//         case NodeType.Intersection:
//           directions.push(_crossIntersection(currentNode, nextPath.node));
//           break;
//         default:
//           break;
//       }
//     } else {
//       switch (nextPath.node.getType()) {
//         case NodeType.Street:
//         case NodeType.Path:
//           // When entering a street or path, from a path or street, respectively
//           if (currentNode.getType() === NodeType.Street || currentNode.getType() === NodeType.Path) {

//           } else {
//             distanceToTravel += nextPath.distance;
//           }
//           break;
//         case NodeType.Intersection:
//           passingThroughIntersection = true;
//           break;
//         case NodeType.Door:
//           if (currentNode.isOutside()) {
//             for (const dir of _enterBuilding(
//                 nextPath.node,
//                 path.edges[i - 1].direction,
//                 path.edges[i].direction,
//                 path.edges[i + 1].direction,
//                 path.edges[i + 2].direction,
//                 language)) {
//               directions.push(dir);
//             }
//           } else {
//             directions.push(
//               _exitBuilding(
//                 nextPath.node,
//                 path.edges[i + 1].direction,
//                 path.edges[i + 2].direction,
//                 language
//               )
//             );
//           }
//           break;
//         case NodeType.Elevator:
//         case NodeType.Stairs:
//           for (const dir of _changeFloors(
//               nextPath.node,
//               path.edges[i + 1],
//               path.edges[i + 2],
//               language)) {
//             directions.push(dir);
//           }
//           break;
//         case NodeType.Room:
//           directions.push(_enterRoom(path.edges[i - 1], nextPath, language));
//           break;
//         default:
//           // Does nothing
//       }
//     }

//     currentDirection = nextDirection;
//   }

//   return directions;
// }

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
    accessible: boolean,
    language: Language): Promise<DirectionResults> {
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
    path = Navigation.findShortestPathBetween(startNode, targetNode, startGraph, accessible, false);
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

  if (path == undefined) {
    const errorMessage = accessible ? 'no_accessible_path_found' : 'no_path_found';

    return {
      showReport: true,
      steps: [
        {
          description_en: Translations.get(language, errorMessage),
          description_fr: Translations.get(language, errorMessage),
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

  return {
    showReport: false,
    steps: [
      {
        description: startString,
        icon: {
          class: 'material',
          name: 'my-location',
        },
        key: `destination_${startString}`,
      },
      {
        description: targetString,
        icon: {
          class: 'material',
          name: 'place',
        },
        key: `target_${targetString}`,
      },
    ],
  };

  // return _buildDirectionsFromPath(path, graphs, language);
}
