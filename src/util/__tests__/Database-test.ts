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
 * @file Database-test.ts
 * @description Tests the functionality of Database
 *
 */
'use strict';

// Mock the react-native-simple-store module
jest.mock('react-native-simple-store');

import * as Database from '../Database';
import { default as store } from 'react-native-simple-store';

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

// Initial base schedule to load and save
const baseSchedule = {
  semester1: {
    name_en: 'English name',
    name_fr: 'French name',
  },
  semester2: {
    name_en: 'Second English name',
    name_fr: 'Second French name',
  },
};

// Update schedule to test saving
const updatedSchedule = {
  semester1: {
    name_en: 'English name',
    name_fr: 'French name',
  },
  semester2: {
    name_en: '2nd English name',
    name_fr: '2nd French name',
  },
  semester3: {
    name_en: 'Third English name',
    name_fr: 'Third French name',
  },
};

describe('Database-test', () => {
  beforeEach(async() => {
    // Reset the datastore between tests
    store.__setDatastore({});
  });

  it('tests retrieving empty config file versions', async() => {
    const versions = await Database.getConfigVersions();
    expect(versions).toEqual([]);
  });

  it('tests saving and retrieving config file versions 1', async() => {
    await Database.updateConfigVersions(baseVersions);
    let versions = await Database.getConfigVersions();
    expect(versions).toEqual(baseVersions);

    await Database.updateConfigVersions(updatedVersions1);
    versions = await Database.getConfigVersions();
    expect(versions).toEqual(baseAndUpdates1);
  });

  it('tests saving and retrieving config file versions 2', async() => {
    await Database.updateConfigVersions(baseVersions);
    let versions = await Database.getConfigVersions();
    expect(versions).toEqual(baseVersions);

    await Database.updateConfigVersions(updatedVersions2);
    versions = await Database.getConfigVersions();
    expect(versions).toEqual(baseAndUpdates2);
  });

  it('tests retrieving the empty schedule', async() => {
    const schedule = await Database.getSchedule();
    expect(schedule).not.toBeDefined();
  });

  it('tests saving and retrieving the schedule', async() => {
    await Database.saveSchedule(baseSchedule);
    let schedule = await Database.getSchedule();
    expect(schedule).toEqual(baseSchedule);

    await Database.saveSchedule(updatedSchedule);
    schedule = await Database.getSchedule();
    expect(schedule).toEqual(updatedSchedule);
  });
});
