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
 * @created 2016-10-20
 * @file BuildingHeader.tsx
 * @description Displays an image and various details about the facilities a particular building provides.
 */
'use strict';

// React imports
import React from 'react';
import {
  Alert,
  Dimensions,
  Image,
  LayoutAnimation,
  ScaledSize,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

// Imports
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { default as Header, HeaderHeight } from './Header';
import * as Configuration from '../util/Configuration';
import * as Constants from '../constants';
import * as Display from '../util/Display';
import * as Translations from '../util/Translations';

// Types
import { Language } from '../util/Translations';
import { BuildingProperty, Facility } from '../../typings/university';

interface Props {
  facilities?: Facility[];                    // List of facilities the building offers
  hideTitle?: boolean;                        // True to hide the title
  image: any;                                 // An image of the building
  language: Language;                         // The user's currently selected language
  large?: boolean;                            // True for a large header, false for a condensed one
  name?: string;                              // Name of the building
  properties: BuildingProperty[] | undefined; // List of properties to display about the building
  shorthand?: string;                         // Unique shorthand identifier for the building
}

interface State {
  bannerPosition: number; // Position the banner is in, or moving towards
  screenWidth: number;    // Active width of the screen
}

// Percentage of banner that banner will take
const BANNER_TEXT_WIDTH_PCT = 0.75;
// Number of milliseconds before the banner swaps
const BANNER_SWAP_TIME = 2000;
// Amount of whitespace between items in the building details banner
const BANNER_TEXT_SEPARATOR = 5;

export default class BuildingHeader extends React.PureComponent<Props, State> {

  /** Timer which swaps the banner after a set amount of time. */
  _swapBannerTimer: number;

  /**
   * Update the screen width, and rerender component.
   *
   * @param {ScaledSize} dims the new dimensions
   */
  _dimensionsHandler = (dims: { window: ScaledSize }): void =>
      this.setState({ screenWidth: dims.window.width })

  /**
   * Constructor.
   *
   * @param {props} props component props
   */
  constructor(props: Props) {
    super(props);
    this._swapBannerTimer = 0;
    this.state = {
      bannerPosition: 0,
      screenWidth: Dimensions.get('window').width,
    };
  }

  /**
   * Sets up timer to swap banner, display additional info on load. Add listener to screen dimensions.
   */
  componentDidMount(): void {
    this._swapBannerTimer = setTimeout(() => {
      this._swapBanner();
    }, BANNER_SWAP_TIME);
    Dimensions.addEventListener('change', this._dimensionsHandler as any);
  }

  /**
   * Clears the timer if it is active. Removes screen dimension listener
   */
  componentWillUnmount(): void {
    clearTimeout(this._swapBannerTimer);
    Dimensions.removeEventListener('change', this._dimensionsHandler as any);
  }

  /**
   * Displays a pop-up to the user, describing what a certain facility icon means.
   *
   * @param {Facility} facility   id of the facility
   */
  _openFacilityDescription(facility: Facility): void {
    Alert.alert(
      Translations.get('whats_this_icon'),
      Translations.get(`facility_${facility}`)
    );
  }

  /**
   * Moves to the next view in the banner.
   */
  _swapBanner(): void {
    // Clear the swap banner timer, if the user manually swipes the banner
    clearTimeout(this._swapBannerTimer);

    if (!this.props.large) {
      LayoutAnimation.easeInEaseOut();
      this.setState({
        bannerPosition: (this.state.bannerPosition === 0) ? 1 : 0,
      });
    }
  }

  /**
   * Returns a list of touchable views which describe facilities in the building.
   *
   * @returns {JSX.Element|undefined} an icon representing each of the facilities in this building
   */
  _renderFacilityIcons(): JSX.Element | undefined {
    const facilities = this.props.facilities;
    if (facilities == undefined) {
      return undefined;
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
                  name={Display.getFacilityIconName(facility)}
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
   * @returns {JSX.Element} a view describing a building
   */
  render(): JSX.Element {
    const imageStyle = (this.state.bannerPosition === 0)
        ? { right: 0 }
        : { right: this.state.screenWidth * BANNER_TEXT_WIDTH_PCT };
    const textContainerStyle = (this.state.bannerPosition === 1)
        ? { left: this.state.screenWidth * (1 - BANNER_TEXT_WIDTH_PCT), marginTop: HeaderHeight }
        : { left: this.state.screenWidth, marginTop: HeaderHeight };
    if (this.props.hideTitle) {
      textContainerStyle.marginTop = 0;
    }

    const properties = this.props.properties;
    let propertiesView: JSX.Element | undefined;
    if (properties != undefined) {
      propertiesView = (
        <View>
          {properties.map((property: BuildingProperty, i: number) => (
            <View key={`prop.${property.name}`}>
              <Text
                  key={`prop.title.${i}`}
                  style={_styles.title}>
                {Translations.get(property.name)}
              </Text>
              <Text
                  key={`prop.desc.${i}`}
                  style={_styles.body}>
                {Translations.getDescription(property)}
              </Text>
            </View>
          ))}
        </View>
      );
    }

    let image: JSX.Element | undefined;
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

    if (this.props.large) {
      return (
        <View style={_styles.bannerLarge}>
          <View style={_styles.bannerLarge}>
            {image}
          </View>
          <View style={_styles.bannerLarge}>
            <View style={_styles.largeTextContainer}>
              <ScrollView>
                {this._renderFacilityIcons()}
                {propertiesView}
              </ScrollView>
            </View>
          </View>
        </View>
      );
    } else {
      return (
        <View style={_styles.banner}>
          <TouchableWithoutFeedback onPress={(): void => this._swapBanner()}>
            {image}
          </TouchableWithoutFeedback>
          <View style={[ _styles.textContainer, textContainerStyle ]}>
            <ScrollView>
              {this._renderFacilityIcons()}
              {propertiesView}
            </ScrollView>
          </View>
          {this.props.hideTitle || !this.props.name
            ? undefined
            : <Header
                style={_styles.header}
                subtitle={this.props.shorthand}
                title={this.props.name} />}
        </View>
      );
    }

  }
}

// Private styles for component
const _styles = StyleSheet.create({
  banner: {
    backgroundColor: Constants.Colors.secondaryBackground,
    height: 175,
  },
  bannerLarge: {
    backgroundColor: Constants.Colors.secondaryBackground,
    flex: 1,
  },
  body: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
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
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  image: {
    bottom: 0,
    height: undefined,
    left: 0,
    position: 'absolute',
    top: 0,
    width: undefined,
  },
  largeTextContainer: {
    flex: 1,
    margin: Constants.Sizes.Margins.Regular,
  },
  textContainer: {
    bottom: 0,
    padding: Constants.Sizes.Margins.Regular,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  title: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Title,
    fontWeight: 'bold',
    marginBottom: BANNER_TEXT_SEPARATOR,
    marginLeft: BANNER_TEXT_SEPARATOR,
    marginRight: BANNER_TEXT_SEPARATOR,
  },
});
