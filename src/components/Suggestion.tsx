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
 * @created 2017-03-18
 * @file Suggestion.tsx
 * @description Indicates status on suggesting a value to the user
 */
'use strict';

// React imports
import React from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Imports
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as Constants from '../constants';
import * as Display from '../util/Display';
import * as Translations from '../util/Translations';

// Types
import { Language } from '../util/Translations';

interface Props {
  backgroundColor?: string;         // Background color for the view
  language: Language;               // The user's currently selected language
  loading: boolean;                 // Indicates whether the view is waiting for a suggestion to display or not
  loadingText?: string | undefined; // Custom text to display while waiting. Default is 'Loading'
  suggestion?: string | undefined;  // Suggestion text
  onRefresh?(): void;               // Callback when the suggestion is refreshed
  onSelect?(): void;                // Callback when the suggestion is selected
}

interface State {}

// Default opacity when selecting while a suggestion is available
const DEFAULT_TOUCH_OPACITY = 0.4;

// Height of the suggestion view
const SUGGESTION_HEIGHT = 50;

export default class Suggestion extends React.PureComponent<Props, State> {

  /**
   * Returns the loading text.
   *
   * @returns {string} the loading text prop, or the translation of 'loading'
   */
  _getLoadingText(): string {
    return this.props.loadingText || Translations.get(this.props.language, 'loading');
  }

  /**
   * Gets the suggestion, with formatting.
   *
   * @returns {string} 'Suggested: <suggestion>'
   */
  _getSuggestion(): string {
    return `${Translations.get(this.props.language, 'suggested')}: ${this.props.suggestion || ''}`;
  }

  /**
   * Invokes the onRefresh callback, if available.
   */
  _onRefresh(): void {
    if (this.props.onRefresh) {
      this.props.onRefresh();
    }
  }

  /**
   * Invokes the onSelect callback, if available.
   */
  _onSelect(): void {
    if (!this.props.loading && this.props.onSelect) {
      this.props.onSelect();
    }
  }

  /**
   * Renders an activity indicator when a suggestion is unavailable.
   *
   * @param {string} color the foreground color of the activity indicator
   * @returns {JSX.Element|undefined} an activity indicator component, or undefined if the suggestion is not loading
   */
  _renderActivityIndicator(color: string): JSX.Element | undefined {
    if (this.props.loading) {
      return (
        <ActivityIndicator
            animating={this.props.loading}
            color={color}
            style={_styles.activityIndicator} />
      );
    } else if (this.props.onRefresh) {
      return (
        <TouchableOpacity
            style={_styles.refreshContainer}
            onPress={this._onRefresh.bind(this)}>
          <Ionicons
              color={color}
              name={Platform.OS === 'ios' ? 'ios-refresh' : 'md-refresh'}
              size={Constants.Sizes.Icons.Medium}
              style={_styles.refresh} />
        </TouchableOpacity>
      );
    } else {
      return undefined;
    }
  }

  /**
   * Renders the suggestion provided, or loading text if a suggestion is still loading.
   *
   * @param {string} color the foreground color of the text
   * @returns {JSX.Element} a text component
   */
  _renderSuggestion(color: string): JSX.Element {
    return (
      <View style={_styles.suggestionContainer}>
        <Text style={[ _styles.suggestion, { color }]}>
          {(this.props.loading ? this._getLoadingText() : this._getSuggestion())}
        </Text>
      </View>
    );
  }

  /**
   * Renders a chevron to indicate the item is selectable
   *
   * @param {string} color foreground color of the icon
   * @returns {JSX.Element|undefined} an icon component, or undefined if the suggestion is loading
   */
  _renderChevron(color: string): JSX.Element | undefined {
    if (this.props.loading) {
      return undefined;
    }

    return (
      <MaterialIcons
          color={color}
          name={'chevron-right'}
          size={Constants.Sizes.Icons.Small}
          style={_styles.chevron} />
    );
  }

  /**
   * Builds the components of the section header, including the title, icon, subtitle, and subtitle icon.
   *
   * @returns {JSX.Element} the hierarchy of views to render
   */
  render(): JSX.Element {
    // Set the background color of the header to a default value if not provided
    const headerBackground = this.props.backgroundColor || Constants.Colors.darkTransparentBackground;
    let primaryForeground = Constants.Colors.primaryBlackText;
    let secondaryForeground = Constants.Colors.secondaryBlackText;
    if (Display.isColorDark(headerBackground)) {
      primaryForeground = Constants.Colors.primaryWhiteText;
      secondaryForeground = Constants.Colors.secondaryWhiteText;
    }

    return (
      <View style={[ _styles.header, { backgroundColor: headerBackground }]}>
        {this._renderActivityIndicator(primaryForeground)}
        <TouchableOpacity
            activeOpacity={this.props.loading ? 1 : DEFAULT_TOUCH_OPACITY}
            style={_styles.touchableSuggestion}
            onPress={this._onSelect.bind(this)}>
          {this._renderSuggestion(primaryForeground)}
          {this._renderChevron(secondaryForeground)}
        </TouchableOpacity>
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  activityIndicator: {
    marginLeft: Constants.Sizes.Margins.Expanded,
  },
  chevron: {
    marginRight: Constants.Sizes.Margins.Expanded,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    height: SUGGESTION_HEIGHT,
  },
  refresh: {
    marginLeft: Constants.Sizes.Margins.Expanded,
  },
  refreshContainer: {
    height: SUGGESTION_HEIGHT,
    justifyContent: 'center',
  },
  suggestion: {
    fontSize: Constants.Sizes.Text.Body,
    marginLeft: Constants.Sizes.Margins.Expanded,
  },
  suggestionContainer: {
    flex: 1,
    marginRight: Constants.Sizes.Margins.Expanded,
  },
  touchableSuggestion: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    height: SUGGESTION_HEIGHT,
  },
});
