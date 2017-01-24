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
 * @created 2016-10-30
 * @file find-test.js
 * @description Tests find reducers
 *
 */
'use strict';

// Imports
import reducer from '../find';

// Expected initial state
const initialState = {
  building: null,
  destination: {
    code: null,
    room: null,
  },
  view: 0,
};

describe('find reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should switch to a new view', () => {
    expect(
      reducer(
        initialState,
        {
          type: 'FIND_VIEW',
          view: 1,
        }
      )
    ).toEqual(
      {
        building: null,
        destination: {
          code: null,
          room: null,
        },
        view: 1,
      }
    );
  });

  it('should set the room to navigate to', () => {
    const code = 'code';
    const room = 'room';

    expect(
      reducer(
        initialState,
        {
          type: 'NAVIGATE_TO',
          destination: {
            code,
            room,
          },
        }
      )
    ).toEqual(
      {
        building: null,
        destination: {
          code,
          room,
        },
        view: 0,
      }
    );
  });

  it('should set the building to display details for', () => {
    const building = {
      code: 'code',
      default_room_type: 1,
      facilities: ['atm', 'gym'],
      image: 'image.png',
      lat: 100,
      long: 200,
      rooms: [{name: 'room_1', type: 0}, {name: 'name_2', type: 1}],
    };

    expect(
      reducer(
        initialState,
        {
          type: 'VIEW_BUILDING',
          building,
        }
      )
    ).toEqual(
      {
        building,
        destination: {
          code: null,
          room: null,
        },
        view: 0,
      }
    );
  });
});
