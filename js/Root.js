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
 * @file Roots.js
 * @module CampusGuide
 * @description Base component for the application.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  Navigator,
  View,
} from 'react-native';

// Type imports
import type {
  Route,
} from './types';

// Imports
const Constants = require('./Constants');
const MainScreen = require('./views/Main');
const Orientation = require('react-native-orientation');
const SplashScreen = require('./views/Splash');

class CampusGuide extends React.Component {

  /**
   * Locks the application to portrait orientation.
   */
  componentDidMount(): void {
    Orientation.lockToPortrait();
  }

  /**
   * Defines the transition between views.
   *
   * @returns {Object} a configuration for scene transitions in the navigator.
   */
  _configureScene(): Object {
    return ({
      ...Navigator.SceneConfigs.HorizontalSwipeJump,
      gestures: false,
    });
  }

  /**
   * Renders a different view based on the current navigator route.
   *
   * @param {Route} route               object with properties to identify the route to display.
   * @param {ReactClass<any>} navigator navigator object to pass to children.
   * @returns {ReactElement<any>} the view to render, based on {route}.
   */
  _renderScene(route: Route, navigator: ReactClass<any>): ReactElement<any> {
    if (route.id === Constants.Views.Splash) {
      return (
        <SplashScreen navigator={navigator} />
      );
    } else if (route.id === Constants.Views.Main) {
      return (
        <MainScreen navigator={navigator} />
      );
    } else {
      return (
        <View />
      );
    }
  }

  /**
   * Renders the root navigator of the app to switch between the splash screen and main screen.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement<any> {
    return (
      <Navigator
          configureScene={this._configureScene}
          initialRoute={{id: 1}}
          renderScene={this._renderScene} />
    );
  }
}

module.exports = CampusGuide;
