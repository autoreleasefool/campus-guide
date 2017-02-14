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
 * @created 2016-10-27
 * @file Discover.js
 * @description Navigator for managing views for discovering the university's campus.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import { Navigator, StyleSheet, View } from 'react-native';

// Redux imports
import { connect } from 'react-redux';
import * as actions from 'actions';

// Types
import type { Route, Tab, VoidFunction } from 'types';

// Type definition for component props.
type Props = {
  appTab: Tab,                              // The current tab the app is showing
  backCount: number,                        // Number of times the user has requested back navigation
  canNavigateBack: VoidFunction,            // Indicates back navigation is possible
  transitCanNavigate: boolean,              // Indicates if the transit subview can navigate backwards
  linksCanNavigate: boolean,                // Indicates if the link subview can navigate backwards
  onNavigation: (view: number) => void,     // Callback when user navigates in the discover view
  view: number,                             // The current view
};

// Imports
import * as Constants from 'Constants';

// Screen imports
import Home from './Home';
import Links from './Links';
import Transit from './Transit';

class Discover extends React.Component {

  /**
   * Properties this component expects to be provided by its parent.
   */
  props: Props;

  /**
   * Determines whether the initial route can be navigated back from.
   */
  componentWillMount(): void {
    if (this.props.view != Constants.Views.Discover.Home) {
      this.props.canNavigateBack();
    }
  }

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
      this.refs.Navigator.push({ id: nextProps.view });
    } else if (nextProps.appTab === 'discover'
        && nextProps.backCount != this.props.backCount
        && !(nextProps.view === Constants.Views.Discover.Links && this.props.linksCanNavigate)
        && !(nextProps.view === Constants.Views.Discover.Transit && this.props.transitCanNavigate)) {
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
    this.props.onNavigation(currentRoutes[currentRoutes.length - 1].id);
  }

  /**
   * Renders a view according to the current route of the navigator.
   *
   * @param {Route} route object with properties to identify the route to display.
   * @returns {ReactElement<any>} the view to render, based on {route}.
   */
  _renderScene(route: Route): ReactElement < any > {
    switch (route.id) {
      case Constants.Views.Discover.Home:
        return (
          <Home />
        );
      case Constants.Views.Discover.Links:
        return (
          <Links />
        );
      case Constants.Views.Discover.Transit:
        return (
          <Transit />
        );
      default:
        // TODO: generic error view?
        return (
          <View style={_styles.container} />
        );
    }
  }

  /**
   * Renders a navigator.
   *
   * @returns {ReactElement<any>} a Navigator instance to render
   */
  render(): ReactElement < any > {
    const routeStack = [{ id: Constants.Views.Discover.Home }];
    if (this.props.view != Constants.Views.Discover.Home) {
      routeStack.push({ id: this.props.view });
    }

    return (
      <Navigator
          configureScene={this._configureScene}
          initialRouteStack={routeStack}
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

const mapStateToProps = (store) => {
  return {
    appTab: store.navigation.tab,
    backCount: store.navigation.backNavigations,
    transitCanNavigate: store.navigation.canBack.transit || false,
    linksCanNavigate: store.navigation.canBack.links || false,
    view: store.navigation.discoverView,
  };
};

const mapDispatchToprops = (dispatch) => {
  return {
    canNavigateBack: () => dispatch(actions.showBack(true, 'discover')),
    onNavigation: (view: number) => {
      switch (view) {
        case Constants.Views.Discover.Home:
          dispatch(actions.showBack(false, 'discover'));
          dispatch(actions.showSearch(false, 'discover'));
          dispatch(actions.setHeaderTitle(null, 'discover'));
          break;
        default:
          dispatch(actions.showBack(true, 'discover'));
      }

      dispatch(actions.switchDiscoverView(view));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToprops)(Discover);
