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
 * @created 2016-10-08
 * @file navigation.js
 * @description Reducers for navigation actions
 *
 * @flow
 */
'use strict';

// Types
import type {
  Action,
  Tab,
} from 'types';

// Describes the navigation state.
type State = {
  backNavigations: number,  // Count of the times the user has navigated back in the app
  tab: Tab,                 // Current tab in the root navigation of the app
};

// Initial navigation state.
const initialState: State = {
  backNavigations: 0,
  tab: 'find',
};

/**
 * When provided with a navigation action, parses the parameters and returns an updated state.
 *
 * @param {State}  state  the current state
 * @param {Action} action the action being taken
 * @returns {State} an updated state based on the previous state and the action taken.
 */
function navigation(state: State = initialState, action: Action): State {
  switch (action.type) {
    case 'NAVIGATE_BACK':
      return {
        ...state,
        backNavigations: state.backNavigations + 1,
      };
    case 'SWITCH_TAB':
      return {
        ...state,
        tab: action.tab,
      };
    default:
      return state;
  }
}

module.exports = navigation;
