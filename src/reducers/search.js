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
 * @created 2016-10-07.
 * @file search.js
 * @description Reducers for search actions
 *
 * @flow
 */
'use strict';

// Type imports
import type {
  Action,
} from 'actionTypes';

// Describes a search.
export type Search = {
  searchTerms: ?string, // Search terms to filter results by
};

// Initial search state.
const initialState: Search = {
  searchTerms: null,
};

/**
 * When provided with a search action, parses the search terms and returns an updated state.
 *
 * @param {Search} state  the current state
 * @param {Action} action the action being taken
 * @returns {Search} an updated state based on the previous state and the action taken.
 */
function search(state: Search = initialState, action: Action): Search {
  switch (action.type) {
    case 'SEARCH_ALL':
      return {
        searchTerms: action.searchTerms,
      };
    default:
      // Does nothing, state left unchanged
  }

  return state;
}

module.exports = search;
