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
 * @file Configuration.js
 * @providesModule Configuration
 * @description Manages the configuration of the application.
 *
 * @flow
 */
'use strict';

// Import types
import type {
  Semester,
  University,
  BusInfo,
} from 'types';

type ConfigUpdate = {
  name: string,
  url: string,
  size: number,
  oldVersion: number,
  newVersion: number
}

// Imports
const Database = require('Database');
const DeviceInfo = require('react-native-device-info');
const HttpStatus = require('http-status-codes');
const Promise = require('promise');
const RNFS = require('react-native-fs');

// Directory for config files
const CONFIG_DIRECTORY = RNFS.DocumentDirectoryPath + '/config';
// Directory for downloaded config files
const TEMP_CONFIG_DIRECTORY = RNFS.DocumentDirectoryPath + '/temp/config';
// Expected filename for app_config
const APP_CONFIG: string = '/app_config.json';

// Default link to return
const DEFAULT_LINK: string = 'http://www.uottawa.ca/';
// List of semesters available in the app
const availableSemesters: Array < Semester > = [];

// Information about the university
let university: ?University = null;
// Information about the buses in the city
let cityBuses: ?BusInfo = null;
// Indicates if the configuration is initializing
let configInitializing: boolean = false;
// List of promises that should resolve or reject if the configuration is available or not
const availablePromises: Array < { resolve: () => any, reject: () => any } > = [];

// List of configuration files which have updates available
const configurationUpdates: Array < ConfigUpdate > = [];
// Indicates if the app has checked for a configuration update yet
let checkedForUpdate: boolean = false;

/**
 * Asynchronously gets the configuration for the application and loads the various config values into their
 * respective variables.
 *
 * @returns {Promise<boolean>} returns a promise which resolves with true if the configuration is available,
 *                             false otherwise
 */
async function _requestConfig(): Promise < boolean > {

  let db = null;
  try {
    db = await Database.init();
  } catch (e) {
    throw e;
  }

  let configVersions = null;
  try {
    configVersions = await Database.getConfigVersions(db);
  } catch (e) {
    throw e;
  }

  if (configVersions.length == 0) {
    return false;
  }

  // Ensure all config files exist
  let configAvailable: boolean = true;
  for (let i = 0; i < configVersions.length; i++) {
    try {
      const exists = await RNFS.exists(CONFIG_DIRECTORY + configVersions[i].name);
      configAvailable = configAvailable && exists;
    } catch (e) {
      throw e;
    }
  }

  // If any config files do not exist, return false for no available configuration
  if (!configAvailable) {
    return false;
  }

  // Load the application configuration
  const appConfig: string = await RNFS.readFile(CONFIG_DIRECTORY + APP_CONFIG, 'utf8');
  const configuration = JSON.parse(appConfig);

  // Get the current semesters available in the app
  if (configuration.semesters) {
    for (let i = 0; i < configuration.semesters.length; i++) {
      availableSemesters.push(configuration.semesters[i]);
    }
  }

  university = configuration.university;
  cityBuses = configuration.bus;
  return true;
}

/**
 * Resolves promises waiting for Configuration initiation with the result.
 *
 * @param {boolean} result true if the configuration is available, false otherwise
 */
function _initSuccess(result: boolean): void {
  if (result) {
    console.log('Configuration successfully loaded.');
  } else {
    console.log('Configuration could not be found.');
  }

  configInitializing = false;
  for (let i = 0; i < availablePromises.length; i++) {
    availablePromises[i].resolve(result);
  }
}

/**
 * Resolves promises waiting for Configuration initiation with false (no configuration available).
 *
 * @param {any} err error encountered while getting configuration
 */
function _initError(err: any): void {
  console.log('Error while getting configuration', err);
  configInitializing = false;
  for (let i = 0; i < availablePromises.length; i++) {
    availablePromises[i].resolve(false);
  }
}

/**
 * Checks if there is a configuration available to download. Returns true or false in a promise.
 *
 * @returns {Promise<boolean>} promise which resolves to true or false depending on if a config update is available
 */
async function _refreshConfigVersions(): Promise < boolean > {

  // Load environment variables
  const env = require('env');

  try {
    // Get current config versions
    const db = await Database.init();
    const configVersions = await Database.getConfigVersions(db);

    // Fetch most recent config versions from server
    const configUpdateURL: string = env.configUpdatesServerUrl + '/config/' + DeviceInfo.getVersion();
    console.log('Retrieving config: ' + configUpdateURL);
    const response = await fetch(configUpdateURL);
    const appConfig: Object = await response.json();

    // Will indicate if any updates are available
    let updateAvailable: boolean = false;

    for (const config in appConfig) {
      if (appConfig.hasOwnProperty(config)) {
        let found: boolean = false;
        for (let i = 0; i < configVersions.length; i++) {
          if (configVersions[i].name === config) {
            found = true;
            if (configVersions[i].version < appConfig[config].version) {
              updateAvailable = true;
              configurationUpdates.push({
                name: config,
                url: appConfig[config].location.url,
                size: appConfig[config].size,
                oldVersion: configVersions[i].version,
                newVersion: appConfig[config].version,
              });
            }
          }
        }

        if (!found) {
          updateAvailable = true;
          configurationUpdates.push({
            name: config,
            url: appConfig[config].location.url,
            size: appConfig[config].size,
            oldVersion: 0,
            newVersion: appConfig[config].version,
          });
        }
      }
    }

    return updateAvailable;
  } catch (e) {
    throw e;
  }
}

