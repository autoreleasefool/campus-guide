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
 * @file FindNavigator.js
 * @description Navigator for managing views for finding rooms on campus.
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
  onChangeScene: (showBackButton: boolean, placeholder: ?string) => void,
};

// Imports
const BaseNavigator = require('BaseNavigator');
const Constants = require('Constants');
const Preferences = require('Preferences');
const TranslationUtils = require('TranslationUtils');

// Screen imports
const BuildingDetails = require('BuildingDetails');
const FindHome = require('FindHome');
const NavigationHome = require('NavigationHome');

class FindNavigator extends BaseNavigator {

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
    super(props, Constants.Views.Find.Home);

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

    this._updateSearchPlaceholder(event.data.route.id, Translations);
    this.props.onChangeScene(event.data.route.id !== Constants.Views.Find.Home, this.getSearchPlaceholder());
  }

  /**
   * Updates the expected search placeholder text.
   *
   * @param {number|string} id    new route identifier
   * @param {Object} Translations translations in the current language of certain text.
   */
  _updateSearchPlaceholder(id: number | string, Translations: Object): void {
    switch (id) {
      case Constants.Views.Find.Home:
        this._searchPlaceholder = Translations.search_placeholder_buildings;
        break;
      case Constants.Views.Find.Building:
        this._searchPlaceholder = Translations.search_placeholder_rooms;
        break;
      case Constants.Views.Find.Navigation:
        this._searchPlaceholder = Translations.search_placeholder_buildings_rooms;
        break;
      default:
        this._searchPlaceholder = null;
    }
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
          <FindHome onShowBuilding={buildingCode => super._nextScreen(Constants.Views.Find.Building, buildingCode)} />
        );
      case Constants.Views.Find.Building:
        return (
          <BuildingDetails
              buildingDetails={route.data}
              onDestinationSelected={(buildingCode, roomName) => super._nextScreen(Constants.Views.Find.Navigation,
                  {buildingCode: buildingCode, roomName: roomName})} />
        );
      case Constants.Views.Find.Navigation:
        return (
          <NavigationHome destination={route.data} />
        );
      default:
        return (
          <View style={_styles.container} />
        );
    }
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

module.exports = FindNavigator;
