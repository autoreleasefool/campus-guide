/*
 * Utility methods for interacting with the screens.
 */
'use strict';

const Constants = require('../Constants');

// Screens which can be reached from the tab bar
const HOME_SCREENS = [
  Constants.Views.Find.Home,
  Constants.Views.Schedule.Home,
  Constants.Views.Discover.Home,
  Constants.Views.Settings.Home,
];

// Screens which are subscreens of the Find tab
const FIND_SCREENS = [
  Constants.Views.Find.Home,
  Constants.Views.Find.Building,
  Constants.Views.Find.Search,
];

// Screens which are subscreens of the Schedule tab
const SCHEDULE_SCREENS = [
  Constants.Views.Schedule.Home,
  Constants.Views.Schedule.Editor,
];

// Screens which are subscreens of the Discover tab
const DISCOVER_SCREENS = [
  Constants.Views.Discover.Home,
  Constants.Views.Discover.BusCampuses,
  Constants.Views.Discover.BusCampusStops,
  Constants.Views.Discover.LinksHome,
  Constants.Views.Discover.LinkCategory,
  Constants.Views.Discover.ShuttleInfo,
];

// Screens which are subscreens of the Settings tab
const SETTINGS_SCREENS = [
  Constants.Views.Settings.Home
];

module.exports = {

  /*
   * Returns true if the screen can be reached directly from the tab bar, or false otherwise.
   */
  isRootScreen(screenId) {
    return HOME_SCREENS.includes(screenId);
  },

  /*
   * Returns the screen that can reached directly from the tab bar based on the screenId.
   */
  getRootScreen(screenId) {
    if (FIND_SCREENS.includes(screenId)) {
      return Constants.Views.Find.Home;
    } else if (SCHEDULE_SCREENS.includes(screenId)) {
      return Constants.Views.Schedule.Home;
    } else if (SETTINGS_SCREENS.includes(screenId)) {
      return Constants.Views.Settings.Home;
    } else if (DISCOVER_SCREENS.includes(screenId)
        || typeof(screenId) === 'string' && screenId.indexOf(Constants.Views.Discover.LinkCategory) === 0) {
      return Constants.Views.Discover.Home;
  },

};
