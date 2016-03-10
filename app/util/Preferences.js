/*
 * Manages the application preferences. Loads the preferences upon opening the application then caches their
 * values so they don't need to be reloaded later. When preferences are updated, the cache is updated and
 * the stored preference is updated to the new value.
 */
'use strict';

// React imports
const React = require('react-native');
const {
  AsyncStorage,
} = React;

// Represents the number of times the app has been opened
const TIMES_APP_OPENED = 'app_times_opened';
// Represents the language selected by the user to use the app in
const SELECTED_LANGUAGE = 'app_selected_langauge';
// Represents if the user prefers routes with wheelchair access
const PREFER_WHEELCHAIR = 'app_pref_wheel';

// Cached values of preferences
let timesAppOpened = 0;
let selectedLanguage = null;
let preferWheelchair = false;

/*
 * Method which should be invoked each time the app is opened, to keep a running track
 * of how many times the app has been opened, the user's preferred language, etc.
 */
async function _loadInitialPreferences() {
  // If any errors occur, just use the default values of the preferences
  try {
    // Number of times the app has been used. Either null or integer greater than or equal to 0
    let value = await AsyncStorage.getItem(TIMES_APP_OPENED);
    timesAppOpened = (value !== null)
        ? parseInt(value)
        : 0;

    // Language chosen by the user. Either null (if no language has been selected), 'en' for English, 'fr' for French
    value = await AsyncStorage.getItem(SELECTED_LANGUAGE)
    selectedLanguage = (value !== null)
        ? value
        : null;

    // If the user prefers wheelchair accessible routes
    value = await AsyncStorage.getItem(PREFER_WHEELCHAIR)
    preferWheelchair = (value !== null)
        ? (value === 'true')
        : false;
  } catch (e) {
    console.log('Caught error loading preferences.', e);

    // Setting variables to their default values
    timesAppOpened = 0;
    selectedLanguage = null;
    preferWheelchair = false;
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

  /*
   * Indicates if the user prefers wheelchair accessible routes or doesn't care.
   */
  isWheelchairRoutePreferred() {
    return preferWheelchair;
  },

  /*
   * Updates the user's preference to wheelchair accessible routes.
   */
  setWheelchairRoutePreferred(preferred) {
    if (preferred !== true && preferred !== false) {
      return;
    }

    preferWheelchair = preferred;
    AsyncStorage.setItem(PREFER_WHEELCHAIR, preferred.toString());
  },

  /*
   * Returns the value of a setting based on the provided key. The returned value may be a string, boolean, integer,
   * or object, and should correspond to the type of the setting.
   */
  getSetting(key) {
    if (key === 'pref_lang') {
      return (this.getSelectedLanguage() === 'en')
          ? 'English'
          : 'Français';
    } else if (key === 'pref_wheel') {
      return this.isWheelchairRoutePreferred();
    }

    return null;
  },
};
