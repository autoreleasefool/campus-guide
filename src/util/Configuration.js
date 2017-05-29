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
 * @created 2016-10-08
 * @file Configuration.js
 * @providesModule Configuration
 * @description Manages the configuration of the application.
 *
 * @flow
 */
'use strict';

// Types
import type { ConfigFile } from 'types';

/** Description of a file which is being updated. */
type FileUpdate = {
  name: string,       // Name of the file
  type: string,       // Type of file: image, json, csv, etc.
  url: string,        // URL to update file from
  size: number,       // Size of the file, in bytes
  oldVersion: number, // Existing version number
  newVersion: number, // New, updated version number
};

/** Callback methods that can be provided to the configuration update */
export type UpdateCallbacks = {
  onUpdateStart?: (totalSize: number, totalFiles: number) => void,  // Invoked when the update begins
  onDownloadStart?: (download: Object) => void,                     // Invoked as each file begins downloading
  onDownloadProgress?: (progress: Object) => void,                  // Invoked multiple times for large file downloads
  onDownloadComplete?: (download: Object) => void,                  // Invoked as each file finishes downloading
};

// Imports
import Promise from 'promise';
import * as Database from 'Database';
import * as DeviceInfo from 'react-native-device-info';
import * as env from 'env';
import * as HttpStatus from 'http-status-codes';
import * as RNFS from 'react-native-fs';

// Subdirectories which files of certain types should be placed/found in
const CONFIG_SUBDIRECTORIES = {
  image: '/images',
  json: '/json',
};

// Directory for config files
const CONFIG_DIRECTORY = RNFS.DocumentDirectoryPath + '/config';
// Directory for downloaded config files
const TEMP_CONFIG_DIRECTORY = RNFS.DocumentDirectoryPath + '/temp/config';

// Indicates if the configuration is initializing
let configInitializing: boolean = false;
// Indicates if the configuration has finished initializing
let configurationInitialized: boolean = false;
// List of promises that should resolve or reject if the configuration is available or not
const availablePromises: Array < { resolve: () => any, reject: () => any } > = [];

// List of configuration files which have updates available
let configurationUpdates: Array < FileUpdate > = [];
// Indicates if the app has checked for a configuration update yet
let checkedForUpdate: boolean = false;

// Set to true to delete configuration when app opens. Only possible while debugging.
let clearConfigOnStart: boolean = true;

/**
 * Asynchronously gets the configuration for the application and loads the various config values into their
 * respective variables.
 */
async function _requestConfig(): Promise < void > {

  if (__DEV__ && clearConfigOnStart) {
    clearConfigOnStart = false;
    await _deleteConfiguration();
  }

  let configVersions = null;
  try {
    configVersions = await Database.getConfigVersions();
  } catch (e) {
    throw e;
  }

  if (configVersions == null || configVersions.length == 0) {
    throw new Error('Configuration versions were not found in database.');
  }

  // Ensure all config files exist
  let configAvailable: boolean = true;
  for (let i = 0; i < configVersions.length; i++) {
    if (configVersions[i].version > 0) {
      try {
        const dir = CONFIG_SUBDIRECTORIES[configVersions[i].type];
        const exists = await RNFS.exists(CONFIG_DIRECTORY + dir + configVersions[i].name);
        configAvailable = configAvailable && exists;
        if (!exists) {
          console.log('Could not find configuration file: ' + configVersions[i].name);
        }
      } catch (e) {
        throw e;
      }
    }
  }

  // If any config files do not exist, throw error for no available configuration
  if (!configAvailable) {
    throw new Error('Some expected configuration file does not exist.');
  }

  configurationInitialized = true;
}

/**
 * Resolves promises waiting for Configuration initiation.
 */
function _initSuccess(): void {
  configInitializing = false;
  for (let i = 0; i < availablePromises.length; i++) {
    availablePromises[i].resolve();
  }
}

/**
 * Rejects  promises waiting for Configuration initiation (no configuration available).
 *
 * @param {any} err error encountered while getting configuration
 */
function _initError(err: any): void {
  console.log('Error while getting configuration', err);
  configInitializing = false;
  for (let i = 0; i < availablePromises.length; i++) {
    availablePromises[i].reject();
  }
}

/**
 * Checks if there is a configuration available to download. Returns true or false in a promise.
 *
 * @returns {Promise<boolean>} promise which resolves to true or false depending on if a config update is available
 */
