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
 * @file Preferences.ts
 * @description Loads and saves the user's preferences.
 */
'use strict';

// Imports
import * as Analytics from '../util/Analytics';

// Type imports
import { AsyncStorageStatic } from 'react-native';
import { Language } from './Translations';

// Represents the language selected by the user to use the app in
const SELECTED_LANGUAGE = 'app_selected_language';
// Represents the current study semester selected by the user
const CURRENT_SEMESTER = 'app_current_semester';
// Represents if the user prefers routes with wheelchair access
const PREFER_WHEELCHAIR = 'app_pref_wheel';
// Represents if the user prefers shorter routes
const PREFER_SHORTEST_ROUTE = 'app_pref_shortest_route';
// Represents the user's preferred time format, 12 or 24 hour
const PREFERRED_TIME_FORMAT = 'app_time_format';
// Represents the user's preference to view their schedule by week or by course
const PREFER_BY_COURSE = 'app_by_course';

/**
 * Retrieves the value of a key from AsyncStorage.
 *
 * @param {AsyncStorageStatic} asyncStorage instance of React Native AsyncStorage
 * @param {string}             key          key to retrieve value for
 * @returns {any} the value, if found, or undefined
 */
async function retrieveFromAsyncStorage(asyncStorage: AsyncStorageStatic, key: string): Promise<any> {
  try {
    const value = await asyncStorage.getItem(key);

    return value;
  } catch (err) {
    console.log(`Caught error retrieving pref from async: ${key}, error: ${JSON.stringify(err)}`);
  }

  return undefined;
}

/**
 * Gets the user's preferred language.
 *
 * @param {AsyncStorageStatic} asyncStorage instance of React Native AsyncStorage
 * @returns {string} 'en', 'fr' or undefined
 */
export async function getSelectedLanguage(asyncStorage: AsyncStorageStatic): Promise<Language|undefined> {
  const value = await retrieveFromAsyncStorage(asyncStorage, SELECTED_LANGUAGE);

  return value;
}

/**
 * Updates the user's selected language.
 *
 * @param {AsyncStorageStatic} asyncStorage instance of React Native AsyncStorage
 * @param {Language}           language     either 'fr' or 'en'
 */
export function setSelectedLanguage(asyncStorage: AsyncStorageStatic, language: any): void {
  if (language === 'en' || language === 'fr') {
    asyncStorage.setItem(SELECTED_LANGUAGE, language);
    Analytics.setPreference(SELECTED_LANGUAGE, language);
  }
}

/**
 * Gets the user's current selected semester.
 *
 * @param {AsyncStorageStatic} asyncStorage instance of React Native AsyncStorage
 * @returns {number} the current semester, or 0 by default
 */
export async function getCurrentSemester(asyncStorage: AsyncStorageStatic): Promise<number> {
  const value = await retrieveFromAsyncStorage(asyncStorage, CURRENT_SEMESTER);

  return (value == undefined)
      ? 0
      : parseInt(value);
}

/**
 * Updates the user's selected semester.
 *
 * @param {AsyncStorageStatic} asyncStorage instance of React Native AsyncStorage
 * @param {number}             semester     the new semester
 */
export function setCurrentSemester(asyncStorage: AsyncStorageStatic, semester: any): void {
  if (typeof (semester) === 'number' && semester >= 0) {
    asyncStorage.setItem(CURRENT_SEMESTER, semester.toString());
    Analytics.setPreference(CURRENT_SEMESTER, semester.toString());
  }
}

/**
 * Gets whether the user prefers wheelchair accessible routes.
 *
 * @param {AsyncStorageStatic} asyncStorage instance of React Native AsyncStorage
 * @returns {boolean} true if the user prefers wheelchair routes, false by default
 */
export async function getPrefersWheelchair(asyncStorage: AsyncStorageStatic): Promise<boolean> {
  const value = await retrieveFromAsyncStorage(asyncStorage, PREFER_WHEELCHAIR);

  return (value == undefined)
      ? false
      : (value === 'true');
}

