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
 * @created 2016-10-19
 * @file find.js
 * @description Reducers for find actions
 *
 * @flow
 */
'use strict';

// Types
import type {
  Action,
  Building,
} from 'types';

// Describes the find state.
type State = {
  building: ?Building,  // The building selected by the user to navigate to, or view
  destination: {
    code: ?string,      // The code of the building the user wishes to navigate to
    room: ?string,      // The room number in the building the user wishes to navigate to
  },
  view: number,         // Current view to display in the Find navigator
};

// Initial find state.
const initialState: State = {
  building: null,
  destination: {
    code: null,
    room: null,
  },
  view: 0,
};

/**
 * When provided with a find action, parses the parameters and returns an updated state.
 *
 * @param {State}  state  the current state
 * @param {Action} action the action being taken
 * @returns {State} an updated state based on the previous state and the action taken.
 */
function find(state: State = initialState, action: Action): State {
  switch (action.type) {
    case 'FIND_VIEW':
      return {
        ...state,
        view: action.view,
      };
    case 'NAVIGATE_TO':
      return {
        ...state,
        destination: {
          code: action.destination.code,
          room: action.destination.room,
        },
      };
    case 'VIEW_BUILDING':
      return {
        ...state,
        building: action.building,
      };
    default:
      return state;
  }
}

module.exports = find;
