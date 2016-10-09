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
 * @file BuildingDetails.js
 * @description Provides details on a single building on campus.
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
  ListView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

// Type imports
import type {
  Building,
  DefaultFunction,
  Facility,
} from 'types';

// Type definition for component props.
type Props = {
  buildingDetails: Building,
  onDestinationSelected: DefaultFunction,
};

// Type definition for component state.
type State = {
  bannerPosition: number,
  buildingRooms: ListView.DataSource,
  loaded: boolean,
};

// Imports
const Constants = require('Constants');
const DisplayUtils = require('DisplayUtils');
const MaterialIcons = require('react-native-vector-icons/MaterialIcons');
const Preferences = require('Preferences');
const RoomList = require('RoomList');
const SectionHeader = require('SectionHeader');
const StatusBarUtils = require('StatusBarUtils');
const Tooltip = require('Tooltip');
const TranslationUtils = require('TranslationUtils');

const {width} = Dimensions.get('window');

// Percentage of banner that banner will take
const BANNER_TEXT_WIDTH_PCT: number = 0.75;
// Number of milliseconds before the banner swaps
const BANNER_SWAP_TIME: number = 2000;
// Y position of the banner tooltip
const IMAGE_TOOLTIP_TOP: number = 65;
// Amount of whitespace between items in the building details banner
const BANNER_TEXT_SEPARATOR: number = 5;

class BuildingDetails extends React.Component {

  /**
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    buildingDetails: React.PropTypes.any.isRequired,
    onDestinationSelected: React.PropTypes.func.isRequired,
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
    this.state = {
      bannerPosition: 0,
      buildingRooms: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
      }),
      loaded: false,
    };

    // Explicitly bind 'this' to methods that require it
    (this:any)._onDestinationSelected = this._onDestinationSelected.bind(this);
    (this:any)._swapBanner = this._swapBanner.bind(this);
  }

  /**
   * Sets up timer to swap banner, display additional info on load.
   */
  componentDidMount(): void {
    this._swapBannerTimer = setTimeout(() => {
      this._swapBanner();
    }, BANNER_SWAP_TIME);

    Tooltip.hasSeenTooltip(Tooltip.SHOW_BUILDING_IMAGE, seen => {
      if (!seen) {
        Tooltip.showTooltip({
          backgroundColor: Constants.Colors.darkGrey,
          callback: () => Tooltip.setHasSeenTooltip(Tooltip.SHOW_BUILDING_IMAGE),
          hAlign: 'center',
          id: Tooltip.SHOW_BUILDING_IMAGE,
          text: 'Tap the picture to see or hide it.',
          vAlign: 'top',
          y: IMAGE_TOOLTIP_TOP + StatusBarUtils.getStatusBarPadding(Platform),
        });
      }
    });
  }

  /**
   * Clears the timer if it is active.
   */
  componentWillUnmount(): void {
    clearTimeout(this._swapBannerTimer);
    Tooltip.dismiss(Tooltip.SHOW_BUILDING_IMAGE);
  }

  /** Timer which swaps the banner after a set amount of time. */
  _swapBannerTimer: number;

