/**
 *
 * @license
 * Copyright (C) 2016 Joseph Roque
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
 * @file DisplayUtils_testFacilityIcons.js
 * @description Tests retrieving icons for building facilities.
 *
 */
'use strict';

// Unmock modules so the real module is used.
jest.unmock('../DisplayUtils');

// List of social media platforms to test.
const FACILITIES = [
  'atm',
  'food',
  'printer',
  'store',
  'bed',
  'alcohol',
  'laundry',
  'library',
  'parking',
  'mail',
  'pharmacy',
  'gym',
  'pool',
  'invalid',
];

describe('testFacilityIcons', () => {
  it('tests retrieving facility icon names.', () => {
    const DisplayUtils = require('../DisplayUtils');

    for (let i = 0; i < FACILITIES.length; i++) {
      expect(DisplayUtils.getFacilityIconName(FACILITIES[i])).toBeDefined();
    }
  });

  it('tests retrieving facility icon classes.', () => {
    const DisplayUtils = require('../DisplayUtils');

    for (let i = 0; i < FACILITIES.length; i++) {
      expect(DisplayUtils.getFacilityIconClass(FACILITIES[i])).toBeDefined();
    }
  });
});
