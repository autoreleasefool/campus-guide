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
 * @created 2016-10-18
 * @file header.js
 * @description Reducers for header actions
 *
 * @flow
 */
'use strict';

// Import default translations
const CoreTranslations = require('../../assets/json/CoreTranslations');

// Types
import type {
  Action,
  Name,
  TranslatedName,
  TabSet,
} from 'types';

// Describes the header state.
type State = {
  title: Name | TranslatedName | string,  // Title for the current screen
  tabTitles: TabSet,                      // Title last set in the tab
  shouldShowBack: boolean,                // True to show a back button in the header, false to hide
  shouldShowSearch: boolean,              // True to show a search field in the header, false to hide
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
  shouldShowBack: false,
  shouldShowSearch: false,
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
    case 'SWITCH_TAB':
      return {
        ...state,
        title: state.tabTitles[action.tab],
      };
    case 'SET_HEADER_TITLE': {
      const tabTitles = {
        ...state.tabTitles,
      };

      if (action.tab != null) {
        tabTitles[action.tab] = action.title || initialState.tabTitles[action.tab];
      }

      return {
        ...state,
        title: (action.tab && !action.title) ? tabTitles[action.tab] : action.title || initialState.title,
        tabTitles,
      };
    }
    case 'HEADER_SHOW_BACK':
      return {
        ...state,
        shouldShowBack: action.shouldShowBack,
      };
    case 'HEADER_SHOW_SEARCH':
      return {
        ...state,
        shouldShowSearch: action.shouldShowSearch,
      };
    default:
      return state;
  }
}

module.exports = header;
