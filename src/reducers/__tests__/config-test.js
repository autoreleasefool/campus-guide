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
 * @created 2016-10-08
 * @file config-test.js
 * @description Tests config reducers
 *
 */
'use strict';

// Imports
import reducer from '../config';

// Expected initial state
const initialState = {
  alwaysSearchAll: false,
  currentSemester: 0,
  firstTime: false,
  language: null,
  preferredTimeFormat: '12h',
  prefersWheelchair: false,
  semesters: [],
};

// Test configuration update
const configurationUpdate = {
  alwaysSearchAll: true,
  language: 'en',
};

// Expected state when configuration updated
const updatedState = {
  alwaysSearchAll: true,
  currentSemester: 0,
  firstTime: false,
  language: 'en',
  preferredTimeFormat: '12h',
  prefersWheelchair: false,
  semesters: [],
};

describe('config reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should update the state', () => {
    expect(
      reducer(
        initialState,
        {
          type: 'UPDATE_CONFIGURATION',
          options: configurationUpdate,
        }
      )
    ).toEqual(updatedState);
  });
});
