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
 * @file header.ts
 * @description Reducers for header actions
 */
'use strict';

// Imports
import * as Actions from '../actionTypes';
import { Name, TabSet } from '../../typings/global';
const CoreTranslations = require('../../assets/json/CoreTranslations');

/** Valid types for a tab title */
type TabTitle = Name | string;

/** Header reducer state. */
export interface State {
  title: Name | string;           // Title for the current screen
  tabTitles: TabSet<TabTitle[]>;  // Titles of tabs, with the last in the array being the most recent
  showBack: boolean;              // True to show a back button in the header, false to hide
  tabShowBack: TabSet<boolean>;   // Whether the tab should show a back button
  showSearch: boolean;            // True to show a search field in the header, false to hide
  tabShowSearch: TabSet<boolean>; // Whether the tab should show a search button
}

/** Default title to use for the header. */
const defaultTitle = {
  name_en: CoreTranslations && CoreTranslations.en ? CoreTranslations.en.app_name : 'Campus Guide',
  name_fr: CoreTranslations && CoreTranslations.fr ? CoreTranslations.fr.app_name : 'Guide de campus',
};

/** Initial header state. */
const initialState: State = {
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
    discover: [{
      name_en: CoreTranslations && CoreTranslations.en ? CoreTranslations.en.discover : 'Campus Guide',
      name_fr: CoreTranslations && CoreTranslations.fr ? CoreTranslations.fr.discover : 'Guide de campus',
    }],
    find: [ defaultTitle ],
    schedule: [{
      name_en: CoreTranslations && CoreTranslations.en ? CoreTranslations.en.schedule : 'Campus Guide',
      name_fr: CoreTranslations && CoreTranslations.fr ? CoreTranslations.fr.schedule : 'Guide de campus',
    }],
    search: [{
      name_en: CoreTranslations && CoreTranslations.en ? CoreTranslations.en.search : 'Campus Guide',
      name_fr: CoreTranslations && CoreTranslations.fr ? CoreTranslations.fr.search : 'Guide de campus',
    }],
    settings: [{
      name_en: CoreTranslations && CoreTranslations.en ? CoreTranslations.en.settings : 'Campus Guide',
      name_fr: CoreTranslations && CoreTranslations.fr ? CoreTranslations.fr.settings : 'Guide de campus',
    }],
  },
  title: defaultTitle,
};

/**
 * When provided with a header action, parses the parameters and returns an updated state.
 *
 * @param {State} state  the current state
 * @param {any}   action the action being taken
 * @returns {State} an updated state based on the previous state and the action taken
 */
export default function header(state: State = initialState, action: any): State {
  switch (action.type) {
    case Actions.Navigation.NavigateBack: {
      const tabTitles = state.tabTitles[action.tab].slice();
      if (tabTitles.length > 1) {
        tabTitles.pop();
      }

      const title = tabTitles[tabTitles.length - 1];

      return {
        ...state,
        tabTitles: {
          ...state.tabTitles,
          [action.tab]: tabTitles,
        },
        title,
      };
    }
    case Actions.App.SwitchTab:
      return {
        ...state,
        showBack: state.tabShowBack[action.tab],
        showSearch: state.tabShowSearch[action.tab],
        title: state.tabTitles[action.tab][state.tabTitles[action.tab].length - 1],
      };
    case Actions.Header.PushTitle: {
      const tabTitles = { ...state.tabTitles };
      for (const tab in tabTitles) {
        if (tabTitles.hasOwnProperty(tab)) {
          tabTitles[tab] = tabTitles[tab].slice();
        }
      }

      tabTitles[action.tab].push(action.title || initialState.tabTitles[action.tab]);

      return {
        ...state,
        tabTitles,
        title: (action.tab && !action.title) ? tabTitles[action.tab] : action.title || initialState.title,
      };
    }
    case Actions.Header.ShowBack: {
      const tabShowBack = { ...state.tabShowBack };

      if (action.tab != undefined) {
        tabShowBack[action.tab] = action.show;
      }

      return {
        ...state,
        showBack: action.show,
        tabShowBack,
      };
    }
    case Actions.Header.ShowSearch: {
      const tabShowSearch = { ...state.tabShowSearch };

      if (action.tab != undefined) {
        tabShowSearch[action.tab] = action.show;
      }

      return {
        ...state,
        showSearch: action.show,
        tabShowSearch,
      };
    }
    default:
      return state;
  }
}
