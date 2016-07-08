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
 * @file Preferences.js
 * @description Manages the application preferences. Loads the preferences upon opening
 *              the application then caches their values so they don't need to be
 *              reloaded later. When preferences are updated, the cache is updated and
 *              the stored preference is updated to the new value.
 *
 * @flow
 */
'use strict';

// Type imports
import type {
  Language,
  Semester,
} from '../types';

// Imports
const Configuration = require('./Configuration');
const LanguageUtils = require('./LanguageUtils');

// Represents the number of times the app has been opened
const TIMES_APP_OPENED: string = 'app_times_opened';
// Represents the language selected by the user to use the app in
const SELECTED_LANGUAGE: string = 'app_selected_language';
// Represents the current study semester selected by the user
const CURRENT_SEMESTER: string = 'app_current_semester';
// Represents if the user prefers routes with wheelchair access
const PREFER_WHEELCHAIR: string = 'app_pref_wheel';
// Represents if the user wants the app to always search all, without being prompted
const ALWAYS_SEARCH_ALL: string = 'app_search_all_always';
// Represents if the user wants the app to prompt them to search all instead
const PROMPT_SEARCH_ALL: string = 'app_prompt_search_all';

// Cached values of preferences
let timesAppOpened: number = 0;
let selectedLanguage: ?Language = null;
let currentSemester: number = 0;
let preferWheelchair: boolean = false;
let alwaysSearchAll: boolean = false;
let promptSearchAll: boolean = true;

/**
 * Method which should be invoked each time the app is opened, to keep a running track of how many times the app has
 * been opened, the user's preferred language, etc.
 *
 * @param {ReactClass<any>} AsyncStorage instance of asynchronous storage class.
 */
async function _loadInitialPreferences(AsyncStorage: ReactClass<any>): Promise<void> {
  // If any errors occur, just use the default values of the preferences
  try {
    // Number of times the app has been used. Either null or integer greater than or equal to 0
    let value: any = await AsyncStorage.getItem(TIMES_APP_OPENED);
    timesAppOpened = (value === null)
        ? 0
        : parseInt(value);

    // Language chosen by the user. Either null (if no language has been selected), 'en' for English, 'fr' for French
    value = await AsyncStorage.getItem(SELECTED_LANGUAGE);
    selectedLanguage = (value === null)
        ? null
        : value;

    value = await AsyncStorage.getItem(CURRENT_SEMESTER);
    currentSemester = (value === null)
        ? 0
        : parseInt(value);

    // If the user prefers wheelchair accessible routes
    value = await AsyncStorage.getItem(PREFER_WHEELCHAIR);
    preferWheelchair = (value === null)
        ? false
        : (value === 'true');

    // If the user prefers to always search the entire app
    value = await AsyncStorage.getItem(ALWAYS_SEARCH_ALL);
    alwaysSearchAll = (value === null)
        ? false
        : (value === 'true');

    // If the user wants to be prompted to search the entire app instead
    value = await AsyncStorage.getItem(PROMPT_SEARCH_ALL);
    promptSearchAll = (value === null)
        ? true
        : (value === 'true');
  } catch (e) {
    console.error('Caught error loading preferences.', e);

    // Setting variables to their default values
    timesAppOpened = 0;
    selectedLanguage = null;
    currentSemester = 0;
    preferWheelchair = false;
    alwaysSearchAll = false;
    promptSearchAll = true;
  }

  timesAppOpened += 1;
  AsyncStorage.setItem(TIMES_APP_OPENED, timesAppOpened.toString());
}

