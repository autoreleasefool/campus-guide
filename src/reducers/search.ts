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
 * @file search.ts
 * @description Reducers for search actions
 */
'use strict';

// Types
import * as Actions from '../actionTypes';
import { TabSet } from '../../typings/global';

/** Describes a search. */
export interface State {
  studyFilters: Set<string>; // Filters to search study rooms by
  tabTerms: TabSet<string>;  // Search terms to filter results by
}

/** Initial search state. */
const initialState: State = {
  studyFilters: new Set(),
  tabTerms: {
    discover: '',
    find: '',
    schedule: '',
    search: '',
    settings: '',
  },
};

/**
 * When provided with a search action, parses the search terms and returns an updated state.
 *
 * @param {State}              state  the current state
 * @param {Actions.ActionType} action the action being taken
 * @returns {Search} an updated state based on the previous state and the action taken
 */
export default function search(state: State = initialState, action: Actions.ActionType): State {
  switch (action.type) {
    case Actions.Navigation.SwitchFindView:
      return {
        ...state,
        tabTerms: {
          ...state.tabTerms,
          find: '',
        },
      };
    case Actions.Navigation.SwitchDiscoverView:
    case Actions.Navigation.SwitchHousingView:
    case Actions.Navigation.SwitchDiscoverLink:
    case Actions.Navigation.SwitchHousingResidence:
      return {
        ...state,
        tabTerms: {
          ...state.tabTerms,
          discover: '',
        },
      };
    case Actions.Search.Search: {
      const tabTerms = {
        ...state.tabTerms,
      };
      tabTerms[action.tab] = action.terms;

      return {
        ...state,
        tabTerms,
      };
    }
    case Actions.Search.ActivateStudyFilter: {
      // Copy the current list of filters, or create a new one
      const studyFilters = new Set(state.studyFilters);
      studyFilters.add(action.filter);

      return {
        ...state,
        studyFilters,
      };
    }
    case Actions.Search.DeactivateStudyFilter: {
      // Copy the current list of filters, or create a new one
      const studyFilters = new Set(state.studyFilters);
      studyFilters.delete(action.filter);

      return {
        ...state,
        studyFilters,
      };
    }
    case Actions.Search.SetStudyFilters: {
      const studyFilters = new Set();
      action.filters.forEach((filter: string) => {
        studyFilters.add(filter);
      });

      return {
        ...state,
        studyFilters,
      };
    }
    default:
      return state;
  }
}
