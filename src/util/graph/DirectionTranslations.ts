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
 * @created 2017-09-03
 * @file DirectionTranslations.ts
 * @description Generate translations for specific directions
 */

import * as Translations from '../Translations';
import * as TextUtils from '../TextUtils';

import { Description } from '../../../typings/global';
import { Direction } from './Directions';
import { BuildingGraph, Edge, EdgeDirection } from './Navigation';
import { Language } from '../Translations';
import { default as Node, Type as NodeType } from './Node';
/**
 * Get the translated name of a node type.
 *
 * @param {NodeType} type     the type of node
 * @param {Language} language language to return translation in
 * @returns {string} the translated name
 */
export function getNodeTypeName(type: NodeType, language: Language): string {
  switch (type) {
    case NodeType.Door: return Translations.get(language, 'door');
    case NodeType.Room: return Translations.get(language, 'room');
    case NodeType.Stairs: return Translations.get(language, 'staircase');
    case NodeType.Elevator: return Translations.get(language, 'elevator');
    case NodeType.Hallway: return Translations.get(language, 'hallway');
    case NodeType.Street: return Translations.get(language, 'street');
    case NodeType.Path: return Translations.get(language, 'path');
    case NodeType.Intersection: return Translations.get(language, 'intersection');
    default: throw new Error(`Invalid node type: ${type}`);
  }
}

/**
 * Get the street name of a Street node, translated to the given language.
 *
 * @param {Node}          node     street node
 * @param {BuildingGraph} graph    building graph with street info
 * @param {Language}      language language to return name in
 * @returns {string} name of the street
 */
export function getNodeStreetName(node: Node, graph: BuildingGraph, language: Language): string {
  if (node.getType() !== NodeType.Street) {
    throw new Error('Cannot get street name of non-street nodes');
  }

  const translationIndex = language === 'en' ? 0 : 1;
  const nameId = graph.extra.get(node).split(',')[translationIndex];

  return graph.streets.get(nameId);
}

/** Get translation of 'Turn left' */
function _turnLeft(language: Language): string {
  return language === 'en' ? 'Turn left' : 'Tournez à gauche';
}

/** Get translation of 'Turn left onto' */
function _turnLeftOnto(language: Language): string {
  return language === 'en' ? `${_turnLeft(language)} onto` : `${_turnLeft(language)} sur`;
}

/** Get translation of 'On your left' */
function _onYourLeft(language: Language): string {
  return language === 'en' ? 'On your left' : 'Sur votre gauche';
}

/** Get translation of 'Turn right' */
function _turnRight(language: Language): string {
  return language === 'en' ? 'Turn right' : 'Tournez à droite';
}

/** Get translation of 'Turn right onto' */
function _turnRightOnto(language: Language): string {
  return language === 'en' ? `${_turnRight(language)} onto` : `${_turnRight(language)} sur`;
}

/** Get translation of 'On your right' */
function _onYourRight(language: Language): string {
  return language === 'en' ? 'On your right' : 'Sur votre droite';
}

/** Get translation of 'Proceed straight' */
function _proceedStraight(language: Language): string {
  return language === 'en' ? 'Proceed straight' : 'Continuez tout droit';
}

/** Get translation of 'Proceed straight on' */
function _proceedStraightOn(language: Language): string {
  return language === 'en' ? `${_proceedStraight(language)} on` : `${_proceedStraight(language)} sur`;
}

/** Get translation of 'Directly ahead' */
function _directlyAhead(language: Language): string {
  return language === 'en' ? 'Directly ahead' : 'Directement en avance';
}

/** Get translation of 'Continue straight when it becomes' */
function _continueStraightWhen(language: Language): string {
  return language === 'en'
      ? 'Continue straight when it becomes'
      : 'Continuer tout droit quand il devient';
}

/** Get translation of 'This path' */
function _thisPath(language: Language): string {
  return language === 'en' ? 'This path' : 'Cette voie';
}

/** Get translation of 'The path' */
function _thePath(language: Language): string {
  return language === 'en' ? 'The path' : 'La voie';
}

/** Get translation of 'A path' */
function _aPath(language: Language): string {
  return language === 'en' ? 'A path' : 'Une voie';
}

