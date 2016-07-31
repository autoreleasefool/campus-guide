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

// Imports
const Database = require('Database');
const DeviceInfo = require('react-native-device-info');
const Promise = require('promise');
const RNFS = require('react-native-fs');

// Directory for config files
const CONFIG_DIRECTORY = RNFS.DocumentDirectoryPath + '/config';
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
const configurationUpdates: Array < { name: string, url: string, oldVersion: number, newVersion: number } > = [];

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
    const stats = await RNFS.stats(CONFIG_DIRECTORY + configVersions[i].name);
    configAvailable = configAvailable && stats.isFile();
  }

  // If any config files do not exist, return false for no available configuration
  if (!configAvailable) {
    return false;
  }

  // Load the application configuration
  const appConfig: string = await RNFS.readFile(CONFIG_DIRECTORY + APP_CONFIG, 'utf8');
  const configuration = JSON.parse(appConfig);

  // Get the current semesters available in the app
  if (configuration.AvailableSemesters) {
    for (let i = 0; i < configuration.AvailableSemesters.length; i++) {
      availableSemesters.push(configuration.AvailableSemesters[i]);
    }
  }

  university = configuration.University;
  cityBuses = configuration.Bus;
  return true;
}

/**
 * Resolves promises waiting for Configuration initiation with the result.
 *
 * @param {boolean} result true if the configuration is available, false otherwise
 */
function _initSuccess(result: boolean): void {
  console.log('Configuration successfully loaded.');
  configInitializing = false;
  for (let i = 0; i < availablePromises.length; i++) {
    availablePromises[i].resolve(result);
  }
}

/**
 * Resolves promises waiting for Configuration initiation with false (no configuration available).
 */
function _initError(): void {
  console.log('Configuration could not be found.');
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
    const configUpdateURL: string = env.configUpdatesServerUrl + '/config/' + DeviceInfo.getBuildVersion();
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
                oldVersion: configVersions[i].version,
                newVersion: appConfig[config].version,
              });
            }
          }
        }

        if (!found) {
          return true;
        }
      }
    }

    return updateAvailable;
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
    return _refreshConfigVersions();
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
