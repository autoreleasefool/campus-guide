/**
 *
 * @license
 * Copyright (C) 2016-2017 Joseph Roque
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
 * @created 2016-10-03
 * @file CampusGuideApp.js
 * @providesModule CampusGuideApp
 * @description Base component for the application.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import { View } from 'react-native';
import { Navigator } from 'react-native-deprecated-custom-components';

// Types
import type { WelcomeTab } from 'types';

// Route to describe which view the Navigator should display.
type AppRoute = {
  id: WelcomeTab,  // The expected tab
};

// Imports
import Main from './Main';
import Splash from './welcome/Splash';
import Update from './welcome/Update';
import * as Constants from 'Constants';

export default class CampusGuideApp extends React.Component {

  /**
   * Defines the transition between views.
   *
   * @returns {Object} a configuration for scene transitions in the navigator.
   */
  _configureScene(): Object {
    return {
      ...Navigator.SceneConfigs.PushFromRight,
      gestures: false,
    };
  }

  /**
   * Renders a different view based on the current navigator route.
   *
   * @param {AppRoute}        route     object with properties to identify the route being displayed
   * @param {ReactClass<any>} navigator navigator object to pass to children
   * @returns {ReactElement<any>} the view to render, based on {route}.
   */
  _renderScene(route: AppRoute, navigator: ReactClass < any >): ReactElement < any > {
    switch (route.id) {
      case 'splash':
        return (
          <Splash navigator={navigator} />
        );
      case 'main':
        return (
          <Main navigator={navigator} />
        );
      case 'update':
        return (
          <Update navigator={navigator} />
        );
      default:
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
  render(): ReactElement < any > {
    return (
      <Navigator
          configureScene={this._configureScene}
          initialRoute={{ id: 'splash' }}
          renderScene={this._renderScene}
          style={{ flex: 1, backgroundColor: Constants.Colors.primaryBackground }} />
    );
  }
}
