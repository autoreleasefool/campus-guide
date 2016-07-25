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
 * @description Base component for the application.
 *
 * @flow
 */
'use strict';

// React imports
import {
  AsyncStorage,
} from 'react-native';

// Imports
const SQLite = require('react-native-sqlite-storage');

/** Name of the database */
const DB_NAME: string = 'CampusGuideData';

/** Current version of the database. Update when changes are made. */
const DB_VERSION: number = 1;

/** Identifies the database version, stored in the local storage. */
const DB_VERSION_KEY: string = "db_version";

/** Display name of the database. */
const DB_DISPLAY_NAME: string = 'Campus Guide Database';

// TODO: determine sufficient database size
/** Size of the database. */
const DB_SIZE: number = 200000;

/** Instance of the database */
let db: ?SQLite = null;

/** Current version of the database. */
let dbCurrentVersion: number = 0;

// Set mode for SQLite
SQLite.DEBUG(true); // TODO: disable for release?
SQLite.enablePromise(false);

module.exports = {

  /**
   * Initialize the database. Create tables if necessary, and update the version.
   */
  init() {
    dbCurrentVersion = 0;
    try {
      let value = await AsyncStorage.getItem(DB_VERSION_KEY);
      dbCurrentVersion = (value === null) ? 0 : parseInt(value);
    } catch (e) {
      console.error('Error getting database version.', e);
    }

    db = SQLite.openDatabase(DB_NAME, DB_VERSION, DB_DISPLAY_NAME, DB_SIZE, this._databaseSuccess, this._databaseError);
    this._upgradeDatabase(db, DB_VERSION);
  },

  /**
   * Closes the open database.
   */
  deinit() {
    if (db) {
      db.close(this._databaseCloseSuccess, this._databaseError);
    } else {
      console.log('Database is not open.');
    }
  },

  /**
   * Upgrades the database based on the current version and the new version
   */
  _upgradeDatabase(db: SQLite, newVersion: number) {
    if (dbCurrentVersion < newVersion) {

      /** Ignore numbers used for database versioning */
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
   */
  _createDatabase(tx) {
    // Clear the existing database
    tx.executeSql('DROP TABLE IF EXISTS Semesters;');
    tx.executeSql('DROP TABLE IF EXISTS Courses;');
    tx.executeSql('DROP TABLE IF EXISTS Sessions;');

    // Create the Semesters table
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS Semesters ('
      + '_id INTEGER PRIMARY KEY NOT NULL,'
      + 'name_fr STRING NOT NULL COLLATE NOCASE,'
      + 'name_en STRING NOT NULL COLLATE NOCASE'
      + ')'
    );

    // Create the Courses table
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS Courses ('
      + '_id INTEGER PRIMARY KEY NOT NULL,'
      + 'semester_id ,'
      + 'name STRING NOT NULL COLLATE NOCASE'
      + ')'
    );

    // Create the Sessions table
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS Sessions ('
      + '_id INTEGER PRIMARY KEY NOT NULL,'
      + 'course_id ,'
      + 'start_time TIME,'
      + 'duration INTEGER NOT NULL DEFAULT 90,'
      + 'type INTEGER NOT NULL DEFAULT 0'
      + ')'
    );
  },

  /**
   * Report a successful database operation.
   */
  _databaseSuccess() {
    console.log('Database operation successful.');
  },

  /**
   * Report a failed database operation.
   */
  _databaseError(err) {
    console.error('Database operation failed.', err);
  },

  /**
   * Reports a successfully closed database
   */
  _databaseCloseSuccess() {
    console.log('Database has been successfully closed.');
  },

  /**
   * Report an error while upgrading the database.
   */
  _databaseUpgradeError(err) {
    console.error('Error upgrading database from {1} to {2}.'.format(dbCurrentVersion, dbCurrentVersion + 1), err);
  },

  /**
   * Increment current database version and upgrade incrementally.
   */
  _databaseUpgradeSuccess() {
    if (dbCurrentVersion === 0) {

    } else {
      console.log('Successfully upgraded database from {1} to {2}.'.format(dbCurrentVersion, dbCurrentVersion + 1));

      dbCurrentVersion++;
      this._upgradeDatabase(db, dbCurrentVersion, DB_VERSION);
    }
  },
};
