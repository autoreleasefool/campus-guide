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

// Imports
import reducer from '../search';

// Expected initial state
const initialState = {
  searchTerms: null,
};

describe('search reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should update the state', () => {
    const testSearchTerms = 'search';
    const otherSearchTerms = 'other_search';

    expect(
      reducer(
        undefined,
        {
          type: 'SEARCH',
          searchTerms: testSearchTerms,
        }
      )
    ).toEqual({searchTerms: testSearchTerms});

    expect(
      reducer(
        {searchTerms: testSearchTerms},
        {
          type: 'SEARCH',
          searchTerms: otherSearchTerms,
        }
      )
    ).toEqual({searchTerms: otherSearchTerms});

    expect(
      reducer(
        {searchTerms: testSearchTerms},
        {
          type: 'CLEAR_SEARCH',
        }
      )
    ).toEqual(initialState);
  });
});
