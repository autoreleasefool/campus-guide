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
 * @created 2018-06-19
 * @file CampusGraph-test.ts
 * @description Tests the methods to parse campus graphs.
 */

jest.setMock('../../Configuration', {
  getDoorsForBuildings: async(): Promise<any> => {
    return undefined;
  },
  getTextFile: async(textFile: string): Promise<string> => {
    return graphTextFiles.get(textFile);
  },
});

// Imports
import * as CampusGraph from '../CampusGraph';
import fs from 'fs';
import path from 'path';
import { getCachedNodeOrBuild } from '../Navigation';

// Type imports
import { Graph } from '../CampusGraph';

const graphTextFiles: Map<string, string> = new Map();
const testingGraphs = ['GSD_graph.txt', 'OUT_graph.txt', 'STE_graph.txt'];

// Mock translations for days
jest.mock('../../../../assets/json/CoreTranslations.json', () => ({
  en: {
    friday: 'Day',
    monday: 'Day',
    saturday: 'Day',
    sunday: 'Day',
    thursday: 'Day',
    tuesday: 'Day',
    wednesday: 'Day',
  },
  fr: {
    friday: 'Jour',
    monday: 'Jour',
    saturday: 'Jour',
    sunday: 'Jour',
    thursday: 'Jour',
    tuesday: 'Jour',
    wednesday: 'Jour',
  },
}));

// Graphs to test on
let graphs: Map<string, Graph>;

