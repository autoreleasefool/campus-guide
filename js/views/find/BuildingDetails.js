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
 * @providesModule BuildingDetails
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
  BuildingRoom,
  Facility,
} from 'types';

import type {
  SearchListener,
} from 'SearchManager';

// Type definition for component props.
type Props = {
  buildingDetails: Building,
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
const LanguageUtils = require('LanguageUtils');
const MaterialIcons = require('react-native-vector-icons/MaterialIcons');
const Preferences = require('Preferences');
const SearchManager = require('SearchManager');
const SectionHeader = require('SectionHeader');
const StatusBarUtils = require('StatusBarUtils');
const Tooltip = require('Tooltip');

const {width} = Dimensions.get('window');

// Percentage of banner that banner will take
const BANNER_TEXT_WIDTH_PCT: number = 0.75;
// Number of milliseconds before the banner swaps
const BANNER_SWAP_TIME: number = 2000;
// Y position of the banner tooltip
const IMAGE_TOOLTIP_TOP: number = 65;
// Amount of whitespace between items in the building details banner
const BANNER_TEXT_SEPARATOR: number = 5;

// Size of room buttons
const ROOM_WIDTH: number = Math.floor(width / 2);
// Maximum number of rooms in a row
const ROOM_COLUMNS: number = 2;

class BuildingDetails extends React.Component {

  /**
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    buildingDetails: React.PropTypes.any.isRequired,
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

    // Create the room search listener
    this._roomSearchListener = {
      onSearch: this._onRoomSearch.bind(this),
    };

    // Explicitly bind 'this' to methods that require it
    (this:any)._filterRooms = this._filterRooms.bind(this);
    (this:any)._swapBanner = this._swapBanner.bind(this);
  }

  /**
   * Loads the links to display, registers the search listener.
   */
  componentDidMount(): void {
    // Register search listener if the app should not search all by default
    if (!Preferences.getAlwaysSearchAll()) {
      SearchManager.addSearchListener(this._roomSearchListener);
    }

    this._swapBannerTimer = setTimeout(() => {
      this._swapBanner();
    }, BANNER_SWAP_TIME);

    Tooltip.hasSeenTooltip(Tooltip.SHOW_BUILDING_IMAGE, seen => {
      if (!seen) {
        Tooltip.showTooltip({
          backgroundColor: Constants.Colors.darkGrey,
          callback: () => Tooltip.setHasSeenTooltip(Tooltip.SHOW_BUILDING_IMAGE),
          hAlign: 'center',
          text: 'Tap the picture to see or hide it.',
          vAlign: 'top',
          y: IMAGE_TOOLTIP_TOP + StatusBarUtils.getStatusBarPadding(Platform),
        });
      }
    });

    if (!this.state.loaded) {
      this._filterRooms(null);
    }
  }

  /**
   * Removes the search listener.
   */
  componentWillUnmount(): void {
    SearchManager.removeSearchListener(this._roomSearchListener);
    clearTimeout(this._swapBannerTimer);
  }

  /** Timer which swaps the banner after a set amount of time. */
  _swapBannerTimer: number;

  /** Listener for search input. */
  _roomSearchListener: SearchListener;

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
   * Filters the rooms in the building and displays them to the user.
   *
   * @param {?string} searchTerms       user input filter terms.
   */
  _filterRooms(searchTerms: ?string): void {
    // Ignore the case of the search terms
    const adjustedSearchTerms: ?string = (searchTerms == null) ? null : searchTerms.toUpperCase();

    // Get the list of rooms in the building
    const rooms: Array<BuildingRoom> = this.props.buildingDetails.rooms;

    // Create array for sets of rooms
    const filteredRooms: Array<BuildingRoom> = [];

    for (let i = 0; i < rooms.length; i++) {
      // If the search terms are empty, or the room contains the terms, add it to the list
      if (adjustedSearchTerms == null || rooms[i].name.toUpperCase().indexOf(adjustedSearchTerms) >= 0) {
        filteredRooms.push(rooms[i]);
      }
    }

    // Update the state so the app reflects the changes made
    this.setState({
      buildingRooms: this.state.buildingRooms.cloneWithRows(filteredRooms),
      loaded: true,
    });
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
   * Calls _filterRooms with all rooms, and the search terms.
   *
   * @param {string} searchTerms user input filter terms.
   */
  _onRoomSearch(searchTerms: ?string): void {
    this._filterRooms(searchTerms);
  }

  /**
   * Returns an image and text description of the building.
   *
   * @param {Object} Translations translations in the current language of certain text.
   * @returns {ReactElement<any>} a banner describing the building
   */
  _renderBanner(Translations: Object): ReactElement< any > {
    const bannerImageStyle = (this.state.bannerPosition === 0)
        ? {right: 0}
        : {right: width * BANNER_TEXT_WIDTH_PCT};
    const bannerTextStyle = (this.state.bannerPosition === 1)
        ? {left: width * (1 - BANNER_TEXT_WIDTH_PCT)}
        : {left: width};
    const buildingAddress: ?string
        = LanguageUtils.getTranslatedVariant(Preferences.getSelectedLanguage(), 'address', this.props.buildingDetails);

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
            <Text style={_styles.detailBody}>{this.props.buildingDetails.name}</Text>
            <Text style={_styles.detailTitle}>{Translations.address}</Text>
            <Text style={_styles.detailBody}>{(buildingAddress == null) ? 'N/A' : buildingAddress}</Text>
          </ScrollView>
        </View>
        <SectionHeader
            sectionName={LanguageUtils.getTranslatedName(Preferences.getSelectedLanguage(), this.props.buildingDetails)}
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
  _renderBuildingDirections(Translations: Object): ReactElement< any > {
    const navigateTo: string = Translations.navigate_to.format(
        LanguageUtils.getTranslatedName(Preferences.getSelectedLanguage(), this.props.buildingDetails));

    return (
      <TouchableOpacity>
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
  _renderFacilityIcons(Translations: Object): ReactElement< any > {
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
                  size={24}
                  style={_styles.facilitiesIcon} />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  /**
   * Returns a list of touchable views listing the room names.
   *
   * @returns {ReactElement<any>} a ScrollView containing a ListView.
   */
  _renderRoomList(): ReactElement< any > {
    return (
      <ListView
          contentContainerStyle={_styles.listView}
          dataSource={this.state.buildingRooms}
          enableEmptySections={true}
          initialListSize={20}
          pageSize={ROOM_COLUMNS}
          renderRow={this._renderRow.bind(this)} />
    );
  }

  /**
   * Renders an item describing a single room in the building.
   *
   * @param {BuildingRoom} room a room to display in this row.
   * @param {string} sectionId  index of the section the room is in.
   * @param {number} index      index of the row the room is in.
   * @returns {ReactElement<any>} a view describing a set of room.
   */
  _renderRow(room: BuildingRoom, sectionId: string, index: number): ReactElement<any> {
    const darkenEven = (Math.floor(index / ROOM_COLUMNS) % ROOM_COLUMNS === 0);
    const color: string = ((darkenEven && index % ROOM_COLUMNS === 0) || (!darkenEven && index % ROOM_COLUMNS === 1))
        ? Constants.Colors.defaultComponentBackgroundColor
        : Constants.Colors.garnet;

    return (
      <TouchableOpacity>
        <View style={{width: ROOM_WIDTH, backgroundColor: color}}>
          <Text style={_styles.room}>
            {room.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  /**
   * Renders a view containing an image of the building, it's name, and a list of its rooms and facilities.
   *
   * @returns {ReactElement<any>} a view describing a building.
   */
  render(): ReactElement< any > {
    // Get current language for translations
    let Translations: Object = {};
    if (Preferences.getSelectedLanguage() === 'fr') {
      Translations = require('../../../assets/js/Translations.fr.js');
    } else {
      Translations = require('../../../assets/js/Translations.en.js');
    }

    return (
      <View style={_styles.container}>
        {this._renderBanner(Translations)}
        {this._renderBuildingDirections(Translations)}
        {this._renderRoomList()}
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
    justifyContent: 'space-around',
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
  listView: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: width,
    flex: 1,
    // backgroundColor: Constants.Colors.garnet,
  },
  room: {
    margin: 15,
    alignSelf: 'center',
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Text.Medium,
  },
});

module.exports = BuildingDetails;
