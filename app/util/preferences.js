'use strict';

var React = require('react-native');

var {
  AsyncStorage,
} = React;

const TIMES_APP_OPENED = 'app_times_opened';
const SELECTED_LANGUAGE = 'app_selected_langauge';

var timesAppOpened = 0;
var selectedLanguage = null;

/*
 * Method which should be invoked each time the app is opened, to keep a running track
 * of how many times the app has been opened, the user's preferred language, etc.
 */
async function _loadInitialPreferences() {
  try {
    /// Number of times the app has been used. Either null or integer greater than or equal to 0
    let value = await AsyncStorage.getItem(TIMES_APP_OPENED);
    timesAppOpened = (value !== null)
        ? parseInt(value)
        : 0;

    // Language chosen by the user. Either null (if no language has been selected), 'en' for English, 'fr' for French
    value = await AsyncStorage.getItem(SELECTED_LANGUAGE)
    selectedLanguage = (value !== null)
        ? value
        : null;
  } catch (e) {
    console.log('Caught error checking first time.', e);

    // Setting variables to their default values
    timesAppOpened = 0;
    selectedLanguage = null;
  }

  timesAppOpened += 1;
  AsyncStorage.setItem(TIMES_APP_OPENED, timesAppOpened.toString());
};

module.exports = {

  /*
   * Wrapper method for _loadInitialPreferences.
   */
  loadInitialPreferences() {
    return _loadInitialPreferences();
  },

  /*
   * Checks if the app is being opened for the first time.
   */
  isFirstTimeOpened() {
    return timesAppOpened == 1;
  },

  /*
   * Returns true if a language has been selected, false if the current language is null.
   */
  isLanguageSelected() {
    return selectedLanguage === 'en' || selectedLanguage === 'fr';
  },

  /*
   * Gets the preferred language selected by the user. Returns 'en' for English, 'fr' for French, or 'en' if no
   * language has been selected yet.
   */
  getSelectedLanguage() {
    return (this.isLanguageSelected()
        ? selectedLanguage
        : 'en');
  },

  /*
   * Updates the user's preferred language.
   */
  setSelectedLanguage(language) {
    if (language !== 'en' && language !=='fr') {
      return;
    }

    selectedLanguage = language;
    AsyncStorage.setItem(SELECTED_LANGUAGE, language);
  },
};
