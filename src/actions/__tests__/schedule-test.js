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
 * @file schedule-test.js
 * @description Tests schedule actions
 *
 */
'use strict';

// Imports
import * as actions from '../schedule';

describe('schedule actions', () => {
  it('should create an action to switch the schedule view', () => {
    const view = 1;
    const expectedAction = {
      type: 'SCHEDULE_VIEW',
      view,
    };

    expect(actions.switchScheduleView(view)).toEqual(expectedAction);
  });

  it('should create an action to update the user\'s schedule', () => {
    const schedule = {
      semester1: {
        name_en: 'English name',
        name_fr: 'French name',
      },
      semester2: {
        name_en: 'Second English name',
        name_fr: 'Second French name',
      },
    };

    const expectedAction = {
      type: 'SCHEDULE_UPDATE',
      schedule,
    };

    expect(actions.updateSchedule(schedule)).toEqual(expectedAction);
  });
});