/**
 * Get translations for all languages to exit a room.
 *
 * @param {Node}      room      room to exit
 * @param {Direction} direction direction to turn to exit the room
 * @returns {Description} directions to exit the room, in all languages
 */
export function translateExitRoom(room: Node, direction: Direction): Description {
  let turnEn: string;
  let turnFr: string;
  switch (direction) {
    case Direction.Left: turnEn = _turnLeft('en'); turnFr = _turnLeft('fr'); break;
    case Direction.Right: turnEn = _turnRight('en'); turnFr = _turnRight('fr'); break;
    case Direction.Straight: turnEn = _proceedStraight('en'); turnFr = _proceedStraight('fr'); break;
    default: throw new Error(`Invalid direction: ${direction}`);
  }

  return {
    description_en: `Exit ${room.getName()} and ${turnEn.toLowerCase()}`,
    description_fr: `Sortie ${room.getName()} et ${turnFr.toLowerCase()}`,
  };
}

/**
 * Get translations for all languages to enter a building.
 *
 * @param {Direction}     passingDirection direction building is approached from
 * @param {Direction}     turningDirection direction to turn to enter building
 * @param {number}        distanceInMetres distance to walk up preceding path/street
 * @param {Node}          outdoorNode      node to traverse prior to door node
 * @param {BuildingGraph} graph            building graph
 * @param {Node}          door             door node
 * @returns {Description[]} directions to enter the building, in all languages
 */
export function translateEnterBuilding(
    passingDirection: Direction,
    turningDirection: Direction,
    distanceInMetres: number,
    outdoorNode: Node,
    graph: BuildingGraph,
    door: Node): Description[] {
  let passingEn: string;
  let passingFr: string;
  switch (passingDirection) {
    case Direction.Left: passingEn = _onYourLeft('en'); passingFr = _onYourLeft('fr'); break;
    case Direction.Right: passingEn = _onYourRight('en'); passingFr = _onYourRight('fr'); break;
    case Direction.Straight: passingEn = _directlyAhead('en'); passingFr = _directlyAhead('fr'); break;
    default: throw new Error(`Invalid direction: ${passingDirection}`);
  }

  let turnEn: string;
  let turnFr: string;
  switch (turningDirection) {
    case Direction.Left: turnEn = _turnLeft('en'); turnFr = _turnLeft('fr'); break;
    case Direction.Right: turnEn = _turnRight('en'); turnFr = _turnRight('fr'); break;
    case Direction.Straight: turnEn = _proceedStraight('en'); turnFr = _proceedStraight('fr'); break;
    default: throw new Error(`Invalid direction: ${turningDirection}`);
  }

  const streetNameEn = outdoorNode.getType() === NodeType.Street ?
      getNodeStreetName(outdoorNode, graph, 'en')
      : _thisPath('en');

  const streetNameFr = outdoorNode.getType() === NodeType.Street ?
      getNodeStreetName(outdoorNode, graph, 'fr')
      : _thisPath('fr');

  // TODO: translate
  return [
    {
      description_en: `Walk approximately ${distanceInMetres}m along ${streetNameEn}`,
      description_fr: `Marcher environ ${distanceInMetres}m le long de le ${streetNameFr}`,
    },
    {
      description_en: `${door.getBuilding()} will be ${passingEn.toLowerCase()}`,
      description_fr: `${door.getBuilding()} sera ${passingFr.toLowerCase()}`,
    },
    {
      description_en: `Enter ${door.getBuilding()} (through ${getNodeTypeName(door.getType(), 'en')}`
          + ` ${door.getName()}) and ${turnEn.toLowerCase()}`,
      description_fr: `Entre dans ${door.getBuilding()} (à travers la ${getNodeTypeName(door.getType(), 'fr')}`
          + ` ${door.getName()}) et ${turnFr.toLowerCase()}`,
    },
  ];
}

/**
 * Get translations for all languages to exit a building.
 *
 * @param {Node}      door      door to exit
 * @param {Direction} direction direction to turn to exit the building
 * @returns {Description} directions to exit the building, in all languages
 */
