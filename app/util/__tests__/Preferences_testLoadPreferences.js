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
 * @file Preferences_testLoadPreferences.js
 * @description Test the loading of the preferences for the application.
 *
 */
'use strict';

// Unmock modules so the real module is used.
jest.unmock('../Configuration');
jest.unmock('../LanguageUtils');
jest.unmock('../Preferences');
jest.unmock('../../../assets/json/config.json');

// Indicates if the method getItem in the AsyncStorage mock should thrown an error
let shouldThrowError: boolean = false;

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

// Dictionary of values to store.
let temporaryAsyncStorage = {};

// Should be identical to the first item in <root>/assets/json/config.json
const firstSemester = {
  code: '20161',
  name_en: 'Winter 2016',
  name_fr: 'Hiver 2016',
  current: true,
};

describe('testLoadPreferences', () => {
  beforeEach(() => {
    const Configuration = require('../Configuration');

    // Load the configuration file for the application.
    Configuration.loadConfiguration();
    temporaryAsyncStorage = {};
    shouldThrowError = false;
  });

  pit('tests the loading of the preferences for the application.', () => {
    const AsyncStorage = require('AsyncStorage');
    const Preferences = require('../Preferences');

    return Preferences.loadInitialPreferences(AsyncStorage).then(() => {
      expect(Preferences.isFirstTimeOpened()).toBeTruthy();
      expect(Preferences.isLanguageSelected()).toBeFalsy();
      expect(Preferences.getSelectedLanguage()).toBe('en');
      expect(Preferences.isWheelchairRoutePreferred()).toBeFalsy();
      expect(Preferences.getCurrentSemester()).toBe(0);
      expect(Preferences.getCurrentSemesterInfo()).toEqual(firstSemester);
    });
  });

  pit('tests the failed loading of the preferences for the application.', () => {
    const AsyncStorage = require('AsyncStorage');
    const Preferences = require('../Preferences');
    shouldThrowError = true;

    return Preferences.loadInitialPreferences(AsyncStorage).then(() => {
      expect(Preferences.isFirstTimeOpened()).toBeTruthy();
      expect(Preferences.isLanguageSelected()).toBeFalsy();
      expect(Preferences.getSelectedLanguage()).toBe('en');
      expect(Preferences.isWheelchairRoutePreferred()).toBeFalsy();
      expect(Preferences.getCurrentSemester()).toBe(0);
      expect(Preferences.getCurrentSemesterInfo()).toEqual(firstSemester);
    });
  });
});
