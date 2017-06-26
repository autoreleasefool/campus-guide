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
 * @created 2016-11-1
 * @file Preferences-test.ts
 * @description Test the preferences for the application.
 *
 */
'use strict';

import * as Preferences from '../Preferences';

/** Required parameters for setting preferences. */
interface PreferenceOptions {
  language: string;
  semester: number;
  wheelchair: boolean;
  timeFormat: string;
  byCourse: boolean;
}

// Initial AsyncStorage data store
let dataStore: any = {};

// Indicates if retrieving from the dataStore should throw an error.
let shouldThrowError = false;

// Create mock functions for storing / retrieving data
const AsyncStorage = {
  getItem: jest.fn(async(key: string) => {
    if (shouldThrowError) {
      throw new Error('Preferences-test error thrown on purpose for testing');
    } else {
      return dataStore[key] || undefined;
    }
  }),
  setItem: jest.fn((key: string, value: string) => {
    dataStore[key] = value;
  }),
};

/**
 * Sets some preferences asynchronously.
 *
 * @param {PreferenceOptions} preferences the preferences to set
 */
async function setPreferences(preferences: PreferenceOptions): Promise<void> {
  Preferences.setSelectedLanguage(AsyncStorage, preferences.language);
  Preferences.setCurrentSemester(AsyncStorage, preferences.semester);
  Preferences.setPrefersWheelchair(AsyncStorage, preferences.wheelchair);
  Preferences.setPreferredTimeFormat(AsyncStorage, preferences.timeFormat);
  Preferences.setPreferScheduleByCourse(AsyncStorage, preferences.byCourse);
}

describe('Preferences-test', () => {

  beforeEach(() => {
    // Reset AsyncStorage
    dataStore = {};

    // Only throw errors if specified in the test
    shouldThrowError = false;
  });

  it('tests the retrieval of default preferences', async() => {
    const language = await Preferences.getSelectedLanguage(AsyncStorage);
    expect(language).not.toBeDefined();

    const currentSemester = await Preferences.getCurrentSemester(AsyncStorage);
    expect(currentSemester).toEqual(0);

    const prefersWheelchair = await Preferences.getPrefersWheelchair(AsyncStorage);
    expect(prefersWheelchair).toBeFalsy();

    const preferredTime = await Preferences.getPreferredTimeFormat(AsyncStorage);
    expect(preferredTime).toEqual('12h');

    const prefersByCourse = await Preferences.getPreferScheduleByCourse(AsyncStorage);
    expect(prefersByCourse).toBeFalsy();
  });

  it('tests setting preferences', async() => {
    const preferences: PreferenceOptions = {
      byCourse: true,
      language: 'fr',
      semester: 2,
      timeFormat: '24h',
      wheelchair: false,
    };

    await setPreferences(preferences);

    const language = await Preferences.getSelectedLanguage(AsyncStorage);
    expect(language).toEqual('fr');

    const currentSemester = await Preferences.getCurrentSemester(AsyncStorage);
    expect(currentSemester).toEqual(2);

    const prefersWheelchair = await Preferences.getPrefersWheelchair(AsyncStorage);
    expect(prefersWheelchair).toBeFalsy();

    const preferredTime = await Preferences.getPreferredTimeFormat(AsyncStorage);
    expect(preferredTime).toEqual('24h');

    const prefersByCourse = await Preferences.getPreferScheduleByCourse(AsyncStorage);
    expect(prefersByCourse).toBeTruthy();
  });

  it('tests setting invalid preferences', async() => {
    // Set defaults for the app to load
    dataStore = {
      app_by_course: 'true',
      app_current_semester: '0',
      app_pref_wheel: 'true',
      app_selected_language: 'en',
      app_time_format: '12h',
    };

    // Set invalid preferences that should not update the dataStore
    const preferences: any = {
      byCourse: 'flase',
      language: 'invalid_lang',
      semester: -1,
      timeFormat: 'twenty four',
      wheelchair: 'true',
    };

    await setPreferences(preferences);

    const language = await Preferences.getSelectedLanguage(AsyncStorage);
    expect(language).toEqual('en');

    const currentSemester = await Preferences.getCurrentSemester(AsyncStorage);
    expect(currentSemester).toEqual(0);

    const prefersWheelchair = await Preferences.getPrefersWheelchair(AsyncStorage);
    expect(prefersWheelchair).toBeTruthy();

    const preferredTime = await Preferences.getPreferredTimeFormat(AsyncStorage);
    expect(preferredTime).toEqual('12h');

    const prefersByCourse = await Preferences.getPreferScheduleByCourse(AsyncStorage);
    expect(prefersByCourse).toBeTruthy();
  });

  it('tests the retrieval of non-default preferences', async() => {
    // Set defaults for the app to load
    dataStore = {
      app_by_course: 'true',
      app_current_semester: '0',
      app_pref_wheel: 'true',
      app_selected_language: 'en',
      app_time_format: '12h',
    };

    const language = await Preferences.getSelectedLanguage(AsyncStorage);
    expect(language).toEqual('en');

    const currentSemester = await Preferences.getCurrentSemester(AsyncStorage);
    expect(currentSemester).toEqual(0);

    const prefersWheelchair = await Preferences.getPrefersWheelchair(AsyncStorage);
    expect(prefersWheelchair).toBeTruthy();

    const preferredTime = await Preferences.getPreferredTimeFormat(AsyncStorage);
    expect(preferredTime).toEqual('12h');

    const prefersByCourse = await Preferences.getPreferScheduleByCourse(AsyncStorage);
    expect(prefersByCourse).toBeTruthy();
  });

  it('tests error handling preferences', async() => {
    shouldThrowError = true;

    // Set defaults for the app to load
    dataStore = {
      app_by_course: 'false',
      app_current_semester: '0',
      app_pref_wheel: 'true',
      app_selected_language: 'en',
      app_time_format: '12h',
    };

    const language = await Preferences.getSelectedLanguage(AsyncStorage);
    expect(language).not.toBeDefined();

    const currentSemester = await Preferences.getCurrentSemester(AsyncStorage);
    expect(currentSemester).toEqual(0);

    const prefersWheelchair = await Preferences.getPrefersWheelchair(AsyncStorage);
    expect(prefersWheelchair).toBeFalsy();

    const preferredTime = await Preferences.getPreferredTimeFormat(AsyncStorage);
    expect(preferredTime).toEqual('12h');

    const prefersByCourse = await Preferences.getPreferScheduleByCourse(AsyncStorage);
    expect(prefersByCourse).toBeFalsy();
  });
});
