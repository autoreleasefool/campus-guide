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
  searchAll: boolean,
  timeFormat: string,
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
  Preferences.setAlwaysSearchAll(AsyncStorage, preferences.searchAll);
  Preferences.setPreferredTimeFormat(AsyncStorage, preferences.timeFormat);
}

describe('Preferences-test', () => {

  beforeEach(() => {
    // Reset AsyncStorage
    dataStore = {};

    // Only throw errors if specified in the test
    shouldThrowError = false;
  });

  pit('tests the retrieval of default preferences', () => {
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
          return Preferences.getAlwaysSearchAll(AsyncStorage);
        })
        .then((always) => {
          expect(always).toBeFalsy();
          return Preferences.getPreferredTimeFormat(AsyncStorage);
        })
        .then((format) => {
          expect(format).toEqual('12h');
        });
  });

  pit('tests setting preferences', () => {
    const preferences: PreferenceOptions = {
      language: 'fr',
      semester: 2,
      wheelchair: false,
      searchAll: true,
      timeFormat: '24h',
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
          return Preferences.getAlwaysSearchAll(AsyncStorage);
        })
        .then((always) => {
          expect(always).toBeTruthy();
          return Preferences.getPreferredTimeFormat(AsyncStorage);
        })
        .then((format) => {
          expect(format).toEqual('24h');
        });
  });

  pit('tests setting invalid preferences', () => {
    // Set defaults for the app to load
    dataStore = {
      app_selected_language: 'en',
      app_current_semester: '0',
      app_pref_wheel: 'true',
      app_search_all_always: 'true',
      app_time_format: '12h',
    };

    // Set invalid preferences that should not update the dataStore
    const preferences: PreferenceOptions = {
      language: 'invalid_lang',
      semester: -1,
      wheelchair: 'true',
      searchAll: 'true',
      timeFormat: 'twenty four',
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
          return Preferences.getAlwaysSearchAll(AsyncStorage);
        })
        .then((always) => {
          expect(always).toBeTruthy();
          return Preferences.getPreferredTimeFormat(AsyncStorage);
        })
        .then((format) => {
          expect(format).toEqual('12h');
        });
  });

  pit('tests the retrieval of non-default preferences', () => {
    // Set defaults for the app to load
    dataStore = {
      app_selected_language: 'en',
      app_current_semester: '0',
      app_pref_wheel: 'true',
      app_search_all_always: 'true',
      app_time_format: '12h',
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
          return Preferences.getAlwaysSearchAll(AsyncStorage);
        })
        .then((always) => {
          expect(always).toBeTruthy();
          return Preferences.getPreferredTimeFormat(AsyncStorage);
        })
        .then((format) => {
          expect(format).toEqual('12h');
        });
  });

  pit('tests error handling preferences', () => {
    shouldThrowError = true;

    // Set defaults for the app to load
    dataStore = {
      app_selected_language: 'en',
      app_current_semester: '0',
      app_pref_wheel: 'true',
      app_search_all_always: 'true',
      app_time_format: '12h',
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
          return Preferences.getAlwaysSearchAll(AsyncStorage);
        })
        .then((always) => {
          expect(always).toBeFalsy();
          return Preferences.getPreferredTimeFormat(AsyncStorage);
        })
        .then((format) => {
          expect(format).toEqual('12h');
        });
  });

  // pit('tests the setting of preferences for the application.', () => {
  //   return Preferences.loadInitialPreferences(AsyncStorage).then(() => {
  //     expect(Preferences.isLanguageSelected()).toBeFalsy();
  //     Preferences.setSelectedLanguage(AsyncStorage, 'en');
  //     expect(Preferences.getSelectedLanguage()).toBe('en');
  //     expect(Preferences.isLanguageSelected()).toBeTruthy();
  //     Preferences.setSelectedLanguage(AsyncStorage, 'fr');
  //     expect(Preferences.getSelectedLanguage()).toBe('fr');
  //     expect(Preferences.isLanguageSelected()).toBeTruthy();
  //     Preferences.setSelectedLanguage(AsyncStorage, 'invalid_language');
  //     expect(Preferences.getSelectedLanguage()).toBe('fr');

  //     Preferences.setWheelchairRoutePreferred(AsyncStorage, false);
  //     expect(Preferences.isWheelchairRoutePreferred()).toBeFalsy();
  //     Preferences.setWheelchairRoutePreferred(AsyncStorage, true);
  //     expect(Preferences.isWheelchairRoutePreferred()).toBeTruthy();
  //     Preferences.setWheelchairRoutePreferred(AsyncStorage, 'invalid_boolean');
  //     expect(Preferences.isWheelchairRoutePreferred()).toBeTruthy();

  //     Preferences.setAlwaysSearchAll(AsyncStorage, false);
  //     expect(Preferences.getAlwaysSearchAll()).toBeFalsy();
  //     Preferences.setAlwaysSearchAll(AsyncStorage, true);
  //     expect(Preferences.getAlwaysSearchAll()).toBeTruthy();
  //     Preferences.setAlwaysSearchAll(AsyncStorage, 'invalid_boolean');
  //     expect(Preferences.getAlwaysSearchAll()).toBeTruthy();

  //     /* eslint-disable no-magic-numbers */
  //     /* Testing setting the time with a number rather than a string */

  //     Preferences.setPreferredTimeFormat(AsyncStorage, '12');
  //     expect(Preferences.getPreferredTimeFormat()).toBe('12');
  //     Preferences.setPreferredTimeFormat(AsyncStorage, '24');
  //     expect(Preferences.getPreferredTimeFormat()).toBe('24');
  //     Preferences.setPreferredTimeFormat(AsyncStorage, 12);
  //     expect(Preferences.getPreferredTimeFormat()).toBe('24');

  //     /* eslint-enable no-magic-numbers */

  //     Preferences.setCurrentSemester(AsyncStorage, 0);
  //     expect(Preferences.getCurrentSemester()).toBe(0);
  //     Preferences.setCurrentSemester(AsyncStorage, 1);
  //     expect(Preferences.getCurrentSemester()).toBe(1);
  //     Preferences.setCurrentSemester(AsyncStorage, INVALID_SEMESTER);
  //     expect(Preferences.getCurrentSemester()).toBe(0);
  //     Preferences.setToNextSemester(AsyncStorage);
  //     expect(Preferences.getCurrentSemester()).toBe(1);
  //   });
  // });

  // pit('tests the loading of the preferences for the application.', () => {
  //   return Preferences.loadInitialPreferences(AsyncStorage).then(() => {
  //     expectDefaultPreferences(Preferences);
  //   });
  // });
});
