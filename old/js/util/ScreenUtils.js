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
 * @providesModule ScreenUtils
 * @description Utility methods for interacting with the screens.
 *
 * @flow
 */
'use strict';

// Imports
const Constants = require('Constants');

// Screens which can be reached from the tab bar
const HOME_SCREENS: Array < number | string > = [
  Constants.Views.Find.Home,
  Constants.Views.Schedule.Home,
  Constants.Views.Discover.Home,
  Constants.Views.Settings.Home,
];

module.exports = {

  /**
   * Returns the screen that can reached directly from the tab bar based on the screenId.
   *
   * @param {number | string} screenId id of the screen to check.
   * @returns {number | string} the id of the home screen of {screenId}, which is determined by the list that
   *          contains the id.
   */
  getRootScreen(screenId: number | string): number {
    for (const tab in Constants.Views) {

      /* istanbul ignore else */
      if (Constants.Views.hasOwnProperty(tab)) {
        const tabGroup: Object = Constants.Views[tab];
        for (const screen in tabGroup) {
          if (tabGroup.hasOwnProperty(screen) && tabGroup[screen] === screenId) {
            return tabGroup.Home;
          }
        }
      }
    }

    return 0;
  },

  /**
   * Returns true if the screen can be reached directly from the tab bar, or false otherwise.
   *
   * @param {number | string} screenId id of the screen to check.
   * @returns {boolean} true if {screenId} is in HOME_SCREENS, false otherwise.
   */
  isRootScreen(screenId: number | string): boolean {
    return HOME_SCREENS.indexOf(screenId) >= 0;
  },
};
