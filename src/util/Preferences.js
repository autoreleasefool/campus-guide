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
 * @file Preferences.js
 * @providesModule Preferences
 * @description Loads and saves the user's preferences.
 *
 * @flow
 */
'use strict';

// Types
import type { Language } from 'types';

// Represents the language selected by the user to use the app in
const SELECTED_LANGUAGE: string = 'app_selected_language';
// Represents the current study semester selected by the user
const CURRENT_SEMESTER: string = 'app_current_semester';
// Represents if the user prefers routes with wheelchair access
const PREFER_WHEELCHAIR: string = 'app_pref_wheel';
// Represents the user's preferred time format, 12 or 24 hour
const PREFERRED_TIME_FORMAT: string = 'app_time_format';
// Represents the user's preference to view their schedule by week or by course
const PREFER_BY_COURSE: string = 'app_by_course';

/**
 * Retrieves the value of a key from AsyncStorage.
 *
 * @param {any}    AsyncStorage instance of the React Native AsyncStorage
 * @param {string} key          key to retrieve value for
 * @returns {any} the value, if found, or null
 */
async function retrieveFromAsyncStorage(AsyncStorage: any, key: string): Promise < any > {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
  } catch (e) {
    console.error('Caught error retrieving pref from async: ' + key, e);
  }

  return null;
}

/**
 * Gets the user's preferred language.
 *
 * @param {any} AsyncStorage instance of the React Native AsyncStorage
 * @returns {string} 'en', 'fr' or null
 */
export async function getSelectedLanguage(AsyncStorage: any): Promise < ?Language > {
  const value = await retrieveFromAsyncStorage(AsyncStorage, SELECTED_LANGUAGE);
  return (value === null)
      ? null
      : value;
}

/**
 * Updates the user's selected language.
 *
 * @param {any}      AsyncStorage instance of the React Native AsyncStorage
 * @param {Language} language     either 'fr' or 'en'
 */
export function setSelectedLanguage(AsyncStorage: any, language: any): void {
  if (language === 'en' || language === 'fr') {
    AsyncStorage.setItem(SELECTED_LANGUAGE, language);
  }
}


/**
 * Gets the user's current selected semester.
 *
 * @param {any} AsyncStorage instance of the React Native AsyncStorage
 * @returns {number} the current semester, or 0 by default
 */
export async function getCurrentSemester(AsyncStorage: any): Promise < number > {
  const value = await retrieveFromAsyncStorage(AsyncStorage, CURRENT_SEMESTER);
  return (value === null)
      ? 0
      : parseInt(value);
}

/**
 * Updates the user's selected semester.
 *
 * @param {any}    AsyncStorage instance of the React Native AsyncStorage
 * @param {number} semester     the new semester
 */
export function setCurrentSemester(AsyncStorage: any, semester: any): void {
  if (typeof (semester) === 'number' && semester >= 0) {
    AsyncStorage.setItem(CURRENT_SEMESTER, semester.toString());
  }
}

/**
 * Gets whether the user prefers wheelchair accessible routes.
 *
 * @param {any} AsyncStorage instance of the React Native AsyncStorage
 * @returns {boolean} true if the user prefers wheelchair routes, false by default
 */
export async function getPrefersWheelchair(AsyncStorage: any): Promise < boolean > {
  const value = await retrieveFromAsyncStorage(AsyncStorage, PREFER_WHEELCHAIR);
  return (value === null)
      ? false
      : (value === 'true');
}

/**
 * Updates the user's preference for wheelchair routes.
 *
 * @param {any}     AsyncStorage instance of the React Native AsyncStorage
 * @param {boolean} prefer       true to prefer wheelchair routes, false for any routes
 */
export function setPrefersWheelchair(AsyncStorage: any, prefer: any): void {
  if (prefer === true || prefer === false) {
    AsyncStorage.setItem(PREFER_WHEELCHAIR, prefer.toString());
  }
}

/**
 * Gets the user's preferred time format.
 *
 * @param {any} AsyncStorage instance of the React Native AsyncStorage
 * @returns {string} 12h or 24h, 12h by default
 */
export async function getPreferredTimeFormat(AsyncStorage: any): Promise < string > {
  const value = await retrieveFromAsyncStorage(AsyncStorage, PREFERRED_TIME_FORMAT);
  return (value === null)
      ? '12h'
      : value;
}

/**
 * Updates the user's preference for time formatting.
 *
 * @param {any}    AsyncStorage instance of the React Native AsyncStorage
 * @param {string} format       12h or 24h time
 */
export function setPreferredTimeFormat(AsyncStorage: any, format: any): void {
  if (format === '12h' || format === '24h') {
    AsyncStorage.setItem(PREFERRED_TIME_FORMAT, format);
  }
}

/**
 * Gets whether the user prefers to view their schedule by course or not.
 *
 * @param {any} AsyncStorage instance of the React Native AsyncStorage
 * @returns {boolea} true to view schedule by course, false to view by week
 */
export async function getPreferScheduleByCourse(AsyncStorage: any): Promise < boolean > {
  const value = await retrieveFromAsyncStorage(AsyncStorage, PREFER_BY_COURSE);
  return (value === null)
      ? false
      : (value === 'true');
}

/**
 * Updates the user's preference for viewing their schedule.
 *
 * @param {any}     AsyncStorage instance of the React Native AsyncStorage
 * @param {boolean} prefer       true to view by course, false to view by week
 */
export function setPreferScheduleByCourse(AsyncStorage: any, prefer: any): void {
  if (prefer === true || prefer === false) {
    AsyncStorage.setItem(PREFER_BY_COURSE, prefer.toString());
  }
}
