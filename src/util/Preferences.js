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
 * @created 2016-10-08
 * @file Preferences.js
 * @providesModule Preferences
 * @description Loads and saves the user's preferences.
 *
 * @flow
 */
'use strict';

// Types
import type {
  Language,
} from 'types';

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
// Represents the user's preferred time format, 12 or 24 hour
const PREFERRED_TIME_FORMAT: string = 'app_time_format';

/**
 * Retrieves the value of a key from AsyncStorage.
 *
 * @param {any}    AsyncStorage instance of the React Native AsyncStorage
 * @param {string} key          key to retrieve value for
 * @returns {any} the value, if found, or null
 */
async function retrieveFromAsyncStorage(AsyncStorage: any, key: string): Promise < any > {
  try {
    const value = await AsyncStorage.getItem(TIMES_APP_OPENED);
    return value;
  } catch (e) {
    console.error('Caught error retrieving pref from async: ' + key, e);
  }

  return null;
}

/**
 * Gets the number of times the app was opened.
 *
 * @param {any} AsyncStorage instance of the React Native AsyncStorage
 * @returns {number} the number of times, or 0 if none
 */
export async function getTimesAppOpened(AsyncStorage: any): Promise < number > {
  const value = await retrieveFromAsyncStorage(AsyncStorage, TIMES_APP_OPENED);
  return (typeof (value) === 'number')
      ? value
      : 0;
}

/**
 * Gets the user's preferred language.
 *
 * @param {any} AsyncStorage instance of the React Native AsyncStorage
 * @returns {string} 'en', 'fr' or null
 */
export async function getSelectedLanguage(AsyncStorage: any): Promise < ?Language > {
  const value = await retrieveFromAsyncStorage(AsyncStorage, SELECTED_LANGUAGE);
  return (typeof (value) === 'string')
      ? value
      : null;
}

/**
 * Gets the user's current selected semester.
 *
 * @param {any} AsyncStorage instance of the React Native AsyncStorage
 * @returns {number} the current semester, or 0 by default
 */
export async function getCurrentSemester(AsyncStorage: any): Promise < number > {
  const value = await retrieveFromAsyncStorage(AsyncStorage, CURRENT_SEMESTER);
  return (typeof (value) === 'number')
      ? value
      : 0;
}

/**
 * Gets whether the user prefers wheelchair accessible routes.
 *
 * @param {any} AsyncStorage instance of the React Native AsyncStorage
 * @returns {boolean} true if the user prefers wheelchair routes, false by default
 */
export async function getPrefersWheelchair(AsyncStorage: any): Promise < boolean > {
  const value = await retrieveFromAsyncStorage(AsyncStorage, PREFER_WHEELCHAIR);
  return (typeof (value) === 'boolean')
      ? value
      : false;
}

/**
 * Indicates if the user prefers the app always search the entire app.
 *
 * @param {any} AsyncStorage instance of the React Native AsyncStorage
 * @returns {boolean} true to always search the entire app, false by default
 */
export async function getAlwaysSearchAll(AsyncStorage: any): Promise < boolean > {
  const value = await retrieveFromAsyncStorage(AsyncStorage, ALWAYS_SEARCH_ALL);
  return (typeof (value) === 'boolean')
      ? value
      : true;
}

/**
 * Gets the user's preferred time format.
 *
 * @param {any} AsyncStorage instance of the React Native AsyncStorage
 * @returns {string} 12h or 24h, 12h by default
 */
export async function getPreferredTimeFormat(AsyncStorage: any): Promise < string > {
  const value = await retrieveFromAsyncStorage(AsyncStorage, PREFERRED_TIME_FORMAT);
  return (typeof (value) === 'string')
      ? value
      : '12h';
}
