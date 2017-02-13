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
 * @file header.js
 * @description Reducers for header actions
 *
 * @flow
 */
'use strict';

// Types
import type { Action, Name, TranslatedName, TabSet } from 'types';
import { SET_HEADER_TITLE, SHOW_BACK, SHOW_SEARCH, SWITCH_TAB } from 'actionTypes';

// Import default translations
const CoreTranslations = require('../../assets/json/CoreTranslations');

// Describes the header state.
type State = {
  title: Name | TranslatedName | string,  // Title for the current screen
  tabTitles: TabSet,                      // Title last set in the tab
  showBack: boolean,                      // True to show a back button in the header, false to hide
  tabShowBack: TabSet,                    // Whether the tab should show a back button
  showSearch: boolean,                    // True to show a search field in the header, false to hide
  tabShowSearch: TabSet,                  // Whether the tab should show a search button
};

// Default title to use for the header
const defaultTitle = {
  name_en: CoreTranslations && CoreTranslations.en ? CoreTranslations.en.app_name : 'Campus Guide',
  name_fr: CoreTranslations && CoreTranslations.fr ? CoreTranslations.fr.app_name : 'Guide de campus',
};

// Initial header state.
const initialState: State = {
  title: defaultTitle,
  tabTitles: {
    find: {
      name_en: CoreTranslations && CoreTranslations.en ? CoreTranslations.en.find : 'Campus Guide',
      name_fr: CoreTranslations && CoreTranslations.fr ? CoreTranslations.fr.find : 'Guide de campus',
    },
    schedule: {
      name_en: CoreTranslations && CoreTranslations.en ? CoreTranslations.en.schedule : 'Campus Guide',
      name_fr: CoreTranslations && CoreTranslations.fr ? CoreTranslations.fr.schedule : 'Guide de campus',
    },
    discover: {
      name_en: CoreTranslations && CoreTranslations.en ? CoreTranslations.en.discover : 'Campus Guide',
      name_fr: CoreTranslations && CoreTranslations.fr ? CoreTranslations.fr.discover : 'Guide de campus',
    },
    search: {
      name_en: CoreTranslations && CoreTranslations.en ? CoreTranslations.en.search : 'Campus Guide',
      name_fr: CoreTranslations && CoreTranslations.fr ? CoreTranslations.fr.search : 'Guide de campus',
    },
    settings: {
      name_en: CoreTranslations && CoreTranslations.en ? CoreTranslations.en.settings : 'Campus Guide',
      name_fr: CoreTranslations && CoreTranslations.fr ? CoreTranslations.fr.settings : 'Guide de campus',
    },
  },
  showBack: false,
  tabShowBack: {
    find: false,
    schedule: false,
    discover: false,
    search: false,
    settings: false,
  },
  showSearch: true,
  tabShowSearch: {
    find: true,
    schedule: false,
    discover: false,
    search: true,
    settings: false,
  },
};

/**
 * When provided with a header action, parses the parameters and returns an updated state.
 *
 * @param {State}  state  the current state
 * @param {Action} action the action being taken
 * @returns {State} an updated state based on the previous state and the action taken.
 */
function header(state: State = initialState, action: Action): State {
  switch (action.type) {
    case SWITCH_TAB:
      return {
        ...state,
        title: state.tabTitles[action.tab],
        showBack: state.tabShowBack[action.tab],
        showSearch: state.tabShowSearch[action.tab],
      };
    case SET_HEADER_TITLE: {
      const tabTitles = { ...state.tabTitles };

      if (action.tab != null) {
        tabTitles[action.tab] = action.title || initialState.tabTitles[action.tab];
      }

      return {
        ...state,
        title: (action.tab && !action.title) ? tabTitles[action.tab] : action.title || initialState.title,
        tabTitles,
      };
    }
    case SHOW_BACK: {
      const tabShowBack = { ...state.tabShowBack };

      if (action.tab != null) {
        tabShowBack[action.tab] = action.show;
      }

      return {
        ...state,
        showBack: action.show,
        tabShowBack,
      };
    }
    case SHOW_SEARCH: {
      const tabShowSearch = { ...state.tabShowSearch };

      if (action.tab != null) {
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

module.exports = header;
