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
 * @file Preferences-test.js
 * @description Test the preferences for the application.
 *
 */
'use strict';

// Unmock modules so the real module is used.
jest.unmock('../Configuration');
jest.unmock('../LanguageUtils');
jest.unmock('../Preferences');
jest.unmock('../../../assets/json/config.json');

// Mock various modules required in testing.
jest.setMock('AsyncStorage', {
  getItem: jest.fn(async (item) => {
    if (shouldThrowError) {
      throw new Error('Error!');
    }

    if (item != null && item in temporaryAsyncStorage) {
      return temporaryAsyncStorage[item];
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

// A number which cannot exist as a semester
const INVALID_SEMESTER = 999;

// Require modules for testing
const AsyncStorage = require('AsyncStorage');

// Dictionary of values to store.
let temporaryAsyncStorage = {};

// Indicates if the method getItem in the AsyncStorage mock should thrown an error
let shouldThrowError: boolean = false;

describe('Preferences-test', () => {

  // Configuration module for tests
  let Configuration;
  // Preferences module for testLoadPreferences
  let Preferences;

  beforeEach(() => {
    // Refresh modules between tests
    Configuration = require('../Configuration');
    Preferences = require('../Preferences');

    // In most cases, we don't want an error to be thrown in AsyncStorage
    shouldThrowError = false;

    // Load the configuration file for the application.
    Configuration.loadConfiguration();
    temporaryAsyncStorage = {};
  });

  pit('tests the retrieval of settings.', () => {
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
      expect(Preferences.getSetting('pref_semester')).toBeDefined();
      Preferences.setSelectedLanguage(AsyncStorage, 'fr');
      expect(Preferences.getSetting('pref_semester')).toBeDefined();

      expect(Preferences.getSetting('invalid_setting')).toBeNull();
    });
  });

  pit('tests the retrieval of non-default settings.', () => {
    // Set defaults for the app to load
    temporaryAsyncStorage = {
      app_times_opened: '2',
      app_selected_langauge: 'en',
      app_current_semester: '0',
      app_pref_wheel: 'true',
    };

    return Preferences.loadInitialPreferences(AsyncStorage).then(() => {
      expect(Preferences.getSetting('pref_lang')).toBe('English');
      expect(Preferences.getSetting('pref_wheel')).toBeTruthy();
      expect(Preferences.getSetting('pref_semester')).toBeDefined();
      expect(Preferences.isFirstTimeOpened()).toBeFalsy();
    });
  });

  pit('tests the setting of preferences for the application.', () => {
    return Preferences.loadInitialPreferences(AsyncStorage).then(() => {
      expect(Preferences.isLanguageSelected()).toBeFalsy();
      Preferences.setSelectedLanguage(AsyncStorage, 'en');
      expect(Preferences.getSelectedLanguage()).toBe('en');
      expect(Preferences.isLanguageSelected()).toBeTruthy();
      Preferences.setSelectedLanguage(AsyncStorage, 'fr');
      expect(Preferences.getSelectedLanguage()).toBe('fr');
      expect(Preferences.isLanguageSelected()).toBeTruthy();
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
      Preferences.setCurrentSemester(AsyncStorage, INVALID_SEMESTER);
      expect(Preferences.getCurrentSemester()).toBe(0);
      Preferences.setToNextSemester(AsyncStorage);
      expect(Preferences.getCurrentSemester()).toBe(1);
    });
  });

  pit('tests the loading of the preferences for the application.', () => {
    return Preferences.loadInitialPreferences(AsyncStorage).then(() => {
      expect(Preferences.isFirstTimeOpened()).toBeTruthy();
      expect(Preferences.isLanguageSelected()).toBeFalsy();
      expect(Preferences.getSelectedLanguage()).toBe('en');
      expect(Preferences.isWheelchairRoutePreferred()).toBeFalsy();
      expect(Preferences.getCurrentSemester()).toBe(0);
      expect(Preferences.getCurrentSemesterInfo()).toBeDefined();
    });
  });

  pit('tests the failed loading of the preferences for the application.', () => {
    // Test what happens when AsyncStorage throws an error
    shouldThrowError = true;

    return Preferences.loadInitialPreferences(AsyncStorage).then(() => {
      expect(Preferences.isFirstTimeOpened()).toBeTruthy();
      expect(Preferences.isLanguageSelected()).toBeFalsy();
      expect(Preferences.getSelectedLanguage()).toBe('en');
      expect(Preferences.isWheelchairRoutePreferred()).toBeFalsy();
      expect(Preferences.getCurrentSemester()).toBe(0);
      expect(Preferences.getCurrentSemesterInfo()).toBeDefined();
    });
  });
})
