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
 * @file RoomList.js
 * @description Displays the list of rooms in a certain building.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  ListView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Type imports
import type {
  BuildingRoom,
  DefaultFunction,
  DefaultIcon,
} from 'types';

import type {
  SearchListener,
} from 'SearchManager';

// Type definition for room search results
type FilteredRoom = {
  altName?: ?string,
  name: string,
  type: ?string,
  icon: ?DefaultIcon,
};

// Type definition for component props.
type Props = {
  buildingCode: string,
  defaultRoomType: string,
  renderHeader: ?() => ReactElement < any >,
  roomSelected: DefaultFunction,
  rooms: Array < BuildingRoom >,
};

// Type definition for component state.
type State = {
  loaded: boolean,
  rooms: ListView.DataSource,
};

// Imports
const Configuration = require('Configuration');
const Constants = require('Constants');
const DisplayUtils = require('DisplayUtils');
const Ionicon = require('react-native-vector-icons/Ionicons');
const MaterialIcons = require('react-native-vector-icons/MaterialIcons');
const Preferences = require('Preferences');
const Promise = require('promise');
const SearchManager = require('SearchManager');
const TranslationUtils = require('TranslationUtils');

class RoomList extends React.Component {

  /**
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    buildingCode: React.PropTypes.string.isRequired,
    defaultRoomType: React.PropTypes.number,
    renderHeader: React.PropTypes.func,
    roomSelected: React.PropTypes.func.isRequired,
    rooms: React.PropTypes.any.isRequired,
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
      loaded: false,
      rooms: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
      }),
    };

    // Create the room search listener
    this._roomSearchListener = {
      onSearch: this._onRoomSearch.bind(this),
    };

    // Explicitly bind 'this' to methods that require it
    (this:any)._filterRooms = this._filterRooms.bind(this);
  }

  componentDidMount(): void {
    // Register search listener if the app should not search all by default
    if (!Preferences.getAlwaysSearchAll()) {
      SearchManager.addSearchListener('find', this._roomSearchListener);
    }

    if (!this.state.loaded) {
      Configuration.init()
          .then(this._onRoomSearch())
          .catch(err => console.error('Configuration could not be initialized for room list.', err));
    }
  }

  /**
   * Clears the search listener.
   */
  componentWillUnmount(): void {
    SearchManager.removeSearchListener('find', this._roomSearchListener);
  }

  /** Listener for search input. */
  _roomSearchListener: SearchListener;

  /** Promise which resolves when the room types have been loaded. */
  _roomTypesPromise: ?Promise < Object > = null;

  /** List of room types and details about them. */
  _roomTypes: Object;

  /**
   * Filters the rooms in the building and displays them to the user.
   *
   * @param {?string} searchTerms user input filter terms.
   */
  _filterRooms(searchTerms: ?string): void {
    // Ignore the case of the search terms
    const adjustedSearchTerms: ?string = (searchTerms == null) ? null : searchTerms.toUpperCase();

    // Get the list of rooms in the building
    const rooms: Array < BuildingRoom > = this.props.rooms;

    // Create array for sets of rooms
    const filteredRooms: Array < FilteredRoom > = [];

    // Cache preferred language
    const language = Preferences.getSelectedLanguage();

    // Cache list of room types that match the search terms
    const matchingRoomTypes = [];
    for (let i = 0; i < this._roomTypes.length; i++) {
      const roomTypeName = TranslationUtils.getTranslatedName(language, this._roomTypes[i]);
      if (adjustedSearchTerms != null
          && roomTypeName != null
          && roomTypeName.toUpperCase().indexOf(adjustedSearchTerms) >= 0) {
        matchingRoomTypes.push(i);
      }
    }

    for (let i = 0; i < rooms.length; i++) {
      const roomName: string = (String:any).format('{0} {1}', this.props.buildingCode, rooms[i].name.toUpperCase());
      const roomAltName: ?string = TranslationUtils.getTranslatedVariant(language, 'alt_name', rooms[i]);

      if (!rooms[i].type) {
        rooms[i].type = this.props.defaultRoomType;
      }

      // If the search terms are empty, or the room contains the terms, add it to the list
      if (adjustedSearchTerms == null
          || roomName.indexOf(adjustedSearchTerms) >= 0
          || matchingRoomTypes.indexOf(rooms[i].type) >= 0
          || (roomAltName != null && roomAltName.indexOf(adjustedSearchTerms) >= 0)) {
        filteredRooms.push({
          altName: roomAltName,
          name: roomName,
          type: TranslationUtils.getTranslatedName(language, this._roomTypes[rooms[i].type]),
          icon: DisplayUtils.getPlatformIcon(Platform.OS, this._roomTypes[rooms[i].type]),
        });
      }
    }

    // Update the state so the app reflects the changes made
    this.setState({
      rooms: this.state.rooms.cloneWithRows(filteredRooms),
      loaded: true,
    });
  }

