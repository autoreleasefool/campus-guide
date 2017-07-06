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
 * @file Configuration.ts
 * @description Manages the configuration of the application.
 */
'use strict';

// Imports
import * as Database from './Database';
import * as DeviceInfo from 'react-native-device-info';
import * as env from '../env';
import * as HttpStatus from 'http-status-codes';
import * as RNFS from 'react-native-fs';

// Types
import { Language } from './Translations';
import { LatLong, Name, TimeFormat } from '../../typings/global';
import { TransitInfo } from '../../typings/transit';
import { Semester } from '../../typings/university';

/** Describes configuration state. */
export interface Options {
  alwaysSearchAll?: boolean;                // Always search the entire app, never within a view
  transitInfo?: TransitInfo | undefined;    // High level information about the city transit
  currentSemester?: number;                 // Current semester for editing, selected by the user
  firstTime?: boolean;                      // Indicates if it's the user's first time in the app
  language?: Language | undefined;          // User's preferred language
  preferredTimeFormat?: TimeFormat;         // Either 12 or 24h time
  prefersWheelchair?: boolean;              // Only provide wheelchair accessible routes
  preferByCourse?: boolean;                 // True to default schedule view by course, false for by week
  scheduleByCourse?: boolean;               // True to sort classes by course, false to sort by week
  semesters?: Semester[];                   // List of semesters currently available
  universityLocation?: LatLong | undefined; // Latitude and longitude of the university
  universityName?: Name | undefined;        // Name of the univeristy
}

/** Describes the progress of an app update. */
export interface ProgressUpdate {
  currentDownload?: string | undefined; // Name of file being downloaded
  filesDownloaded?: string[];           // Array of filenames downloaded
  intermediateProgress?: number;        // Updated progress of current download
  showRetry?: boolean;                  // True to show retry button, false to hide
  showUpdateProgress?: boolean;         // True to show progress bar, false to hide
  totalFiles?: number;                  // Total number of files to download
  totalProgress?: number;               // Total bytes downloaded
  totalSize?: number;                   // Total number of bytes across all files
}

/** Describes a configuration file. */
export interface ConfigFile {
  name: string;     // Name of the file
  type: string;     // Type of file: image, json, csv, etc.
  version: number;  // Version number
}

/** Description of a file which is being updated. */
interface FileUpdate {
  name: string;       // Name of the file
  type: string;       // Type of file: image, json, csv, etc.
  url: string;        // URL to update file from
  size: number;       // Size of the file, in bytes
  oldVersion: number; // Existing version number
  newVersion: number; // New, updated version number
}

/** Callback methods that can be provided to the configuration update */
interface UpdateCallbacks {
  onUpdateStart?(totalSize: number, totalFiles: number): void;              // Invoked when the update begins
  onDownloadStart?(name: string, download: RNFS.DownloadBeginCallbackResult): void;
                                                                            // Invoked as each file begins downloading
  onDownloadProgress?(progress: RNFS.DownloadProgressCallbackResult): void; // Invoked for large downloads
  onDownloadComplete?(name: string, download: RNFS.DownloadResult): void;   // Invoked as each file finishes downloading
}

/** Stripped down promise class, with only resolve and reject methods. */
interface NaivePromise {
  resolve(r: any): void;  // Promises resolve when they complete successfully
  reject(a: any): void;   // Promises reject when an error occurs
}

// Subdirectories which files of certain types should be placed/found in
const CONFIG_SUBDIRECTORIES = {
  image: '/images',
  json: '/json',
};

// Directory for config files
const CONFIG_DIRECTORY = `${RNFS.DocumentDirectoryPath}/config`;
// Directory for downloaded config files
const TEMP_CONFIG_DIRECTORY = `${RNFS.DocumentDirectoryPath}/temp/config`;

// Indicates if the configuration is initializing
let configInitializing = false;
// Indicates if the configuration has finished initializing
let configurationInitialized = false;
// List of promises that should resolve or reject if the configuration is available or not
const availablePromises: NaivePromise[] = [];

