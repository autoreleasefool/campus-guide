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
 * @created 2017-08-04
 * @file Node.ts
 * @description Node in a graph
 */

 /** Node types */
export enum Type {
  Door = 'D',
  Elevator = 'E',
  Hallway = 'H',
  Intersection = 'I',
  OutdoorSteps = 'O',
  Path = 'P',
  Room = 'R',
  Stairs = 'S',
  Street = 'T',
}

export default class Node {

  /** Original ID used to construct the node. */
  _originalId: string;

  /** ID of the node after formatting. */
  _formattedId: string;

  /** Type of the node. */
  _type: Type;

  /** The name of the node. */
  _name: string;

  /** Building the node is in. */
  _building: string;

  /** Floor which the node is on. */
  _floor: string;

  /**
   * Construct a node ID.
   *
   * @param id       base node ID
   * @param building building the node is in
   */
  static buildId(id: string, building: string): string {
    return id.startsWith('B') ? id : `B${building}-${id}`;
  }

  constructor(id: string, building: string, formats: Map<string, string>) {
    // Parse node properties
    this._originalId = id;
    this._formattedId = Node.buildId(id, building);
    this._type = this._formattedId.charAt(this._formattedId.indexOf('-') + 1) as Type;
    this._name = this._formattedId.substr(this._formattedId.indexOf('-') + 2);
    this._building = building;

    // Get floor of the node by comparing it to available floors
    if (this._type === Type.Room || this._type === Type.Hallway) {
      for (const format of formats.keys()) {
        if (!format.startsWith('floor')) {
          continue;
        }

        const floorRegex = new RegExp(formats.get(format));
        const match = floorRegex.exec(this._name);
        if (match != undefined) {
          this._floor = match[1];
          break;
        }
      }
    }
  }

  /**
   * Returns the shorthand of this building.
   */
  getBuilding(): string {
    return this._building;
  }

  /**
   * Gets the floor this room is on, or -1 if unknown.
   */
  getFloor(): string {
    return this._floor;
  }

  /**
   * Returns the ID to use for unique identification purposes.
   */
  getId(): string {
    return this._formattedId;
  }

  /**
   * Returns the node's name.
   */
  getName(): string {
    return this._name;
  }

  /**
   * Returns the type of node.
   */
  getType(): Type {
    return this._type;
  }

  /**
   * Returns true if the node is considered outside (it's building is OUT).
   */
  isOutside(): boolean {
    return this.getBuilding() === 'OUT';
  }

  /**
   * Returns true if the node is accessible, or false if it is inaccessible.
   */
  isAccessible(): boolean {
    switch (this.getType()) {
      case Type.Stairs:
        return false;
      default:
        return true;
    }
  }

  /**
   * Return a string representation of this node.
   *
   * @returns {string} this node's formatted Id
   */
  toString(): string {
    return this._formattedId;
  }

}
