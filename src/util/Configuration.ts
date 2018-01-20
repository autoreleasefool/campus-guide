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
 * @created 2016-10-08
 * @file Configuration.ts
 * @description Manages the configuration of the application.
 */

// Imports
import DeviceInfo from 'react-native-device-info';
import moment from 'moment';
import * as Database from './Database';
import * as HttpStatus from 'http-status-codes';
import * as RNFS from 'react-native-fs';

// Types
import { AsyncStorageStatic, PlatformOSType } from 'react-native';
import { Language } from './Translations';
import { Description, LatLong, Name, TimeFormat } from '../../typings/global';
import { TransitInfo } from '../../typings/transit';
import { Semester } from '../../typings/university';

/** Describes configuration state. */
export interface Options {
  alwaysSearchAll?: boolean;                // Always search the entire app, never within a view
  transitInfo?: TransitInfo | undefined;    // High level information about the city transit
  currentSemester?: number;                 // Current semester for editing, selected by the user
  language?: Language | undefined;          // User's preferred language
  lastUpdatedAt?: number;                   // Time the config was last updated from the server
  preferredTimeFormat?: TimeFormat;         // Either 12 or 24h time
  prefersWheelchair?: boolean;              // Only provide wheelchair accessible routes
  prefersShortestRoute?: boolean;           // Find the shortest route
  preferByCourse?: boolean;                 // True to default schedule view by course, false for by week
  scheduleByCourse?: boolean;               // True to sort classes by course, false to sort by week
  semesters?: Semester[];                   // List of semesters currently available
  universityLocation?: LatLong | undefined; // Latitude and longitude of the university
  universityName?: Name | undefined;        // Name of the university
}

/** Describes the progress of an app update. */
export interface ProgressUpdate {
  currentDownload?: string | undefined; // Name of file being downloaded
  filesDownloaded?: string[];           // Array of filenames downloaded
  intermediateProgress?: number;        // Updated progress of current download
  totalFiles?: number;                  // Total number of files to download
  totalProgress?: number;               // Total bytes downloaded
  totalSize?: number;                   // Total number of bytes across all files
}

/** Describes a configuration file. */
export interface ConfigFile {
  name: string;     // Name of the file
  size: number;     // Size of the file
  type: string;     // Type of file: image, json, csv, etc.
  url: string;      // URL to GET file
  version: number;  // Version number
  zsize?: number;   // Size of the file, zipped
  zurl?: string;    // gzipped url of a file
}

/** Details of the available configuration files for the app. */
export interface ConfigurationDetails {
  lastUpdatedAt: number;  // Milliseconds since epoch for time the file was last updated
  files: ConfigFile[];    // List of files in app configuration
  whatsNew: Description;  // Indicates new features/info in the update
}

/** Callback methods that can be provided to the configuration update */
interface UpdateCallbacks {
  onUpdateStart?(totalSize: number, totalFiles: number): void;              // Invoked when the update begins
  onDownloadStart?(name: string, download: RNFS.DownloadBeginCallbackResult): void;
                                                                            // Invoked as each file begins downloading
  onDownloadProgress?(progress: RNFS.DownloadProgressCallbackResult): void; // Invoked for large downloads
  onDownloadComplete?(name: string, download: RNFS.DownloadResult): void;   // Invoked as each file finishes downloading
}

// Subdirectories which files of certain types should be placed/found in
const CONFIG_SUBDIRECTORIES = {
  image: '/images',
  json: '/json',
  text: '/text',
};

// Time, in milliseconds, to wait before connection timeout when downloading config files
const CONFIG_CONNECTION_TIMEOUT = 5000;
// Time, in milliseconds, to wait before data read timeout when downloading config files
const CONFIG_READ_TIMEOUT = 5000;

// Directory for config files
const CONFIG_DIRECTORY = `${RNFS.DocumentDirectoryPath}/config`;
// Directory for downloaded config files
const TEMP_CONFIG_DIRECTORY = `${RNFS.DocumentDirectoryPath}/temp/config`;