describe('CampusGraph-test', () => {
  beforeEach(async() => {
    for (const file of testingGraphs) {
      const dir = path.join(__dirname, '..', '__mocks__', `${file}`);
      graphTextFiles.set(
        `/${file}`,
        await fs.readFileSync(dir, 'utf8')
      );
    }

    const buildingNames: Set<string> = new Set(['GSD', 'OUT', 'STE']);
    graphs = await CampusGraph.getGraphs(buildingNames);
  });

  it('tests that only requested graphs are loaded', async() => {
    const buildingNames: Set<string> = new Set(['GSD', 'OUT']);
    const testGraphs = await CampusGraph.getGraphs(buildingNames);
    expect(testGraphs.size).toBe(2);
    expect(testGraphs.get('GSD')).not.toBeNull();
    expect(testGraphs.get('OUT')).not.toBeNull();
    expect(testGraphs.get('STE')).toBeUndefined();
  });

  it('tests that graphs are successfully loaded', () => {
    const gsdGraph = graphs.get('GSD');
    const outGraph = graphs.get('OUT');
    const steGraph = graphs.get('STE');
    expect(gsdGraph).not.toBeNull();
    expect(outGraph).not.toBeNull();
    expect(steGraph).not.toBeNull();
  });

  it('tests that graphs are set in the proper campus', () => {
    const gsdGraph = graphs.get('GSD');
    const outGraph = graphs.get('OUT');
    const steGraph = graphs.get('STE');
    expect(gsdGraph.campus).toBe('main');
    expect(outGraph.campus).toBe('main');
    expect(steGraph.campus).toBe('main');
  });

  it('tests that graphs have exits', () => {
    const gsdGraph = graphs.get('GSD');
    const outGraph = graphs.get('OUT');
    const steGraph = graphs.get('STE');

    // tslint:disable no-magic-numbers
    expect(gsdGraph.exits.size).toBe(1);
    expect(outGraph.exits.size).toBe(3);
    expect(steGraph.exits.size).toBe(2);
    // tslint:enable no-magic-numbers

    // Non-outdoor graphs shouldn't have x/y coords for doors
    const gsdDoorNode = getCachedNodeOrBuild('D1', 'GSD', gsdGraph.formattingRules);
    expect(gsdGraph.exits.get(gsdDoorNode)).toEqual({ x: 0, y: 0 });

    // Outdoor graphs should map doors to x/y coords
    const steDoorNode = getCachedNodeOrBuild('D1', 'STE', outGraph.formattingRules);
    expect(outGraph.exits.get(steDoorNode)).toEqual({ x: 310, y: 227 });
  });

  it('tests that graphs have the proper exclusions', () => {
    const gsdGraph = graphs.get('GSD');
    const outGraph = graphs.get('OUT');
    const steGraph = graphs.get('STE');
    expect(gsdGraph.excluded.size).toBe(2);
    expect(outGraph.excluded.size).toBe(0);
    expect(steGraph.excluded.size).toBe(0);

    const firstExcludedNode = getCachedNodeOrBuild('H1h2', 'GSD', gsdGraph.formattingRules);
    const secondExcludedNode = getCachedNodeOrBuild('H1h3', 'GSD', gsdGraph.formattingRules);

    expect(gsdGraph.excluded.get(firstExcludedNode)).toEqual(new Set([secondExcludedNode]));
    expect(gsdGraph.excluded.get(secondExcludedNode)).toEqual(new Set([firstExcludedNode]));
  });

  it('tests that graphs have the proper formatting rules', () => {
    const gsdGraph = graphs.get('GSD');
    const outGraph = graphs.get('OUT');
    const steGraph = graphs.get('STE');

    expect(gsdGraph.formattingRules.size).toBe(2);
    expect(outGraph.formattingRules.size).toBe(1);
    expect(steGraph.formattingRules.size).toBe(1);

    expect(gsdGraph.formattingRules.get('floor1')).toBe('^(1).*$');
    expect(gsdGraph.formattingRules.get('floor2')).toBe('^(2).*$');
    expect(outGraph.formattingRules.get('floor*')).toBe('^(\\d).*$');
    expect(steGraph.formattingRules.get('floor*')).toBe('^(\\d).*$');
  });

  it('tests that graphs have the proper intersections', () => {
    const gsdGraph = graphs.get('GSD');
    const outGraph = graphs.get('OUT');
    const steGraph = graphs.get('STE');

    // tslint:disable no-magic-numbers
    expect(gsdGraph.intersections.size).toBe(0);
    expect(outGraph.intersections.size).toBe(4);
    expect(steGraph.intersections.size).toBe(0);
    // tslint:enable no-magic-numbers

    const intersectionNode = getCachedNodeOrBuild('I5', 'OUT', outGraph.formattingRules);
    expect(outGraph.intersections.get(intersectionNode)).toBe(',,2:3,0:1');
  });

  it('tests that graphs have the proper street names', () => {
    const gsdGraph = graphs.get('GSD');
    const outGraph = graphs.get('OUT');
    const steGraph = graphs.get('STE');

    // tslint:disable no-magic-numbers
    expect(gsdGraph.streets.size).toBe(0);
    expect(outGraph.streets.size).toBe(17);
    expect(steGraph.streets.size).toBe(0);
    // tslint:enable no-magic-numbers

    // tslint:disable no-magic-numbers
    expect(gsdGraph.streetNames.size).toBe(0);
    expect(outGraph.streetNames.size).toBe(6);
    expect(steGraph.streetNames.size).toBe(0);
    // tslint:enable no-magic-numbers

    expect(outGraph.streetNames.get('0')).toBe('English1');
    expect(outGraph.streetNames.get('1')).toBe('French1');
    expect(outGraph.streetNames.get('5')).toBe('French3');
  });

  it('tests that graph adjacencies are correctly loaded', () => {
    const gsdGraph = graphs.get('GSD');

    const adjacentHallNode = getCachedNodeOrBuild('H1h2', 'GSD', gsdGraph.formattingRules);
    const hallAdjacencies = gsdGraph.adjacencies.get(adjacentHallNode);

    // tslint:disable no-magic-numbers
    expect(hallAdjacencies).toEqual([
      {
        accessible: true,
        direction: 'L',
        distance: 67,
        node: getCachedNodeOrBuild('H1h1', 'GSD', gsdGraph.formattingRules),
      },
      {
        accessible: true,
        direction: 'R',
        distance: 69,
        node: getCachedNodeOrBuild('H1h3', 'GSD', gsdGraph.formattingRules),
      },
      {
        accessible: true,
        direction: 'D',
        distance: 67,
        node: getCachedNodeOrBuild('H1h4', 'GSD', gsdGraph.formattingRules),
      },
      {
        accessible: true,
        direction: 'U',
        distance: 60,
        node: getCachedNodeOrBuild('R101', 'GSD', gsdGraph.formattingRules),
      },
    ]);
    // tslint:enable no-magic-numbers

    const adjacentStairNode = getCachedNodeOrBuild('SB', 'GSD', gsdGraph.formattingRules);
    const stairAdjacencies = gsdGraph.adjacencies.get(adjacentStairNode);

    // tslint:disable no-magic-numbers
    expect(stairAdjacencies).toEqual([
      {
        accessible: false,
        direction: 'L',
        distance: 51,
        node: getCachedNodeOrBuild('H1h5', 'GSD', gsdGraph.formattingRules),
      },
      {
        accessible: false,
        direction: 'L',
        distance: 80,
        node: getCachedNodeOrBuild('H2h8', 'GSD', gsdGraph.formattingRules),
      },
    ]);
    // tslint:enable no-magic-numbers

  });

});