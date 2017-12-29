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
 * @description Base component for the application.
 */
'use strict';

// React imports
import React from 'react';
import { SafeAreaView, View } from 'react-native';
import { Navigator } from 'react-native-deprecated-custom-components';

// Redux imports
import { connect } from 'react-redux';

// Imports
import * as Constants from '../constants';
import Main from './Main';
import Onboarding from './welcome/Onboarding';
import Splash from './welcome/Splash';
import Update from './welcome/Update';

// Types
import { Store } from '../store/configureStore';
import { WelcomeTab } from '../../typings/global';

interface Props {
  showIntroTour: boolean;   // When true, the onboarding tour should be opened
}

interface State {}

// Route to describe which view the Navigator should display.
interface AppRoute {
  id: WelcomeTab; // The expected view
  data: any;      // Additional data for the view
}

class CampusGuideApp extends React.PureComponent<Props, State> {

  /**
   * Show the intro tour, if requested.
   *
   * @param {Props} nextProps the new props being received
   */
  componentWillReceiveProps(nextProps: Props): void {
    if (nextProps.showIntroTour && nextProps.showIntroTour !== this.props.showIntroTour) {
      (this.refs.Navigator as any).push({ id: 'onboarding' });
    }
  }

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
    let scene: JSX.Element;
    const safeAreaStyle = { flex: 1, backgroundColor: Constants.Colors.tertiaryBackground };

    switch (route.id) {
      case 'splash':
        safeAreaStyle.backgroundColor = Constants.Colors.secondaryBackground;
        scene = (
          <Splash navigator={navigator} />
        );
        break;
      case 'onboarding':
        safeAreaStyle.backgroundColor = Constants.Colors.tutorialSafeArea;
        scene = (
          <Onboarding navigator={navigator} />
        );
        break;
      case 'main':
        scene = (
          <Main navigator={navigator} />
        );
        break;
      case 'update':
        safeAreaStyle.backgroundColor = Constants.Colors.primaryBackground;
        scene = (
          <Update
              navigator={navigator}
              available={route.data ? route.data.available : undefined} />
        );
        break;
      default:
        scene = (
          <View />
        );
    }

    return (
      <SafeAreaView style={safeAreaStyle}>
        {scene}
      </SafeAreaView>
    );
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
          ref='Navigator'
          renderScene={this._renderScene}
          style={{ flex: 1, backgroundColor: Constants.Colors.primaryBackground }} />
    );
  }
}

const mapStateToProps = (store: Store): any => {
  return {
    showIntroTour: store.navigation.showIntroTour,
  };
};

export default connect(mapStateToProps)(CampusGuideApp) as any;
