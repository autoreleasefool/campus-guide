/**
 *
 * @license
 * Copyright (C) 2017 Joseph Roque
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
 * @file directions-test.ts
 * @description Tests direction reducers
 *
 */
'use strict';

// Imports
import { default as reducer, State } from '../directions';

// Types
import * as Actions from '../../actionTypes';
import { Building } from '../../../typings/university';

// Expected initial state
const initialState: State = {
  building: undefined,
  destination: undefined,
  startingPoint: undefined,
};

describe('directions reducer', () => {

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: Actions.Other.Invalid })).toEqual(initialState);
  });

  it('should set the destination to navigate to', () => {
    const destination = { shorthand: 'building_sh', room: 'room_number' };
    expect(reducer(initialState, { type: Actions.Directions.SetDestination, destination }))
        .toEqual({ ...initialState, destination });
  });

  it('should set the point to navigate from', () => {
    const startingPoint = { shorthand: 'building_sh', room: 'room_number' };
    expect(reducer(initialState, { type: Actions.Directions.SetStartingPoint, startingPoint }))
        .toEqual({ ...initialState, startingPoint });
  });

  it('should set the building to display details for', () => {
    const building: Building = {
      facilities: [ 'atm', 'gym' ],
      image: 'image.png',
      location: {
        latitude: 100,
        longitude: 200,
      },
      rooms: [{ name: 'room_1', type: 'class' }, { name: 'name_2', type: 'meet' }],
      shorthand: 'sh',
      thumbnail: 'thumbnail.png',
    };

    expect(reducer(initialState, { type: Actions.Directions.ViewBuilding, building }))
        .toEqual({ ...initialState, building });
  });

});
