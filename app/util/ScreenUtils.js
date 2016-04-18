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
 * ScreenUtils.js
 *
 * @description
 * Utility methods for interacting with the screens.
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

// Imports
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
  Constants.Views.Discover.ShuttleCampusInfo,
  Constants.Views.Discover.ShuttleDetails,
];

// Screens which are subscreens of the Settings tab
const SETTINGS_SCREENS = [
  Constants.Views.Settings.Home,
];

module.exports = {

  /**
   * Returns true if the screen can be reached directly from the tab bar,
   * or false otherwise.
   *
   * @param id of the screen to check.
   * @return {true} if {screenId} is in HOME_SCREENS, {false} otherwise.
   */
  isRootScreen(screenId) {
    return HOME_SCREENS.includes(screenId);
  },

  /**
   * Returns the screen that can reached directly from the tab bar based on
   * the screenId.
   *
   * @param screenId id of the screen to check.
   * @return the id of the home screen of {screenId}, which is determined by
   *         the list that contains the id.
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
    }
  },
};
