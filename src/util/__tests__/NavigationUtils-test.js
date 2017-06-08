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
 * @created 2017-06-07
 * @file NavigationUtils-test.js
 * @description Tests the navigation methods.
 *
 */
'use strict';

// Require modules used in testing
import * as NavigationUtils from '../NavigationUtils';

const buildings = [
  {
    location: {
      latitude: 0,
      longitude: 0,
    },
  },
  {
    location: {
      latitude: 45,
      longitude: 75,
    },
  },
  {
    location: {
      latitude: 38.897147,
      longitude: -77.043934,
    },
  },
];

describe('NavigationUtils-test', () => {

  it('tests finding the closest building in a list to a location', () => {

    expect(NavigationUtils.findClosestBuilding({ latitude: 0, longitude: 0 }, buildings)).toBe(buildings[0]);
    expect(NavigationUtils.findClosestBuilding({ latitude: 38, longitude: -77 }, buildings)).toBe(buildings[2]);
    expect(NavigationUtils.findClosestBuilding({ latitude: 25, longitude: 25 }, buildings, 1)).toBeNull();

  });

  it('tests that comparing the distance between coordinates works', () => {

    /* eslint-disable no-magic-numbers */
    /* Test: http://andrew.hedges.name/experiments/haversine/ */

    expect(NavigationUtils.getDistanceBetweenCoordinates(0, 0, 0, 0)).toBe(0);
    expect(NavigationUtils.getDistanceBetweenCoordinates(0, 0, 45, 75)).toBeCloseTo(8835, 1);
    expect(NavigationUtils.getDistanceBetweenCoordinates(38.898556, -77.037852, 38.897147, -77.043934))
        .toBeCloseTo(0.549, 1);

    /* eslint-enable no-magic-numbers */

  });

});
