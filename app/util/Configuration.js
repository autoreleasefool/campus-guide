/*
 * Manages the configuration of the application.
 */
'use strict';

// React imports
const React = require('react-native');
const {
  AsyncStorage,
} = React;

let availableSemesters = [];

/*
 * Asynchronously gets the configuration for the application and loads the various config values into their respective
 * variables.
 */
async function _requestConfig() {
  // Get the configuration file
  let configuration = require('../../assets/static/json/config.json');

  // Get the current sessions available in the app
  for (var i = 0; i < configuration['AvailableSemesters'].length; i++) {
    availableSemesters.push(configuration['AvailableSemesters'][i]);
  }
}

module.exports = {

  /*
   * Retrieves the app's configuration data and returns it in a promise.
   */
  loadConfiguration() {
    return _requestConfig();
  },

  /*
   * Gets the list of semesters currently available in the application.
   */
  getAvailableSemesters() {
    return availableSemesters;
  },

  /*
   * Returns the semester requested.
   */
  getSemester(semester) {
    return availableSemesters[semester];
  }
};
