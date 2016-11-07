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
  switchFindView,
} from 'actions';

// Type imports
import type {
  Route,
} from 'types';

// Type definition for component props.
type Props = {
  onBackNavigation: (view: number) => void, // Callback when user pops the stacks
  view: number,                             // The current view
};

// Views in the Find tab
export const Views = {
  Home: 0,          // Home find view where user can select a building
  Building: 1,      // Building details, where user can see details of a single building
  StartingPoint: 2, // User can select their starting point for directions
};

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
      if (currentRoutes != null && currentRoutes.length > 0
          && nextProps.view === currentRoutes[currentRoutes.length - 1].id) {
        return;
      }
      this.refs.Navigator.push({id: nextProps.view});
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
      case Views.Home:
        return (
          <Home />
        );
      case Views.Building:
        return (
          <Building />
        );
      case Views.StartingPoint:
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
          initialRoute={{id: Views.Home}}
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
    view: store.find.view,
  };
};

// Map dispatch to props
const actions = (dispatch) => {
  return {
    onBackNavigation: (view: number) => {
      if (view === Views.Home) {
        dispatch(setHeaderTitle(null));
      }
      dispatch(switchFindView(view));
    },
  };
};

export default connect(select, actions)(Find);
