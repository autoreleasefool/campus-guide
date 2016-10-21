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
 * @file Header.js
 * @providesModule Header
 * @description Predefined style for section separating headers in the app.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Type imports
import type {
  Icon,
  VoidFunction,
} from 'types';

// Imports
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as DisplayUtils from 'DisplayUtils';
import * as Constants from 'Constants';

export default class Header extends React.Component {

  /**
   * Properties which the parent component should make available to this component.
   */
  props: {
    backgroundColor?: string,         // Background color for the view
    title: string,                    // Title for the header
    icon?: Icon,                      // Large icon to represent the section
    iconCallback?: VoidFunction,      // Callback function for icon on press
    subtitle?: string,                // Subtitle text
    subtitleIcon?: Icon,              // Small icon for the subtitle
    subtitleCallback?: VoidFunction,  // Callback function for subtitle on press
  };

  /**
   * Creates a view containing this Header's icon.
   *
   * @param {string} color color of the icon
   * @returns {?ReactElement<any>} a view with the Header's icon, or null
   */
  _renderIcon(color: string): ?ReactElement < any > {
    let icon: ?ReactElement < any > = null;

    if (this.props.icon != null) {
      if (this.props.icon.class === 'material') {
        icon = (
          <MaterialIcons
              color={color}
              name={this.props.icon.name}
              size={Constants.Sizes.Icons.Medium}
              style={_styles.icon} />
        );
      } else {
        icon = (
          <Ionicons
              color={color}
              name={this.props.icon.name}
              size={Constants.Sizes.Icons.Medium}
              style={_styles.icon} />
        );
      }

      // Wrap the icon in a TouchableOpacity if there an onClick function
      if (this.props.iconCallback) {
        icon = (
          <TouchableOpacity onPress={this.props.iconCallback}>
            {icon}
          </TouchableOpacity>
        );
      }
    }

    return icon;
  }

  /**
   * Builds a view containing the Header's subtitle text and icon, as long as one of them is defined.
   *
   * @param {string} color color of the subtitle
   * @returns {?ReactElement<any>} a view with the subtitle text and icon, or null if neither exists.
   */
  _renderSubtitle(color: string): ?ReactElement < any > {
    let subtitle: ?ReactElement < any > = null;
    const subtitleText: ?ReactElement < any > = this._renderSubtitleText(color);
    const subtitleIcon: ?ReactElement < any > = this._renderSubtitleIcon(color);

    // If either subtitle component exists, render the subtitle
    if (subtitleText != null || subtitleIcon != null) {
      if (this.props.subtitleCallback) {
        // If there is an action that occurs when a subtitle is clicked, add a TouchableOpacity
        subtitle = (
          <TouchableOpacity
              style={_styles.subtitle}
              onPress={this.props.subtitleCallback}>
            {subtitleText}
            {subtitleIcon}
          </TouchableOpacity>
        );
      } else {
        // Otherwise, just draw the text and icon
        subtitle = (
          <View style={_styles.subtitle}>
            {subtitleText}
            {subtitleIcon}
          </View>
        );
      }
    }

    return subtitle;
  }

  /**
   * Creates a view containing this Header's subtitle icon, so long as it is not null.
   *
   * @param {string} color color of the subtitle
   * @returns {?ReactElement<any>} a view with the Header's subtitle icon, or null
   */
  _renderSubtitleIcon(color: string): ?ReactElement < any > {
    let subtitleIcon: ?ReactElement < any > = null;

    if (this.props.subtitleIcon != null) {
      if (this.props.subtitleIcon.class === 'material') {
        subtitleIcon = (
          <MaterialIcons
              color={color}
              name={this.props.subtitleIcon.name}
              size={Constants.Sizes.Icons.Small}
              style={_styles.subtitleIcon} />
        );
      } else {
        subtitleIcon = (
          <Ionicons
              color={color}
              name={this.props.subtitleIcon.name}
              size={Constants.Sizes.Icons.Small}
              style={_styles.subtitleIcon} />
        );
      }
    }

    return subtitleIcon;
  }

  /**
   * Creates a text view containing this Header's subtitle text, so long as it is not null.
   *
   * @param {string} color color of the subtitle
   * @returns {?ReactElement<any>} a text view with the Header's subtitle text, or null
   */
  _renderSubtitleText(color: string): ?ReactElement < any > {
    let subtitleText: ?ReactElement < any > = null;

    if (this.props.subtitle != null) {
      subtitleText = (
        <Text style={[_styles.subtitleText, {color: color}]}>
          {this.props.subtitle.toUpperCase()}
        </Text>
      );
    }

    return subtitleText;
  }

  /**
   * Builds the components of the section header, including the title, icon, subtitle, and subtitle icon.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement < any > {
    // Set the background color of the header to a default value if not provided
    const headerBackground = this.props.backgroundColor || Constants.Colors.darkTransparentBackground;
    let primaryForeground = Constants.Colors.primaryBlackText;
    let secondaryForeground = Constants.Colors.secondaryBlackText;
    if (DisplayUtils.isColorDark(headerBackground)) {
      primaryForeground = Constants.Colors.primaryWhiteText;
      secondaryForeground = Constants.Colors.secondaryWhiteText;
    }

    return (
      <View style={[_styles.header, {backgroundColor: headerBackground}]}>
        {this._renderIcon(primaryForeground)}
        <View style={_styles.titleContainer}>
          <Text
              ellipsizeMode={'tail'}
              numberOfLines={1}
              style={[_styles.title, {color: primaryForeground}]}>
            {this.props.title}
          </Text>
        </View>
        {this._renderSubtitle(secondaryForeground)}
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  header: {
    height: 50,
    alignItems: 'center',
    flexDirection: 'row',
  },
  icon: {
    marginBottom: Constants.Sizes.Margins.Regular,
    marginLeft: Constants.Sizes.Margins.Expanded,
    marginTop: Constants.Sizes.Margins.Regular,
  },
  subtitle: {
    flexDirection: 'row',
  },
  subtitleIcon: {
    marginBottom: Constants.Sizes.Margins.Regular,
    marginRight: Constants.Sizes.Margins.Expanded,
    marginTop: Constants.Sizes.Margins.Regular,
  },
  subtitleText: {
    fontSize: Constants.Sizes.Text.Caption,
  },
  title: {
    marginLeft: Constants.Sizes.Margins.Expanded,
    fontSize: Constants.Sizes.Text.Title,
  },
  titleContainer: {
    flex: 1,
  },
});
