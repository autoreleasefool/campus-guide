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
 * @created 2016-10-27
 * @file schedule.js
 * @description Reducers for schedule actions
 *
 * @flow
 */
'use strict';

// Types
import type {
  Action,
} from 'types';

// Describes the schedule state.
type State = {
  view: number,     // Current view to display in the schedule navigator
  schedule: Object, // The user's defined schedule
};

// Initial schedule state.
const initialState: State = {
  view: 0,
  schedule: {},
};

/**
 * When provided with a schedule action, parses the parameters and returns an updated state.
 *
 * @param {State}  state  the current state
 * @param {Action} action the action being taken
 * @returns {State} an updated state based on the previous state and the action taken.
 */
function schedule(state: State = initialState, action: Action): State {
  switch (action.type) {
    case 'SCHEDULE_VIEW':
      return {
        ...state,
        view: action.view,
      };
    case 'SCHEDULE_UPDATE':
      return {
        ...state,
        schedule: action.schedule,
      };
    default:
      return state;
  }
}

module.exports = schedule;
