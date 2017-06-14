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
 * @file navigation.ts
 * @description Reducers for navigation actions
 */
'use strict';

// Imports
import * as Actions from '../../typings/actions';
import { MenuSection, Tab } from '../../typings/global';
import { Residence } from '../../typings/university';

/** Navigation reducer state. */
interface State {
  backNavigations: number;              // Count of the times the user has navigated back in the app
  canBack: object;                      // Indicates which subsections of the app can navigate backwards
  tab: Tab;                             // Current tab in the root navigation of the app

  findView: number;                     // The current view to display in the find tab

  discoverView: number;                 // The current view to display in the discover tab
  housingView: number;                  // The current view to display in the housing menu
  linkId: string | number | undefined;  // Currently selected link category id
  campus: MenuSection;                  // Selected transit campus to display info for
  residence: Residence | undefined;     // Selected residence to display info for
}

/** Initial navigation state. */
const initialState: State = {
  backNavigations: 0,
  campus: undefined,
  canBack: {},
  discoverView: 0,
  findView: 0,
  housingView: 0,
  linkId: 0,
  residence: undefined,
  tab: 'find',
};

/**
 * When provided with a navigation action, parses the parameters and returns an updated state.
 *
 * @param {State} state  the current state
 * @param {any}   action the action being taken
 * @returns {State} an updated state based on the previous state and the action taken
 */
export default function navigation(state: State = initialState, action: any): State {
  switch (action.type) {
    case Actions.Navigation.NavigateBack:
      return {
        ...state,
        backNavigations: state.backNavigations + 1,
      };
    case Actions.Navigation.CanBack: {
      const can = {
        ...state.canBack,
      };
      can[action.key] = action.can;

      return {
        ...state,
        canBack: can,
      };
    }
    case Actions.App.SwitchTab:
      return {
        ...state,
        tab: action.tab,
      };
    case Actions.App.SwitchFindView:
      return {
        ...state,
        findView: action.view,
      };
    case Actions.App.SwitchDiscoverView:
      return {
        ...state,
        discoverView: action.view,
      };
    case Actions.App.SwitchHousingView:
      return {
        ...state,
        housingView: action.view,
      };
    case Actions.App.SwitchDiscoverLink:
      return {
        ...state,
        linkId: action.linkId,
      };
    case Actions.App.SwitchDiscoverTransitCampus:
      return {
        ...state,
        campus: action.campus,
      };
    case Actions.App.SwitchHousingResidence:
      return {
        ...state,
        residence: action.residence,
      };
    default:
      return state;
  }
}
