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
 * @created 2016-10-19
 * @file Find.js
 * @description Navigator for managing views for finding rooms on campus.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  Navigator,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// Redux imports
import {connect} from 'react-redux';
import {
  setHeaderTitle,
  setShowBack,
  setShowSearch,
  switchFindView,
} from 'actions';

// Type imports
import type {
  Route,
  Tab,
} from 'types';

// Type definition for component props.
type Props = {
  appTab: Tab,                              // The current tab the app is showing
  backCount: number,                        // Number of times the user has requested back navigation
  onBackNavigation: (view: number) => void, // Callback when user pops the stacks
  view: number,                             // The current view
};

// Imports
import * as Constants from 'Constants';

// Screen imports
import Building from './Building';
import Home from './Home';
// const NavigationHome = require('NavigationHome');

class Find extends React.Component {

  /**
   * Properties this component expects to be provided by its parent.
   */
  props: Props;

  /**
   * Adds a listener for navigation events.
   */
  componentDidMount(): void {
    this.refs.Navigator.navigationContext.addListener('didfocus', this._handleNavigationEvent.bind(this));
  }

  /**
   * Present the updated view.
   *
   * @param {Props} nextProps the new props being received
   */
  componentWillReceiveProps(nextProps: Props): void {
    if (nextProps.view != this.props.view) {
      const currentRoutes = this.refs.Navigator.getCurrentRoutes();
      for (let i = 0; i < currentRoutes.length; i++) {
        if (nextProps.view === currentRoutes[i].id) {
          this.refs.Navigator.popToRoute(currentRoutes[i]);
          return;
        }
      }
      this.refs.Navigator.push({id: nextProps.view});
    } else if (nextProps.appTab === 'find' && nextProps.backCount != this.props.backCount) {
      this.refs.Navigator.pop();
    }
  }

  /**
   * Sets the transition between two views in the navigator.
   *
   * @returns {Object} a configuration for the transition between scenes.
   */
  _configureScene(): Object {
    return Navigator.SceneConfigs.PushFromRight;
  }

  /**
   * Handles navigation events.
   *
   * @param {any} event the event taking place
   */
  _handleNavigationEvent(): void {
    const currentRoutes = this.refs.Navigator.getCurrentRoutes();
    this.props.onBackNavigation(currentRoutes[currentRoutes.length - 1].id);
  }

  /**
   * Renders a view according to the current route of the navigator.
   *
   * @param {Route} route object with properties to identify the route to display.
   * @returns {ReactElement<any>} the view to render, based on {route}.
   */
  _renderScene(route: Route): ReactElement < any > {
    switch (route.id) {
      case Constants.Views.Find.Home:
        return (
          <Home />
        );
      case Constants.Views.Find.Building:
        return (
          <Building />
        );
      case Constants.Views.Find.StartingPoint:
        return (
          <View style={_styles.container}>
            <Text>{'StartingPoint'}</Text>
          </View>
        );
      default:
        // TODO: generic error view?
        return (
          <View style={_styles.container} />
        );
    }
  }

  render(): ReactElement < any > {
    return (
      <Navigator
          configureScene={this._configureScene}
          initialRoute={{id: Constants.Views.Find.Home}}
          ref='Navigator'
          renderScene={this._renderScene.bind(this)}
          style={_styles.container} />
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

// Map state to props
const select = (store) => {
  return {
    appTab: store.navigation.tab,
    backCount: store.navigation.backNavigations,
    view: store.find.view,
  };
};

// Map dispatch to props
const actions = (dispatch) => {
  return {
    onBackNavigation: (view: number) => {
      if (view === Constants.Views.Find.Home) {
        dispatch(setShowBack(false, 'find'));
        dispatch(setHeaderTitle(null, 'find'));
      } else {
        dispatch(setShowBack(true, 'find'));
      }
      dispatch(setShowSearch(true, 'find'));
      dispatch(switchFindView(view));
    },
  };
};

export default connect(select, actions)(Find);
