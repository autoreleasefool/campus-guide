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
 * @file Preferences-test.js
 * @description Test the preferences for the application.
 *
 */
'use strict';

import * as Preferences from '../Preferences';

/** Required parameters for setting preferences. */
type PreferenceOptions = {
  language: string,
  semester: number,
  wheelchair: boolean,
  timeFormat: string,
  byCourse: boolean,
}

// Initial AsyncStorage data store
let dataStore = {};

// Indicates if retrieving from the dataStore should throw an error.
let shouldThrowError: boolean = false;

// Create mock functions for storing / retrieving data
const AsyncStorage = {
  getItem: jest.fn((key: string) => {
    return new Promise((resolve, reject) => {
      if (shouldThrowError) {
        reject('Preferences-test error thrown on purpose for testing');
      } else {
        resolve(dataStore[key] || null);
      }
    });
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
async function setPreferences(preferences: PreferenceOptions) {
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

  it('tests the retrieval of default preferences', () => {
    return Preferences.getSelectedLanguage(AsyncStorage)
        .then((language) => {
          expect(language).toBeNull();
          return Preferences.getCurrentSemester(AsyncStorage);
        })
        .then((currentSemester) => {
          expect(currentSemester).toEqual(0);
          return Preferences.getPrefersWheelchair(AsyncStorage);
        })
        .then((prefers) => {
          expect(prefers).toBeFalsy();
          return Preferences.getPreferredTimeFormat(AsyncStorage);
        })
        .then((format) => {
          expect(format).toEqual('12h');
          return Preferences.getPreferScheduleByCourse(AsyncStorage);
        })
        .then((prefers) => {
          expect(prefers).toBeFalsy();
        });
  });

  it('tests setting preferences', () => {
    const preferences: PreferenceOptions = {
      language: 'fr',
      semester: 2,
      wheelchair: false,
      timeFormat: '24h',
      byCourse: true,
    };

    return setPreferences(preferences)
        .then(() => Preferences.getSelectedLanguage(AsyncStorage))
        .then((language) => {
          expect(language).toEqual('fr');
          return Preferences.getCurrentSemester(AsyncStorage);
        })
        .then((currentSemester) => {
          expect(currentSemester).toEqual(2);
          return Preferences.getPrefersWheelchair(AsyncStorage);
        })
        .then((prefers) => {
          expect(prefers).toBeFalsy();
          return Preferences.getPreferredTimeFormat(AsyncStorage);
        })
        .then((format) => {
          expect(format).toEqual('24h');
          return Preferences.getPreferScheduleByCourse(AsyncStorage);
        })
        .then((prefers) => {
          expect(prefers).toBeTruthy();
        });
  });

  it('tests setting invalid preferences', () => {
    // Set defaults for the app to load
    dataStore = {
      app_selected_language: 'en',
      app_current_semester: '0',
      app_pref_wheel: 'true',
      app_time_format: '12h',
      app_by_course: 'true',
    };

    // Set invalid preferences that should not update the dataStore
    const preferences: PreferenceOptions = {
      language: 'invalid_lang',
      semester: -1,
      wheelchair: 'true',
      timeFormat: 'twenty four',
      byCourse: 'flase',
    };

    return setPreferences(preferences)
        .then(() => Preferences.getSelectedLanguage(AsyncStorage))
        .then((language) => {
          expect(language).toEqual('en');
          return Preferences.getCurrentSemester(AsyncStorage);
        })
        .then((currentSemester) => {
          expect(currentSemester).toEqual(0);
          return Preferences.getPrefersWheelchair(AsyncStorage);
        })
        .then((prefers) => {
          expect(prefers).toBeTruthy();
          return Preferences.getPreferredTimeFormat(AsyncStorage);
        })
        .then((format) => {
          expect(format).toEqual('12h');
          return Preferences.getPreferScheduleByCourse(AsyncStorage);
        })
        .then((prefers) => {
          expect(prefers).toBeTruthy();
        });
  });

  it('tests the retrieval of non-default preferences', () => {
    // Set defaults for the app to load
    dataStore = {
      app_selected_language: 'en',
      app_current_semester: '0',
      app_pref_wheel: 'true',
      app_time_format: '12h',
      app_by_course: 'true',
    };

    return Preferences.getSelectedLanguage(AsyncStorage)
        .then((language) => {
          expect(language).toEqual('en');
          return Preferences.getCurrentSemester(AsyncStorage);
        })
        .then((currentSemester) => {
          expect(currentSemester).toEqual(0);
          return Preferences.getPrefersWheelchair(AsyncStorage);
        })
        .then((prefers) => {
          expect(prefers).toBeTruthy();
          return Preferences.getPreferredTimeFormat(AsyncStorage);
        })
        .then((format) => {
          expect(format).toEqual('12h');
          return Preferences.getPreferScheduleByCourse(AsyncStorage);
        })
        .then((prefers) => {
          expect(prefers).toBeTruthy();
        });
  });

  it('tests error handling preferences', () => {
    shouldThrowError = true;

    // Set defaults for the app to load
    dataStore = {
      app_selected_language: 'en',
      app_current_semester: '0',
      app_pref_wheel: 'true',
      app_time_format: '12h',
      app_by_course: 'false',
    };

    return Preferences.getSelectedLanguage(AsyncStorage)
        .then((language) => {
          expect(language).toBeNull();
          return Preferences.getCurrentSemester(AsyncStorage);
        })
        .then((currentSemester) => {
          expect(currentSemester).toEqual(0);
          return Preferences.getPrefersWheelchair(AsyncStorage);
        })
        .then((prefers) => {
          expect(prefers).toBeFalsy();
          return Preferences.getPreferredTimeFormat(AsyncStorage);
        })
        .then((format) => {
          expect(format).toEqual('12h');
          return Preferences.getPreferScheduleByCourse(AsyncStorage);
        })
        .then((prefers) => {
          expect(prefers).toBeFalsy();
        });
  });
});
