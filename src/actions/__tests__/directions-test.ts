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
 * @file directions-test.ts
 * @description Tests direction actions
 *
 */
'use strict';

// Imports
import * as directions from '../directions';

// Types
import * as Actions from '../../actionTypes';

describe('direction actions', () => {

  it('should set a building room to navigate to', () => {
    const destination = { shorthand: 'code', room: 'room' };
    const expectedAction = { type: Actions.Directions.SetDestination, destination };
    expect(directions.setDestination(destination)).toEqual(expectedAction);
  });

  it('should set a building room to navigate from', () => {
    const startingPoint = { shorthand: 'code', room: 'room' };
    const expectedAction = { type: Actions.Directions.SetStartingPoint, startingPoint };
    expect(directions.setStartingPoint(startingPoint)).toEqual(expectedAction);
  });

  it('should set a building to view details for', () => {
    const building: any = {
      facilities: [ 'atm', 'gym' ],
      image: 'image.png',
      location: {
        latitude: 100,
        longitude: 200,
      },
      rooms: [{ name: 'room_1', type: 0 }, { name: 'name_2', type: 1 }],
      shorthand: 'code',
    };
    const expectedAction = { type: Actions.Directions.ViewBuilding, building };
    expect(directions.viewBuilding(building)).toEqual(expectedAction);
  });
});
