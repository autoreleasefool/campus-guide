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
 * @file CampusGuideApp.tsx
 * @providesModule CampusGuideApp
 * @description Base component for the application.
 */
'use strict';

// React imports
import React from 'react';
import { View } from 'react-native';
import { Navigator } from 'react-native-deprecated-custom-components';

// Imports
import * as Constants from '../constants';
import Main from './Main';
import Splash from './welcome/Splash';
import Update from './welcome/Update';

// Types
import { WelcomeTab } from '../../typings/global';

interface Props {}
interface State {}

// Route to describe which view the Navigator should display.
interface AppRoute {
  id: WelcomeTab;  // The expected tab
}

export default class CampusGuideApp extends React.PureComponent<Props, State> {

  /**
   * Defines the transition between views.
   *
   * @returns {object} a configuration for scene transitions in the navigator
   */
  _configureScene(): object {
    return {
      ...Navigator.SceneConfigs.PushFromRight,
      gestures: false,
    };
  }

  /**
   * Renders a different view based on the current navigator route.
   *
   * @param {AppRoute} route     object with properties to identify the route being displayed
   * @param {any}      navigator navigator object to pass to children
   * @returns {JSX.Element} the view to render, based on {route}
   */
  _renderScene(route: AppRoute, navigator: any): JSX.Element {
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
   * @returns {JSX.Element} the hierarchy of views to render
   */
  render(): JSX.Element {
    return (
      <Navigator
          configureScene={this._configureScene}
          initialRoute={{ id: 'main' }}
          renderScene={this._renderScene}
          style={{ flex: 1, backgroundColor: Constants.Colors.primaryBackground }} />
    );
  }
}
