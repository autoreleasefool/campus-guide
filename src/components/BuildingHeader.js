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
 * @created 2016-10-20
 * @file BuildingHeader.js
 * @providesModule BuildingHeader
 * @description Displays an image and various details about the facilities a particular building provides.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  Alert,
  Dimensions,
  Image,
  LayoutAnimation,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

// Types
import type { Facility, Language } from 'types';

// Properties which describe the building
type Property = {
  name: string,         // Name of the property
  description: string,  // Description of the building property
};

// Type definition for component props.
type Props = {
  facilities?: Array < Facility >,  // List of facilities the building offers
  hideTitle?: boolean,              // True to hide the title
  image: any,                       // An image of the building
  language: Language,               // The user's currently selected language
  name?: string,                    // Name of the building
  properties: ?Array < Property >,  // List of properties to display about the building
  shorthand?: string,               // Unique shorthand identifier for the building
};

// Type definition for component state.
type State = {
  bannerPosition: number,
};

// Imports
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { default as Header, HeaderHeight } from 'Header';
import * as Configuration from 'Configuration';
import * as Constants from 'Constants';
import * as DisplayUtils from 'DisplayUtils';
import * as Translations from 'Translations';

const { width } = Dimensions.get('window');

// Percentage of banner that banner will take
const BANNER_TEXT_WIDTH_PCT: number = 0.75;
// Number of milliseconds before the banner swaps
const BANNER_SWAP_TIME: number = 2000;
// Amount of whitespace between items in the building details banner
const BANNER_TEXT_SEPARATOR: number = 5;

export default class BuildingHeader extends React.Component {

  /**
   * Properties this component expects to be provided by its parent.
   */
  props: Props;

  /**
   * Current state of the component.
   */
  state: State;

  /**
   * Constructor.
   *
   * @param {props} props component props
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      bannerPosition: 0,
    };

    // Explicitly bind 'this' to methods that require it
    (this:any)._swapBanner = this._swapBanner.bind(this);
  }

  /**
   * Sets up timer to swap banner, display additional info on load.
   */
  componentDidMount(): void {
    this._swapBannerTimer = setTimeout(() => {
      this._swapBanner();
    }, BANNER_SWAP_TIME);
  }

  /**
   * Clears the timer if it is active.
   */
  componentWillUnmount(): void {
    clearTimeout(this._swapBannerTimer);
  }

  /** Timer which swaps the banner after a set amount of time. */
  _swapBannerTimer: number;

  /**
   * Displays a pop-up to the user, describing what a certain facility icon means.
   *
   * @param {Facility} facility   id of the facility
   */
  _openFacilityDescription(facility: Facility): void {
    Alert.alert(
      Translations.get(this.props.language, 'whats_this_icon'),
      Translations.get(this.props.language, facility),
    );
  }

  /**
   * Moves to the next view in the banner.
   */
  _swapBanner(): void {
    // Clear the swap banner timer, if the user manually swipes the banner
    clearTimeout(this._swapBannerTimer);

    LayoutAnimation.easeInEaseOut();
    this.setState({
      bannerPosition: (this.state.bannerPosition === 0) ? 1 : 0,
    });
  }

  /**
   * Returns a list of touchable views which describe facilities in the building.
   *
   * @returns {?ReactElement<any>} an icon representing each of the facilities in this building
   */
  _renderFacilityIcons(): ?ReactElement < any > {
    const facilities = this.props.facilities;
    if (facilities == null) {
      return null;
    }

    return (
      <View style={_styles.facilitiesContainer}>
        {facilities.map((facility: Facility) => {
          return (
            <TouchableOpacity
                key={facility}
                onPress={this._openFacilityDescription.bind(this, facility)}>
              <MaterialIcons
                  color={Constants.Colors.primaryWhiteIcon}
                  name={DisplayUtils.getFacilityIconName(facility, Translations)}
                  size={Constants.Sizes.Icons.Medium}
                  style={_styles.facilitiesIcon} />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  /**
   * Renders a view containing an image of the building, it's name, and a list of its rooms and facilities.
   *
   * @returns {ReactElement<any>} a view describing a building.
   */
  render(): ReactElement < any > {
    const imageStyle = (this.state.bannerPosition === 0)
        ? { right: 0 }
        : { right: width * BANNER_TEXT_WIDTH_PCT };
    const textContainerStyle = (this.state.bannerPosition === 1)
        ? { left: width * (1 - BANNER_TEXT_WIDTH_PCT), marginTop: HeaderHeight }
        : { left: width, marginTop: HeaderHeight };
    if (this.props.hideTitle) {
      textContainerStyle.marginTop = 0;
    }

    const properties = this.props.properties;
    let propertiesView = null;
    if (properties != null) {
      propertiesView = (
        <View>
          {properties.map((property, i) => (
            <View key={`prop.${Translations.getEnglishName(property) || ''}`}>
              <Text
                  key={`prop.title.${i}`}
                  style={_styles.title}>
                {Translations.getName(this.props.language, property)}
              </Text>
              <Text
                  key={`prop.desc.${i}`}
                  style={_styles.body}>
                {Translations.getVariant(this.props.language, 'description', property)}
              </Text>
            </View>
          ))}
        </View>
      );
    }

    let image = null;
    if (typeof (this.props.image) === 'string') {
      image = (
        <Image
            resizeMode={'cover'}
            source={{ uri: Configuration.getImagePath(this.props.image) }}
            style={[ _styles.image, imageStyle ]} />
      );
    } else {
      image = (
        <Image
            resizeMode={'cover'}
            source={this.props.image}
            style={[ _styles.image, imageStyle ]} />
      );
    }

    return (
      <View style={_styles.banner}>
        <TouchableWithoutFeedback onPress={this._swapBanner}>
          {image}
        </TouchableWithoutFeedback>
        <View style={[ _styles.textContainer, textContainerStyle ]}>
          <ScrollView>
            {this._renderFacilityIcons()}
            {propertiesView}
          </ScrollView>
        </View>
        {this.props.hideTitle || !this.props.name
          ? null
          : <Header
              style={_styles.header}
              subtitle={this.props.shorthand}
              title={this.props.name} />}
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  banner: {
    height: 175,
    backgroundColor: Constants.Colors.secondaryBackground,
  },
  body: {
    fontSize: Constants.Sizes.Text.Body,
    color: Constants.Colors.primaryWhiteText,
    marginBottom: BANNER_TEXT_SEPARATOR,
    marginLeft: BANNER_TEXT_SEPARATOR,
    marginRight: BANNER_TEXT_SEPARATOR,
  },
  facilitiesContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  facilitiesIcon: {
    margin: BANNER_TEXT_SEPARATOR * 2,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  image: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: null,
    height: null,
  },
  textContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    padding: Constants.Sizes.Margins.Regular,
  },
  title: {
    fontSize: Constants.Sizes.Text.Title,
    fontWeight: 'bold',
    color: Constants.Colors.primaryWhiteText,
    marginBottom: BANNER_TEXT_SEPARATOR,
    marginLeft: BANNER_TEXT_SEPARATOR,
    marginRight: BANNER_TEXT_SEPARATOR,
  },
});
