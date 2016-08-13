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

// React Imports
import {
  AsyncStorage,
} from 'react-native';

// Imports
const Promise = require('promise');
const SQLite = require('react-native-sqlite-storage');

// Name of the database
const DB_NAME: string = 'CampusGuideData.db';
// Current version of the database. Update when changes are made
const DB_VERSION: number = 1;
// Identifies the database version, stored in the local storage
const DB_VERSION_KEY: string = 'db_version';
// Display name of the database
const DB_DISPLAY_NAME: string = 'Campus Guide Database';
// TODO: determine sufficient database size
// Size of the database
const DB_SIZE: number = 200000;

// Instance of the database
let db: ?SQLite = null;
// Current version of the database
let dbCurrentVersion: number = 0;
// Indicates if the database is currently being initialized
let dbInitializing: boolean = false;

// List of promises that should resolve or reject when the database opens or fails, respectively
const initPromises: Array < { resolve: () => any, reject: () => any } > = [];

// Set mode for SQLite
SQLite.enablePromise(true);

/**
 * Initialize and update the database.
 *
 * @param {Object} Database the Database module
 */
async function _init(): Promise < void > {

  // Get version of the database
  dbCurrentVersion = 0;
  try {
    const value = await AsyncStorage.getItem(DB_VERSION_KEY);
    dbCurrentVersion = (value === null) ? 0 : parseInt(value);
  } catch (e) {
    console.error('Error getting database version.', e);
  }

  // Test SQLite functionality
  try {
    await SQLite.echoTest();
  } catch (e) {
    console.error('Error - SQLite plugin not functional.', e);
    throw e;
  }

  try {
    db = await SQLite.openDatabase(DB_NAME, DB_VERSION, DB_DISPLAY_NAME, DB_SIZE);
    await _upgradeDatabase(DB_VERSION);
    _openSuccess();
  } catch (e) {
    _openError(e);
    throw e;
  }
}

/**
 * Upgrades the database based on the current version and the new version
 *
 * @param {number} newVersion version of the database to update to
 */
async function _upgradeDatabase(newVersion: number): Promise < void > {
  if (db && dbCurrentVersion < newVersion) {

    /* Ignore numbers used for database versioning */
    /* eslint-disable no-magic-numbers */

    try {
      switch (dbCurrentVersion) {
        case 0:
          await db.transaction(_createDatabase);
          break;
        default:
          // does nothing
      }
    } catch (e) {
      throw e;
    }

    /* eslint-enable no-magic-numbers */

    // Update database version
    dbCurrentVersion++;
    await AsyncStorage.setItem(DB_VERSION_KEY, dbCurrentVersion.toString());

    if (dbCurrentVersion !== 0) {
      const upgrade: string = (String:any).format(
        'Successfully upgraded database from {0} to {1}.',
        dbCurrentVersion - 1,
        dbCurrentVersion
      );
      console.log(upgrade);

      await _upgradeDatabase(db, DB_VERSION);
    }
  }
}

/**
 * Creates the database.
 *
 * @param {any} tx database transaction
 */
function _createDatabase(tx: any): void {
  // Clear the existing database
  tx.executeSql('PRAGMA foreign_keys = ON;');
  tx.executeSql('DROP TABLE IF EXISTS Semesters;');
  tx.executeSql('DROP TABLE IF EXISTS Courses;');
  tx.executeSql('DROP TABLE IF EXISTS Sessions;');
  tx.executeSql('DROP TABLE IF EXISTS Config;');

  // Create the Semesters table
  tx.executeSql(
    'CREATE TABLE IF NOT EXISTS Semesters ('
    + '_id INTEGER PRIMARY KEY NOT NULL, '
    + 'name_fr TEXT NOT NULL COLLATE NOCASE, '
    + 'name_en TEXT NOT NULL COLLATE NOCASE'
    + ');'
  );

  // Create the Courses table
  tx.executeSql(
    'CREATE TABLE IF NOT EXISTS Courses ('
    + '_id INTEGER PRIMARY KEY NOT NULL, '
    + 'semester_id INTEGER NOT NULL, '
    + 'name TEXT NOT NULL COLLATE NOCASE, '
    + 'FOREIGN KEY (semester_id) REFERENCES Semesters(_id) '
    + 'ON UPDATE CASCADE ON DELETE CASCADE'
    + ');'
  );

  // Create the Sessions table
  tx.executeSql(
    'CREATE TABLE IF NOT EXISTS Sessions ('
    + '_id INTEGER PRIMARY KEY NOT NULL, '
    + 'course_id INTEGER NOT NULL, '
    + 'start_time TIME, '
    + 'duration INTEGER NOT NULL DEFAULT 90, '
    + 'type INTEGER NOT NULL DEFAULT 0, '
    + 'FOREIGN KEY (course_id) REFERENCES Courses(_id) '
    + 'ON UPDATE CASCADE ON DELETE CASCADE'
    + ');'
  );

  // Create the config files table
  tx.executeSql(
    'CREATE TABLE IF NOT EXISTS Config ('
    + '_id INTEGER PRIMARY KEY NOT NULL, '
    + 'name TEXT NOT NULL COLLATE NOCASE, '
    + 'type TEXT NOT NULL COLLATE NOCASE, '
    + 'version INTEGER NOT NULL DEFAULT 1'
    + ');'
  );
}

