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
 * @file Find.tsx
 * @description Navigator for managing views for finding rooms on campus.
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
import { default as BuildingScreen } from './Building';
import { default as HomeScreen } from './Home';
import { default as StartingPointScreen } from './StartingPoint';
import { default as StepsScreen } from './Steps';

// Types
import { Route, Tab } from '../../../typings/global';
import { Building } from '../../../typings/university';

interface Props {
  appTab: Tab;                          // The current tab the app is showing
  backCount: number;                    // Number of times the user has requested back navigation
  view: number;                         // The current view
  onBackNavigation(view: number): void; // Callback when user pops the stacks
}

interface State {}

class Find extends React.PureComponent<Props, State> {

  /** List of buildings in the app. */
  _buildingList: Building[] = [];

  /**
   * Constructor.
   *
   * @param {props} props component props
   */
  constructor(props: Props) {
    super(props);
    this._buildingList = require('../../../assets/js/Buildings');
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
      for (const route of currentRoutes) {
        if (nextProps.view === route.id) {
          (this.refs.Navigator as any).popToRoute(route);

          return;
        }
      }
      (this.refs.Navigator as any).push({ id: nextProps.view });
    } else if (nextProps.appTab === 'find' && nextProps.backCount !== this.props.backCount) {
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
    this.props.onBackNavigation(currentRoutes[currentRoutes.length - 1].id);
  }

  /**
   * Renders a view according to the current route of the navigator.
   *
   * @param {Route} route object with properties to identify the route to display
   * @returns {JSX.Element} the view to render, based on {route}
   */
  _renderScene(route: Route): JSX.Element {
    switch (route.id) {
      case Constants.Views.Find.Home:
        return (
          <HomeScreen buildingList={this._buildingList} />
        );
      case Constants.Views.Find.Building:
        return (
          <BuildingScreen />
        );
      case Constants.Views.Find.StartingPoint:
        return (
          <StartingPointScreen buildingList={this._buildingList} />
        );
      case Constants.Views.Find.Steps:
        return (
          <StepsScreen />
        );
      default:
        // TODO: generic error view?
        return (
          <View style={_styles.container} />
        );
    }
  }

  /**
   * Renders a navigator to switch between views in the Find screen.
   *
   * @returns {JSX.Element} the hierarchy of views to render
   */
  render(): JSX.Element {
    return (
      <Navigator
          configureScene={this._configureScene}
          initialRoute={{ id: Constants.Views.Find.Home }}
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
    view: store.navigation.findView,
  };
};

const mapDispatchToProps = (dispatch: any): any => {
  return {
    onBackNavigation: (view: number): any => {
      if (view === Constants.Views.Find.Home) {
        dispatch(actions.showBack(false, 'find'));
        dispatch(actions.setHeaderTitle(undefined, 'find'));
      } else {
        dispatch(actions.showBack(true, 'find'));
      }

      if (view === Constants.Views.Find.Steps) {
        dispatch(actions.showSearch(false, 'find'));
      } else {
        dispatch(actions.showSearch(true, 'find'));
      }

      dispatch(actions.switchFindView(view));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Find) as any;
