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
 * @module BuildingDetails
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
  ListView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Type imports
import type {
  Building,
  BuildingRoom,
  Facility,
} from '../../types';

import type {
  SearchListener,
} from '../../util/SearchManager';

// Type definition for component props.
type Props = {
  buildingDetails: Building,
};

// Type definition for component state.
type State = {
  buildingRooms: ListView.DataSource,
  loaded: boolean,
};

// Imports
const Constants = require('../../Constants');
const DisplayUtils = require('../../util/DisplayUtils');
const LanguageUtils = require('../../util/LanguageUtils');
const MaterialIcons = require('react-native-vector-icons/MaterialIcons');
const Preferences = require('../../util/Preferences');
const SearchManager = require('../../util/SearchManager');
const SectionHeader = require('../../components/SectionHeader');

const {width} = Dimensions.get('window');

// Size of room buttons
const ROOM_WIDTH: number = Math.floor(width / 2);
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
  }

  /**
   * Loads the links to display, registers the search listener.
   */
  componentDidMount(): void {
    // Register search listener if the app should not search all by default
    if (!Preferences.getAlwaysSearchAll()) {
      SearchManager.addSearchListener(this._roomSearchListener);
    }

    if (!this.state.loaded) {
      this._filterRooms(this.props.buildingDetails.rooms, null);
    }
  }

  /**
   * Removes the search listener.
   */
  componentWillUnmount(): void {
    SearchManager.removeSearchListener(this._roomSearchListener);
  }

  /* Listener for search input. */
  _roomSearchListener: SearchListener;

  /**
   * Returns a list of touchable views which describe facilities in the building.
   *
   * @param {Object} Translations translations in the current language of certain text.
   * @returns {ReactElement<any>} an icon representing each of the facilities in this building
   */
  _getFacilityIcons(Translations: Object): ReactElement<any> {
    return (
      <View style={_styles.facilitiesContainer}>
        {this.props.buildingDetails.facilities.map(facility => {
          return (
            <TouchableOpacity
                key={facility}
                style={_styles.facilitiesIcon}
                onPress={() => this._openFacilityDescription(facility, Translations)}>
              <MaterialIcons
                  color={'white'}
                  name={DisplayUtils.getFacilityIconName(facility, Translations)}
                  size={24} />
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
  _getRoomList(): ReactElement<any> {
    return (
      <ListView
          dataSource={this.state.buildingRooms}
          enableEmptySections={true}
          renderRow={this._renderRow.bind(this)} />
    );
  }

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
   * @param {Array<BuildingRoom>} rooms list of filtered rooms in the building to display.
   * @param {?string} searchTerms       user input filter terms.
   */
  _filterRooms(rooms: Array<BuildingRoom>, searchTerms: ?string): void {
    // Ignore the case of the search terms
    const adjustedSearchTerms: ?string = (searchTerms == null) ? null : searchTerms.toUpperCase();

    // Create array for sets of rooms
    const roomSets: Array<Array<BuildingRoom>> = [];

    // Create a temporary set of rooms with up to ROOM_COLUMNS rooms in it
    let tempSet: Array<BuildingRoom> = [];
    let roomsInSet = 0;

    for (let i = 0; i < rooms.length; i++) {
      if (roomsInSet === ROOM_COLUMNS) {
        // After the temporary set has reached its max length, add it to the rooms and clear the temporary set
        roomSets.push(tempSet);
        tempSet = [];
        roomsInSet = 0;
      }

      // If the search terms are empty, or the room contains the terms, add it to the list
      if (adjustedSearchTerms == null || rooms[i].name.toUpperCase().indexOf(adjustedSearchTerms) >= 0) {
        tempSet.push(rooms[i]);
        roomsInSet++;
      }
    }

    // Add the final set, if any rooms were added to it
    if (tempSet.length > 0) {
      roomSets.push(tempSet);
    }

    // Update the state so the app reflects the changes made
    this.setState({
      buildingRooms: this.state.buildingRooms.cloneWithRows(roomSets),
      loaded: true,
    });
  }

  /**
   * Calls _filterRooms with all rooms, and the search terms.
   *
   * @param {string} searchTerms user input filter terms.
   */
  _onRoomSearch(searchTerms: ?string): void {
    this._filterRooms(this.props.buildingDetails.rooms, searchTerms);
  }

  /**
   * Renders an item describing a single room in the building.
   *
   * @param {Array<BuildingRoom>} rooms a list of rooms to display in this row.
   * @param {string} sectionId          index of the section the room is in.
   * @param {number} rowIndex           index of the row the room is in.
   * @returns {ReactElement<any>} a view describing a set of room.
   */
  _renderRow(rooms: Array<BuildingRoom>, sectionId: string, rowIndex: number): ReactElement<any> {
    const darkenEvenElements = (Math.floor(rowIndex / ROOM_COLUMNS * 2) % ROOM_COLUMNS === 0);

    return (
      <View style={_styles.roomSet}>
        {rooms.map((room, index) => {
          const rowColor: string = ((darkenEvenElements && index % 2 === 0) || (!darkenEvenElements && index % 2 === 1))
              ? Constants.Colors.defaultComponentBackgroundColor
              : Constants.Colors.garnet;
          return (
            <TouchableOpacity
                key={index}>
              <View style={{width: ROOM_WIDTH, backgroundColor: rowColor}}>
                <Text style={_styles.room}>
                  {room.name}
                </Text>
              </View>
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
  render(): ReactElement<any> {
    // Get current language for translations
    let Translations: Object = {};
    if (Preferences.getSelectedLanguage() === 'fr') {
      Translations = require('../../../assets/js/Translations.fr.js');
    } else {
      Translations = require('../../../assets/js/Translations.en.js');
    }

    const building = this.props.buildingDetails;
    const facilityIcons: ReactElement<any> = this._getFacilityIcons(Translations);
    const roomList: ReactElement<any> = this._getRoomList();

    return (
      <View style={_styles.container}>
        <View style={_styles.banner}>
          <Image
              resizeMode={'cover'}
              source={this.props.buildingDetails.image}
              style={_styles.bannerImage} />
          <SectionHeader
              sectionName={LanguageUtils.getTranslatedName(Preferences.getSelectedLanguage(), building)}
              style={_styles.header}
              subtitleName={building.code} />
        </View>
        {facilityIcons}
        {roomList}
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
  },
  bannerImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: null,
    height: null,
  },
  facilitiesContainer: {
    backgroundColor: Constants.Colors.defaultComponentBackgroundColor,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: width,
  },
  facilitiesIcon: {
    margin: 10,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  room: {
    margin: 15,
    alignSelf: 'center',
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Text.Medium,
  },
  roomSet: {
    flexDirection: 'row',
  },
});

module.exports = BuildingDetails;