// Indicates if the configuration is initializing
let configInitializing = false;
// Indicates if the configuration has finished initializing
let configurationInitialized = false;
// Indicates if the app has checked for a configuration update yet
let checkedForUpdate = false;
// List of promises that should resolve or reject if the configuration is available or not
const initPromises: any[] = [];

// Key to indicate the last time the app checked for an update
const KEY_LAST_UPDATE_TIME = 'key_config_last_update_time';
// Amount of time to wait before checking for an update
const TIME_BEFORE_UPDATE_CHECK: { amount: number; unit: string} = { amount: 1, unit: 'h' }; // 1 hour
// Set to true to always check for config updates. Only possible while debugging.
const alwaysCheckForUpdate = false;

// Set to true to delete configuration when app opens. Only possible while debugging.
const clearConfigOnStart = false;
// Indicates if the config has been cleared
let configCleared = false;

/**
 * Asynchronously gets the configuration for the application from the cache.
 */
async function _initializeConfiguration(): Promise<void> {
  if (__DEV__ && clearConfigOnStart && !configCleared) {
    configCleared = true;
    await _deleteConfiguration();
  }

  let expectedConfigVersions;
  try {
    expectedConfigVersions = await Database.getConfigVersions();
  } catch (err) {
    throw err;
  }

  if (expectedConfigVersions == undefined || expectedConfigVersions.length === 0) {
    throw new Error('Configuration versions were not found in database.');
  }

  // Ensure all files exist
  let configAvailable = true;
  for (const file of expectedConfigVersions) {
    if (file.version > 0) {
      try {
        const dir = CONFIG_SUBDIRECTORIES[file.type];
        const exists = await RNFS.exists(CONFIG_DIRECTORY + dir + file.name);
        configAvailable = configAvailable && exists;
        if (!exists && __DEV__) {
          console.log(`Could not find configuration file: ${file.name}`);
        }
      } catch (err) {
        throw err;
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
  for (const promise of initPromises) {
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
  for (const promise of initPromises) {
    promise.reject(err);
  }
}

/**
 * Returns a promise that resolves if all expected versions of configuration files exist,
 * or rejects otherwise.
 *
 * @returns {Promise<void>} promise that will resolve/reject when configuration is found or not
 */
export function init(): Promise<void> {
  return new Promise((resolve: (r: any) => void, reject: (e: any) => void): void => {
    if (configurationInitialized) {
      resolve({});
    } else {
      initPromises.push({ resolve, reject });

      if (!configInitializing) {
        configInitializing = true;
        _initializeConfiguration()
            .then(_initSuccess)
            .catch(_initError);
      }
    }
  });
}

/**
 * Deletes the configuration on the disk and clears versions in the database. Used for debugging.
 *
 * @returns {Promise<void>} a promise which resolves when the configuration is deleted
 */
async function _deleteConfiguration(): Promise<void> {
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
        size: 0,
        type: configVersion.type,
        url: '',
        version: 0,
      });
    }

    await Database.updateConfigVersions(clearVersions);

    const exists = await RNFS.exists(CONFIG_DIRECTORY);
    if (exists) {
      await RNFS.unlink(CONFIG_DIRECTORY);
    }
  } catch (err) {
    console.error('Error accessing database while clearing versions.', err);
  }
}

/**
 * Gets the lastUpdatedAt field of the most recent config.
 *
 * @returns {Promise<number>} lastUpdatedAt of config
 */
async function getConfigLastUpdatedAt(): Promise<number> {
  try {
    return await Database.getConfigLastUpdatedAt();
  } catch (err) {
    throw err;
  }
}

/**
 * Updates the configuration lastUpdatedAt time.
 *
 * @param {number} lastUpdatedAt the new time
 * @returns {Promise<void>} promise which resolves when the time is saved
 */
function setConfigLastUpdatedAt(lastUpdatedAt: number): Promise<void> {
  return Database.saveConfigLastUpdatedAt(lastUpdatedAt);
}

