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
 * @created 2016-10-19
 * @file header-test.js
 * @description Tests header reducers
 *
 */
'use strict';

// Imports
import reducer from '../header';

// Expected initial state
const initialState = {
  title: {name: 'Campus Guide'},
  shouldShowBack: false,
  shouldShowSearch: false,
};

describe('navigation reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it ('should set a new header title', () => {
    expect(
      reducer(
        initialState,
        {
          type: 'SET_HEADER_TITLE',
          title: {
            name: 'New title',
          },
        }
      )
    ).toEqual(
      {
        shouldShowBack: false,
        shouldShowSearch: false,
        title: {
          name: 'New title',
        },
      }
    );
  });

  it ('should show the back button', () => {
    expect(
      reducer(
        initialState,
        {
          type: 'HEADER_SHOW_BACK',
          shouldShowBack: true,
        }
      )
    ).toEqual(
      {
        shouldShowBack: true,
        shouldShowSearch: false,
        title: {
          name: 'Campus Guide',
        },
      }
    );
  });

  it ('should show the search button', () => {
    expect(
      reducer(
        initialState,
        {
          type: 'HEADER_SHOW_SEARCH',
          shouldShowSearch: true,
        }
      )
    ).toEqual(
      {
        shouldShowBack: false,
        shouldShowSearch: true,
        title: {
          name: 'Campus Guide',
        },
      }
    );
  });
});
