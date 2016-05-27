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
 * @file BuildingPage.js
 * @module BuildingPage
 * @description View for the root navigation for finding a room on campus.
 * @flow
 *
 */
'use strict';

// React Native imports
import React from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ListView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Import type definitions
import type {
  Building,
  BuildingRoom,
} from '../../Types';

// Imports
const Constants = require('../../Constants');
const DisplayUtils = require('../../util/DisplayUtils');
const LanguageUtils = require('../../util/LanguageUtils');
const MaterialIcons = require('react-native-vector-icons/MaterialIcons');
const Preferences = require('../../util/Preferences');
const SectionHeader = require('../../components/SectionHeader');
const Styles = require('../../Styles');

const {width} = Dimensions.get('window');
const screenWidth: number = width;

const ROOM_MARGIN: number = 10;
const ROOM_WIDTH: number = (screenWidth - 20) / 2;

// Type definition for component props.
type Props = {
  buildingDetails: Building,
};

// Type definition for component state.
type State = {
  dataSource: ListView.DataSource,
  loaded: boolean,
};

class BuildingPage extends React.Component {

  /**
   * Properties which the parent component should make available to this
   * component.
   */
  static propTypes = {
    buildingDetails: React.PropTypes.any.isRequired,
  };

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
  }

  /**
   * Loads the links to display.
   */
  componentDidMount(): void {
    if (!this.state.loaded) {
      this._parseBuildingRooms();
    }
  }

  /**
   * Displays a pop-up to the user, describing what a certain facility icon means.
   *
   * @param {Facility} facility id of the facility
   */
  _openFacilityDescription(facility: Facility, Translations: Object): void {
    Alert.alert(
      Translations.whats_this_icon,
      Translations[facility],
    );
  }

  /**
   * Retrieves a ListView.DataSource from the array containing the building's rooms.
   */
  _parseBuildingRooms(): void {
    this.setState({
      buildingRooms: this.state.buildingRooms.cloneWithRows(this.props.buildingDetails.rooms),
    });
  }

  /**
   * Returns a list of touchable views which describe facilities in the building.
   *
   * @param {Object} Translations translations in the current language of certain text.
   * @returns {ReactElement} an icon representing each of the facilities in this building
   */
  _getFacilityIcons(Translations: Object): ReactElement {
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
                  size={30}
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
   * @returns {ReactElement} a ScrollView containing a ListView.
   */
  _getRoomList(): ReactElement {
    return (
      <ListView
          contentContainerStyle={_styles.roomList}
          dataSource={this.state.buildingRooms}
          renderRow={this._renderRow.bind(this)} />
    );
  }

  /**
   * Renders an item describing a single room in the building.
   *
   * @param {BuildingRoom} room the identifier of the room.
   * @param {string} sectionId  index of the section the room is in.
   * @param {number} rowIndex   index of the row the room is in.
   * @returns {ReactElement} a view describing a room.
   */
  _renderRow(room: BuildingRoom, sectionId: string, rowIndex: number): ReactElement {
    let rowColor: string = Constants.Colors.garnet;
    const rowPosition = rowIndex % 4;
    if (rowPosition === 1 || rowPosition === 2) {
      rowColor = Constants.Colors.defaultComponentBackgroundColor;
    }

    return (
      <TouchableOpacity>
        <View style={{width: ROOM_WIDTH, backgroundColor: rowColor}}>
          <Text style={[Styles.mediumText, _styles.room]}>
            {room.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  /**
   * Renders a view containing an image of the building, it's name, and a list of its rooms and facilities.
   *
   * @returns {ReactElement} a view describing a building.
   */
  render(): ReactElement {
    // Get current language for translations
    let Translations: Object = {};
    if (Preferences.getSelectedLanguage() === 'fr') {
      Translations = require('../../../assets/static/js/Translations.fr.js');
    } else {
      Translations = require('../../../assets/static/js/Translations.en.js');
    }

    const building = this.props.buildingDetails;
    const facilityIcons: ReactElement = this._getFacilityIcons(Translations);
    const roomList: ReactElement = this._getRoomList();

    return (
      <View style={_styles.container}>
        <ScrollView style={_styles.scrollView}>
          <View style={_styles.banner}>
            <Image
                resizeMode={'cover'}
                source={this.props.buildingDetails.image}
                style={_styles.bannerImage} />
          </View>
          {facilityIcons}
          {roomList}
        </ScrollView>
        <SectionHeader
            sectionName={LanguageUtils.getTranslatedName(Preferences.getSelectedLanguage(), building)}
            subtitleName={building.code} />
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
  scrollView: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  facilitiesContainer: {
    backgroundColor: Constants.Colors.defaultComponentBackgroundColor,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: screenWidth,
  },
  facilitiesIcon: {
    margin: 10,
  },
  roomList: {
    margin: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  room: {
    margin: 15,
    alignSelf: 'center',
    color: Constants.Colors.primaryWhiteText,
  }
});

// Expose component to app
module.exports = BuildingPage;
