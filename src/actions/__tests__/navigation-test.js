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
 * @created 2016-10-17
 * @file navigation-test.js
 * @description Tests navigation actions
 *
 */
'use strict';

// Types
import type {
  Tab,
} from 'types';

// Imports
import * as actions from '../navigation';

describe('navigation actions', () => {
  it('should create an action to switch the tabs', () => {
    const tab: Tab = 'find';
    const expectedAction = {
      type: 'SWITCH_TAB',
      tab,
    };

    expect(actions.switchTab(tab)).toEqual(expectedAction);
  });

  it('should create an action to navigate backwards', () => {
    const expectedAction = {
      type: 'NAVIGATE_BACK',
    };

    expect(actions.navigateBack()).toEqual(expectedAction);
  });

  it('should set the state for a key which can back navigate', () => {
    const key = 'test_key';
    const expectedAction = {
      type: 'CAN_NAVIGATE_BACK',
      can: true,
      key,
    };

    expect(actions.canNavigateBack(key, true)).toEqual(expectedAction);
  });
});
