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
 * @file BaseNavigator.js
 * @providesModule BaseNavigator
 * @description Navigator for managing views in a tab.
 *
 * @flow
 */

// React imports
import React from 'react';
import {
  Navigator,
  StyleSheet,
  View,
} from 'react-native';

// Type imports
import type {
  Route,
} from 'types';

class BaseNavigator extends React.Component {

  /**
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    onChangeScene: React.PropTypes.func.isRequired,
  };

  constructor(props: {}, initialRoute: number) {
    super(props);
    this._initialRoute = initialRoute;

    (this:any)._nextScreen = this._nextScreen.bind(this);
    (this:any).navigateBack = this.navigateBack.bind(this);
    (this:any).showBackButton = this.showBackButton.bind(this);
  }

  /**
   * Adds a listener for navigation events.
   */
  componentDidMount(): void {
    this.refs.Navigator.navigationContext.addListener('willfocus', this._handleNavigationEvent);
  }

  /** Route that the Navigator should display on load. */
  _initialRoute: number = 0;

  /**
   * Returns placeholder text that should be used for the search bar.
   *
   * @returns {?string} the text to use as a placeholder, or null to use the default
   */
  getSearchPlaceholder(): ?string {
    return null;
  }

  /**
   * Pop the navigator.
   *
   * @returns {boolean} true if there are still more routes to pop, false otherwise.
   */
  navigateBack(): boolean {
    const moreRoutes = this.refs.Navigator.getCurrentRoutes().length - 1 > 1;

    this.refs.Navigator.pop();
    return moreRoutes;
  }

  /**
   * Indicates if the app should show a back button.
   *
   * @returns {boolean} true to indicate a back button should be shown, false otherwise
   */
  showBackButton(): boolean {
    return this.refs.Navigator.getCurrentRoutes().length > 1;
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
  _handleNavigationEvent(event: any): void {
    console.log('Unhandled navigation event: ' + event);
  }

  /**
   * Navigate forward to the next screen.
   *
   * @param {number} id   route id
   * @param {Object} data data to render the route with
   */
  _nextScreen(id: number | string, data: Object): void {
    this.refs.Navigator.push({
      id: id,
      data: data,
    });
  }

  /**
   * Renders an empty view.
   *
   * @param {Route} route any
   * @returns {ReactElement<any>} an empty view
   */
  _renderScene(route: Route): ReactElement < any > {
    console.log('Route unused: ' + JSON.stringify(route));

    return (
      <View />
    );
  }

  /**
   * Returns a navigator for subnavigation between class finding components.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render
   */
  render(): ReactElement < any > {
    return (
      <Navigator
          configureScene={this._configureScene}
          initialRoute={{id: this._initialRoute}}
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

module.exports = BaseNavigator;
