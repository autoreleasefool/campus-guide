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
 * @file Preferences_testSetPreferences.js
 * @description Test the setting of the preferences for the application.
 *
 */
'use strict';

// Unmock modules so the real module is used.
jest.unmock('../Configuration')
    .unmock('../Preferences')
    .unmock('../../../assets/static/json/config.json');

// Mock various modules required in testing.
jest.setMock('AsyncStorage', {
      getItem: jest.fn(async (item) => {
        if (item != null && item in temporaryAsyncStorage) {
          return temporaryAsyncStorage[item]
        } else {
          return null;
        }
      }),
      setItem: jest.fn((item, value) => {
        if (item != null && typeof value === 'string') {
          temporaryAsyncStorage[item] = value;
        }
      }),
    });

// Dictionary of values to store.
let temporaryAsyncStorage = {};

describe('testSetPreferences', () => {
  beforeEach(() => {
    const Configuration = require('../Configuration');

    // Load the configuration file for the application.
    Configuration.loadConfiguration();
  });

  pit('tests the setting of preferences for the application.', () => {
    const AsyncStorage = require('AsyncStorage');
    const Preferences = require('../Preferences');

    return Preferences.loadInitialPreferences(AsyncStorage).then(() => {
      Preferences.setSelectedLanguage(AsyncStorage, 'en');
      expect(Preferences.getSelectedLanguage()).toBe('en');
      Preferences.setSelectedLanguage(AsyncStorage, 'fr');
      expect(Preferences.getSelectedLanguage()).toBe('fr');
      Preferences.setSelectedLanguage(AsyncStorage, 'invalid_language');
      expect(Preferences.getSelectedLanguage()).toBe('fr');

      Preferences.setWheelchairRoutePreferred(AsyncStorage, false);
      expect(Preferences.isWheelchairRoutePreferred()).toBeFalsy();
      Preferences.setWheelchairRoutePreferred(AsyncStorage, true);
      expect(Preferences.isWheelchairRoutePreferred()).toBeTruthy();
      Preferences.setWheelchairRoutePreferred(AsyncStorage, 'invalid_boolean');
      expect(Preferences.isWheelchairRoutePreferred()).toBeTruthy();

      Preferences.setCurrentSemester(AsyncStorage, 0);
      expect(Preferences.getCurrentSemester()).toBe(0);
      Preferences.setCurrentSemester(AsyncStorage, 1);
      expect(Preferences.getCurrentSemester()).toBe(1);
      Preferences.setCurrentSemester(AsyncStorage, 999);
      expect(Preferences.getCurrentSemester()).toBe(0);
      Preferences.setToNextSemester(AsyncStorage);
      expect(Preferences.getCurrentSemester()).toBe(1);
    });
  });
});
