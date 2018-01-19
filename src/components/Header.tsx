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
 * @file Header.tsx
 * @description Predefined style for section separating headers in the app.
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

// Imports
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import PaddedIcon from './PaddedIcon';
import * as Display from '../util/Display';
import * as Constants from '../constants';

// Height of the view
export const HeaderHeight = 50;

// Types
import { BasicIcon } from '../../typings/global';

interface Props {
  backgroundColor?: string;             // Background color for the view
  icon?: BasicIcon | undefined;         // Large icon to represent the section
  largeSubtitle?: boolean;              // Request a larger font size for subtitles
  subtitle?: string | undefined;        // Subtitle text
  subtitleIcon?: BasicIcon | undefined; // Small icon for the subtitle
  style?: any;                          // View style
  title: string;                        // Title for the header
  iconCallback?(): void;                // Callback function for icon on press
  subtitleCallback?(): void;            // Callback function for subtitle on press
}

interface State {}

export default class Header extends React.PureComponent<Props, State> {

  /**
   * Creates a view containing this Header's icon.
   *
   * @param {string} color color of the icon
   * @returns {JSX.Element|undefined} a view with the Header's icon, or undefined
   */
  _renderIcon(color: string): JSX.Element | undefined {
    let icon: JSX.Element | undefined;
    if (this.props.icon != undefined) {
      icon = (
        <PaddedIcon
            style={_styles.icon}
            color={color}
            icon={this.props.icon} />
      );

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
   * @returns {JSX.Element|undefined} a view with the subtitle text and icon, or undefined if neither exists
   */
  _renderSubtitle(color: string): JSX.Element | undefined {
    let subtitle: JSX.Element | undefined;
    const subtitleText: JSX.Element | undefined = this._renderSubtitleText(color);
    const subtitleIcon: JSX.Element | undefined = this._renderSubtitleIcon(color);

    // If either subtitle component exists, render the subtitle
    if (subtitleText != undefined || subtitleIcon != undefined) {
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
   * Creates a view containing this Header's subtitle icon, so long as it is not undefined.
   *
   * @param {string} color color of the subtitle
   * @returns {JSX.Element|undefined} a view with the Header's subtitle icon, or undefined
   */
  _renderSubtitleIcon(color: string): JSX.Element | undefined {
    let subtitleIcon: JSX.Element | undefined;

    if (this.props.subtitleIcon != undefined) {
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
   * Creates a text view containing this Header's subtitle text, so long as it is not undefined.
   *
   * @param {string} color color of the subtitle
   * @returns {JSX.Element|undefined} a text view with the Header's subtitle text, or undefined
   */
  _renderSubtitleText(color: string): JSX.Element | undefined {
    let subtitleText: JSX.Element | undefined;
    const style = {
      color,
      fontSize: this.props.largeSubtitle ? Constants.Sizes.Text.Body : Constants.Sizes.Text.Caption,
    };

    if (this.props.subtitle != undefined) {
      subtitleText = (
        <Text style={[ _styles.subtitleText, style ]}>
          {this.props.subtitle.toUpperCase()}
        </Text>
      );
    }

    return subtitleText;
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

    const icon = this._renderIcon(primaryForeground);
    const titleStyle = { marginLeft: icon == undefined ? Constants.Sizes.Margins.Expanded : 0 };

    return (
      <View style={[ _styles.header, { backgroundColor: headerBackground }, this.props.style ]}>
        {icon}
        <View style={_styles.titleContainer}>
          <Text
              ellipsizeMode={'tail'}
              numberOfLines={1}
              style={[ _styles.title, titleStyle, { color: primaryForeground }]}>
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
    alignItems: 'center',
    flexDirection: 'row',
    height: HeaderHeight,
  },
  icon: {
    height: HeaderHeight,
  },
  subtitle: {
    alignItems: 'center',
    flexDirection: 'row',
    height: HeaderHeight,
    justifyContent: 'center',
    paddingLeft: Constants.Sizes.Margins.Regular,
    paddingRight: Constants.Sizes.Margins.Regular,
  },
  subtitleIcon: {
    alignSelf: 'center',
    marginBottom: Constants.Sizes.Margins.Regular,
    marginRight: Constants.Sizes.Margins.Regular,
    marginTop: Constants.Sizes.Margins.Regular,
  },
  subtitleText: {
    alignSelf: 'center',
    marginRight: Constants.Sizes.Margins.Regular,
  },
  title: {
    fontSize: Constants.Sizes.Text.Title,
  },
  titleContainer: {
    flex: 1,
    marginRight: Constants.Sizes.Margins.Regular,
  },
});
