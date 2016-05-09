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
 * @file SectionHeader.js
 * @module SectionHeader
 * @description Predefined style for section separating headers in the app.
 * @flow
 *
 */
'use strict';

// React Native imports
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Imports
const Constants = require('../Constants');
const Ionicons = require('react-native-vector-icons/Ionicons');
const MaterialIcons = require('react-native-vector-icons/MaterialIcons');
const Styles = require('../Styles');
const TextUtils = require('../util/TextUtils');

// Represents a value in the subtitle which should not be used.
const NULL_SUBTITLE_VALUE: string = 'value_null';
// List of icon families that the subtitle icon can belong to.
const VALID_ICON_CLASSES: Array<?string> = ['material', 'ionicon'];
// Maximum number of characters in the section name.
const MAX_NAME_LENGTH: number = 21;

// Type definition for component props.
type Props = {
  backgroundOverride: ?string,
  sectionIcon: ?string,
  sectionIconClass: ?string,
  sectionIconOnClick: () => any,
  sectionName: string,
  subtitleIcon: ?string,
  subtitleIconClass: ?string,
  subtitleName: ?string,
  subtitleOnClick: () => any,
  useBlackText: ?boolean,
};

// Type definition for component state.
type State = {
  sectionIcon: string,
  sectionIconClass: string,
  subtitleIcon: string,
  subtitleIconClass: string,
  subtitleName: string,
  textAndIconColor: string,
};

class SectionHeader extends React.Component {

  /**
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    backgroundOverride: React.PropTypes.string,
    sectionIcon: React.PropTypes.string,
    sectionIconClass: React.PropTypes.oneOf(VALID_ICON_CLASSES),
    sectionIconOnClick: React.PropTypes.func,
    sectionName: React.PropTypes.string.isRequired,
    subtitleIcon: React.PropTypes.string,
    subtitleIconClass: React.PropTypes.oneOf(VALID_ICON_CLASSES),
    subtitleName: React.PropTypes.string,
    subtitleOnClick: React.PropTypes.func,
    useBlackText: React.PropTypes.bool,
  };

  /**
   * Define type for the component state.
   */
  state: State;

  /**
   * Pass props and declares initial state.
   *
   * @param {Props} props properties passed from container to this component.
   */
  constructor(props: Props) {
    super(props);

    const sectIcon = this.props.sectionIcon || NULL_SUBTITLE_VALUE;
    const sectIconClass = this.props.sectionIconClass || NULL_SUBTITLE_VALUE;
    const subName = this.props.subtitleName || NULL_SUBTITLE_VALUE;
    const subIcon = this.props.subtitleIcon || NULL_SUBTITLE_VALUE;
    const subIconClass = this.props.subtitleIconClass || NULL_SUBTITLE_VALUE;
    const textAndIconColor = this.props.useBlackText
        ? Constants.Colors.primaryBlackText
        : Constants.Colors.primaryWhiteText;

    this.state = {
      sectionIcon: sectIcon,
      sectionIconClass: sectIconClass,
      subtitleName: subName,
      subtitleIcon: subIcon,
      subtitleIconClass: subIconClass,
      textAndIconColor: textAndIconColor,
    };

    // Explicitly binding 'this' to all methods that need it
    (this:any).getSubtitleName = this.getSubtitleName.bind(this);
    (this:any).getSubtitleIcon = this.getSubtitleIcon.bind(this);
    (this:any).getSubtitleIconClass = this.getSubtitleIconClass.bind(this);
    (this:any).updateSubtitle = this.updateSubtitle.bind(this);
  }

  /**
   * Gets the subtitle of the header.
   *
   * @returns {?string} the subtitle name from the state.
   */
  getSubtitleName(): ?string {
    return this.state.subtitleName;
  }

  /**
   * Gets the name of the icon on the subtitle.
   *
   * @returns {?string} the subtitle icon name from the state.
   */
  getSubtitleIcon(): ?string {
    return this.state.subtitleIcon;
  }

  /**
   * Gets the string representation of the icon class.
   *
   * @returns {?string} the subtitle icon class from the state.
   */
  getSubtitleIconClass(): ?string {
    return this.state.subtitleIconClass;
  }

  /**
   * Returns a value which can be used in updateSubtitle(name, icon, iconClass)
   * to remove a subtitle value.
   *
   * @returns {string} {NULL_SUBTITLE_VALUE}.
   */
  getEmptySubtitleValue(): string {
    return NULL_SUBTITLE_VALUE;
  }

