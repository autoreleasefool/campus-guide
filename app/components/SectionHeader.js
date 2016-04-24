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
 * @file
 * SectionHeader.js
 *
 * @description
 * Predefined style for section separating headers in the app.
 *
 * @author
 * Joseph Roque
 *
 * @external
 * @flow
 *
 */
'use strict';

// React Native imports
const React = require('react-native');
const {
  Component,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} = React;

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

// Type definition for component props.
type Props = {
  sectionName: string,
  sectionIcon: ?string,
  sectionIconClass: ?string,
  sectionIconOnClick: () => any,
  subtitleOnClick: () => any,
  subtitleName: ?string,
  subtitleIcon: ?string,
  subtitleIconClass: ?string,
  backgroundOverride: ?string,
};

// Type definition for component state.
type State = {
  sectionIcon: ?string,
  sectionIconClass: ?string,
  subtitleName: ?string,
  subtitleIcon: ?string,
  subtitleIconClass: ?string,
};

class SectionHeader extends Component {
  state: State;

  /**
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    sectionName: React.PropTypes.string.isRequired,
    sectionIcon: React.PropTypes.string,
    sectionIconClass: React.PropTypes.oneOf(VALID_ICON_CLASSES),
    sectionIconOnClick: React.PropTypes.func,
    subtitleOnClick: React.PropTypes.func,
    subtitleName: React.PropTypes.string,
    subtitleIcon: React.PropTypes.string,
    subtitleIconClass: React.PropTypes.oneOf(VALID_ICON_CLASSES),
    backgroundOverride: React.PropTypes.string,
  };

  /**
   * Pass props and declares initial state.
   *
   * @param {Props} props properties passed from container to this component.
   */
  constructor(props: Props) {
    super(props);

    let sectIcon = this.props.sectionIcon || NULL_SUBTITLE_VALUE;
    let sectIconClass = this.props.sectionIconClass || NULL_SUBTITLE_VALUE;
    let subName = this.props.subtitleName || NULL_SUBTITLE_VALUE;
    let subIcon = this.props.subtitleIcon || NULL_SUBTITLE_VALUE;
    let subIconClass = this.props.subtitleIconClass || NULL_SUBTITLE_VALUE;

    this.state = {
      sectionIcon: sectIcon,
      sectionIconClass: sectIconClass,
      subtitleName: subName,
      subtitleIcon: subIcon,
      subtitleIconClass: subIconClass,
    };

    // Explicitly binding 'this' to all methods that need it
    (this:any).getSubtitleName = this.getSubtitleName.bind(this);
    (this:any).getSubtitleIcon = this.getSubtitleIcon.bind(this);
    (this:any).getSubtitleIconClass = this.getSubtitleIconClass.bind(this);
    (this:any).updateSubtitle = this.updateSubtitle.bind(this);
  };

  /**
   * Gets the subtitle of the header.
   *
   * @return {?string} the subtitle name from the state.
   */
  getSubtitleName(): ?string {
    return this.state.subtitleName;
  };

  /**
   * Gets the name of the icon on the subtitle.
   *
   * @return {?string} the subtitle icon name from the state.
   */
  getSubtitleIcon(): ?string {
    return this.state.subtitleIcon;
  };

  /**
   * Gets the string representation of the icon class.
   *
   * @return {?string} the subtitle icon class from the state.
   */
  getSubtitleIconClass(): ?string {
    return this.state.subtitleIconClass;
  };

  /**
   * Returns a value which can be used in updateSubtitle(name, icon, iconClass)
   * to remove a subtitle value.
   *
   * @return {string} {NULL_SUBTITLE_VALUE}.
   */
  getEmptySubtitleValue(): string {
    return NULL_SUBTITLE_VALUE;
  };

  /**
   * Update properties of the subtitle in the header.
   *
   * @param {string} name      new name for the subtitle.
   * @param {string} icon      new icon name for the subtitle.
   * @param {string} iconClass new icon class name for the subtitle.
   */
  updateSubtitle(name: ?string, icon: ?string, iconClass: ?string) {
    if (VALID_ICON_CLASSES.indexOf(iconClass) < 0) {
      icon = iconClass = NULL_SUBTITLE_VALUE;
    }

    // Set the subtitle params to {NULL_SUBTITLE_VALUE} if they are invalid.
    if (name == null) {
      name = NULL_SUBTITLE_VALUE;
    }

    if (icon == null) {
      icon = NULL_SUBTITLE_VALUE;
    }

    if (iconClass == null) {
      iconClass == NULL_SUBTITLE_VALUE;
    }

    // Update the state with the parameters
    this.setState({
      subtitleName: name,
      subtitleIcon: icon,
      subtitleIconClass: iconClass,
    });
  };

  /**
   * Builds the components of the section header, including the title, icon,
   * subtitle, and subtitle icon.
   *
   * @return {ReactElement} the hierarchy of views to render.
   */
  render() {
    let icon: ?ReactElement = null;
    let subtitleName: ?ReactElement = null;
    let subtitleIcon: ?ReactElement = null;

    // Build the icon for the section
    if (this.state.sectionIcon !== NULL_SUBTITLE_VALUE && this.state.sectionIconClass !== NULL_SUBTITLE_VALUE) {
      if (this.state.sectionIconClass === 'material') {
        icon = (
          <MaterialIcons
              name={this.state.sectionIcon}
              size={24}
              color={'white'}
              style={_styles.headerIcon} />
        );
      } else {
        icon = (
          <Ionicons
              name={this.state.sectionIcon}
              size={24}
              color={'white'}
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
        <Text style={[Styles.smallText, {color: 'white', marginTop: 17, marginBottom: 16, marginLeft: 20, marginRight: 20}]}>
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
              name={this.state.subtitleIcon}
              size={18}
              color={'white'}
              style={{marginTop: 15, marginBottom: 15, marginRight: 20}} />
        );
      } else {
        subtitleIcon = (
          <Ionicons
              name={this.state.subtitleIcon}
              size={18}
              color={'white'}
              style={{marginTop: 15, marginBottom: 15, marginRight: 20}} />
        );
      }
    }

    // Combine the subtitle name and icon
    let iconAndSubtitle = null;
    if (subtitleName !== null || subtitleIcon !== null) {
      if (this.props.subtitleOnClick) {
        iconAndSubtitle = (
          <TouchableOpacity
              onPress={this.props.subtitleOnClick}
              activeOpacity={0.4}
              style={_styles.iconAndSubtitle}>
            {subtitleName}
            {subtitleIcon}
          </TouchableOpacity>
        )
      } else {
        iconAndSubtitle = (
          <View style={_styles.iconAndSubtitle}>
            {subtitleName}
            {subtitleIcon}
          </View>
        )
      }
    }

    // Set the background color of the header to a default value if not provided
    let headerBackground = this.props.backgroundOverride || Constants.Colors.defaultComponentBackgroundColor;

    return (
      <View style={[_styles.header, {backgroundColor: headerBackground}]}>
        {icon}
        <Text style={[Styles.largeText, {color: 'white', marginLeft: 20}]}>
          {TextUtils.getTextWithEllipses(this.props.sectionName, 21)}
        </Text>
        {iconAndSubtitle}
      </View>
    );
  };
};

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
});

// Expose component to app
module.exports = SectionHeader;
