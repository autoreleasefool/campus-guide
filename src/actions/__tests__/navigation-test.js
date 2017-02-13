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
import type { Tab } from 'types';
import {
  NAVIGATE_BACK,
  SET_CAN_BACK,
  SWITCH_TAB,
  SWITCH_FIND_VIEW,
  SWITCH_DISCOVER_VIEW,
  SWITCH_DISCOVER_LINK,
  SWITCH_DISCOVER_TRANSIT_CAMPUS,
} from 'actionTypes';

// Imports
import * as actions from '../navigation';

describe('navigation actions', () => {

  it('should create an action to switch the tabs', () => {
    const tab: Tab = 'find';
    const expectedAction = { type: SWITCH_TAB, tab };
    expect(actions.switchTab(tab)).toEqual(expectedAction);
  });

  it('should create an action to navigate backwards', () => {
    const expectedAction = { type: NAVIGATE_BACK };
    expect(actions.navigateBack()).toEqual(expectedAction);
  });

  it('should set the state for a key which can back navigate', () => {
    const key = 'test_key';
    const can = true;
    const expectedAction = { type: SET_CAN_BACK, can, key };
    expect(actions.canNavigateBack(key, can)).toEqual(expectedAction);
  });

  it('should create an action to switch the find view', () => {
    const view = 1;
    const expectedAction = { type: SWITCH_FIND_VIEW, view };
    expect(actions.switchFindView(view)).toEqual(expectedAction);
  });

  it('should create an action to switch the discover view', () => {
    const view = 1;
    const expectedAction = { type: SWITCH_DISCOVER_VIEW, view };
    expect(actions.switchDiscoverView(view)).toEqual(expectedAction);
  });

  it('should show a link category', () => {
    const linkId = 'fake_id';
    const expectedAction = { type: SWITCH_DISCOVER_LINK, linkId };
    expect(actions.switchLinkCategory(linkId)).toEqual(expectedAction);
  });

  it('should show a transit campus', () => {
    const campus = {
      background: 'background_color',
      image: 'image.jpg',
      name: 'campus_name',
    };
    const expectedAction = { type: SWITCH_DISCOVER_TRANSIT_CAMPUS, campus };
    expect(actions.switchTransitCampus(campus)).toEqual(expectedAction);
  });

});
