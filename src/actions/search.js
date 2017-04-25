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
 * @created 2016-11-12
 * @file search.js
 * @description Provides search actions.
 *
 * @flow
 */
'use strict';

// Types
import { SEARCH, ACTIVATE_STUDY_FILTER, DEACTIVATE_STUDY_FILTER, SET_STUDY_FILTERS } from 'actionTypes';

module.exports = {

  search: (terms: ?string) => ({
    type: SEARCH,
    terms,
  }),

  activateStudyFilter: (filter: number) => ({
    type: ACTIVATE_STUDY_FILTER,
    filter,
  }),

  deactivateStudyFilter: (filter: number) => ({
    type: DEACTIVATE_STUDY_FILTER,
    filter,
  }),

  setStudyFilters: (filters: Array < number >) => ({
    type: SET_STUDY_FILTERS,
    filters,
  }),

};
