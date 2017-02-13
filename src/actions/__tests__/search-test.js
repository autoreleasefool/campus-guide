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
 * @file search-test.js
 * @description Tests search actions
 *
 */
'use strict';

// Types
import { SEARCH } from 'actionTypes';

// Imports
import * as actions from '../search';

describe('search actions', () => {

  it('creates an action to search for a search term', () => {
    const searchTerms = 'search term';
    const expectedAction = { type: SEARCH, searchTerms };
    expect(actions.search(searchTerms)).toEqual(expectedAction);
  });

  it('creates an action to clear the search', () => {
    const searchTerms = null;
    const expectedAction = { type: SEARCH, searchTerms };
    expect(actions.search(null)).toEqual(expectedAction);
  });

});