export function translateExitBuilding(door: Node, direction: Direction): Description {
  let turnEn: string;
  let turnFr: string;
  switch (direction) {
    case Direction.Left: turnEn = _turnLeft('en'); turnFr = _turnLeft('fr'); break;
    case Direction.Right: turnEn = _turnRight('en'); turnFr = _turnRight('fr'); break;
    case Direction.Straight: turnEn = _proceedStraight('en'); turnFr = _proceedStraight('fr'); break;
    default: throw new Error(`Invalid direction: ${direction}`);
  }

  return {
    description_en: `Exit ${door.getBuilding()} (through ${getNodeTypeName(door.getType(), 'en')}`
        + ` ${door.getName()}) and ${turnEn.toLowerCase()}`,
    description_fr: `Sortie ${door.getBuilding()} (à travers la ${getNodeTypeName(door.getType(), 'fr')}`
        + ` ${door.getName()}) et ${turnFr.toLowerCase()}`,
  };
}

/**
 * Get translations for all languages to change floors.
 *
 * @param {Node}      node      node to use to change floors
 * @param {Node}      floorNode node on the target floor
 * @param {Direction} direction direction to turn after leaving the staircase
 * @returns {Description[]} directions to exit the building, in all languages
 */
export function translateChangingFloors(node: Node, floorNode: Node, direction: Direction): Description[] {
  let turnEn: string;
  let turnFr: string;
  switch (direction) {
    case Direction.Left: turnEn = _turnLeft('en'); turnFr = _turnLeft('fr'); break;
    case Direction.Right: turnEn = _turnRight('en'); turnFr = _turnRight('fr'); break;
    case Direction.Straight: turnEn = _proceedStraight('en'); turnFr = _proceedStraight('fr'); break;
    default: throw new Error(`Invalid direction: ${direction}`);
  }

  const nodeNameEn = node.getType() === NodeType.Elevator
      ? getNodeTypeName(node.getType(), 'en')
      : `${getNodeTypeName(node.getType(), 'en')} ${node.getName()}`;

  const nodeNameFr = node.getType() === NodeType.Elevator
      ? getNodeTypeName(node.getType(), 'fr')
      : `${getNodeTypeName(node.getType(), 'fr')} ${node.getName()}`;

  return [
    {
      description_en: `Enter ${nodeNameEn}`,
      description_fr: `Entre ${nodeNameFr}`,
    },
    {
      description_en: `Take ${nodeNameEn} to the ${TextUtils.getOrdinal(floorNode.getFloor(), 'en')} floor`,
      description_fr: `Prendre l'${nodeNameEn} au ${TextUtils.getOrdinal(floorNode.getFloor(), 'fr')} étage`,
    },
    {
      description_en: `Exit ${nodeNameEn} and ${turnEn.toLowerCase()}`,
      description_fr: `Sortie l'${nodeNameFr} et ${turnFr.toLowerCase()}`,
    },
  ];
}

/**
 * Get translations for all languages to enter a room.
 *
 * @param {Node}      room      room to enter
 * @param {Direction} direction direction to turn to enter the room
 * @returns {Description} directions to enter the room, in all languages
 */
export function translateEnterRoom(room: Node, direction: Direction): Description {
  let turnEn: string;
  let turnFr: string;
  switch (direction) {
    case Direction.Left: turnEn = _onYourLeft('en'); turnFr = _onYourLeft('fr'); break;
    case Direction.Right: turnEn = _onYourRight('en'); turnFr = _onYourRight('fr'); break;
    case Direction.Straight: turnEn = _directlyAhead('en'); turnFr = _directlyAhead('fr'); break;
    default: throw new Error(`Invalid direction: ${direction}`);
  }

  return {
    description_en: `${getNodeTypeName(room.getType(), 'en')} ${room.getBuilding()} ${room.getName()}`
        + ` will be ${turnEn.toLowerCase()}`,
    description_fr: `${getNodeTypeName(room.getType(), 'en')} ${room.getBuilding()} ${room.getName()}`
        + ` sera ${turnEn.toLowerCase()}`,
  };
}

/**
 * Get translations for all languages to turn down a hallway.
 *
 * @param {Direction} direction           direction to turn
 * @param {number}    missedHalls         number of missed hallways in the turning direction
 * @param {number}    missedStraightHalls number of missed hallways at the end of the hall
 * @returns {Description} directions to turn down a hallway, in all languages
 */
