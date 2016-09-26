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
 * @file DiscoverNavigator.js
 * @providesModule Discover
 * @description Navigator for managing views for learning more about the campus.
 *
 * @flow
 */
'use strict';

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

// Type definition for component props.
type Props = {
  onChangeScene: (showBackButton: boolean) => void,
};

// Imports
const Constants = require('Constants');

// Screen imports
const BusCampusDetails = require('BusCampusDetails');
const BusCampusList = require('BusCampusList');
const DetailsScreen = require('DetailsScreen');
const DiscoverHome = require('DiscoverHome');
const LinkCategory = require('LinkCategory');
const LinksHome = require('LinksHome');
const ShuttleCampusList = require('ShuttleCampusList');
const ShuttleCampusDetails = require('ShuttleCampusDetails');

class DiscoverNavigator extends React.Component {

  /**
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    onChangeScene: React.PropTypes.func.isRequired,
  };

  /**
   * Pass props and declares initial state.
   *
   * @param {Props} props properties passed from container to this component.
   */
  constructor(props: Props) {
    super(props);

    (this:any)._nextScreen = this._nextScreen.bind(this);
    (this:any).navigateBack = this.navigateBack.bind(this);
    (this:any).showBackButton = this.showBackButton.bind(this);
    (this:any)._handleNavigationEvent = this._handleNavigationEvent.bind(this);
  }

  /**
   * Adds a listener for navigation events.
   */
  componentDidMount(): void {
    this.refs.Navigator.navigationContext.addListener('willfocus', this._handleNavigationEvent);
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
    this.props.onChangeScene(event.data.route.id !== Constants.Views.Find.Home);
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
   * Renders a view according to the current route of the navigator.
   *
   * @param {Route} route object with properties to identify the route to display.
   * @returns {ReactElement<any>} the view to render, based on {route}.
   */
  _renderScene(route: Route): ReactElement < any > {
    switch (route.id) {
      case Constants.Views.Discover.Home:
        return (
          <DiscoverHome onScreenSelected={this._nextScreen} />
        );
      case Constants.Views.Discover.BusCampusList:
        return (
          <BusCampusList
              showCampus={(name, color) =>
                  this._nextScreen(Constants.Views.Discover.BusCampusDetails, {name: name, color: color})} />
        );
      case Constants.Views.Discover.BusCampusDetails:
        return (
          <BusCampusDetails
              campusColor={route.data.color}
              campusName={route.data.name} />
        );
      case Constants.Views.Discover.LinksHome:
        return (
          <LinksHome
              showLinkCategory={category => this._nextScreen(Constants.Views.Discover.LinkCategory + '-0',
                      {category: category, categoryImage: category.image, index: 0})} />
        );
      case Constants.Views.Discover.ShuttleCampusList:
        return (
          <ShuttleCampusList
              showCampus={(campusName, campusColor) =>
                  this._nextScreen(Constants.Views.Discover.ShuttleCampusDetails,
                      {name: campusName, color: campusColor})}
              showDetails={(title, image, text, backgroundColor) =>
                  this._nextScreen(Constants.Views.Discover.ShuttleInfo,
                      {title: title, image: image, text: text, backgroundColor: backgroundColor})} />
        );
      case Constants.Views.Discover.ShuttleCampusDetails:
        return (
          <ShuttleCampusDetails
              campusColor={route.data.color}
              campusName={route.data.name} />
        );
      case Constants.Views.Discover.ShuttleInfo:
        return (
          <DetailsScreen
              backgroundColor={route.data.backgroundColor}
              image={route.data.image}
              text={route.data.text}
              title={route.data.title} />
        );
      default:
        if (typeof route.id === 'string' && route.id.indexOf(Constants.Views.Discover.LinkCategory + '-') === 0) {
          return (
            <LinkCategory
                category={route.data.category}
                categoryImage={route.data.categoryImage}
                showLinkCategory={category =>
                    this._nextScreen(Constants.Views.Discover.LinkCategory + '-' + (route.data.index + 1),
                        {category: category, categoryImage: route.data.categoryImage, index: route.data.index + 1})} />
          );
        }


        return (<View style={_styles.container} />);
    }
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
          initialRoute={{id: Constants.Views.Discover.Home}}
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

module.exports = DiscoverNavigator;
