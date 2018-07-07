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
 * @created 2018-06-29
 * @file Navigation-test.ts
 * @description Tests the methods for campus navigation.
 */

jest.setMock('../../Configuration', {
  getTextFile: async(textFile: string): Promise<string> => {
    return graphTextFiles.get(textFile);
  },
});

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

// Imports
import fs from 'fs';
import Node from '../Node';
import path from 'path';
import * as CampusGraph from '../CampusGraph';
import * as Navigation from '../Navigation';

// Type imports
import { Graph } from '../CampusGraph';
import { Path } from '../Navigation';

// Graphs to test on
let graphs: Map<string, Graph>;
const graphTextFiles: Map<string, string> = new Map();
const testingGraphs = ['GSD_graph.txt', 'OUT_graph.txt', 'STE_graph.txt'];

describe('Navigation-test', () => {

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

  it('tests that nodes are built correctly', () => {
    const gsdGraph = graphs.get('GSD');
    const id = 'H1h1';
    const building = 'GSD';
    const nodeId = Node.buildId(id, building);
    const expectedNode = new Node(nodeId, building, gsdGraph.formattingRules);
    const testNode = Navigation.getCachedNodeOrBuild(nodeId, building, gsdGraph.formattingRules);
    expect(testNode).toEqual(expectedNode);
  });

  it('tests that the correct distance is found between doors', () => {
    const doors = CampusGraph.getDoorsForBuildings(graphs.get('OUT'), new Set(['GSD', 'STE']));
    const gsdDoors = doors.get('GSD');
    const steDoors = doors.get('STE');

    /* tslint:disable no-magic-numbers */
    const expectedDistances: Map<Node, Map<Node, number>> = new Map(
      [
        [
          Navigation.getCachedNodeOrBuild('D1', 'GSD', graphs.get('GSD').formattingRules),
          new Map(
            [
              [Navigation.getCachedNodeOrBuild('D1', 'STE', graphs.get('STE').formattingRules), 274.089401473314907],
              [Navigation.getCachedNodeOrBuild('D2', 'STE', graphs.get('STE').formattingRules), 388.190674797836946],
            ]
          ),
        ],
      ]
    );
    /* tslint:enable no-magic-numbers */

    expect(Navigation.findDistancesBetweenDoors(gsdDoors, steDoors, graphs.get('OUT'))).toEqual(expectedDistances);
  });

  it('tests that the shortest route between a node and two destinations is found', () => {
    const steGraph = graphs.get('STE');
    const startNode = Navigation.getCachedNodeOrBuild('H1h12', 'STE', steGraph.formattingRules);
    const endNodes: Node[] = [
      Navigation.getCachedNodeOrBuild('H1h11', 'STE', steGraph.formattingRules),
      Navigation.getCachedNodeOrBuild('D1', 'STE', steGraph.formattingRules),
    ];

    /* tslint:disable no-magic-numbers */
    const expectedPaths: Map<Node, Path> = new Map(
      [
        [
          endNodes[0],
          {
            distance: 292,
            edges: [
              {
                accessible: true,
                direction: CampusGraph.EdgeDirection.Up,
                distance: 54,
                node: Navigation.getCachedNodeOrBuild('H1h1', 'STE', steGraph.formattingRules),
              },
              {
                accessible: true,
                direction: CampusGraph.EdgeDirection.Right,
                distance: 63,
                node: Navigation.getCachedNodeOrBuild('H1h3', 'STE', steGraph.formattingRules),
              },
              {
                accessible: true,
                direction: CampusGraph.EdgeDirection.Right,
                distance: 67,
                node: Navigation.getCachedNodeOrBuild('H1h4', 'STE', steGraph.formattingRules),
              },
              {
                accessible: true,
                direction: CampusGraph.EdgeDirection.Right,
                distance: 57,
                node: Navigation.getCachedNodeOrBuild('H1h9', 'STE', steGraph.formattingRules),
              },
              {
                accessible: true,
                direction: CampusGraph.EdgeDirection.Up,
                distance: 51,
                node: endNodes[0],
              },
            ],
            source: startNode,
          },
        ],
        [
          endNodes[1],
          {
            distance: 114,
            edges: [
              {
                accessible: true,
                direction: CampusGraph.EdgeDirection.Up,
                distance: 54,
                node: Navigation.getCachedNodeOrBuild('H1h1', 'STE', steGraph.formattingRules),
              },
              {
                accessible: true,
                direction: CampusGraph.EdgeDirection.Left,
                distance: 60,
                node: endNodes[1],
              },
            ],
            source: startNode,
          },
        ],
      ]
    );
    /* tslint:enable no-magic-numbers */

    expect(
      Navigation.findShortestPathsBetween(startNode, new Set(endNodes), steGraph, false, false)
    ).toEqual(expectedPaths);
  });

  it('tests that no path between the nodes is found', () => {
    const steGraph = graphs.get('STE');
    const startNode = Navigation.getCachedNodeOrBuild('H1h12', 'STE', steGraph.formattingRules);
    const endNodes: Node[] = [
      Navigation.getCachedNodeOrBuild('H1hinvalid', 'STE', steGraph.formattingRules),
    ];

    expect(
      Navigation.findShortestPathsBetween(startNode, new Set(endNodes), steGraph, false, false)
    ).toEqual(new Map());
  });

  it('tests that a path is found between two nodes', () => {
    const steGraph = graphs.get('STE');
    const startNode = Navigation.getCachedNodeOrBuild('H1h12', 'STE', steGraph.formattingRules);
    const endNode = Navigation.getCachedNodeOrBuild('H1h11', 'STE', steGraph.formattingRules);

    /* tslint:disable no-magic-numbers */
    const expectedPath: Path = {
      distance: 292,
      edges: [
        {
          accessible: true,
          direction: CampusGraph.EdgeDirection.Up,
          distance: 54,
          node: Navigation.getCachedNodeOrBuild('H1h1', 'STE', steGraph.formattingRules),
        },
        {
          accessible: true,
          direction: CampusGraph.EdgeDirection.Right,
          distance: 63,
          node: Navigation.getCachedNodeOrBuild('H1h3', 'STE', steGraph.formattingRules),
        },
        {
          accessible: true,
          direction: CampusGraph.EdgeDirection.Right,
          distance: 67,
          node: Navigation.getCachedNodeOrBuild('H1h4', 'STE', steGraph.formattingRules),
        },
        {
          accessible: true,
          direction: CampusGraph.EdgeDirection.Right,
          distance: 57,
          node: Navigation.getCachedNodeOrBuild('H1h9', 'STE', steGraph.formattingRules),
        },
        {
          accessible: true,
          direction: CampusGraph.EdgeDirection.Up,
          distance: 51,
          node: endNode,
        },
      ],
      source: startNode,
    };
    /* tslint:enable no-magic-numbers */

    expect(
      Navigation.findShortestPathBetween(startNode, endNode, steGraph, false, false)
    ).toEqual(expectedPath);
  });

  it('tests that the best path across buildings is found', () => {
    const outGraph = graphs.get('OUT');

    // Set up STE nodes and paths
    const steGraph = graphs.get('STE');
    const steStartNode = Navigation.getCachedNodeOrBuild('H1h1', 'STE', steGraph.formattingRules);
    const steInnerDoors: Node[] = [
      Navigation.getCachedNodeOrBuild('D1', 'STE', steGraph.formattingRules),
      Navigation.getCachedNodeOrBuild('D2', 'STE', steGraph.formattingRules),
    ];
    const steStartToExits = Navigation.findShortestPathsBetween(
      steStartNode,
      new Set(steInnerDoors),
      steGraph,
      false,
      false
    );

    // Set up GSD nodes and paths
    const gsdGraph = graphs.get('GSD');
    const gsdStartNode = Navigation.getCachedNodeOrBuild('H1h2', 'GSD', gsdGraph.formattingRules);
    const gsdInnerDoors: Node[] = [Navigation.getCachedNodeOrBuild('D1', 'GSD', gsdGraph.formattingRules)];
    const gsdExitsToTarget = Navigation.findShortestPathsBetween(
      gsdStartNode,
      new Set(gsdInnerDoors),
      gsdGraph,
      false,
      true
    );

    // Get door distances
    const doors = CampusGraph.getDoorsForBuildings(outGraph, new Set(['GSD', 'STE']));
    const gsdDoors = doors.get('GSD');
    const steDoors = doors.get('STE');
    const exitDistances = Navigation.findDistancesBetweenDoors(steDoors, gsdDoors, outGraph);

    expect(Navigation.getBestPathAcross(steStartToExits, gsdExitsToTarget, exitDistances, graphs, true, true)).toEqual(
      {
        distance: 752,
        edges: [
          {
            accessible: true,
            direction: CampusGraph.EdgeDirection.Left,
            distance: 60,
            node: Navigation.getCachedNodeOrBuild('D1', 'STE', steGraph.formattingRules),
          },
          {
            accessible: true,
            direction: CampusGraph.EdgeDirection.Down,
            distance: 29,
            node: Navigation.getCachedNodeOrBuild('T24', 'OUT', outGraph.formattingRules),
          },
          {
            accessible: true,
            direction: CampusGraph.EdgeDirection.Down,
            distance: 41,
            node: Navigation.getCachedNodeOrBuild('T23', 'OUT', outGraph.formattingRules),
          },
          {
            accessible: true,
            direction: CampusGraph.EdgeDirection.Down,
            distance: 32,
            node: Navigation.getCachedNodeOrBuild('P19', 'OUT', outGraph.formattingRules),
          },
          {
            accessible: true,
            direction: CampusGraph.EdgeDirection.Left,
            distance: 48,
            node: Navigation.getCachedNodeOrBuild('P21', 'OUT', outGraph.formattingRules),
          },
          {
            accessible: false,
            direction: CampusGraph.EdgeDirection.Left,
            distance: 16,
            node: Navigation.getCachedNodeOrBuild('O22', 'OUT', outGraph.formattingRules),
          },
          {
            accessible: false,
            direction: CampusGraph.EdgeDirection.Left,
            distance: 11,
            node: Navigation.getCachedNodeOrBuild('P20', 'OUT', outGraph.formattingRules),
          },
          {
            accessible: true,
            direction: CampusGraph.EdgeDirection.Left,
            distance: 40,
            node: Navigation.getCachedNodeOrBuild('P18', 'OUT', outGraph.formattingRules),
          },
          {
            accessible: true,
            direction: CampusGraph.EdgeDirection.Up,
            distance: 71,
            node: Navigation.getCachedNodeOrBuild('P17', 'OUT', outGraph.formattingRules),
          },
          {
            accessible: true,
            direction: CampusGraph.EdgeDirection.Up,
            distance: 32,
            node: Navigation.getCachedNodeOrBuild('T16', 'OUT', outGraph.formattingRules),
          },
          {
            accessible: true,
            direction: CampusGraph.EdgeDirection.Up,
            distance: 43,
            node: Navigation.getCachedNodeOrBuild('T14', 'OUT', outGraph.formattingRules),
          },
          {
            accessible: true,
            direction: CampusGraph.EdgeDirection.Up,
            distance: 25,
            node: Navigation.getCachedNodeOrBuild('I8', 'OUT', outGraph.formattingRules),
          },
          {
            accessible: true,
            direction: CampusGraph.EdgeDirection.Up,
            distance: 31,
            node: Navigation.getCachedNodeOrBuild('I6', 'OUT', outGraph.formattingRules),
          },
          {
            accessible: true,
            direction: CampusGraph.EdgeDirection.Left,
            distance: 35,
            node: Navigation.getCachedNodeOrBuild('I5', 'OUT', outGraph.formattingRules),
          },
          {
            accessible: true,
            direction: CampusGraph.EdgeDirection.Left,
            distance: 35,
            node: Navigation.getCachedNodeOrBuild('T4', 'OUT', outGraph.formattingRules),
          },
          {
            accessible: true,
            direction: CampusGraph.EdgeDirection.Left,
            distance: 32,
            node: Navigation.getCachedNodeOrBuild('T3', 'OUT', outGraph.formattingRules),
          },
          {
            accessible: true,
            direction: CampusGraph.EdgeDirection.Left,
            distance: 36,
            node: Navigation.getCachedNodeOrBuild('D1', 'GSD', gsdGraph.formattingRules),
          },
          {
            accessible: true,
            direction: CampusGraph.EdgeDirection.Up,
            distance: 68,
            node: Navigation.getCachedNodeOrBuild('H1h4', 'GSD', gsdGraph.formattingRules),
          },
          {
            accessible: true,
            direction: CampusGraph.EdgeDirection.Up,
            distance: 67,
            node: Navigation.getCachedNodeOrBuild('H1h2', 'GSD', gsdGraph.formattingRules),
          },
        ],
        source: steStartNode,
      }
    );

  });

});