export function translateTurnDownNthHall(
    direction: Direction,
    missedHalls: number,
    missedStraightHalls: number): Description {
  if (missedStraightHalls === 0) {
    let turnEn: string;
    let turnFr: string;
    switch (direction) {
      case Direction.Left: turnEn = _turnLeft('en'); turnFr = _turnLeft('fr'); break;
      case Direction.Right: turnEn = _turnRight('en'); turnFr = _turnRight('fr'); break;
      default: throw new Error(`Invalid direction to turn: ${direction}`);
    }

    return {
      description_en: `Walk to the end of the hall and ${turnEn.toLowerCase()}`,
      description_fr: `Marcher jusqu'a la fin du couloir et ${turnFr.toLowerCase()}`,
    };
  } else {
    let turnEn: string;
    let turnFr: string;
    switch (direction) {
      case Direction.Left: turnEn = _onYourLeft('en'); turnFr = _onYourLeft('fr'); break;
      case Direction.Right: turnEn = _onYourRight('en'); turnFr = _onYourRight('fr'); break;
      default: throw new Error(`Invalid direction to turn: ${direction}`);
    }

    return {
      description_en: `Turn down the ${TextUtils.getOrdinal(missedHalls + 1, 'en')} hallway ${turnEn.toLowerCase()}`,
      description_fr: `Baissez le ${TextUtils.getOrdinal(missedHalls + 1, 'fr')} couloir ${turnFr.toLowerCase()}`,
    };
  }
}

/**
 * Get translations for all languages to turn onto a street.
 *
 * @param {Node}          currentNode      node of the current path/street
 * @param {Node}          nextNode         node of the next path/street
 * @param {Direction}     direction        direction to turn
 * @param {number}        distanceInMetres distance travelled down current street before turn
 * @param {BuildingGraph} graph            building graph, for street names
 * @returns {Description} directions to turn down a street, in all languages
 */
export function translateTurnDownStreet(
    currentNode: Node,
    nextNode: Node,
    direction: Direction,
    distanceInMetres: number,
    graph: BuildingGraph): Description {
  let turnEn: string;
  let turnFr: string;
  switch (direction) {
    case Direction.Left: turnEn = _turnLeftOnto('en'); turnFr = _turnLeftOnto('fr'); break;
    case Direction.Right: turnEn = _turnRightOnto('en'); turnFr = _turnRightOnto('fr'); break;
    case Direction.Straight: turnEn = _continueStraightWhen('en'); turnFr = _continueStraightWhen('fr'); break;
    default: throw new Error(`Invalid direction to turn: ${direction}`);
  }

  let nextStreetEn: string;
  let nextStreetFr: string;
  switch (nextNode.getType()) {
    case NodeType.Street:
      nextStreetEn = getNodeStreetName(nextNode, graph, 'en');
      nextStreetFr = getNodeStreetName(nextNode, graph, 'fr');
      break;
    case NodeType.Path:
      nextStreetEn = (direction === Direction.Straight) ? _aPath('en').toLowerCase() : _thePath('en').toLowerCase();
      nextStreetEn = (direction === Direction.Straight) ? _aPath('en').toLowerCase() : _thePath('en').toLowerCase();
      break;
    default: throw new Error(`Cannot turn down onto a node which is not a Street or a Path: ${nextNode.getType()}`);
  }

  const streetNameEn = currentNode.getType() === NodeType.Street ?
      getNodeStreetName(currentNode, graph, 'en')
      : _thisPath('en');
  const streetNameFr = currentNode.getType() === NodeType.Street ?
      getNodeStreetName(currentNode, graph, 'fr')
      : _thisPath('fr');

  return {
    description_en: `Walk approximately ${distanceInMetres}m along ${streetNameEn}, then`
        + `${turnEn.toLowerCase()} ${nextStreetEn}`,
    description_fr: `Marcher environ ${distanceInMetres}m le long de le ${streetNameFr}, puis`
        + `${turnFr.toLowerCase()} ${nextStreetFr}`,
  };
}

