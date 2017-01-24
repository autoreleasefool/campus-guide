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
 * @created 2016-10-30
 * @file Database-test.js
 * @description Tests the functionality of Database
 *
 */
'use strict';

import * as Database from '../Database';

// Mock the react-native-simple-store module
jest.mock('react-native-simple-store');

// Base set of config file versions
const baseVersions = [
  {
    name: 'config_1',
    type: 'json',
    version: 1,
  },
  {
    name: 'config_2',
    type: 'image',
    version: 2,
  },
];

// Update specific config file version
const updatedVersions1 = [
  {
    name: 'config_1',
    type: 'json',
    version: 2,
  },
];

// Combine base and updated config files
const baseAndUpdates1 = [
  {
    name: 'config_1',
    type: 'json',
    version: 2,
  },
  {
    name: 'config_2',
    type: 'image',
    version: 2,
  },
];

// Update specific config file version
const updatedVersions2 = [
  {
    name: 'config_3',
    type: 'json',
    version: 3,
  },
];

// Combine base and updated config files
const baseAndUpdates2 = [
  {
    name: 'config_1',
    type: 'json',
    version: 1,
  },
  {
    name: 'config_2',
    type: 'image',
    version: 2,
  },
  {
    name: 'config_3',
    type: 'json',
    version: 3,
  },
];

describe('Database-test', () => {
  beforeEach(() => {
    // Reset the datastore between tests
    require('react-native-simple-store').__setDatastore({});
  });

  pit('tests retrieving empty config file versions', () => {
    return Database.getConfigVersions().then((versions) => {
      expect(versions).toBeNull();
    });
  });

  pit('tests saving and retrieving config file versions 1', () => {
    return Database.updateConfigVersions(baseVersions)
        .then(() => Database.getConfigVersions())
        .then((versions) => {
          expect(versions).toEqual(baseVersions);
          return Database.updateConfigVersions(updatedVersions1);
        })
        .then(() => Database.getConfigVersions())
        .then((versions) => {
          expect(versions).toEqual(baseAndUpdates1);
        });
  });

  pit('tests saving and retrieving config file versions 2', () => {
    return Database.updateConfigVersions(baseVersions)
        .then(() => Database.getConfigVersions())
        .then((versions) => {
          expect(versions).toEqual(baseVersions);
          return Database.updateConfigVersions(updatedVersions2);
        })
        .then(() => Database.getConfigVersions())
        .then((versions) => {
          expect(versions).toEqual(baseAndUpdates2);
        });
  });
});
