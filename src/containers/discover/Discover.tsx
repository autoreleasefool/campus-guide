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
 * @file Discover.tsx
 * @description Navigator for managing views for discovering the university's campus.
 */
'use strict';

// React imports
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Navigator } from 'react-native-deprecated-custom-components';

// Redux imports
import { connect } from 'react-redux';
import * as actions from '../../actions';

// Imports
import * as Constants from '../../constants';

// Screen imports
import Home from './Home';
import Housing from './Housing';
import Links from './Links';
import Shuttle from './Shuttle';
import StudySpots from './StudySpots';
import Transit from './Transit';

// Types
import { Route, Tab } from '../../../typings/global';

interface Props {
  appTab: Tab;                      // The current tab the app is showing
  backCount: number;                // Number of times the user has requested back navigation
  housingCanNavigate: boolean;      // Indicates if the housing subview can navigate backwards
  linksCanNavigate: boolean;        // Indicates if the link subview can navigate backwards
  transitCanNavigate: boolean;      // Indicates if the transit subview can navigate backwards
  view: number;                     // The current view
  canNavigateBack(): void;          // Indicates back navigation is possible
  onNavigation(view: number): void; // Callback when user navigates in the discover view
}

interface State {}

class Discover extends React.PureComponent<Props, State> {

  /**
   * Determines whether the initial route can be navigated back from.
   */
  componentWillMount(): void {
    if (this.props.view !== Constants.Views.Discover.Home) {
      this.props.canNavigateBack();
    }
  }

  /**
   * Adds a listener for navigation events.
   */
  componentDidMount(): void {
    (this.refs.Navigator as any).navigationContext.addListener('didfocus', this._handleNavigationEvent.bind(this));
  }

  /**
   * Present the updated view.
   *
   * @param {Props} nextProps the new props being received
   */
  componentWillReceiveProps(nextProps: Props): void {
    if (nextProps.view !== this.props.view) {
      const currentRoutes = (this.refs.Navigator as any).getCurrentRoutes();
      if (currentRoutes != undefined && currentRoutes.length > 0
          && nextProps.view === currentRoutes[currentRoutes.length - 1].id) {
        return;
      }
      (this.refs.Navigator as any).push({ id: nextProps.view });
    } else if (nextProps.appTab === 'discover'
        && nextProps.backCount !== this.props.backCount
        && !(nextProps.view === Constants.Views.Discover.Links && this.props.linksCanNavigate)
        && !(nextProps.view === Constants.Views.Discover.Transit && this.props.transitCanNavigate)
        && !(nextProps.view === Constants.Views.Discover.Housing && this.props.housingCanNavigate)) {
      (this.refs.Navigator as any).pop();
    }
  }

  /**
   * Sets the transition between two views in the navigator.
   *
   * @returns {any} a configuration for the transition between scenes
   */
  _configureScene(): any {
    return Navigator.SceneConfigs.PushFromRight;
  }

  /**
   * Handles navigation events.
   *
   * @param {any} event the event taking place
   */
  _handleNavigationEvent(): void {
    const currentRoutes = (this.refs.Navigator as any).getCurrentRoutes();
    this.props.onNavigation(currentRoutes[currentRoutes.length - 1].id);
  }

  /**
   * Renders a view according to the current route of the navigator.
   *
   * @param {Route} route object with properties to identify the route to display
   * @returns {JSX.Element} the view to render, based on {route}
   */
  _renderScene(route: Route): JSX.Element {
    switch (route.id) {
      case Constants.Views.Discover.Home:
        return (
          <Home />
        );
      case Constants.Views.Discover.Housing:
        return (
          <Housing />
        );
      case Constants.Views.Discover.Links:
        return (
          <Links />
        );
      case Constants.Views.Discover.Transit:
        return (
          <Transit />
        );
      case Constants.Views.Discover.Shuttle:
        return (
          <Shuttle />
        );
      case Constants.Views.Discover.StudySpots:
        return (
          <StudySpots />
        );
      default:
        // FIXME: generic error view?
        return (
          <View style={_styles.container} />
        );
    }
  }

  /**
   * Renders a navigator.
   *
   * @returns {JSX.Element} a Navigator instance to render
   */
  render(): JSX.Element {
    const routeStack = [{ id: Constants.Views.Discover.Home }];
    if (this.props.view !== Constants.Views.Discover.Home) {
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

const mapStateToProps = (store: any): any => {
  return {
    appTab: store.navigation.tab,
    backCount: store.navigation.backNavigations,
    housingCanNavigate: store.navigation.canBack.housing || false,
    linksCanNavigate: store.navigation.canBack.links || false,
    transitCanNavigate: store.navigation.canBack.transit || false,
    view: store.navigation.discoverView,
  };
};

const mapDispatchToProps = (dispatch: any): any => {
  return {
    canNavigateBack: (): void => dispatch(actions.showBack(true, 'discover')),
    onNavigation: (view: number): void => {
      switch (view) {
        case Constants.Views.Discover.Home:
          dispatch(actions.showBack(false, 'discover'));
          dispatch(actions.showSearch(false, 'discover'));
          break;
        default:
          dispatch(actions.showBack(true, 'discover'));
      }

      dispatch(actions.switchDiscoverView(view));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Discover) as any;