/**
 * Parses the results of a query into a list.
 *
 * @returns {Array} an array of rows.
 */
function _parseRows([tx]) {
  const len = tx.rows.length;
  const rows = [];
  for (let i = 0; i < len; i++) {
    rows.push(tx.rows.item(i));
  }

  return rows;
}

/**
 * Resolves promises waiting for the database to be initialized.
 */
function _openSuccess(): void {
  console.log('Database successfully opened.');
  dbInitializing = false;
  for (let i = 0; i < initPromises.length; i++) {
    initPromises[i].resolve(db);
  }
}

/**
 * Rejects promises waiting for the database to be initialized.
 *
 * @param {any} err database error
 */
function _openError(err: any): void {
  console.error('Database could not be opened.', err);
  dbInitializing = false;
  for (let i = 0; i < initPromises.length; i++) {
    initPromises[i].reject();
  }
}

/**
 * Initialize the database. Resolves when the database is ready to use. All database operations
 * should be invoked in the resolution of this function.
 *
 * @returns {Promise<SQLite>} promise that resolves or rejects when the database opens or fails to, respectively
 */
export function init(): Promise < void > {
  return new Promise((resolve, reject) => {
    if (db == null) {
      initPromises.push({
        resolve: resolve,
        reject: reject,
      });

      if (!dbInitializing) {
        dbInitializing = true;
        _init()
            .then(_openSuccess)
            .catch(_openError);
      }
    } else {
      resolve(db);
    }
  });
}

/**
 * Closes the open database.
 */
export function deinit(): Promise < void > {
  if (db) {
    db.close()
        .then(() => console.log('Closed database successfully.'))
        .catch(err => console.error('Could not close database.', err));
  } else {
    console.log('Database is not open.');
  }
}

/**
 * Gets a list of config files and their versions from the database.
 *
 * @param {SQLite} DB instance of database, from init()
 * @returns {Promise<Array<Object>>} a promise which resolves with a list of config file names and versions
 */
export function getConfigVersions(DB: SQLite): Promise < Array < Object > > {
  return new Promise((resolve, reject) => {
    DB.executeSql('SELECT * FROM Config;')
        .then(_parseRows)
        .then(rows => {
          resolve(rows);
        })
        .catch(err => {
          reject(err);
        });
  });
}

/**
 * Update versions in the database for config files provided.
 *
 * @param {SQLite} DB                                      instance of database, from init()
 * @param {{name: string, version: number}} configVersions set of config files and versions
 * @returns {Promise<void>} promise which resolves when all updates have finished
 */
export function updateConfigVersions(
    DB: SQLite,
    configVersions: Array < {name: string, type: string, version: number} >): Promise < void > {
  return new Promise((resolve, reject) => {

    DB.executeSql('SELECT * FROM Config;')
        .then(_parseRows)
        .then(rows => {
          const updatePromises: Array < Promise > = [];
          for (let i = 0; i < configVersions.length; i++) {
            let promise: ?Promise;
            for (let j = 0; j < rows.length; j++) {
              if (configVersions[i].name == rows[j].name) {
                promise = DB.executeSql('UPDATE Config SET version = ' + configVersions[i].version
                    + ' WHERE name = \'' + configVersions[i].name + '\';');
              }
            }

            if (promise == null) {
              promise = DB.executeSql('INSERT INTO Config (name, type, version) VALUES (?, ?, ?);',
                  [configVersions[i].name, configVersions[i].type, configVersions[i].version]);
            }

            updatePromises.push(promise);
          }

          Promise.all(updatePromises)
              .then(() => {
                resolve();
              })
              .catch(err => {
                reject(err);
              });
        })
        .catch(err => {
          reject(err);
        });
  });
}
