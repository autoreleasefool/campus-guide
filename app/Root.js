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
 * Root.js
 *
 * @description
 * Base component for the application.
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
  Component,
  Navigator,
  View,
} = React;

// Imports
const Constants = require('./Constants');
const MainScreen = require('./views/Main');
const Orientation = require('react-native-orientation');
const SplashScreen = require('./views/Splash');

class CampusGuide extends Component {

  /**
   * Default constructor to pass props to parent.
   *
   * @param props properties passed from container to this component.
   */
  constructor(props) {
    super(props);
  };

  /**
   * Defines the transition between views.
   *
   * @return a configuration for scene transitions in the navigator.
   */
  _configureScene() {
    return ({
      ...Navigator.SceneConfigs.HorizontalSwipeJump,
      gestures: false,
    });
  };

  /**
   * Renders a different view based on the current navigator route.
   *
   * @param route     object with properties to identify the route to display.
   * @param navigator navigator object to pass to children.
   * @return the view to render, based on {route}.
   */
  _renderScene(route, navigator) {
    if (route.id === Constants.Views.Splash) {
      return <SplashScreen navigator={navigator} />
    } else if (route.id === Constants.Views.Main) {
      return <MainScreen navigator={navigator} />
    }
  };

  /**
   * Locks the application to portrait orientation.
   */
  componentDidMount() {
    Orientation.lockToPortrait();
  };

  /**
   * Renders the root navigator of the app to switch between the splash screen
   * and main screen.
   *
   * @return the hierarchy of views to render.
   */
  render() {
    return (
      <Navigator
          configureScene={this._configureScene}
          initialRoute={{id: 1}}
          renderScene={this._renderScene} />
    );
  };
};

// Expose component to app
module.exports = CampusGuide;