/**
 * Get translations for all languages to cross an intersection.
 *
 * @param {Node}          previousEdge     the current path/street being travelled down
 * @param {Node}          intersectionNode the intersection to cross
 * @param {Node}          nextEdge         the street/path after the intersection
 * @param {Direction}     turningDirection direction to turn to cross the intersection
 * @param {Direction}     nextDirection    direction to turn after crossing the intersection
 * @param {number}        distanceInMetres distance travelled on current path to reach intersection
 * @param {BuildingGraph} graph            the graph, for retrieving street names
 * @returns {Description[]} directions to cross an intersection, in all languages
 */
export function translateCrossIntersection(
    previousEdge: Edge,
    intersectionEdge: Edge,
    nextEdge: Edge,
    turningDirection: Direction,
    nextDirection: Direction,
    distanceInMetres: number,
    graph: BuildingGraph): Description[] {
  const translations: Description[] = [];

  // Instruct how far to walk along preceding path/street, or skip if previous node was an intersection
  if (previousEdge.node.getType() !== NodeType.Intersection) {
    const previousStreetEn = previousEdge.node.getType() === NodeType.Street
        ? getNodeStreetName(previousEdge.node, graph, 'en')
        : _thisPath('en').toLowerCase();
    const previousStreetFr = previousEdge.node.getType() === NodeType.Street
        ? getNodeStreetName(previousEdge.node, graph, 'fr')
        : _thisPath('fr').toLowerCase();
    translations.push({
      description_en: `Walk approximately ${distanceInMetres}m along ${previousStreetEn}`,
      description_fr: `Marcher environ ${distanceInMetres}m le long de le ${previousStreetFr}`,
    });
  }

  // Determine which direction to turn to cross the intersection
  let turnEn: string;
  let turnFr: string;
  switch (turningDirection) {
    case Direction.Left: turnEn = _turnLeft('en'); turnFr = _turnLeft('fr'); break;
    case Direction.Right: turnEn = _turnRight('en'); turnFr = _turnRight('fr'); break;
    case Direction.Straight: turnEn = _proceedStraight('en'); turnFr = _proceedStraight('fr'); break;
    default: throw new Error(`Invalid direction: ${turningDirection}`);
  }

  /* tslint:disable no-magic-numbers */
  /* Specify array index up to 3 */

  // Get the street to cross from the intersection edge
  const intersectionStreets = graph.extra.get(intersectionEdge.node).split(',');
  let streetIndex: number;
  switch (intersectionEdge.direction) {
    case EdgeDirection.Left: streetIndex = 0; break;
    case EdgeDirection.Up: streetIndex = 1; break;
    case EdgeDirection.Right: streetIndex = 2; break;
    case EdgeDirection.Down: streetIndex = 3; break;
    default: throw new Error(`Invalid edge direction: ${intersectionEdge.direction}`);
  }

  /* tslint:enable no-magic-numbers */

  const streetNameEn = graph.streets.get(intersectionStreets[streetIndex].split(':')[0]);
  const streetNameFr = graph.streets.get(intersectionStreets[streetIndex].split(':')[1]);
  translations.push({
    description_en: `${turnEn.toLowerCase()} and cross ${streetNameEn}`,
    description_fr: `${turnFr.toLowerCase()} et traversez le ${streetNameFr}`,
  });

  // Determine which direction to turn onto the following path/street, or skip if the next node is an intersection
  if (nextEdge.node.getType() !== NodeType.Intersection) {
    const nextStreetEn = nextEdge.node.getType() === NodeType.Street
        ? getNodeStreetName(nextEdge.node, graph, 'en')
        : _thePath('en').toLowerCase();
    const nextStreetFr = nextEdge.node.getType() === NodeType.Street
        ? getNodeStreetName(nextEdge.node, graph, 'fr')
        : _thePath('fr').toLowerCase();

    switch (nextDirection) {
      case Direction.Left: turnEn = _turnLeftOnto('en'); turnFr = _turnLeftOnto('fr'); break;
      case Direction.Right: turnEn = _turnRightOnto('en'); turnFr = _turnRightOnto('fr'); break;
      case Direction.Straight: turnEn = _proceedStraightOn('en'); turnFr = _proceedStraightOn('fr'); break;
      default: throw new Error(`Invalid direction: ${nextDirection}`);
    }

    translations.push({
      description_en: `${turnEn} ${nextStreetEn}`,
      description_fr: `${turnFr} ${nextStreetFr}`,
    });
  }

  return translations;
}
