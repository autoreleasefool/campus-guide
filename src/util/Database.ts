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
 * @created 2016-10-09
 * @file Database.ts
 * @description Provides interactions with the application database.
 */
'use strict';

// Imports
import * as Arrays from './Arrays';
import { default as store } from 'react-native-simple-store';

import { ConfigFile } from './Configuration';

/** Identifier for storing Configuration file versions.  */
const STORE_CONFIG_VERSIONS = 'configFiles';

/** Identifier for storing user schedule. */
const STORE_SCHEDULE = 'schedule';

/**
 * Returns the user's full schedule.
 *
 * @returns {Promise<any>} a promise which resolves with a set of semesters mapped to their
 *                         respective courses and schedules, as designated by the user
 */
export function getSchedule(): Promise<any> {
  return store.get(STORE_SCHEDULE);
}

/**
 * Overrides the user's schedule, saving it.
 *
 * @param {object} schedule the schedule to save
 * @returns {Promise<void>} a promise which resolves when the schedule has been saved
 */
export function saveSchedule(schedule: object): Promise<void> {
  return store.save(STORE_SCHEDULE, schedule);
}

/**
 * Gets a list of config files and their versions from the database.
 *
 * @returns {Promise<ConfigFile[]>} a promise which resolves with a list of config file names and versions,
 *                                  or undefined
 */
export async function getConfigVersions(): Promise<ConfigFile[]> {
  const configVersions: ConfigFile[] = await store.get(STORE_CONFIG_VERSIONS);
  if (configVersions == undefined) {
    return [];
  }

  return Arrays.sortObjectArrayByKeyValues(configVersions, 'name');
}

/**
 * Update versions in the database for config files provided.
 *
 * @param {ConfigFile[]} updates set of config files and versions
 * @returns {Promise<void>} promise which resolves when all updates have finished
 */
export async function updateConfigVersions(updates: ConfigFile[]): Promise<void> {
  const original: ConfigFile[] = await store.get(STORE_CONFIG_VERSIONS);

  let final: object[] = updates;

  if (original != undefined) {
    const sorted = Arrays.sortObjectArrayByKeyValues(original, 'name');

    // Replace any config versions that should be updated
    for (const update of updates) {
      const index = Arrays.binarySearchObjectArrayByKeyValue(sorted, 'name', update.name);
      if (index >= 0) {
        sorted.splice(index, 1);
      }
    }

    final = final.concat(sorted);
  }

  // Save the updated config files
  await store.save(STORE_CONFIG_VERSIONS, final);
}
