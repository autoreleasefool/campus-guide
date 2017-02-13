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
 * @created 2016-10-18
 * @file navigation-test.js
 * @description Tests navigation reducers
 *
 */
'use strict';

// Types
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
import reducer from '../navigation';

// Expected initial state
const initialState = {
  backNavigations: 0,
  canBack: {},
  tab: 'find',

  findView: 0,

  discoverView: 0,
  linkId: 0,
  campus: null,
};

describe('navigation reducer', () => {

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should switch to a new tab', () => {
    expect(reducer(initialState, { type: SWITCH_TAB, tab: 'schedule' }))
        .toEqual({ ...initialState, tab: 'schedule' });
  });

  it('should increase the number of back navigations', () => {
    expect(reducer(initialState, { type: NAVIGATE_BACK })).toEqual({ ...initialState, backNavigations: 1 });
  });

  it('should update the state for a key which can back navigate', () => {
    const updatedState = reducer(initialState, { type: SET_CAN_BACK, key: 'test_key', can: true });
    expect(updatedState).toEqual({ ...initialState, canBack: { test_key: true }});
    const finalState = reducer(updatedState, { type: SET_CAN_BACK, key: 'test_key', can: false });
    expect(finalState).toEqual({ ...initialState, canBack: { test_key: false }});
  });

  it('switches the find view', () => {
    expect(reducer(initialState, { type: SWITCH_FIND_VIEW, view: 1 }))
        .toEqual({ ...initialState, findView: 1 });
  });

  it('switches the discover view', () => {
    expect(reducer(initialState, { type: SWITCH_DISCOVER_VIEW, view: 1 }))
        .toEqual({ ...initialState, discoverView: 1 });
  });

  it('switches the link id', () => {
    expect(reducer(initialState, { type: SWITCH_DISCOVER_LINK, linkId: 1 }))
        .toEqual({ ...initialState, linkId: 1 });
  });

  it('switches the campus', () => {
    const campus = { background: 'background', image: 'image', name: 'name' };
    expect(reducer(initialState, { type: SWITCH_DISCOVER_TRANSIT_CAMPUS, campus }))
        .toEqual({ ...initialState, campus });
  });

});
