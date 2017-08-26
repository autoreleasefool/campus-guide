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
 * @created 2017-02-12
 * @file search-test.ts
 * @description Tests search actions
 *
 */
'use strict';

// Imports
import * as search from '../search';

// Types
import * as Actions from '../../actionTypes';

describe('search actions', () => {

  it('creates an action to search for a search term', () => {
    const terms = 'search term';
    const expectedAction = { type: Actions.Search.Search, terms };
    expect(search.search(terms)).toEqual(expectedAction);
  });

  it('creates an action to clear the search', () => {
    const terms = undefined;
    const expectedAction = { type:  Actions.Search.Search, terms: '' };
    expect(search.search(terms)).toEqual(expectedAction);
  });

  it('creates an action to set the study filters', () => {
    const filters = [ 'filter1', 'filter2' ];
    const expectedAction = { type:  Actions.Search.SetStudyFilters, filters };
    expect(search.setStudyFilters(filters)).toEqual(expectedAction);
  });

  it('creates an action to activate a study filter', () => {
    const expectedAction = { type:  Actions.Search.ActivateStudyFilter, filter: 'filter1' };
    expect(search.activateStudyFilter('filter1')).toEqual(expectedAction);
  });

  it('creates an action to deactivate a study filter', () => {
    const expectedAction = { type:  Actions.Search.DeactivateStudyFilter, filter: 'filter1' };
    expect(search.deactivateStudyFilter('filter1')).toEqual(expectedAction);
  });

});
