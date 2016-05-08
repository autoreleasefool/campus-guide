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
 * @file ScreenUtils.js
 * @description Utility methods for interacting with the screens.
 * @flow
 *
 */
'use strict';

// Imports
const Constants = require('../Constants');

// Valid types of screen ids.
type ScreenId =
    | number
    | string;

// Screens which can be reached from the tab bar
const HOME_SCREENS: Array<ScreenId> = [
  Constants.Views.Find.Home,
  Constants.Views.Schedule.Home,
  Constants.Views.Discover.Home,
  Constants.Views.Settings.Home,
];

// Screens which are subscreens of the Find tab
const FIND_SCREENS: Array<ScreenId> = [
  Constants.Views.Find.Home,
  Constants.Views.Find.Building,
  Constants.Views.Find.Search,
];

// Screens which are subscreens of the Schedule tab
const SCHEDULE_SCREENS: Array<ScreenId> = [
  Constants.Views.Schedule.Home,
  Constants.Views.Schedule.Editor,
];

// Screens which are subscreens of the Discover tab
const DISCOVER_SCREENS: Array<ScreenId> = [
  Constants.Views.Discover.Home,
  Constants.Views.Discover.BusCampuses,
  Constants.Views.Discover.BusCampusStops,
  Constants.Views.Discover.LinksHome,
  Constants.Views.Discover.LinkCategory,
  Constants.Views.Discover.ShuttleInfo,
  Constants.Views.Discover.ShuttleCampusInfo,
  Constants.Views.Discover.ShuttleDetails,
  Constants.Views.Discover.HotSpots,
];

// Screens which are subscreens of the Settings tab
const SETTINGS_SCREENS: Array<ScreenId> = [
  Constants.Views.Settings.Home,
];

module.exports = {

  /**
   * Returns the screen that can reached directly from the tab bar based on
   * the screenId.
   *
   * @param {ScreenId} screenId id of the screen to check.
   * @return {ScreenId} the id of the home screen of {screenId}, which is determined by
   *         the list that contains the id.
   */
  getRootScreen(screenId: ScreenId): ScreenId {
    if (FIND_SCREENS.indexOf(screenId) >= 0) {
      return Constants.Views.Find.Home;
    } else if (SCHEDULE_SCREENS.indexOf(screenId) >= 0) {
      return Constants.Views.Schedule.Home;
    } else if (SETTINGS_SCREENS.indexOf(screenId) >= 0) {
      return Constants.Views.Settings.Home;
    } else if (DISCOVER_SCREENS.indexOf(screenId) >= 0
        || typeof(screenId) === 'string' && screenId.indexOf(Constants.Views.Discover.LinkCategory.toString()) === 0) {
      return Constants.Views.Discover.Home;
    }

    return 0;
  },

  /**
   * Returns true if the screen can be reached directly from the tab bar,
   * or false otherwise.
   *
   * @param {ScreenId} id of the screen to check.
   * @return {boolean} true  if {screenId} is in HOME_SCREENS, false otherwise.
   */
  isRootScreen(screenId: ScreenId): boolean {
    return HOME_SCREENS.indexOf(screenId) >= 0;
  },
};
