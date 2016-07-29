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
const DB_NAME: string = 'CampusGuideData';
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
SQLite.DEBUG(true); // TODO: disable for release?
SQLite.enablePromise(false);

/**
 * Initialize and update the database.
 *
 * @param {Object} DB the Database module
 */
async function _init(DB: Object): Promise < void > {
  dbCurrentVersion = 0;
  try {
    const value = await AsyncStorage.getItem(DB_VERSION_KEY);
    dbCurrentVersion = (value === null) ? 0 : parseInt(value);
  } catch (e) {
    console.error('Error getting database version.', e);
  }

  db = SQLite.openDatabase(DB_NAME, DB_VERSION, DB_DISPLAY_NAME, DB_SIZE, DB._openSuccess, DB._openError);
  DB._upgradeDatabase(db, DB_VERSION);
}

module.exports = {

  /**
   * Initialize the database. Resolves when the database is ready to use. All database operations
   * should be invoked in the resolution of this function.
   *
   * @returns {Promise<SQLite>} promise that resolves or rejects when the database opens or fails to, respectively
   */
  init(): Promise < SQLite > {
    const self = this;
    return new Promise((resolve, reject) => {
      if (db == null) {
        if (dbInitializing) {
          initPromises.push({
            resolve: resolve,
            reject: reject,
          });
        } else {
          dbInitializing = true;
          _init(self).then(function resolved() {
            resolve(db);
          }, function rejected() {
            reject();
          });
        }
      } else {
        resolve(db);
      }
    });
  },

  /**
   * Closes the open database.
   */
  deinit(): void {
    if (db) {
      db.close(this._databaseCloseSuccess, this._databaseError);
    } else {
      console.log('Database is not open.');
    }
  },

  /**
   * Upgrades the database based on the current version and the new version
   *
   * @param {number} newVersion version of the database to update to
   */
  _upgradeDatabase(newVersion: number): void {
    if (db && dbCurrentVersion < newVersion) {

      /* Ignore numbers used for database versioning */
      /* eslint-disable no-magic-numbers */

      switch (dbCurrentVersion) {
        case 0:
          db.transaction(
            this._createDatabase,
            this._databaseUpgradeError,
            this._databaseUpgradeSuccess,
          );
          break;
        default:
          // does nothing
      }

      /* eslint-enable no-magic-numbers */
    }
  },

  /**
   * Creates the database.
   *
   * @param {any} tx database transaction
   */
  _createDatabase(tx: any): void {
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
      + 'version INTEGER NOT NULL DEFAULT 1'
      + ');'
    );
  },

  /**
   * Report a successful database operation.
   */
  _databaseSuccess(): void {
    console.log('Database operation successful.');
  },

  /**
   * Report a failed database operation.
   *
   * @param {any} err database error
   */
  _databaseError(err: any): void {
    console.error('Database operation failed.', err);
  },

  /**
   * Resolves promises waiting for the database to be initialized.
   */
  _openSuccess(): void {
    console.log('Database successfully opened.');
    dbInitializing = false;
    for (let i = 0; i < initPromises.length; i++) {
      initPromises[i].resolve(db);
    }
  },

  /**
   * Rejects promises waiting for the database to be initialized.
   *
   * @param {any} err database error
   */
  _openError(err: any): void {
    console.error('Database could not be opened.', err);
    dbInitializing = false;
    for (let i = 0; i < initPromises.length; i++) {
      initPromises[i].reject();
    }
  },

  /**
   * Reports a successfully closed database
   */
  _databaseCloseSuccess():void {
    console.log('Database has been successfully closed.');
  },

  /**
   * Report an error while upgrading the database.
   *
   * @param {any} err database error
   */
  _databaseUpgradeError(err: any): void {
    console.error('Error upgrading database from {1} to {2}.'.format(dbCurrentVersion, dbCurrentVersion + 1), err);
  },

  /**
   * Increment current database version and upgrade incrementally.
   */
  _databaseUpgradeSuccess(): void {
    if (dbCurrentVersion !== 0) {
      console.log('Successfully upgraded database from {1} to {2}.'.format(dbCurrentVersion, dbCurrentVersion + 1));

      dbCurrentVersion++;
      this._upgradeDatabase(db, dbCurrentVersion, DB_VERSION);
    }
  },
};