// List of configuration files which have updates available
let configurationUpdates: FileUpdate[] = [];
// Indicates if the app has checked for a configuration update yet
let checkedForUpdate = false;

// Set to true to delete configuration when app opens. Only possible while debugging.
let clearConfigOnStart = true;

/**
 * Asynchronously gets the configuration for the application and loads the various config values into their
 * respective variables.
 */
async function _requestConfig(): Promise < void > {

  if (__DEV__ && clearConfigOnStart) {
    clearConfigOnStart = false;
    await _deleteConfiguration();
  }

  let configVersions;
  try {
    configVersions = await Database.getConfigVersions();
  } catch (e) {
    throw e;
  }

  if (configVersions == undefined || configVersions.length === 0) {
    throw new Error('Configuration versions were not found in database.');
  }

  // Ensure all config files exist
  let configAvailable = true;
  for (const config of configVersions) {
    if (config.version > 0) {
      try {
        const dir = CONFIG_SUBDIRECTORIES[config.type];
        const exists = await RNFS.exists(CONFIG_DIRECTORY + dir + config.name);
        configAvailable = configAvailable && exists;
        if (!exists && __DEV__) {
          console.log(`Could not find configuration file: ${config.name}`);
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
  for (const promise of availablePromises) {
    promise.resolve({});
  }
}

/**
 * Rejects promises waiting for Configuration initiation (no configuration available).
 *
 * @param {any} err error encountered while getting configuration
 */
function _initError(err: any): void {
  if (__DEV__) {
    console.log('Error while getting configuration', err);
  }

  configInitializing = false;
  for (const promise of availablePromises) {
    promise.reject(err);
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
    const configUpdateURL = `${env.configUpdatesServerUrl}/config/${DeviceInfo.getVersion()}`;
    const response = await fetch(configUpdateURL, {
      headers: { Authorization: env.authorizationKey },
      method: 'GET',
    });
    const appConfig = await response.json();

    // Will indicate if any updates are available
    let updateAvailable = false;

    configurationUpdates = [];
    for (const config in appConfig) {
      if (appConfig.hasOwnProperty(config)) {
        let found = false;
        for (const configVersion of configVersions) {
          if (configVersion.name === config) {
              found = true;
              if (configVersion.version < appConfig[config].version) {
                updateAvailable = true;
                configurationUpdates.push({
                  name: config,
                  newVersion: appConfig[config].version,
                  oldVersion: configVersion.version,
                  size: appConfig[config].size,
                  type: appConfig[config].type,
                  url: appConfig[config].location.url,
                });
              }
            }
        }

        if (!found) {
          updateAvailable = true;
          configurationUpdates.push({
            name: config,
            newVersion: appConfig[config].version,
            oldVersion: 0,
            size: appConfig[config].size,
            type: appConfig[config].type,
            url: appConfig[config].location.url,
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
  let totalSize = 0;
  for (const update of configurationUpdates) {
    totalSize += update.size;
  }

  if (callbacks.onUpdateStart) {
    callbacks.onUpdateStart(totalSize, configurationUpdates.length);
  }

  // Add filename to download info and invoke start callback
  const onStart = (filename: string, download: RNFS.DownloadBeginCallbackResult): void => {
    if (callbacks.onDownloadStart) {
      callbacks.onDownloadStart(filename, download);
    }
  };

  try {
    for (const update of configurationUpdates) {

      // Download the file
      const downloadResult = await RNFS.downloadFile({
        begin: (download: RNFS.DownloadBeginCallbackResult): void => onStart(update.name, download),
        fromUrl: update.url,
        headers: { Authorization: env.authorizationKey },
        progress: callbacks.onDownloadProgress,
        toFile: TEMP_CONFIG_DIRECTORY + update.name,
      }).promise;

      if (downloadResult.statusCode !== HttpStatus.OK) {
        throw new Error(`Download of file ${update.name} failed. Status code: ${downloadResult.statusCode}`);
      }

      // Get file stats
      const fileStats = await RNFS.stat(TEMP_CONFIG_DIRECTORY + update.name);
      downloadResult.bytesWritten = parseInt(fileStats.size);
      if (callbacks.onDownloadComplete) {
        callbacks.onDownloadComplete(update.name, downloadResult);
      }
    }

    const configRowUpdates: ConfigFile[] = [];

    // Delete the old configuration files, move the new ones
    for (const update of configurationUpdates) {
      // Delete the file if it exists
      const exists = await RNFS.exists(CONFIG_DIRECTORY + update.name);
      if (exists) {
        await RNFS.unlink(CONFIG_DIRECTORY + update.name);
      }

      await RNFS.moveFile(
        TEMP_CONFIG_DIRECTORY + update.name,
        CONFIG_DIRECTORY + CONFIG_SUBDIRECTORIES[update.type] + update.name
      );

      configRowUpdates.push({
        name: update.name,
        type: update.type,
        version: update.newVersion,
      });
    }

    // Delete temporary downloads
    await RNFS.unlink(TEMP_CONFIG_DIRECTORY);

    // Update config versions in database
    await Database.updateConfigVersions(configRowUpdates);

    configurationInitialized = false;
    await init();
  } catch (e) {
    throw e;
  }
}

/**
 * Returns a promise that resolves when the config file can be found, or rejects.
 *
 * @param {string} configFile name of the config file to retrieve. Make sure it starts with a '/'
 * @returns {Promise<any|undefined>} promise that resolves when the configuration is loaded
 */
async function _getConfigFile(configFile: string): Promise < any | undefined > {
  // First, make sure the file exists
  const dir = CONFIG_SUBDIRECTORIES.json;
  const exists = await RNFS.exists(CONFIG_DIRECTORY + dir + configFile);

  if (!exists) {
    throw new Error(`Configuration file '${dir}${configFile}' does not exist.`);
  }

  // Load and parse the configuration file
  const raw = await RNFS.readFile(CONFIG_DIRECTORY + dir + configFile, 'utf8');

  return JSON.parse(raw);
}

/**
 * Deletes the configuration on the disk and clears versions in the database. Used for debugging.
 *
 * @returns {Promise<void>} a promise which reoslves when the configuration is deleted
 */
async function _deleteConfiguration(): Promise < void > {
  if (!__DEV__) {
    return;
  }

  try {
    const configVersions = await Database.getConfigVersions();
    const clearVersions: ConfigFile[] = [];

    if (configVersions == undefined) {
      return;
    }

    for (const configVersion of configVersions) {
      try {
        const dir = CONFIG_SUBDIRECTORIES[configVersion.type];
        await RNFS.unlink(CONFIG_DIRECTORY + dir + configVersion.name);
      } catch (e) {
        // do nothing - file doesn't exist
      }

      clearVersions.push({
        name: configVersion.name,
        type: configVersion.type,
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
  return new Promise((resolve: (r: any) => void, reject: (e: any) => void): void => {
    if (configurationInitialized) {
      resolve({});
    } else {
      availablePromises.push({ resolve, reject });

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
 * @returns {Promise<any|undefined>} promise that resolves when the configuration is loaded
 */
export async function getConfig(configFile: string): Promise < any | undefined > {
  await init();

  return await _getConfigFile(configFile);
}

/**
 * Returns the path to the image.
 *
 * @param {string|undefined} configImage name of the image to retrieve
 * @returns {string} absolute path to the image or the empty string if configImage was undefined
 */
export function getImagePath(configImage: string | undefined): string {
  if (configImage == undefined) {
    return '';
  } else {
    return `file://${CONFIG_DIRECTORY}${CONFIG_SUBDIRECTORIES.image}${configImage}`;
  }
}
