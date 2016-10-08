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
 * @description Tests config actions
 *
 * @flow
 */
'use strict';

// Types
import type {
  Language,
} from 'types';

// Imports
import * as actions from '../config';

describe('config actions', () => {
  it('should create an action to change the language', () => {
    const language: Language = 'en';
    const expectedAction = {
      type: 'CHANGE_LANGUAGE',
      language,
    };

    expect(actions.changeLanguage(language)).toEqual(expectedAction);
  });
});