/**
 * Updates the user's preference for wheelchair routes.
 *
 * @param {AsyncStorageStatic} asyncStorage instance of React Native AsyncStorage
 * @param {boolean}            prefer       true to prefer wheelchair routes, false for any routes
 */
export function setPrefersWheelchair(asyncStorage: AsyncStorageStatic, prefer: any): void {
  if (prefer === true || prefer === false) {
    asyncStorage.setItem(PREFER_WHEELCHAIR, prefer.toString());
    Analytics.setPreference(PREFER_WHEELCHAIR, prefer.toString());
  }
}

/**
 * Gets whether the user prefers the shortest routes over the easiest.
 *
 * @param {AsyncStorageStatic} asyncStorage instance of React Native AsyncStorage
 * @returns {boolean} true if the user prefers shorter routes, false by default
 */
export async function getPrefersShortestRoute(asyncStorage: AsyncStorageStatic): Promise<boolean> {
  const value = await retrieveFromAsyncStorage(asyncStorage, PREFER_SHORTEST_ROUTE);

  return (value == undefined)
      ? false
      : (value === 'true');
}

/**
 * Updates the user's preference for shorter routes.
 *
 * @param {AsyncStorageStatic} asyncStorage instance of React Native AsyncStorage
 * @param {boolean}            prefer       true to prefer shorter routes, false for any routes
 */
export function setPrefersShortestRoute(asyncStorage: AsyncStorageStatic, prefer: any): void {
  if (prefer === true || prefer === false) {
    asyncStorage.setItem(PREFER_SHORTEST_ROUTE, prefer.toString());
    Analytics.setPreference(PREFER_SHORTEST_ROUTE, prefer.toString());
  }
}

/**
 * Gets the user's preferred time format.
 *
 * @param {AsyncStorageStatic} asyncStorage instance of React Native AsyncStorage
 * @returns {string} 12h or 24h, 12h by default
 */
export async function getPreferredTimeFormat(asyncStorage: AsyncStorageStatic): Promise<string> {
  const value = await retrieveFromAsyncStorage(asyncStorage, PREFERRED_TIME_FORMAT);

  return (value == undefined)
      ? '12h'
      : value;
}

/**
 * Updates the user's preference for time formatting.
 *
 * @param {AsyncStorageStatic} asyncStorage instance of React Native AsyncStorage
 * @param {string}             format       12h or 24h time
 */
export function setPreferredTimeFormat(asyncStorage: AsyncStorageStatic, format: any): void {
  if (format === '12h' || format === '24h') {
    asyncStorage.setItem(PREFERRED_TIME_FORMAT, format);
    Analytics.setPreference(PREFERRED_TIME_FORMAT, format);
  }
}

/**
 * Gets whether the user prefers to view their schedule by course or not.
 *
 * @param {AsyncStorageStatic} asyncStorage instance of React Native AsyncStorage
 * @returns {boolean} true to view schedule by course, false to view by week
 */
export async function getPreferScheduleByCourse(asyncStorage: AsyncStorageStatic): Promise<boolean> {
  const value = await retrieveFromAsyncStorage(asyncStorage, PREFER_BY_COURSE);

  return (value == undefined)
      ? false
      : (value === 'true');
}

/**
 * Updates the user's preference for viewing their schedule.
 *
 * @param {AsyncStorageStatic} asyncStorage instance of React Native AsyncStorage
 * @param {boolean}            prefer       true to view by course, false to view by week
 */
export function setPreferScheduleByCourse(asyncStorage: AsyncStorageStatic, prefer: any): void {
  if (prefer === true || prefer === false) {
    asyncStorage.setItem(PREFER_BY_COURSE, prefer.toString());
    Analytics.setPreference(PREFER_BY_COURSE, prefer.toString());
  }
}