  /**
   * Returns a promise which resolves when the room types have been loaded
   *
   * @returns {Promise<Object>} promise which resolves with room types
   */
  _getRoomTypes(): Promise < Object > {
    if (this._roomTypesPromise == null) {
      this._roomTypesPromise = new Promise(resolve => {
        Configuration.getConfig('/room_types.json')
            .then(roomTypes => resolve(roomTypes))
            .catch(err => console.error('Could not get /room_types.json.', err));
      });
    }

    return this._roomTypesPromise;
  }

  /**
   * Calls _filterRooms with all rooms, and the search terms.
   *
   * @param {string} searchTerms user input filter terms.
   */
  _onRoomSearch(searchTerms: ?string): void {
    if (this.roomTypes == null) {
      this._getRoomTypes()
          .then(roomTypes => {
            this._roomTypes = roomTypes;
            this._filterRooms(searchTerms);
          });
    } else {
      this._filterRooms(searchTerms);
    }
  }

  /**
   * Renders a header for the list of rooms.
   *
   * @returns {?ReactElement<any>} the header, if this.props.header is provided
   */
  _renderHeader(): ?ReactElement < any > {
    return this.props.renderHeader == null ? null : this.props.renderHeader();
  }

  /**
   * Renders an item describing a single room in the building.
   *
   * @param {FilteredRoom} room a room to display in this row.
   * @param {string} sectionId  index of the section the room is in.
   * @param {number} index      index of the row the room is in.
   * @returns {ReactElement<any>} a view describing a set of room.
   */
  _renderRow(room: FilteredRoom, sectionId: string, index: number): ReactElement < any > {
    const color: string = (index % 2 === 0)
        ? Constants.Colors.garnet
        : Constants.Colors.defaultComponentBackgroundColor;

    let icon: ?ReactElement < any > = null;
    if (room.icon != null) {
      icon = room.icon.class === 'ionicon'
          ? <Ionicon
              color={Constants.Colors.primaryWhiteText}
              name={room.icon.name}
              size={Constants.Icons.Medium}
              style={_styles.roomIcon} />
          : <MaterialIcons
              color={Constants.Colors.primaryWhiteText}
              name={room.icon.name}
              size={Constants.Icons.Medium}
              style={_styles.roomIcon} />;
    }

    return (
      <TouchableOpacity onPress={() => this.props.roomSelected(this.props.buildingCode, room.name)}>
        <View style={{backgroundColor: color}}>
          <View style={_styles.room}>
            {icon}
            <View style={_styles.roomDescription}>
              {room.altName == null ? null : <Text style={_styles.roomType}>{room.altName}</Text>}
              <Text style={_styles.roomName}>{room.name}</Text>
              <Text style={_styles.roomType}>{room.type}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  /**
   * Returns a list of touchable views listing the room names.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement < any > {
    if (!this.state.loaded) {
      return <View />;
    }

    return (
      <ListView
          dataSource={this.state.rooms}
          enableEmptySections={true}
          initialListSize={10}
          renderHeader={this._renderHeader.bind(this)}
          renderRow={this._renderRow.bind(this)}
          style={{backgroundColor: Constants.Colors.garnet}} />
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  room: {
    flex: 1,
    margin: Constants.Margins.Expanded,
    alignItems: 'center',
    flexDirection: 'row',
  },
  roomIcon: {
    marginRight: Constants.Margins.Expanded,
  },
  roomDescription: {
    marginRight: Constants.Margins.Regular,
    flex: 1,
  },
  roomName: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Text.Medium,
    marginTop: Constants.Margins.Minimum,
    marginBottom: Constants.Margins.Minimum,
  },
  roomType: {
    color: Constants.Colors.secondaryWhiteText,
    fontSize: Constants.Text.Small,
  },
});

module.exports = RoomList;
