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
 * @description Tests find actions
 *
 */
'use strict';

// Imports
import * as actions from '../find';

describe('find actions', () => {
  it('should create an action to switch the find view', () => {
    const view = 1;
    const expectedAction = {
      type: 'FIND_VIEW',
      view,
    };

    expect(actions.switchFindView(view)).toEqual(expectedAction);
  });

  it('should set a building room to navigate to', () => {
    const code = 'code';
    const room = 'room';

    const expectedAction = {
      type: 'NAVIGATE_TO',
      destination: {
        code,
        room,
      },
    };

    expect(actions.navigateTo(code, room)).toEqual(expectedAction);
  });

  it('should set a building to view details for', () => {
    const building = {
      code: 'code',
      facilities: ['atm', 'gym'],
      image: 'image.png',
      lat: 100,
      long: 200,
      rooms: [{name: 'room_1', type: 0}, {name: 'name_2', type: 1}],
    };

    const expectedAction = {
      type: 'VIEW_BUILDING',
      building,
    };

    expect(actions.viewBuilding(building)).toEqual(expectedAction);
  });
});
