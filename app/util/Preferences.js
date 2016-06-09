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
 * @flow
 *
 */
'use strict';

// Import type definition for objects.
import type {
  LanguageString,
  Semester,
} from '../Types';

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

// Cached values of preferences
let timesAppOpened: number = 0;
let selectedLanguage: ?LanguageString = null;
let currentSemester: number = 0;
let preferWheelchair: boolean = false;

/**
 * Method which should be invoked each time the app is opened, to
 * keep a running track of how many times the app has been opened,
 * the user's preferred language, etc.
 *
 * @param {ReactClass} AsyncStorage instance of asynchronous storage class.
 */
async function _loadInitialPreferences(AsyncStorage: ReactClass): Promise<void> {
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
  } catch (e) {
    console.error('Caught error loading preferences.', e);

    // Setting variables to their default values
    timesAppOpened = 0;
    selectedLanguage = null;
    currentSemester = 0;
    preferWheelchair = false;
  }

  timesAppOpened += 1;
  AsyncStorage.setItem(TIMES_APP_OPENED, timesAppOpened.toString());
}

module.exports = {

  /**
   * Wrapper method for _loadInitialPreferences.
   *
   * @param {ReactClass} AsyncStorage instance of asynchronous storage class.
   * @returns {Promise<void>} the Promise from the async function {_loadInitialPreferences}.
   */
  loadInitialPreferences(AsyncStorage: ReactClass): Promise<void> {
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
   * @returns {LanguageString} 'en' for English, 'fr' for French, or 'en' if no language has
   *         been selected yet.
   */
  getSelectedLanguage(): LanguageString {
    return (this.isLanguageSelected() && selectedLanguage != null
        ? selectedLanguage
        : 'en');
  },

  /**
   * Updates the user's preferred language.
   *
   * @param {ReactClass} AsyncStorage instance of asynchronous storage class.
   * @param {LanguageString} language the new language, either 'en' or 'fr'.
   */
  setSelectedLanguage(AsyncStorage: ReactClass, language: LanguageString): void {
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
   * @param {ReactClass} AsyncStorage instance of asynchronous storage class.
   * @param {boolean} preferred the new preference for wheelchair accessible routes.
   */
  setWheelchairRoutePreferred(AsyncStorage: ReactClass, preferred: boolean): void {
    if (preferred !== true && preferred !== false) {
      return;
    }

    preferWheelchair = preferred;
    AsyncStorage.setItem(PREFER_WHEELCHAIR, preferred.toString());
  },

  /**
   * Sets the current semester. If the provided value is not a valid index,
   * the current semester is set to 0.
   *
   * @param {ReactClass} AsyncStorage instance of asynchronous storage class.
   * @param {number} semester the new current semester.
   */
  setCurrentSemester(AsyncStorage: ReactClass, semester: number): void {
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
   * @param {ReactClass} AsyncStorage instance of asynchronous storage class.
   */
  setToNextSemester(AsyncStorage: ReactClass): void {
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
   * Returns the value of a setting based on the provided key. The returned
   * value may be a string, boolean, integer, or object, and should correspond
   * to the type of the setting.
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
    }

    return null;
  },
};
