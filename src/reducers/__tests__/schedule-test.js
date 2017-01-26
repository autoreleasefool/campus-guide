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
 * @description Tests schedule reducers
 *
 */
'use strict';

// Imports
import reducer from '../schedule';

// Expected initial state
const initialState = {
  view: 0,
  schedule: {},
};

describe('schedule reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should switch to a new view', () => {
    expect(
      reducer(
        initialState,
        {
          type: 'SCHEDULE_VIEW',
          view: 1,
        }
      )
    ).toEqual(
      {
        ...initialState,
        view: 1,
      }
    );
  });

  it('should update the schedule', () => {
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

    expect(
      reducer(
        initialState,
        {
          type: 'SCHEDULE_UPDATE',
          schedule,
        }
      )
    ).toEqual(
      {
        ...initialState,
        schedule,
      }
    );
  });
});
