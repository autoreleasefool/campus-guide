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
 * @created 2016-10-08
 * @file config-test.js
 * @description Tests config reducers
 *
 * @flow
 */
'use strict';

// Imports
import reducer from '../config';

// Expected initial state
const initialState = {
  language: null,
};

// Expected state when language changed to anything other than french or english
const nullConfig = {
  language: null,
};

// Expected state with english language change
const englishConfig = {
  language: 'en',
};

// Expected state with french language change
const frenchConfig = {
  language: 'fr',
};

describe('config reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it ('should update the state', () => {
    expect(
      reducer(
        undefined,
        {
          type: 'CHANGE_LANGUAGE',
          language: 'en',
        }
      )
    ).toEqual(englishConfig);

    expect(
      reducer(
        englishConfig,
        {
          type: 'CHANGE_LANGUAGE',
          language: 'fr',
        }
      )
    ).toEqual(frenchConfig);

    expect(
      reducer(
        englishConfig,
        {
          type: 'CHANGE_LANGUAGE',
          language: 'jp',
        }
      )
    ).toEqual(nullConfig);

    expect(
      reducer(
        englishConfig,
        {
          type: 'CHANGE_LANGUAGE',
          language: null,
        }
      )
    ).toEqual(nullConfig);
  });
});