module.exports = {

  /**
   * Public wrapper method for _loadInitialPreferences.
   *
   * @param {ReactClass<any>} AsyncStorage instance of asynchronous storage class.
   * @returns {Promise<void>} the Promise from the async function {_loadInitialPreferences}.
   */
  loadInitialPreferences(AsyncStorage: ReactClass< any >): Promise< void > {
    return _loadInitialPreferences(AsyncStorage);
  },

  /**
   * Checks if the app is being opened for the first time.
   *
   * @returns {boolean} true if the app has not been opened before, false otherwise.
   */
  isFirstTimeOpened(): boolean {
    return timesAppOpened === 1;
  },

  /**
   * Checks if a language has been selected by the user.
   *
   * @returns {boolean} true if a language has been selected, false otherwise.
   */
  isLanguageSelected(): boolean {
    return selectedLanguage === 'en' || selectedLanguage === 'fr';
  },

  /**
   * Gets the preferred language selected by the user.
   *
   * @returns {Language} 'en' for English, 'fr' for French, or 'en' if no language has been selected yet.
   */
  getSelectedLanguage(): Language {
    return (this.isLanguageSelected() && selectedLanguage != null
        ? selectedLanguage
        : 'en');
  },

  /**
   * Updates the user's preferred language.
   *
   * @param {ReactClass<any>} AsyncStorage instance of asynchronous storage class.
   * @param {Language} language            the new language, either 'en' or 'fr'.
   */
  setSelectedLanguage(AsyncStorage: ReactClass< any >, language: Language): void {
    if (language !== 'en' && language !== 'fr') {
      return;
    }

    selectedLanguage = language;
    AsyncStorage.setItem(SELECTED_LANGUAGE, language);
  },

  /**
   * Indicates if the user prefers wheelchair accessible routes or doesn't care.
   *
   * @returns {boolean} true if the user prefers accessible routes, false otherwise.
   */
  isWheelchairRoutePreferred(): boolean {
    return preferWheelchair;
  },

  /**
   * Updates the user's preference to wheelchair accessible routes.
   *
   * @param {ReactClass<any>} AsyncStorage instance of asynchronous storage class.
   * @param {boolean} preferred            the new preference for wheelchair accessible routes.
   */
  setWheelchairRoutePreferred(AsyncStorage: ReactClass< any >, preferred: boolean): void {
    if (preferred !== true && preferred !== false) {
      return;
    }

    preferWheelchair = preferred;
    AsyncStorage.setItem(PREFER_WHEELCHAIR, preferred.toString());
  },

  /**
   * Updates the user's preference to always search the entire app by default.
   *
   * @param {ReactClass<any>} AsyncStorage instance of asynchronous storage class.
   * @param {boolean} always               the new preference for always searching the entire app.
   */
  setAlwaysSearchAll(AsyncStorage: ReactClass< any >, always: boolean): void {
    if (always !== true && always !== false) {
      return;
    }

    alwaysSearchAll = always;
    AsyncStorage.setItem(ALWAYS_SEARCH_ALL, always.toString());
  },

  /**
   * Indicates if the user prefers to always search the entire app.
   *
   * @returns {boolean} true if the user prefers to search the entire app by default, false otherwise
   */
  getAlwaysSearchAll(): boolean {
    return alwaysSearchAll;
  },

  /**
   * Updates the user's preference to promp them to search all when they are filtering.
   *
   * @param {ReactClass<any>} AsyncStorage instance of asynchronous storage class.
   * @param {boolean} prompt               the new preference for prompting to search all.
   */
  setPromptSearchAll(AsyncStorage: ReactClass< any >, prompt: boolean): void {
    if (prompt !== true && prompt !== false) {
      return;
    }

    promptSearchAll = prompt;
    AsyncStorage.setItem(PROMPT_SEARCH_ALL, prompt.toString());
  },

  /**
   * Indicates if the user does or does not want to be prompted to search the entire app when filtering.
   *
   * @returns {boolean} true if the user should be prompted to search all instead, false otherwise
   */
  shouldPromptSearchAll(): boolean {
    return promptSearchAll;
  },

  /**
   * Sets the current semester. If the provided value is not a valid index, the current semester is set to 0.
   *
   * @param {ReactClass<any>} AsyncStorage instance of asynchronous storage class.
   * @param {number} semester              the new current semester.
   */
  setCurrentSemester(AsyncStorage: ReactClass< any >, semester: number): void {
    if (semester >= Configuration.getAvailableSemesters().length || semester < 0) {
      currentSemester = 0;
    } else {
      currentSemester = semester;
    }

    AsyncStorage.setItem(CURRENT_SEMESTER, currentSemester.toString());
  },

  /**
   * Sets semester to be the next in chronologically.
   *
   * @param {ReactClass<any>} AsyncStorage instance of asynchronous storage class.
   */
  setToNextSemester(AsyncStorage: ReactClass< any >): void {
    this.setCurrentSemester(AsyncStorage, currentSemester + 1);
  },

  /**
   * Returns the index of the current semester.
   *
   * @returns {number} the index of the current semester.
   */
  getCurrentSemester(): number {
    return currentSemester;
  },

  /**
   * Returns information about the current semester.
   *
   * @returns {Semester} details about the current semester.
   */
  getCurrentSemesterInfo(): Semester {
    return Configuration.getSemester(currentSemester);
  },

  /**
   * Returns the value of a setting based on the provided key. The returned value may be a string, boolean, integer,
   * or object, and should correspond to the type of the setting.
   *
   * @param {string} key the setting value to return.
   * @returns {any} the value of the setting corresponding to {key}, or null.
   */
  getSetting(key: string): any {
    if (key === 'pref_lang') {
      return (this.getSelectedLanguage() === 'en')
          ? 'English'
          : 'Français';
    } else if (key === 'pref_wheel') {
      return this.isWheelchairRoutePreferred();
    } else if (key === 'pref_semester') {
      return LanguageUtils.getTranslatedName(this.getSelectedLanguage(), this.getCurrentSemesterInfo());
    } else if (key === 'pref_search_all_always') {
      return this.getAlwaysSearchAll();
    } else if (key === 'pref_prompt_search_all') {
      return this.shouldPromptSearchAll();
    }

    return null;
  },
};
