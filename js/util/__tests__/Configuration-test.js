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
 * @file Configuration-test.js
 * @description Test the loading of the configuration file for the application.
 *
 */
'use strict';

// Unmock modules so the real module is used.
jest.unmock('Configuration');

describe('Configuration-test', () => {

  // Configuration module for testing
  let Configuration;

  beforeEach(() => {
    // Refresh module between tests
    Configuration = require('Configuration');
  });

  pit('tests the loading of the configuration file for the application.', () => {

    // Mock config.json
    jest.setMock('../../../assets/json/config.json', {
      AvailableSemesters: [
        {
          code: '0',
          name_en: 'name_en',
          name_fr: 'name_fr',
          current: true,
        },
      ],
      University: {},
      Bus: {},
    });

    return Configuration.loadConfiguration().then(() => {
      expect(Configuration.getAvailableSemesters().length).toBeGreaterThan(0);
      expect(Configuration.getDefaultLink()).toBe('http://www.uottawa.ca/');
      expect(Configuration.getCityBusyInfo()).toBeDefined();
      expect(Configuration.getSemester(0)).toBeDefined();
      expect(Configuration.getUniversity()).toBeDefined();
    });
  });

  pit('tests the loading of an empty configuration.', () => {

    // Define an empty configuration.
    jest.setMock('../../../assets/json/config.json', {});

    return Configuration.loadConfiguration().then(() => {
      expect(Configuration.getAvailableSemesters().length).toBe(0);
      expect(Configuration.getDefaultLink()).toBe('http://www.uottawa.ca/');
      expect(Configuration.getCityBusyInfo()).toBeUndefined();
      expect(Configuration.getSemester(0)).toBeUndefined();
      expect(Configuration.getUniversity()).toBeUndefined();
    });
  });
});
