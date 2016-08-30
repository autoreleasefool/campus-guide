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
 * @file Database.js
 * @providesModule Database
 * @description Provides interations with the application database.
 *
 * @flow
 */
'use strict';

// Type imports
import type {
  ConfigFile,
} from 'types';

const store = require('react-native-simple-store');

// Imports
const Promise = require('promise');

/** Identifier for storing Configuration file versions.  */
const STORE_CONFIG_VERSIONS = 'configFiles';

/**
 * Sorts an array of config files by their name.
 *
 * @param {Array<ConfigFile>} configFiles an array of configuration file descriptors
 * @returns {Array<ConfigFiles>} the sorted array
 */
function _sortConfigFiles(configFiles: Array < ConfigFile >): Array < ConfigFile > {
  if (configFiles == null) {
    return configFiles;
  }

  return configFiles.sort((a, b) => {
    const nameA = a.name.toUpperCase();
    const nameB = b.name.toUpperCase();

    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }

    // names must be equal
    return 0;
  });
}

/**
 * Search an array of configuration file descriptors to see if the file already exists.
 *
 * @param {Array<ConfigFile>} configFiles a sorted array of configuration file descriptors
 * @param {ConfigFile} file               the file to search for
 * @returns {number} the index of the file in the array, or -1 if the file was not found
 */
function _searchConfigFiles(configFiles: Array < ConfigFile >, file: ConfigFile): number {
  const fileName = file.name.toUpperCase();

  let low: number = 0;
  let high: number = configFiles.length - 1;
  while (low <= high) {
    const mid: number = Math.floor((low + high) / 2);
    const midName = configFiles[mid].name.toUpperCase();

    if (midName < fileName) {
      low = mid + 1;
    } else if (midName > fileName) {
      high = mid - 1;
    } else {
      return mid;
    }
  }

  return -1;
}

/**
 * Gets a list of config files and their versions from the database.
 *
 * @returns {Promise<Array<ConfigFile>>} a promise which resolves with a list of config file names and versions, or null
 */
export function getConfigVersions(): Promise < Array < ConfigFile > > {
  return store.get(STORE_CONFIG_VERSIONS)
      .then(configVersions => {
        return _sortConfigFiles(configVersions);
      });
}

/**
 * Update versions in the database for config files provided.
 *
 * @param {ConfigFile} updatedConfigFiles set of config files and versions
 * @returns {Promise<void>} promise which resolves when all updates have finished
 */
export function updateConfigVersions(updatedConfigFiles: Array < ConfigFile >): Promise < void > {
  return store.get(STORE_CONFIG_VERSIONS)
      .then(configFiles => {
        let updated = updatedConfigFiles;

        if (configFiles != null) {
          const sortedConfigFiles = _sortConfigFiles(configFiles);

          // Replace any config versions that should be updated
          for (let i = 0; i < updatedConfigFiles.length; i++) {
            const index = _searchConfigFiles(sortedConfigFiles, updatedConfigFiles[i]);
            if (index >= 0) {
              sortedConfigFiles.splice(index, 1);
            }
          }

          updated = updated.concat(sortedConfigFiles);
        }

        // Save the updated config files
        return store.save(STORE_CONFIG_VERSIONS, updated);
      });
}