  /**
   * Update properties of the subtitle in the header.
   *
   * @param {string} name      new name for the subtitle.
   * @param {string} icon      new icon name for the subtitle.
   * @param {string} iconClass new icon class name for the subtitle.
   */
  updateSubtitle(name: ?string, icon: ?string, iconClass: ?string): void {
    let updatedName: ?string = name;
    let updatedIcon: ?string = icon;
    let updatedIconClass: ?string = iconClass;

    if (VALID_ICON_CLASSES.indexOf(iconClass) < 0) {
      updatedIcon = updatedIconClass = NULL_SUBTITLE_VALUE;
    }

    // Set the subtitle params to {NULL_SUBTITLE_VALUE} if they are invalid.
    if (updatedName == null) {
      updatedName = NULL_SUBTITLE_VALUE;
    }

    if (updatedIcon == null) {
      updatedIcon = NULL_SUBTITLE_VALUE;
    }

    if (updatedIconClass == null) {
      updatedIconClass = NULL_SUBTITLE_VALUE;
    }

    // Update the state with the parameters
    this.setState({
      subtitleName: updatedName,
      subtitleIcon: updatedIcon,
      subtitleIconClass: updatedIconClass,
    });
  }

  /**
   * Builds the components of the section header, including the title, icon,
   * subtitle, and subtitle icon.
   *
   * @returns {ReactElement} the hierarchy of views to render.
   */
  render(): ReactElement {
    let icon: ?ReactElement = null;
    let subtitleName: ?ReactElement = null;
    let subtitleIcon: ?ReactElement = null;

    // Build the icon for the section
    if (this.state.sectionIcon !== NULL_SUBTITLE_VALUE && this.state.sectionIconClass !== NULL_SUBTITLE_VALUE) {
      if (this.state.sectionIconClass === 'material') {
        icon = (
          <MaterialIcons
              color={this.state.textAndIconColor}
              name={this.state.sectionIcon}
              size={24}
              style={_styles.headerIcon} />
        );
      } else {
        icon = (
          <Ionicons
              color={this.state.textAndIconColor}
              name={this.state.sectionIcon}
              size={24}
              style={_styles.headerIcon} />
        );
      }

      if (this.props.sectionIconOnClick) {
        icon = (
          <TouchableOpacity onPress={this.props.sectionIconOnClick}>
            {icon}
          </TouchableOpacity>
        );
      }
    }

    // Build the subtitle for the section
    if (this.state.subtitleName && this.state.subtitleName !== NULL_SUBTITLE_VALUE) {
      subtitleName = (
        <Text style={[Styles.smallText, _styles.subtitleName, {color: this.state.textAndIconColor}]}>
          {this.state.subtitleName.toUpperCase()}
        </Text>
      );
    }

    // Build the icon for the subtitle
    if (this.state.subtitleIcon && this.state.subtitleIcon !== NULL_SUBTITLE_VALUE
        && this.state.subtitleIconClass && this.state.subtitleIconClass !== NULL_SUBTITLE_VALUE) {
      if (this.state.subtitleIconClass === 'material') {
        subtitleIcon = (
          <MaterialIcons
              color={this.state.textAndIconColor}
              name={this.state.subtitleIcon}
              size={18}
              style={_styles.subtitleIcon} />
        );
      } else {
        subtitleIcon = (
          <Ionicons
              color={this.state.textAndIconColor}
              name={this.state.subtitleIcon}
              size={18}
              style={_styles.subtitleIcon} />
        );
      }
    }

    // Combine the subtitle name and icon
    let iconAndSubtitle = null;
    if (subtitleName !== null || subtitleIcon !== null) {
      if (this.props.subtitleOnClick) {
        iconAndSubtitle = (
          <TouchableOpacity
              activeOpacity={0.4}
              style={_styles.iconAndSubtitle}
              onPress={this.props.subtitleOnClick}>
            {subtitleName}
            {subtitleIcon}
          </TouchableOpacity>
        );
      } else {
        iconAndSubtitle = (
          <View style={_styles.iconAndSubtitle}>
            {subtitleName}
            {subtitleIcon}
          </View>
        );
      }
    }

    // Set the background color of the header to a default value if not provided
    const headerBackground = this.props.backgroundOverride || Constants.Colors.defaultComponentBackgroundColor;

    return (
      <View style={[_styles.header, {backgroundColor: headerBackground}]}>
        {icon}
        <Text style={[Styles.largeText, {color: this.state.textAndIconColor, marginLeft: 20}]}>
          {TextUtils.getTextWithEllipses(this.props.sectionName, MAX_NAME_LENGTH)}
        </Text>
        {iconAndSubtitle}
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
  headerIcon: {
    marginLeft: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  iconAndSubtitle: {
    position: 'absolute',
    right: 0,
    flex: 1,
    flexDirection: 'row',
  },
  subtitleName: {
    marginTop: 17,
    marginRight: 20,
    marginBottom: 16,
    marginLeft: 20,
  },
  subtitleIcon: {
    marginTop: 15,
    marginBottom: 15,
    marginRight: 20,
  },
});

// Expose component to app
module.exports = SectionHeader;
