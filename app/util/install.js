'use strict';

var React = require('react-native');

var {
  AsyncStorage,
} = React;

const TIMES_APP_OPENED = 'times_app_opened';

var valuesLoaded = false;
var timesAppOpened = 2;

async function _loadAppDetails() {
  try {
    let value = await AsyncStorage.getItem(TIMES_APP_OPENED);
    timesAppOpened = (value !== null)
        ? parseInt(value)
        : 0;

    valuesLoaded = true;
  } catch (e) {
    console.log('Caught error checking first time.', e);

    // Setting variables to their default values
    timesAppOpened = 1;
  }

  timesAppOpened += 1;
  AsyncStorage.setItem(TIMES_APP_OPENED, timesAppOpened.toString());
}

module.exports = {

  /*
   * Method which should be invoked each time the app is opened, to keep a running track
   * of the current version installed and how many times the app has been opened.
   */
  appOpened() {
    if (!valuesLoaded) {
      _loadAppDetails();
    }
  },

  /*
   * Checks if the app is being opened for the first time.
   */
  async isFirstTimeOpened() {
    if (!valuesLoaded) {
      await _loadAppDetails();
    }

    return timesAppOpened == 1;
  },
};
