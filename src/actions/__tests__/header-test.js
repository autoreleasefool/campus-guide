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
 * @created 2016-10-19
 * @file header-test.js
 * @description Tests header actions
 *
 */
'use strict';

// Types
import { SET_HEADER_TITLE, SHOW_BACK, SHOW_SEARCH } from 'actionTypes';

// Imports
import * as actions from '../header';

describe('header actions', () => {

  it('should create an action to set the title', () => {
    const title = { name: 'Title' };
    const expectedAction = { type: SET_HEADER_TITLE, title };
    expect(actions.setHeaderTitle(title)).toEqual(expectedAction);
  });

  it('should create an action to set the title for a tab', () => {
    const title = 'name';
    const tab = 'find';
    const expectedAction = { type: SET_HEADER_TITLE, title, tab };
    expect(actions.setHeaderTitle(title, tab)).toEqual(expectedAction);
  });

  it('should create an action to show the back button for a tab', () => {
    const show = true;
    const tab = 'find';
    const expectedAction = { type: SHOW_BACK, show, tab };
    expect(actions.showBack(show, tab)).toEqual(expectedAction);
  });

  it('should create an action to show the search button for a tab', () => {
    const show = true;
    const tab = 'find';
    const expectedAction = { type: SHOW_SEARCH, show, tab };
    expect(actions.showSearch(show, tab)).toEqual(expectedAction);
  });

  it('should create an action to show the back button', () => {
    const show = true;
    const expectedAction = { type: SHOW_BACK, show };
    expect(actions.showBack(show)).toEqual(expectedAction);
  });

  it('should create an action to show the search button', () => {
    const show = true;
    const expectedAction = { type: SHOW_SEARCH, show };
    expect(actions.showSearch(show)).toEqual(expectedAction);
  });

});
