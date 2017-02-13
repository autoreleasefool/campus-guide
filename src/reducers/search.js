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
 * @created 2016-10-07
 * @file search.js
 * @description Reducers for search actions
 *
 * @flow
 */
'use strict';

// Types
import { SEARCH } from 'actionTypes';

// Describes a search.
export type Search = {
  terms: ?string, // Search terms to filter results by
};

// Initial search state.
const initialState: Search = {
  terms: null,
};

/**
 * When provided with a search action, parses the search terms and returns an updated state.
 *
 * @param {State} state  the current state
 * @param {any}   action the action being taken
 * @returns {Search} an updated state based on the previous state and the action taken.
 */
function search(state: Search = initialState, action: any): Search {
  switch (action.type) {
    case SEARCH:
      return {
        ...state,
        terms: action.terms,
      };
    default:
      return state;
  }
}

module.exports = search;
