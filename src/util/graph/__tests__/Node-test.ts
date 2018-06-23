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
 * @created 2018-06-22
 * @file Node-test.ts
 * @description Tests the methods to create graph Nodes.
 */

import Node from '../Node';

// Default floor formatting rules
const formattingRules: Map<string, string> = new Map();
formattingRules.set('Invalid', 'Invalid');
formattingRules.set('floor00', '^(00).*$');
formattingRules.set('floor*', '^(\\d).*$');

describe('Node-test', () => {

  it('tests that Node ids are built correctly', () => {
    expect(Node.buildId('H1h1', 'GSD')).toBe('BGSD#H1h1');
    expect(Node.buildId('Bid', 'GSD')).toBe('Bid');
  });

  it('tests that a hallway Node is constructed correctly', () => {
    const testNode = new Node('H1h1', 'GSD', formattingRules);
    expect(testNode.getBuilding()).toBe('GSD');
    expect(testNode.getFloor()).toBe('1');
    expect(testNode.getFloorInt()).toBe(1);
    expect(testNode.getId()).toBe('BGSD#H1h1');
    expect(testNode.getName()).toBe('1h1');
    expect(testNode.getType()).toBe('H');
    expect(testNode.isOutside()).toBeFalsy();
    expect(testNode.isAccessible()).toBeTruthy();
    expect(testNode.toString()).toBe('BGSD#H1h1');
  });

  it('tests that a stairway node is not accessible', () => {
    const testNode = new Node('SB', 'GSD', formattingRules);
    expect(testNode.isAccessible()).toBeFalsy();
  });

  it('tests that an elevator node does not have a floor', () => {
    const testNode = new Node('EA', 'GSD', formattingRules);
    expect(testNode.getFloor()).toBeUndefined();
    expect(() => {
      testNode.getFloorInt();
    }).toThrow();
  });

  it('tests that a node on floor 00 is in the basement', () => {
    const testNode = new Node('H00h1', 'GSD', formattingRules);
    expect(testNode.getFloor()).toBe('00');
    expect(testNode.getFloorInt()).toBe(-1);
  });

});