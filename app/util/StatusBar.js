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
 * StatusBar.js
 *
 * @description
 * Offers utilities for adjusting the status bar.
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

// React Native imports
const React = require('react-native');
const {
  Platform,
  StatusBar,
} = React;

// Provides additional spacing on iOS to allow room for the status bar
let statusBarPadding = 0;
if (Platform.OS === 'ios') {
  statusBarPadding = 20;
}

module.exports = {

  /**
   * Changes the status bar text colors on iOS to be either light or dark.
   * True for light, false for dark.
   *
   * @param light {true} or {false} to set the color of the status bar.
   */
  setLightStatusBarIOS(light) {
    if (Platform.OS === 'ios') {
      if (light) {
        StatusBar.setBarStyle('light-content');
      } else {
        StatusBar.setBarStyle('default');
      }
    }
  },

  /**
   * Returns an additional padding for the status bar on iOS.
   *
   * @return the padding to use for the status bar.
   */
  getStatusBarPadding() {
    return statusBarPadding;
  }
}
