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
 * @created 2016-11-1
 * @file Preferences-test.ts
 * @description Test the preferences for the application.
 *
 */
'use strict';

import * as Preferences from '../Preferences';

// Mock translations for days
jest.mock('../../../assets/json/CoreTranslations.json', () => ({
  en: {
    friday: 'Day',
    monday: 'Day',
    saturday: 'Day',
    sunday: 'Day',
    thursday: 'Day',
    tuesday: 'Day',
    wednesday: 'Day',
  },
  fr: {
    friday: 'Jour',
    monday: 'Jour',
    saturday: 'Jour',
    sunday: 'Jour',
    thursday: 'Jour',
    tuesday: 'Jour',
    wednesday: 'Jour',
  },
}));

/** Required parameters for setting preferences. */
interface PreferenceOptions {
  language: string;
  semester: number;
  wheelchair: boolean;
  timeFormat: string;
  byCourse: boolean;
  shortest: boolean;
}

// Initial AsyncStorage data store
let dataStore: any = {};

// Indicates if retrieving from the dataStore should throw an error.
let shouldThrowError = false;

// Create mock functions for storing / retrieving data
const AsyncStorage: any = {
  getItem: jest.fn(async(key: string) => {
    if (shouldThrowError) {
      throw new Error('Preferences-test error thrown on purpose for testing');
    } else {
      return dataStore[key] || undefined;
    }
  }),
  setItem: jest.fn((key: string, value: string) => {
    if (shouldThrowError) {
      throw new Error('Preferences-test error thrown on purpose for testing');
    } else {
      dataStore[key] = value;
    }
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
  Preferences.setPrefersShortestRoute(AsyncStorage, preferences.shortest);
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

    const prefersShortest = await Preferences.getPrefersShortestRoute(AsyncStorage);
    expect(prefersShortest).toBeFalsy();

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
      shortest: true,
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

    const prefersShortest = await Preferences.getPrefersShortestRoute(AsyncStorage);
    expect(prefersShortest).toBeTruthy();

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
      app_pref_shortest_route: 'true',
      app_pref_wheel: 'true',
      app_selected_language: 'en',
      app_time_format: '12h',
    };

    // Set invalid preferences that should not update the dataStore
    const preferences: any = {
      byCourse: 'flase',
      language: 'invalid_lang',
      semester: -1,
      shortest: 'sjkdlsa',
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

    const prefersShortest = await Preferences.getPrefersShortestRoute(AsyncStorage);
    expect(prefersShortest).toBeTruthy();

    const preferredTime = await Preferences.getPreferredTimeFormat(AsyncStorage);
    expect(preferredTime).toEqual('12h');

    const prefersByCourse = await Preferences.getPreferScheduleByCourse(AsyncStorage);
    expect(prefersByCourse).toBeTruthy();
  });

  it('tests error handling preferences', async() => {
    // Test error handling setting preferences
    let preferences: PreferenceOptions = {
      byCourse: true,
      language: 'fr',
      semester: 2,
      shortest: true,
      timeFormat: '24h',
      wheelchair: false,
    };

    shouldThrowError = true;
    let errorThrown = false;
    try {
      await setPreferences(preferences);
    } catch (e) {
      errorThrown = true;
    }
    expect(errorThrown).toBeTruthy();

    // Expect defaults
    let language = await Preferences.getSelectedLanguage(AsyncStorage);
    expect(language).not.toBeDefined();

    let currentSemester = await Preferences.getCurrentSemester(AsyncStorage);
    expect(currentSemester).toEqual(0);

    let prefersWheelchair = await Preferences.getPrefersWheelchair(AsyncStorage);
    expect(prefersWheelchair).toBeFalsy();

    let prefersShortest = await Preferences.getPrefersShortestRoute(AsyncStorage);
    expect(prefersShortest).toBeFalsy();

    let preferredTime = await Preferences.getPreferredTimeFormat(AsyncStorage);
    expect(preferredTime).toEqual('12h');

    let prefersByCourse = await Preferences.getPreferScheduleByCourse(AsyncStorage);
    expect(prefersByCourse).toBeFalsy();

    // Set preferences
    shouldThrowError = false;
    preferences = {
      byCourse: false,
      language: 'en',
      semester: 0,
      shortest: false,
      timeFormat: '12h',
      wheelchair: false,
    };
    await setPreferences(preferences);

    // Test error handling retrieving preferences
    shouldThrowError = true;

    // Expect defaults
    language = await Preferences.getSelectedLanguage(AsyncStorage);
    expect(language).not.toBeDefined();

    currentSemester = await Preferences.getCurrentSemester(AsyncStorage);
    expect(currentSemester).toEqual(0);

    prefersWheelchair = await Preferences.getPrefersWheelchair(AsyncStorage);
    expect(prefersWheelchair).toBeFalsy();

    prefersShortest = await Preferences.getPrefersShortestRoute(AsyncStorage);
    expect(prefersShortest).toBeFalsy();

    preferredTime = await Preferences.getPreferredTimeFormat(AsyncStorage);
    expect(preferredTime).toEqual('12h');

    prefersByCourse = await Preferences.getPreferScheduleByCourse(AsyncStorage);
    expect(prefersByCourse).toBeFalsy();
  });
});
