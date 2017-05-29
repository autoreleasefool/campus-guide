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
 * @created 2016-10-08
 * @file search-test.js
 * @description Tests search reducers
 *
 */
'use strict';

// Types
import { SEARCH, ACTIVATE_STUDY_FILTER, DEACTIVATE_STUDY_FILTER, SET_STUDY_FILTERS } from 'actionTypes';

// Imports
import reducer from '../search';

// Expected initial state
const initialState = {
  studyFilters: new Set(),
  terms: null,
};

describe('search reducer', () => {

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should perform a set of searches', () => {
    const testTerms = 'search';
    const otherTerms = 'other_search';

    expect(reducer(initialState, { type: SEARCH, terms: testTerms }))
        .toEqual({ ...initialState, terms: testTerms });

    expect(reducer(initialState, { type: SEARCH, terms: otherTerms }))
        .toEqual({ ...initialState, terms: otherTerms });

    expect(reducer(initialState, { type: SEARCH, terms: null }))
        .toEqual({ ...initialState, terms: null });
  });

  it('should set new filters', () => {
    const filters = new Set();
    filters.add('filter1');
    filters.add('filter2');

    const updatedState = reducer(initialState, { type: SET_STUDY_FILTERS, filters: [ 'filter1', 'filter2' ]});
    expect(updatedState.studyFilters).not.toBeNull();
    expect(updatedState.studyFilters.size).toBe(2);
    expect(updatedState.studyFilters.has('filter1')).toBeTruthy();
    expect(updatedState.studyFilters.has('filter2')).toBeTruthy();
  });

  it('should activate new filters', () => {
    let updatedState = reducer(initialState, { type: ACTIVATE_STUDY_FILTER, filter: 'filter1' });
    expect(updatedState.studyFilters).not.toBeNull();
    expect(updatedState.studyFilters.size).toBe(1);
    expect(updatedState.studyFilters.has('filter1')).toBeTruthy();

    updatedState = reducer(updatedState, { type: ACTIVATE_STUDY_FILTER, filter: 'filter2' });
    expect(updatedState.studyFilters).not.toBeNull();
    expect(updatedState.studyFilters.size).toBe(2);
    expect(updatedState.studyFilters.has('filter1')).toBeTruthy();
    expect(updatedState.studyFilters.has('filter2')).toBeTruthy();
  });

  it('should deactivate filters', () => {
    let updatedState = reducer(initialState, { type: ACTIVATE_STUDY_FILTER, filter: 'filter1' });
    expect(updatedState.studyFilters).not.toBeNull();
    expect(updatedState.studyFilters.size).toBe(1);
    expect(updatedState.studyFilters.has('filter1')).toBeTruthy();

    updatedState = reducer(updatedState, { type: ACTIVATE_STUDY_FILTER, filter: 'filter2' });
    updatedState = reducer(updatedState, { type: ACTIVATE_STUDY_FILTER, filter: 'filter3' });

    updatedState = reducer(updatedState, { type: DEACTIVATE_STUDY_FILTER, filter: 'filter2' });
    expect(updatedState.studyFilters).not.toBeNull();
    expect(updatedState.studyFilters.size).toBe(2);
    expect(updatedState.studyFilters.has('filter1')).toBeTruthy();
    expect(updatedState.studyFilters.has('filter2')).toBeFalsy();
    expect(updatedState.studyFilters.has('filter3')).toBeTruthy();
  });
});
