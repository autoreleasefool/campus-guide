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
 * @created 2016-10-18
 * @file header.js
 * @description Reducers for header actions
 *
 * @flow
 */
'use strict';

// Types
import type {
  Action,
} from 'types';

// Describes the header state.
type State = {
  title: string,              // Title for the current screen
  shouldShowBack: boolean,    // True to show a back button in the header, false to hide
  shouldShowSearch: boolean,  // True to show a search field in the header, false to hide
};

// Initial header state.
const initialState: State = {
  title: 'Campus Guide',
  shouldShowBack: false,
  shouldShowSearch: false,
};

/**
 * When provided with a header action, parses the parameters and returns an updated state.
 *
 * @param {State}  state  the current state
 * @param {Action} action the action being taken
 * @returns {State} an updated state based on the previous state and the action taken.
 */
function header(state: State = initialState, action: Action): State {
  switch (action.type) {
    case 'SET_HEADER_TITLE':
      return {
        ...state,
        title: action.title,
      };
    case 'HEADER_SHOW_BACK':
      return {
        ...state,
        shouldShowBack: action.shouldShowBack,
      };
    case 'HEADER_SHOW_SEARCH':
      return {
        ...state,
        shouldShowSearch: action.shouldShowSearch,
      };
    default:
      return state;
  }
}

module.exports = header;