/**
 * Updates the configuration, invoking a callback with progress on the download so the UI may be updated.
 *
 * @param {ConfigurationDetails} configDetails set of files to update
 * @param {UpdateCallbacks}      callbacks     functions to invoke as update progresses
 * @param {PlatformOSType}       os            active operating system
 */
async function _updateConfig(
    configDetails: ConfigurationDetails,
    callbacks: UpdateCallbacks,
    os: PlatformOSType): Promise<void> {
  if (configDetails.files.length === 0) {
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
  for (const update of configDetails.files) {
    totalSize += update.size;
  }

  if (callbacks.onUpdateStart) {
    callbacks.onUpdateStart(totalSize, configDetails.files.length);
  }

  // Add filename to download info and invoke start callback
  const onStart = (filename: string, download: RNFS.DownloadBeginCallbackResult): void => {
    if (callbacks.onDownloadStart) {
      callbacks.onDownloadStart(filename, download);
    }
  };

  try {
    for (const update of configDetails.files) {
      // Download the file
      // TODO: Android cannot use Accept-Encoding
      // (https://react-native.canny.io/feature-requests/p/fetch-with-accept-encoding-gzip-does-not-work)
      const downloadResult = await RNFS.downloadFile({
        begin: (download: RNFS.DownloadBeginCallbackResult): void => onStart(update.name, download),
        connectionTimeout: CONFIG_CONNECTION_TIMEOUT,
        fromUrl: (os !== 'android' && update.zsize && update.zurl) ? update.zurl : update.url,
        headers: { 'Accept-Encoding': 'gzip,deflate' },
        progress: callbacks.onDownloadProgress,
        readTimeout: CONFIG_READ_TIMEOUT,
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
    for (const update of configDetails.files) {
      // Delete the file if it exists
      const targetLocation = `${CONFIG_DIRECTORY}${CONFIG_SUBDIRECTORIES[update.type]}${update.name}`;
      const tempLocation = `${TEMP_CONFIG_DIRECTORY}${update.name}`;

      const exists = await RNFS.exists(targetLocation);
      if (exists) {
        await RNFS.unlink(targetLocation);
      }

      await RNFS.moveFile(
        tempLocation,
        targetLocation
      );

      configRowUpdates.push(update);
    }

    // Delete temporary downloads
    await RNFS.unlink(TEMP_CONFIG_DIRECTORY);

    // Update config versions in database
    await Database.updateConfigVersions(configRowUpdates);
    await setConfigLastUpdatedAt(configDetails.lastUpdatedAt);

    configurationInitialized = false;
    await init();
  } catch (e) {
    throw e;
  }
}

/**
 * Updates the configuration, invoking a callback with progress on the download so the UI may be updated.
 *
 * @param {ConfigurationDetails} configDetails set of files to update
 * @param {UpdateCallbacks}      callbacks     functions to invoke as update progresses
 * @param {PlatformOSType}       os            active operating system
 * @returns {Promise<void>} a promise which resolves when the update is complete
 */
export function updateConfig(
    configDetails: ConfigurationDetails,
    callbacks: UpdateCallbacks,
    os: PlatformOSType): Promise<void> {
  return _updateConfig(configDetails, callbacks, os);
}

/**
 * Checks if there is a configuration available to download. Returns the list of files available to update.
 *
 * @param {PlatformOSType} os the active operating system
 * @returns {Promise<ConfigurationDetails>} promise which resolves to true or false depending on if a
 *                                          config update is available
 */
async function _getAvailableConfigUpdates(os: PlatformOSType): Promise<ConfigurationDetails> {
  try {
    // Fetch most recent config versions from server
    // FIXME: get server name in production env
    const configLocation = __DEV__
        ? (os === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080')
        : (os === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080');

    const configUpdateURL = `${configLocation}/config/${DeviceInfo.getVersion()}.json`;

    const headers = new Headers();
    headers.append('platform', os);
    const response = await fetch(configUpdateURL, { headers });
    const appConfig: ConfigurationDetails = await response.json();

    const appConfigToUpdate: ConfigurationDetails = {
      files: [],
      lastUpdatedAt: appConfig.lastUpdatedAt,
      whatsNew: appConfig.whatsNew,
    };

    const lastUpdatedAt = await getConfigLastUpdatedAt();
    if (appConfig.lastUpdatedAt <= lastUpdatedAt && !(__DEV__ && clearConfigOnStart)) {
      return appConfigToUpdate;
    }

    // Get current config versions
    const currentConfigFiles = await Database.getConfigVersions();

    for (const file of appConfig.files) {
      let found = false;
      for (let i = 0; i < currentConfigFiles.length; i++) {
        if (currentConfigFiles[i].name === file.name) {
          found = true;

          if (currentConfigFiles[i].version < file.version) {
            appConfigToUpdate.files.push({ ...file });
          }

          currentConfigFiles.splice(i, 1);
          break;
        }
      }

      if (!found) {
        appConfigToUpdate.files.push({ ...file });
      }
    }

    return appConfigToUpdate;
  } catch (err) {
    throw err;
  }
}

/**
 * Checks if there is a configuration available to download. Returns the list of files available to update.
 *
 * @param {PlatformOSType} os the active operating system
 * @param {AsyncStorageStatic} asyncStorage instance of React Native AsyncStorage
 * @returns {Promise<ConfigurationDetails>} promise which resolves to with the list of available updates,
 *                                          or an empty list
 */
export function getAvailableConfigUpdates(
    os: PlatformOSType,
    asyncStorage: AsyncStorageStatic): Promise<ConfigurationDetails> {
  checkedForUpdate = true;
  asyncStorage.setItem(KEY_LAST_UPDATE_TIME, moment().format());

  return _getAvailableConfigUpdates(os);
}

/**
 * Load the default configuration from the asset bundle.
 */
export async function setupDefaultConfiguration(os: PlatformOSType): Promise<void> {
  let assetBasePath;
  let readDir;
  let copyFile;
  let configDetails: ConfigurationDetails;

  // Get functions and locations for Android vs iOS assets
  if (os === 'android') {
    assetBasePath = 'config';
    readDir = RNFS.readDirAssets;
    copyFile = RNFS.copyFileAssets;
    configDetails = JSON.parse(await RNFS.readFileAssets(`${assetBasePath}/base_config.json`));
  } else {
    assetBasePath = `${RNFS.MainBundlePath}/config.bundle`;
    readDir = RNFS.readDir;
    copyFile = RNFS.copyFile;
    configDetails = JSON.parse(await RNFS.readFile(`${assetBasePath}/base_config.json`));
  }

  // Create the config file directory
  await RNFS.mkdir(CONFIG_DIRECTORY);
  for (const type in CONFIG_SUBDIRECTORIES) {
    if (CONFIG_SUBDIRECTORIES.hasOwnProperty(type)) {
      await RNFS.mkdir(CONFIG_DIRECTORY + CONFIG_SUBDIRECTORIES[type]);
    }
  }

  // Copy base assets to config file directory
  const assetTypes = await readDir(assetBasePath);
  for (const type of assetTypes) {
    if (!(type.name in CONFIG_SUBDIRECTORIES)) {
      continue;
    }

    const assets = await readDir(`${assetBasePath}/${type.name}`);
    for (const asset of assets) {
      const sourcePath = asset.path;
      const fileName = asset.path.substr(asset.path.lastIndexOf('/'));
      const destPath = `${CONFIG_DIRECTORY}${CONFIG_SUBDIRECTORIES[type.name]}${fileName}`;
      console.log(`Copying config file from ${sourcePath} to ${destPath}`);
      await copyFile(sourcePath, destPath);
    }
  }

  // Update config versions in database
  await Database.updateConfigVersions(configDetails.files);
  await setConfigLastUpdatedAt(configDetails.lastUpdatedAt);
}

/**
 * Checks if the app has already performed an update check since opening, and, if so, checks if enough time
 * has passed that it should check again.
 *
 * @param {AsyncStorageStatic} asyncStorage instance of React Native AsyncStorage
 * @returns {boolean} true if the app should check for an update, false otherwise
 */
export async function shouldCheckForUpdate(asyncStorage: AsyncStorageStatic): Promise<boolean> {
  if (__DEV__ && alwaysCheckForUpdate) {
    return true;
  }

  if (checkedForUpdate) {
    try {
      const lastUpdated = await asyncStorage.getItem(KEY_LAST_UPDATE_TIME);
      const lastUpdatedTime = lastUpdated ? moment(lastUpdated) : moment(0);
      const { amount, unit }: { amount: number; unit: string } = TIME_BEFORE_UPDATE_CHECK;
      lastUpdatedTime.add(amount as any, unit);

      return lastUpdatedTime.isBefore(moment());
    } catch (e) {
      // Ignore errors
    }
  }

  return true;
}

/**
 * Returns a promise that resolves when the config file can be found, or rejects.
 *
 * @param {string} configFile name of the config file to retrieve. Make sure it starts with a '/'
 * @returns {Promise<any>} promise that resolves when the configuration is loaded
 */
async function _getConfigFile(configFile: string): Promise<any> {
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
 * Returns a promise that resolves when the config file can be found, or rejects.
 *
 * @param {string} configFile name of the config file to retrieve. Make sure it starts with a '/'
 * @returns {Promise<any>} promise that resolves when the configuration is loaded
 */
export async function getConfig(configFile: string): Promise<any> {
  await init();

  return await _getConfigFile(configFile);
}

/**
 * Returns a promise that resolves when the text file can be found, or rejects.
 *
 * @param {string} textFile name of the text file to retrieve. Make sure it starts with a '/'
 * @returns {Promise<string>} promise that resolves when the text is loaded
 */
async function _getTextFile(textFile: string): Promise<string> {
  // First, make sure the file exists
  const dir = CONFIG_SUBDIRECTORIES.text;
  const exists = await RNFS.exists(CONFIG_DIRECTORY + dir + textFile);

  if (!exists) {
    throw new Error(`Text file '${dir}${textFile}' does not exist.`);
  }

  // Load and parse the text file
  const raw = await RNFS.readFile(CONFIG_DIRECTORY + dir + textFile, 'utf8');

  return raw;
}

/**
 * Returns a promise that resolves when the text file can be found, or rejects.
 *
 * @param {string} textFile name of the text file to retrieve. Make sure it starts with a '/'
 * @returns {Promise<string>} promise that resolves when the text is loaded
 */
export async function getTextFile(textFile: string): Promise<string> {
  await init();

  return await _getTextFile(textFile);
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

// Size of 1MB
const MEGABYTE = 1000000;
// Size of 1KB
const KILOBYTE = 1000;

/**
 * Create a message about a config update from different elements.
 *
 * @param {string} message         the translated message
 * @param {number} updateSize      size of the update, in bytes
 * @param {string} whatsNew        details of new features/info in the update
 * @param {string} defaultWhatsNew backup default message for what's new
 * @returns {string} the message with the update size
 */
export function constructUpdateMessage(
    message: string,
    updateSize: number,
    whatsNew: string,
    defaultWhatsNew: string): string {
  // Form text with size of update
  let updateText = `${updateSize} B`;
  if (updateSize > MEGABYTE) {
    updateText = `${(updateSize / MEGABYTE).toFixed(2)} MB`;
  } else if (updateSize > KILOBYTE) {
    updateText = `${(updateSize / KILOBYTE).toFixed(2)} KB`;
  }

  // Replace "What's new" message with default if empty
  if (whatsNew.length === 0) {
    whatsNew = defaultWhatsNew;
  }

  let updateMessage = message.replace('{1}', updateText);
  updateMessage = updateMessage.replace('{2}', ` ${whatsNew}`);

  return updateMessage;
}
