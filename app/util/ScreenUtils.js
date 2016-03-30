/*
 * Utility methods for interacting with the screens.
 */
'use strict';

const Constants = require('../Constants');

module.exports = {

  /*
   * Returns true if the screen can be reached directly from the tab bar, or false otherwise.
   */
  isRootScreen(screenId) {
    return (screenId === Constants.Views.Find.Home
        || screenId === Constants.Views.Schedule.Home
        || screenId === Constants.Views.Discover.Home
        || screenId === Constants.Views.Settings.Home);
  },

  /*
   * Returns the screen that can reached directly from the tab bar based on the screenId.
   */
  getRootScreen(screenId) {
    if (screenId === Constants.Views.Find.Home
        || screenId === Constants.Views.Find.Building
        || screenId === Constants.Views.Find.Search) {
      return Constants.Views.Find.Home;
    } else if (screenId === Constants.Views.Schedule.Home
        || screenId === Constants.Views.Schedule.Editor) {
      return Constants.Views.Schedule.Home;
    } else if (screenId === Constants.Views.Discover.Home
        || screenId === Constants.Views.Discover.BusCampusStops) {
      return Constants.Views.Discover.Home;
    } else if (screenId === Constants.Views.Settings.Home) {
      return Constants.Views.Settings.Home;
    }
  },

};
