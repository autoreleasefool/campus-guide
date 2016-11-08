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
 * @description Tests header actions
 *
 */
'use strict';

// Imports
import * as actions from '../header';

describe('header actions', () => {
  it('should create an action to set the title', () => {
    const title = {name: 'Title'};
    const expectedAction = {
      type: 'SET_HEADER_TITLE',
      title,
    };

    expect(actions.setHeaderTitle(title)).toEqual(expectedAction);
  });

  it('should create an action to show the back button', () => {
    const showBack: boolean = true;
    const expectedAction = {
      type: 'HEADER_SHOW_BACK',
      shouldShowBack: showBack,
    };

    expect(actions.setShowBack(showBack)).toEqual(expectedAction);
  });

  it('should create an action to show the search button', () => {
    const showSearch: boolean = true;
    const expectedAction = {
      type: 'HEADER_SHOW_SEARCH',
      shouldShowSearch: showSearch,
    };

    expect(actions.setShowSearch(showSearch)).toEqual(expectedAction);
  });

  it('should create an action to navigate backwards', () => {
    const expectedAction = {
      type: 'NAVIGATE_BACK',
    };

    expect(actions.navigateBack()).toEqual(expectedAction);
  });
});
