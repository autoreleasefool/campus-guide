/*************************************************************************
 *
 * @license
 *
 * Copyright 2016 Joseph Roque
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
 *************************************************************************
 *
 * @file
 * Configuration.js
 *
 * @description
 * Manages the configuration of the application.
 *
 * @author
 * Joseph Roque
 *
 *************************************************************************
 *
 * @external
 * @flow
 *
 ************************************************************************/
'use strict';

let availableSemesters = [];
let university = {};
let cityBuses = {};

/*
 * Asynchronously gets the configuration for the application and loads the
 * various config values into their respective variables.
 */
async function _requestConfig() {
  // Get the configuration file
  let configuration = require('../../assets/static/json/config.json');

  // Get the current semesters available in the app
  for (var i = 0; i < configuration['AvailableSemesters'].length; i++) {
    availableSemesters.push(configuration['AvailableSemesters'][i]);
  }

  university = configuration['University'];
  cityBuses = configuration['Bus'];
}

module.exports = {

  /**
   * Retrieves the app's configuration data and returns it in a promise.
   *
   * @return the Promise from the async function {_requestConfig}.
   */
  loadConfiguration() {
    return _requestConfig();
  },

  /**
   * Gets the list of semesters currently available in the application.
   *
   * @return the list of objects containing semester information.
   */
  getAvailableSemesters() {
    return availableSemesters;
  },

  /**
   * Returns the semester requested.
   *
   * @param semester index of the semester to return.
   * @return the object with semester information.
   */
  getSemester(semester) {
    return availableSemesters[semester];
  },

  /**
   * Gets a object with information about the university.
   *
   * @return an object with details about the university.
   */
  getUniversity() {
    return university;
  },

  /**
   * Returns an object with information about the city buses.
   *
   * @return an objec with details about the city bus system.
   */
  getCityBusyInfo() {
    return cityBuses;
  },
};