/**
 * Updates the configuration, invoking a callback with progress on the download so the UI may be updated.
 *
 * @param {function} onStart    callback function invoked with total size of update in bytes
 * @param {function} onProgress callback function invoked with byte of update downloaded so far and total expected bytes
 */
async function _updateConfig(
    onStart: (ts: number) => any,
    onProgress: (bw: number, ts: number) => any): Promise < void > {
  if (configurationUpdates.length === 0) {
    // If there are no updates, exit
    return;
  }

  await RNFS.mkdir(CONFIG_DIRECTORY);
  await RNFS.mkdir(TEMP_CONFIG_DIRECTORY);

  // Get total size of update
  let totalSize: number = 0;
  let bytesWritten: number = 0;
  for (let i = 0; i < configurationUpdates.length; i++) {
    totalSize += configurationUpdates[i].size;
  }
  onStart(totalSize);

  const updateProgress = progress => {
    bytesWritten += parseInt(progress);
    onProgress(bytesWritten, totalSize);
  };

  try {
    for (let i = 0; i < configurationUpdates.length; i++) {
      // Download the file
      const downloadResult = await RNFS.downloadFile({
        fromUrl: configurationUpdates[i].url,
        toFile: TEMP_CONFIG_DIRECTORY + configurationUpdates[i].name,
        progress: updateProgress,
      });

      if (downloadResult.statusCode != HttpStatus.OK) {
        throw new Error('Download of file ' + configurationUpdates[i].name + ' failed.'
            + 'Status code: ' + downloadResult.statusCode);
      }
    }

    const configRowUpdates: Array < {name: string, version: number} > = [];

    // Delete the old configuration files, move the new ones
    for (let i = 0; i < configurationUpdates.length; i++) {

      // Delete the file if it exists
      const exists = await RNFS.exists(CONFIG_DIRECTORY + configurationUpdates[i].name);
      if (exists) {
        await RNFS.unlink(CONFIG_DIRECTORY + configurationUpdates[i].name);
      }

      await RNFS.moveFile(
        TEMP_CONFIG_DIRECTORY + configurationUpdates[i].name,
        CONFIG_DIRECTORY + configurationUpdates[i].name
      );

      configRowUpdates.push({
        name: configurationUpdates[i].name,
        version: configurationUpdates[i].newVersion,
      });
    }

    // Update config versions in database
    let db = null;
    try {
      db = await Database.init();
    } catch (e) {
      throw e;
    }

    await Database.updateConfigVersions(db, configRowUpdates);

    await RNFS.unlink(TEMP_CONFIG_DIRECTORY);
    await module.exports.init();
  } catch (e) {
    throw e;
  }
}

module.exports = {

  /**
   * Returns a promise that resolves with a boolean indicating if a version of the configuration is available, and
   * false if not, or rejects if the configuration cannot be found.
   *
   * @returns {Promise<boolean>} promise that will resolve/reject when configuration is found or not
   */
  init(): Promise < boolean > {
    return new Promise((resolve, reject) => {
      if (university == null) {
        availablePromises.push({
          resolve: resolve,
          reject: reject,
        });

        if (!configInitializing) {
          configInitializing = true;
          _requestConfig()
              .then(_initSuccess)
              .catch(_initError);
        }
      } else {
        // Configuration has been loaded and parsed, so resolve to true
        resolve(true);
      }
    });
  },

  /**
   * Checks if there is a configuration available to download. Returns true or false in a promise.
   *
   * @returns {Promise<boolean>} promise which resolves to true or false depending on if a config update is available
   */
  isConfigUpdateAvailable(): Promise < boolean > {
    checkedForUpdate = true;
    return _refreshConfigVersions();
  },

  /**
   * Updates the configuration, invoking a callback with progress on the download so the UI may be updated.
   *
   * @param {function} onStart    callback function invoked with total size of update in bytes
   * @param {function} onProgress callback function invoked with byte of update downloaded so far and total
   *                              expected bytes
   * @returns {Promise<void>} a promise which resolves when the update is complete
   */
  updateConfig(onStart: (ts: number) => any, onProgress: (bw: number, ts: number) => any): Promise < void > {
    return _updateConfig(onStart, onProgress);
  },

  /**
   * Returns true if the app has already performed a check for a configuration update.
   *
   * @returns {boolean} true if the app checked for a configuration update, false otherwise
   */
  didCheckForUpdate(): boolean {
    return checkedForUpdate;
  },

  /**
   * Gets the list of semesters currently available in the application.
   *
   * @returns {Array<Semester>} the list of objects containing semester information.
   */
  getAvailableSemesters(): Array< Semester > {
    return availableSemesters;
  },

  /**
   * Returns an object with information about the city buses.
   *
   * @returns {?BusInfo} an object with details about the city bus system.
   */
  getCityBusyInfo(): ?BusInfo {
    return cityBuses;
  },

  /**
   * Gets a link to use in place of a missing link.
   *
   * @returns {string} a default link.
   */
  getDefaultLink(): string {
    return DEFAULT_LINK;
  },

  /**
   * Returns the semester requested.
   *
   * @param {number} semester index of the semester to return.
   * @returns {Semester} the object with semester information.
   */
  getSemester(semester: number): Semester {
    return availableSemesters[semester];
  },

  /**
   * Gets a object with information about the university.
   *
   * @returns {?University} an object with details about the university.
   */
  getUniversity(): ?University {
    return university;
  },
};
