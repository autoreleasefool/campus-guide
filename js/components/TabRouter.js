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
 * @file TabRouter.js
 * @providesModule TabRouter
 * @description Manages view changes in the application. Common to Android and iOS.
 *
 * @flow
 */
// React imports
import React from 'react';
import {
  View,
} from 'react-native';

// Type imports
import type {
  DefaultFunction,
  Route,
} from 'types';

// Imports
const Constants = require('Constants');

// Screen imports
const Discover = require('Discover');
const Find = require('Find');
const Schedule = require('Schedule');
const SearchResults = require('SearchResults');
const SettingsHome = require('SettingsHome');

module.exports = {

  /**
   * Renders a view according to the current route of the navigator.
   *
   * @param {Route}           route           object with properties to identify the route to display.
   * @param {DefaultFunction} changeTabs      function to change tabs in the tab manager.
   * @param {DefaultFunction} navigateForward function to navigate to a new screen in the tab manager.
   * @param {DefaultFunction} refreshNavbar   function to update the NavBar.
   * @returns {ReactElement<any>} the view to render, based on {route}.
   */
  renderScene(route: Route,
      changeTabs: (tabId: number) => any,
      navigateForward: (screenId: number | string, data: any) => any,
      refreshNavbar: DefaultFunction): ReactElement < any > {
    let scene = null;

    switch (route.id) {
      case Constants.Views.Discover.Home:
        scene = (
          <Discover />
        );
        break;
      case Constants.Views.Find.Home:
        scene = (
          <Find />
        );
        break;
      case Constants.Views.Schedule.Home:
        scene = (
          <Schedule />
        );
        break;
      case Constants.Views.Settings.Home:
        scene = (
          <SettingsHome refreshParent={refreshNavbar} />
        );
        break;
      case Constants.Views.Search:
        scene = (
          <SearchResults initialSearch={route.data} />
        );
        break;
      default:
        // Does nothing - scene remains null
    }

    return (
      <View style={{flex: 1, backgroundColor: Constants.Colors.garnet}}>
        {scene}
      </View>
    );
  },
};
