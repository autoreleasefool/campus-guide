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
 * @created 2017-02-11
 * @file directions-test.js
 * @description Tests direction actions
 *
 */
'use strict';

// Types
import { SET_DESTINATION, VIEW_BUILDING } from 'actionTypes';

// Imports
import * as actions from '../directions';

describe('direction actions', () => {

  it('should set a building room to navigate to', () => {
    const destination = { code: 'code', room: 'room' };
    const expectedAction = { type: SET_DESTINATION, destination };
    expect(actions.setDestination(destination)).toEqual(expectedAction);
  });

  it('should set a building to view details for', () => {
    const building = {
      code: 'code',
      facilities: [ 'atm', 'gym' ],
      image: 'image.png',
      lat: 100,
      long: 200,
      rooms: [{ name: 'room_1', type: 0 }, { name: 'name_2', type: 1 }],
    };
    const expectedAction = { type: VIEW_BUILDING, building };
    expect(actions.viewBuilding(building)).toEqual(expectedAction);
  });
});
