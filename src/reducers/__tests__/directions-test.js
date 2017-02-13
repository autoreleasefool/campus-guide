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
 * @created 2017-02-12
 * @file directions-test.js
 * @description Tests direction reducers
 *
 */
'use strict';

// Types
import { SET_DESTINATION, VIEW_BUILDING } from 'actionTypes';

// Imports
import reducer from '../directions';

// Expected initial state
const initialState = {
  building: null,
  destination: null,
};

describe('directions reducer', () => {

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should set the destination to navigate to', () => {
    const destination = { code: 'building_code', room: 'room_number' };
    expect(reducer(initialState, { type: SET_DESTINATION, destination }))
        .toEqual({ ...initialState, destination });
  });

  it('should set the building to display details for', () => {
    const building = {
      code: 'code',
      facilities: [ 'atm', 'gym' ],
      image: 'image.png',
      lat: 100,
      long: 200,
      rooms: [ { name: 'room_1', type: 0 }, { name: 'name_2', type: 1 } ],
    };

    expect(reducer(initialState, { type: VIEW_BUILDING, building }))
        .toEqual({ ...initialState, building });
  });

});