async function _refreshConfigVersions(): Promise < boolean > {
  try {
    // Get current config versions
    const configVersions = await Database.getConfigVersions();

    // Fetch most recent config versions from server
    const configUpdateURL: string = env.configUpdatesServerUrl + '/config/' + DeviceInfo.getVersion();
    const response = await fetch(configUpdateURL);
    const appConfig: Object = await response.json();

    // Will indicate if any updates are available
    let updateAvailable: boolean = false;

    configurationUpdates = [];
    for (const config in appConfig) {
      if (appConfig.hasOwnProperty(config)) {
        let found: boolean = false;
        if (configVersions != null) {
          for (let i = 0; i < configVersions.length; i++) {
            if (configVersions[i].name === config) {
              found = true;
              if (configVersions[i].version < appConfig[config].version) {
                updateAvailable = true;
                configurationUpdates.push({
                  name: config,
                  type: appConfig[config].type,
                  url: appConfig[config].location.url,
                  size: appConfig[config].size,
                  oldVersion: configVersions[i].version,
                  newVersion: appConfig[config].version,
                });
              }
            }
          }
        }

        if (!found) {
          updateAvailable = true;
          configurationUpdates.push({
            name: config,
            type: appConfig[config].type,
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
 * @param {UpdateCallbacks} callbacks functions to invoke as update progresses
 */
async function _updateConfig(callbacks: UpdateCallbacks): Promise < void > {
  if (configurationUpdates.length === 0) {
    // If there are no updates, exit
    return;
  }

  // Generate directories
  await RNFS.mkdir(CONFIG_DIRECTORY);
  await RNFS.mkdir(TEMP_CONFIG_DIRECTORY);
  for (const type in CONFIG_SUBDIRECTORIES) {
    if (CONFIG_SUBDIRECTORIES.hasOwnProperty(type)) {
      await RNFS.mkdir(CONFIG_DIRECTORY + CONFIG_SUBDIRECTORIES[type]);
    }
  }

  // Get total size of update
  let totalSize: number = 0;
  for (let i = 0; i < configurationUpdates.length; i++) {
    totalSize += configurationUpdates[i].size;
  }
  if (callbacks.onUpdateStart) {
    callbacks.onUpdateStart(totalSize, configurationUpdates.length);
  }

  // Add filename to download info and invoke start callback
  const onStart = (filename: string, download: Object) => {
    if (callbacks.onDownloadStart) {
      download.filename = filename;
      callbacks.onDownloadStart(download);
    }
  };

  try {
    for (let i = 0; i < configurationUpdates.length; i++) {

      /* eslint-disable no-loop-func */

      /*
       * The parameter from the function and the name of the file must be passed,
       * so creating a function each loop is beneficial here.
       */

      // Download the file
      const downloadResult: Object = await RNFS.downloadFile({
        fromUrl: configurationUpdates[i].url,
        toFile: TEMP_CONFIG_DIRECTORY + configurationUpdates[i].name,
        progress: callbacks.onDownloadProgress,
        begin: (download) => onStart(configurationUpdates[i].name, download),
      }).promise;

      /* eslint-enable no-loop-func */

      if (downloadResult.statusCode != HttpStatus.OK) {
        throw new Error('Download of file ' + configurationUpdates[i].name + ' failed.'
            + ' Status code: ' + downloadResult.statusCode);
      }

      // Get file stats
      const fileStats = await RNFS.stat(TEMP_CONFIG_DIRECTORY + configurationUpdates[i].name);
      downloadResult.bytesWritten = fileStats.size;
      downloadResult.filename = configurationUpdates[i].name;
      if (callbacks.onDownloadComplete) {
        callbacks.onDownloadComplete(downloadResult);
      }
    }

    const configRowUpdates: Array < ConfigFile > = [];

    // Delete the old configuration files, move the new ones
    for (let i = 0; i < configurationUpdates.length; i++) {

      // Delete the file if it exists
      const exists = await RNFS.exists(CONFIG_DIRECTORY + configurationUpdates[i].name);
      if (exists) {
        await RNFS.unlink(CONFIG_DIRECTORY + configurationUpdates[i].name);
      }

      await RNFS.moveFile(
        TEMP_CONFIG_DIRECTORY + configurationUpdates[i].name,
        CONFIG_DIRECTORY + CONFIG_SUBDIRECTORIES[configurationUpdates[i].type] + configurationUpdates[i].name
      );

      configRowUpdates.push({
        name: configurationUpdates[i].name,
        type: configurationUpdates[i].type,
        version: configurationUpdates[i].newVersion,
      });
    }

    // Delete temporary downloads
    await RNFS.unlink(TEMP_CONFIG_DIRECTORY);

    // Update config versions in database
    await Database.updateConfigVersions(configRowUpdates);

    configurationInitialized = false;
    await module.exports.init();
  } catch (e) {
    throw e;
  }
}

/**
 * Returns a promise that resolves when the config file can be found, or rejects.
 *
 * @param {string} configFile name of the config file to retrieve. Make sure it starts with a '/'
 * @returns {Promise<?Object>} promise that resolves when the configuration is loaded
 */
async function _getConfigFile(configFile: string): Promise < ?Object > {
  // First, make sure the file exists
  const dir = CONFIG_SUBDIRECTORIES.json;
  const exists = await RNFS.exists(CONFIG_DIRECTORY + dir + configFile);

  if (!exists) {
    throw new Error('Configuration file \'' + dir + configFile + '\' does not exist.');
  }

  // Load and parse the configuration file
  const raw: string = await RNFS.readFile(CONFIG_DIRECTORY + dir + configFile, 'utf8');
  return JSON.parse(raw);
}

/**
 * Deletes the configuration on the disk and clears versions in the database. Used for debugging.
 */
async function _deleteConfiguration(): Promise < void > {
  try {
    const configVersions : Array < Object > = await Database.getConfigVersions();
    const clearVersions: Array < Object > = [];

    if (configVersions == null) {
      return;
    }

    for (let i = 0; i < configVersions.length; i++) {
      try {
        const dir = CONFIG_SUBDIRECTORIES[configVersions[i].type];
        await RNFS.unlink(CONFIG_DIRECTORY + dir + configVersions[i].name);
      } catch (e) {
        // do nothing - file doesn't exist
      }

      clearVersions.push({
        name: configVersions[i].name,
        type: configVersions[i].type,
        version: 0,
      });
    }

    await Database.updateConfigVersions(clearVersions);
    await RNFS.unlink(CONFIG_DIRECTORY);
  } catch (err) {
    console.error('Error accessing database while clearing versions.', err);
  }
}

/**
   * Returns a promise that resolves if a version of the configuration is available, or rejects if the configuration
   * cannot be found.
   *
   * @returns {Promise<void>} promise that will resolve/reject when configuration is found or not
   */
export function init(): Promise < void > {
  return new Promise((resolve, reject) => {
    if (configurationInitialized) {
      resolve();
    } else {
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
    }
  });
}

/**
 * Checks if there is a configuration available to download. Returns true or false in a promise.
 *
 * @returns {Promise<boolean>} promise which resolves to true or false depending on if a config update is available
 */
export function isConfigUpdateAvailable(): Promise < boolean > {
  checkedForUpdate = true;
  return _refreshConfigVersions();
}

/**
 * Updates the configuration, invoking a callback with progress on the download so the UI may be updated.
 *
 * @param {UpdateCallbacks} callbacks functions to invoke as update progresses
 * @returns {Promise<void>} a promise which resolves when the update is complete
 */
export function updateConfig(callbacks: UpdateCallbacks): Promise < void > {
  return _updateConfig(callbacks);
}

/**
 * Returns true if the app has already performed a check for a configuration update.
 *
 * @returns {boolean} true if the app checked for a configuration update, false otherwise
 */
export function didCheckForUpdate(): boolean {
  return checkedForUpdate;
}

/**
 * Returns a promise that resolves when the config file can be found, or rejects.
 *
 * @param {string} configFile name of the config file to retrieve. Make sure it starts with a '/'
 * @returns {Promise<?Object>} promise that resolves when the configuration is loaded
 */
export function getConfig(configFile: string): Promise < ?Object > {
  return _getConfigFile(configFile);
}

/**
 * Returns the path to the image.
 *
 * @param {?string} configImage name of the image to retrieve.
 * @returns {string} absolute path to the image or the empty string if configImage was null
 */
export function getImagePath(configImage: ?string): string {
  if (configImage == null) {
    return '';
  } else {
    return 'file://' + CONFIG_DIRECTORY + CONFIG_SUBDIRECTORIES.image + configImage;
  }
}
