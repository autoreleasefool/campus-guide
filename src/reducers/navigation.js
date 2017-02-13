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
 * @file navigation.js
 * @description Reducers for navigation actions
 *
 * @flow
 */
'use strict';

// Types
import type { Campus, Tab } from 'types';
import {
  NAVIGATE_BACK,
  SET_CAN_BACK,
  SWITCH_TAB,
  SWITCH_FIND_VIEW,
  SWITCH_DISCOVER_VIEW,
  SWITCH_DISCOVER_LINK,
  SWITCH_DISCOVER_TRANSIT_CAMPUS,
} from 'actionTypes';

// Describes the navigation state.
type State = {
  backNavigations: number,  // Count of the times the user has navigated back in the app
  canBack: Object,          // Indicates which subsections of the app can navigate backwards
  tab: Tab,                 // Current tab in the root navigation of the app

  findView: number,         // The current view to display in the find tab

  discoverView: number,     // The current view to display in the discover tab
  linkId: ?string | number, // Currently selected link category id
  campus: ?Campus,          // Selected transit campus to display info for
};

// Initial navigation state.
const initialState: State = {
  backNavigations: 0,
  canBack: {},
  tab: 'find',

  findView: 0,

  discoverView: 0,
  linkId: 0,
  campus: null,
};

/**
 * When provided with a navigation action, parses the parameters and returns an updated state.
 *
 * @param {State} state  the current state
 * @param {any}   action the action being taken
 * @returns {State} an updated state based on the previous state and the action taken.
 */
function navigation(state: State = initialState, action: any): State {
  switch (action.type) {
    case NAVIGATE_BACK:
      return {
        ...state,
        backNavigations: state.backNavigations + 1,
      };
    case SET_CAN_BACK: {
      const can = {
        ...state.canBack,
      };
      can[action.key] = action.can;
      return {
        ...state,
        canBack: can,
      };
    }
    case SWITCH_TAB:
      return {
        ...state,
        tab: action.tab,
      };
    case SWITCH_FIND_VIEW:
      return {
        ...state,
        findView: action.view,
      };
    case SWITCH_DISCOVER_VIEW:
      return {
        ...state,
        discoverView: action.view,
      };
    case SWITCH_DISCOVER_LINK:
      return {
        ...state,
        linkId: action.linkId,
      };
    case SWITCH_DISCOVER_TRANSIT_CAMPUS:
      return {
        ...state,
        campus: action.campus,
      };
    default:
      return state;
  }
}

module.exports = navigation;