  /**
   * Displays a pop-up to the user, describing what a certain facility icon means.
   *
   * @param {Facility} facility   id of the facility
   * @param {Object} Translations translations in the current language of certain text.
   */
  _openFacilityDescription(facility: Facility, Translations: Object): void {
    Alert.alert(
      Translations.whats_this_icon,
      Translations[facility],
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
   * Informs parent that the user has selected a destination.
   *
   * @param {string} buildingCode code of the building that has been selected
   * @param {?string} roomName    name of the room selected, or null if a building was selected
   */
  _onDestinationSelected(buildingCode: string, roomName: ?string): void {
    this.props.onDestinationSelected(buildingCode, roomName);
  }

  /**
   * Returns an image and text description of the building.
   *
   * @param {Object} Translations translations in the current language of certain text.
   * @returns {ReactElement<any>} a banner describing the building
   */
  _renderBanner(Translations: Object): ReactElement < any > {
    const buildingName = TranslationUtils.getTranslatedName(Preferences.getSelectedLanguage(),
        this.props.buildingDetails);
    const bannerImageStyle = (this.state.bannerPosition === 0)
        ? {right: 0}
        : {right: width * BANNER_TEXT_WIDTH_PCT};
    const bannerTextStyle = (this.state.bannerPosition === 1)
        ? {left: width * (1 - BANNER_TEXT_WIDTH_PCT)}
        : {left: width};
    const buildingAddress: ?string = TranslationUtils.getTranslatedVariant(
      Preferences.getSelectedLanguage(),
      'address',
      this.props.buildingDetails
    );

    return (
      <View style={_styles.banner}>
        <TouchableWithoutFeedback onPress={this._swapBanner}>
          <Image
              resizeMode={'cover'}
              source={this.props.buildingDetails.image}
              style={[_styles.bannerImage, bannerImageStyle]} />
        </TouchableWithoutFeedback>
        <View style={[_styles.bannerText, bannerTextStyle]}>
          <ScrollView>
            {this._renderFacilityIcons(Translations)}
            <Text style={_styles.detailTitle}>{Translations.name}</Text>
            <Text style={_styles.detailBody}>{buildingName}</Text>
            <Text style={_styles.detailTitle}>{Translations.address}</Text>
            <Text style={_styles.detailBody}>{(buildingAddress == null) ? 'N/A' : buildingAddress}</Text>
          </ScrollView>
        </View>
        <SectionHeader
            sectionName={
              TranslationUtils.getTranslatedName(Preferences.getSelectedLanguage(), this.props.buildingDetails)
            }
            style={_styles.header}
            subtitleName={this.props.buildingDetails.code} />
      </View>
    );
  }

  /**
   * Returns a view which allows the user to navigate to the building depicted.
   *
   * @param {Object} Translations translations in the current language of certain text.
   * @returns {ReactElement<any>} a touchable view
   */
  _renderBuildingDirections(Translations: Object): ReactElement < any > {
    const navigateTo: string = (String:any).format(
      Translations.navigate_to,
      TranslationUtils.getTranslatedName(Preferences.getSelectedLanguage(), this.props.buildingDetails)
    );

    return (
      <TouchableOpacity onPress={() => this._onDestinationSelected(this.props.buildingDetails.code)}>
        <SectionHeader
            backgroundOverride={Constants.Colors.polarGrey}
            sectionIcon={Platform.OS === 'ios' ? 'ios-navigate' : 'md-navigate'}
            sectionIconClass={'ionicon'}
            sectionName={navigateTo}
            useBlackText={true} />
      </TouchableOpacity>
    );
  }

  /**
   * Returns a list of touchable views which describe facilities in the building.
   *
   * @param {Object} Translations translations in the current language of certain text.
   * @returns {ReactElement<any>} an icon representing each of the facilities in this building
   */
  _renderFacilityIcons(Translations: Object): ReactElement < any > {
    return (
      <View style={_styles.facilitiesContainer}>
        {this.props.buildingDetails.facilities.map(facility => {
          return (
            <TouchableOpacity
                key={facility}
                onPress={() => this._openFacilityDescription(facility, Translations)}>
              <MaterialIcons
                  color={'white'}
                  name={DisplayUtils.getFacilityIconName(facility, Translations)}
                  size={Constants.Icons.Medium}
                  style={_styles.facilitiesIcon} />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  _renderHeader(): ReactElement < any > {
    // Get current language for translations
    const Translations: Object = TranslationUtils.getTranslations(Preferences.getSelectedLanguage());

    return (
      <View>
        {this._renderBanner(Translations)}
        {this._renderBuildingDirections(Translations)}
      </View>
    );
  }

  /**
   * Renders a view containing an image of the building, it's name, and a list of its rooms and facilities.
   *
   * @returns {ReactElement<any>} a view describing a building.
   */
  render(): ReactElement < any > {
    return (
      <View style={_styles.container}>
        <RoomList
            buildingCode={this.props.buildingDetails.code}
            defaultRoomType={this.props.buildingDetails.default_room_type}
            renderHeader={this._renderHeader.bind(this)}
            roomSelected={this._onDestinationSelected}
            rooms={this.props.buildingDetails.rooms} />
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  banner: {
    height: 175,
    backgroundColor: Constants.Colors.charcoalGrey,
  },
  bannerImage: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: null,
    height: null,
  },
  bannerText: {
    marginTop: 50,
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
  },
  detailTitle: {
    fontSize: Constants.Text.Large,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: BANNER_TEXT_SEPARATOR,
    marginLeft: BANNER_TEXT_SEPARATOR,
    marginRight: BANNER_TEXT_SEPARATOR,
  },
  detailBody: {
    fontSize: Constants.Text.Medium,
    color: 'white',
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
});

module.exports = BuildingDetails;
