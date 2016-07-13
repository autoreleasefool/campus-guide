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

// Default link to return
const DEFAULT_LINK: string = 'http://www.uottawa.ca/';
// List of semesters available in the app
const availableSemesters: Array<Semester> = [];

// Information about the university
let university: ?University = null;
// Information about the buses in the city
let cityBuses: ?BusInfo = null;

/**
 * Asynchronously gets the configuration for the application and loads the various config values into their
 * respective variables.
 */
async function _requestConfig(): Promise<void> {
  // Get the configuration file
  const configuration: Object = require('../../assets/json/config.json');

  // Get the current semesters available in the app
  if (configuration.AvailableSemesters) {
    for (let i = 0; i < configuration.AvailableSemesters.length; i++) {
      availableSemesters.push(configuration.AvailableSemesters[i]);
    }
  }

  university = configuration.University;
  cityBuses = configuration.Bus;
}

module.exports = {

  /**
   * Retrieves the app's configuration data and returns it in a promise.
   *
   * @returns {Promise<void>} the Promise from the async function {_requestConfig}.
   */
  loadConfiguration(): Promise<void> {
    return _requestConfig();
  },

  /**
   * Gets the list of semesters currently available in the application.
   *
   * @returns {Array<Semester>} the list of objects containing semester information.
   */
  getAvailableSemesters(): Array<Semester> {
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
