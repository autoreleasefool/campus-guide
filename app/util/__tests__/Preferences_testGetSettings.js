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
 * @file Preferences_testGetSettings.js
 * @description Test the retrieval of settings for the application.
 *
 */
'use strict';

// Unmock modules so the real module is used.
jest.unmock('../Configuration')
    .unmock('../LanguageUtils')
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

// Should be identical to the first item in <root>/assets/static/json/config.json
const firstSemester = {
  code: '20161',
  name_en: 'Winter 2016',
  name_fr: 'Hiver 2016',
  current: true,
};

describe('testGetSettings', () => {
  beforeEach(() => {
    const Configuration = require('../Configuration');

    // Load the configuration file for the application.
    Configuration.loadConfiguration();
  });

  pit('tests the retrieval of settings.', () => {
    const AsyncStorage = require('AsyncStorage');
    const Preferences = require('../Preferences');

    return Preferences.loadInitialPreferences(AsyncStorage).then(() => {
      Preferences.setSelectedLanguage(AsyncStorage, 'en');
      expect(Preferences.getSetting('pref_lang')).toBe('English');
      Preferences.setSelectedLanguage(AsyncStorage, 'fr');
      expect(Preferences.getSetting('pref_lang')).toBe('Français');

      Preferences.setWheelchairRoutePreferred(AsyncStorage, false);
      expect(Preferences.getSetting('pref_wheel')).toBeFalsy();
      Preferences.setWheelchairRoutePreferred(AsyncStorage, true);
      expect(Preferences.getSetting('pref_wheel')).toBeTruthy();

      Preferences.setSelectedLanguage(AsyncStorage, 'en');
      expect(Preferences.getSetting('pref_semester')).toBe(firstSemester.name_en);
      Preferences.setSelectedLanguage(AsyncStorage, 'fr');
      expect(Preferences.getSetting('pref_semester')).toBe(firstSemester.name_fr);

      expect(Preferences.getSetting('invalid_setting')).toBeNull();
    });
  });
});
