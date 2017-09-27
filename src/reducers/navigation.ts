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
import * as Constants from '../constants';
const CoreTranslations = require('../../assets/json/CoreTranslations');

// Types
import * as Actions from '../actionTypes';
import { MenuSection, Name, Tab, TabSet } from '../../typings/global';
import { Residence } from '../../typings/university';

/** Valid types for a tab title */
type TabTitle = Name | string;
interface TabTitleMap {
  [ index: string ]: TabTitle;
}

/** Navigation reducer state. */
export interface State {
  backNavigations: number;              // Count of the times the user has navigated back in the app
  canBack: object;                      // Indicates which subsections of the app can navigate backwards
  tab: Tab;                             // Current tab in the root navigation of the app

  findView: number;                     // The current view to display in the find tab
  discoverView: number;                 // The current view to display in the discover tab
  housingView: number;                  // The current view to display in the housing menu
  linkId: string | number | undefined;  // Currently selected link category id
  campus: MenuSection;                  // Selected transit campus to display info for
  residence: Residence | undefined;     // Selected residence to display info for

  title: Name | string;           // Title for the current screen
  tabTitles: TabSet<TabTitleMap>; // Titles of tabs, with the last in the array being the most recent
  showBack: boolean;              // True to show a back button in the header, false to hide
  tabShowBack: TabSet<boolean>;   // Whether the tab should show a back button
  showSearch: boolean;            // True to show a search field in the header, false to hide
  tabShowSearch: TabSet<boolean>; // Whether the tab should show a search button
}

/** Default title to use for the header. */
const defaultTitle = {
  name_en: CoreTranslations.en.app_name,
  name_fr: CoreTranslations.fr.app_name,
};

/* tslint:disable object-literal-sort-keys */
/* Better organization of initial state keys */

/** Initial navigation state. */
const initialState: State = {
  backNavigations: 0,
  canBack: {},
  tab: 'find',

  findView: 0,
  discoverView: 0,
  housingView: 0,
  linkId: 0,
  campus: undefined,
  residence: undefined,

  showBack: false,
  showSearch: true,
  tabShowBack: {
    discover: false,
    find: false,
    schedule: false,
    search: false,
    settings: false,
  },
  tabShowSearch: {
    discover: false,
    find: true,
    schedule: false,
    search: true,
    settings: false,
  },
  tabTitles: {
    discover: {
      [Constants.Views.Discover.Home]: {
        name_en: CoreTranslations.en.discover,
        name_fr: CoreTranslations.fr.discover,
      },
    },
    find: {
      [Constants.Views.Find.Home]: defaultTitle,
    },
    schedule: {
      [Constants.Views.Schedule.Home]: {
        name_en: CoreTranslations.en.schedule,
        name_fr: CoreTranslations.fr.schedule,
      },
    },
    search: {
      [Constants.Views.Search.Home]: {
        name_en: CoreTranslations.en.search,
        name_fr: CoreTranslations.fr.search,
      },
    },
    settings: {
      [Constants.Views.Settings.Home]: {
        name_en: CoreTranslations.en.settings,
        name_fr: CoreTranslations.fr.settings,
      },
    },
  },
  title: defaultTitle,
};

/* tslint:enable object-literal-sort-keys */

/**
 * Get the title for a tab based on the current state.
 *
 * @param {State} state the current state
 * @param {Tab}   tab   tab to get title for
 * @returns {TabTitle} the current title set for the tab
 */
function getTabTitle(state: State, tab: Tab): TabTitle {
  let title: TabTitle;

  switch (tab) {
    case 'discover':
      switch (state.discoverView) {
        case Constants.Views.Discover.Housing:
          // TODO: make this use the proper housing section
          title = state.tabTitles.discover[Constants.Views.Discover.Housing];
          break;
        case Constants.Views.Discover.Links:
          // TODO: make this properly use the current link section
          title = state.tabTitles.discover[Constants.Views.Discover.Links];
          break;
        case Constants.Views.Discover.Shuttle:
        case Constants.Views.Discover.StudySpots:
        case Constants.Views.Discover.Home:
        case Constants.Views.Discover.Transit:
          title = state.tabTitles.discover[state.discoverView];
          break;
        default:
          // Return default title from initial state when view cannot be determined
          title = initialState.tabTitles.discover[Constants.Views.Discover.Home];
      }
      break;
    case 'find':
      title = state.tabTitles.find[state.findView] || state.tabTitles.find[Constants.Views.Find.Home];
      break;
    case 'schedule': title = state.tabTitles.schedule[Constants.Views.Schedule.Home]; break;
    case 'search': title = state.tabTitles.search[Constants.Views.Search.Home]; break;
    case 'settings': title = state.tabTitles.settings[Constants.Views.Settings.Home]; break;
    default: title = defaultTitle;
  }

  return title || defaultTitle;
}

/**
 * When provided with a navigation action, parses the parameters and returns an updated state.
 *
 * @param {State}              state  the current state
 * @param {Actions.ActionType} action the action being taken
 * @returns {State} an updated state based on the previous state and the action taken
 */
export default function navigation(state: State = initialState, action: Actions.ActionType): State {
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
    case Actions.Navigation.SetTitle: {
      const tabCapitalized = `${action.tab.charAt(0).toUpperCase()}${action.tab.substr(1)}`;
      if (action.view === Constants.Views[tabCapitalized].Home) {
        // Do not alter tab home title
        return state;
      }

      return {
        ...state,
        tabTitles: {
          ...state.tabTitles,
          [action.tab]: {
            ...state.tabTitles[action.tab],
            [action.view]: action.title,
          },
        },
      };
    }
    case Actions.Navigation.ShowBack:
      return {
        ...state,
        showBack: action.show,
        tabShowBack: {
          ...state.tabShowBack,
          [action.tab]: action.show,
        },
      };
    case Actions.Navigation.ShowSearch:
      return {
        ...state,
        showSearch: action.show,
        tabShowSearch: {
          ...state.tabShowSearch,
          [action.tab]: action.show,
        },
      };
    case Actions.Navigation.SwitchTab: {
      const updatedState: State = {
        ...state,
        showBack: state.tabShowBack[action.tab],
        showSearch: state.tabShowSearch[action.tab],
        tab: action.tab,
      };
      updatedState.title = getTabTitle(updatedState, action.tab);

      return updatedState;
    }
    case Actions.Navigation.SwitchFindView:
      return {
        ...state,
        findView: action.view,
      };
    case Actions.Navigation.SwitchDiscoverView:
      return {
        ...state,
        discoverView: action.view,
      };
    case Actions.Navigation.SwitchHousingView:
      return {
        ...state,
        housingView: action.view,
      };
    case Actions.Navigation.SwitchDiscoverLink:
      return {
        ...state,
        linkId: action.linkId,
      };
    case Actions.Navigation.SwitchDiscoverTransitCampus:
      return {
        ...state,
        campus: action.campus,
      };
    case Actions.Navigation.SwitchHousingResidence:
      return {
        ...state,
        residence: action.residence,
      };
    default:
      return state;
  }
}
