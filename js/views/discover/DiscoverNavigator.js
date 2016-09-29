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
const BaseNavigator = require('BaseNavigator');
const Constants = require('Constants');
const Preferences = require('Preferences');
const TranslationUtils = require('TranslationUtils');

// Screen imports
const BusCampusDetails = require('BusCampusDetails');
const BusCampusList = require('BusCampusList');
const DetailsScreen = require('DetailsScreen');
const DiscoverHome = require('DiscoverHome');
const LinkCategory = require('LinkCategory');
const LinksHome = require('LinksHome');
const ShuttleCampusList = require('ShuttleCampusList');
const ShuttleCampusDetails = require('ShuttleCampusDetails');

class DiscoverNavigator extends BaseNavigator {

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
    super(props, Constants.Views.Discover.Home);

    (this:any).getSearchPlaceholder = this.getSearchPlaceholder.bind(this);
    (this:any)._handleNavigationEvent = this._handleNavigationEvent.bind(this);
  }

  /** Placeholder text for the search box. */
  _searchPlaceholder: ?string = null;

  /**
   * Returns placeholder text that should be used for the search bar.
   *
   * @returns {?string} the text to use as a placeholder, or null to use the default
   */
  getSearchPlaceholder(): ?string {
    return this._searchPlaceholder;
  }

  /**
   * Handles navigation events.
   *
   * @param {any} event the event taking place
   */
  _handleNavigationEvent(event: any): void {
    // Get current language for translations
    const Translations: Object = TranslationUtils.getTranslations(Preferences.getSelectedLanguage());
    const routeId = event.data.route.id;

    if (routeId === Constants.Views.Discover.BusCampusList || routeId === Constants.Views.Discover.BusCampusDetails) {
      this._searchPlaceholder = Translations.search_placeholder_buses;
    } else if (typeof routeId === 'string' && routeId.indexOf(Constants.Views.Discover.LinkCategory + '-') === 0) {
      this._searchPlaceholder = Translations.search_placeholder_links;
    } else {
      this._searchPlaceholder = null;
    }

    this.props.onChangeScene(event.data.route.id !== Constants.Views.Discover.Home, this.getSearchPlaceholder());
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
          <DiscoverHome onScreenSelected={(id, data) => super._nextScreen(id, data)} />
        );
      case Constants.Views.Discover.BusCampusList:
        return (
          <BusCampusList
              showCampus={(name, color) =>
                  super._nextScreen(Constants.Views.Discover.BusCampusDetails, {name: name, color: color})} />
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
              showLinkCategory={category => super._nextScreen(Constants.Views.Discover.LinkCategory + '-0',
                      {category: category, categoryImage: category.image, index: 0})} />
        );
      case Constants.Views.Discover.ShuttleCampusList:
        return (
          <ShuttleCampusList
              showCampus={(campusName, campusColor) =>
                  super._nextScreen(Constants.Views.Discover.ShuttleCampusDetails,
                      {name: campusName, color: campusColor})}
              showDetails={(title, image, text, backgroundColor) =>
                  super._nextScreen(Constants.Views.Discover.ShuttleInfo,
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
                    super._nextScreen(Constants.Views.Discover.LinkCategory + '-' + (route.data.index + 1),
                        {category: category, categoryImage: route.data.categoryImage, index: route.data.index + 1})} />
          );
        }

        return (<View style={_styles.container} />);
    }
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

module.exports = DiscoverNavigator;
