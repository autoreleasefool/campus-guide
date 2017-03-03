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
 * @file RoomGrid.js
 * @providesModule RoomGrid
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

// Types
import type { BuildingRoom, Icon, Language, RoomType } from 'types';

// Type definition for component props.
type Props = {
  code: string,                                     // Unique shorthand identifier for the building
  defaultRoomType: number,                          // Default type that rooms should be recognized as
  filter: ?string,                                  // Filter the list of rooms
  language: Language,                               // Language to display building names in
  onSelect: (code: string, room: ?string) => void,  // Callback function for when a room is selected
  renderHeader: ?() => ReactElement < any >,        // Render a custom header at the top of the list
  rooms: Array < BuildingRoom >,                    // The list of rooms in the building
};

// Type definition for component state.
type State = {
  dataSource: ListView.DataSource,  // List of rooms for the ListView
  loaded: boolean,                  // Indicates if the room data has been loaded
};

// Data required for rendering the list of filtered rooms.
type FilteredRoom = {
  altName: ?string, // Alternate display name for the room
  icon: ?Icon,      // Icon to identify the room's type
  name: string,     // Unique name/number of the room
  type: string,     // Type of room
};

// Imports
import PaddedIcon from 'PaddedIcon';
import Promise from 'promise';
import * as Configuration from 'Configuration';
import * as Constants from 'Constants';
import * as DisplayUtils from 'DisplayUtils';
import * as TranslationUtils from 'TranslationUtils';

export default class RoomGrid extends React.Component {

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
      dataSource: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
      }),
      loaded: false,
    };

    // Explicitly bind 'this' to methods that require it
    (this:any)._filterRooms = this._filterRooms.bind(this);
  }

  /**
   * Loads configuration file containing data of rooms.
   */
  componentDidMount(): void {
    if (!this.state.loaded) {
      Configuration.init()
          .then(() => this._onRoomSearch())
          .catch((err: any) => console.error('Configuration could not be initialized for room grid.', err));
    }
  }

  /**
   * If a new filter is provided, update the list of rooms.
   *
   * @param {Props} nextProps the new props being received
   */
  componentWillReceiveProps(nextProps: Props): void {
    if (nextProps.filter != this.props.filter || nextProps.language != this.props.language) {
      this._onRoomSearch(nextProps.filter);
    }
  }

  /** Promise which resolves when the room types have been loaded. */
  _roomTypesPromise: ?Promise < Array < RoomType > > = null;

  /** List of room types and details about them. */
  _roomTypes: Array < RoomType >;

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

    // Cache list of room types that match the search terms
    const matchingRoomTypes = [];
    for (let i = 0; i < this._roomTypes.length; i++) {
      const roomTypeName = TranslationUtils.getTranslatedName(this.props.language, this._roomTypes[i]);
      if (adjustedSearchTerms == null
          || (roomTypeName != null && roomTypeName.toUpperCase().indexOf(adjustedSearchTerms) >= 0)) {
        matchingRoomTypes.push(i);
      }
    }

    for (let i = 0; i < rooms.length; i++) {
      const roomName: string = `${this.props.code} ${rooms[i].name.toUpperCase()}`;
      const roomAltName: ?string = TranslationUtils.getTranslatedVariant(this.props.language, 'alt_name', rooms[i]);

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
          icon: DisplayUtils.getPlatformIcon(Platform.OS, this._roomTypes[rooms[i].type]),
          name: roomName,
          type: TranslationUtils.getTranslatedName(this.props.language, this._roomTypes[rooms[i].type]) || '',
        });
      }
    }

    // Update the state so the app reflects the changes made
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(filteredRooms),
      loaded: true,
    });
  }

  /**
   * Returns a promise which resolves when the room types have been loaded
   *
   * @returns {Promise<Array<RoomType>>} promise which resolves with room types
   */
  _getRoomTypes(): Promise < Array < RoomType > > {
    if (this._roomTypesPromise == null) {
      this._roomTypesPromise = new Promise((resolve: any) => {
        Configuration.getConfig('/room_types.json')
            .then((roomTypes: Array < RoomType >) => resolve(roomTypes))
            .catch((err: any) => console.error('Could not get /room_types.json.', err));
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
          .then((roomTypes: Array < RoomType >) => {
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
   * @returns {?ReactElement<any>} the header, if this.props.renderHeader is provided
   */
  _renderHeader(): ?ReactElement < any > {
    return this.props.renderHeader == null ? null : this.props.renderHeader();
  }

  /**
   * Renders an item describing a single room in the building.
   *
   * @param {FilteredRoom} room a room to display in this row.
   * @returns {ReactElement<any>} a view describing a set of room.
   */
  _renderRow(room: FilteredRoom): ReactElement < any > {
    let icon: ?ReactElement < any > = null;
    if (room.icon != null) {
      icon = (
        <PaddedIcon
            color={Constants.Colors.primaryWhiteText}
            icon={room.icon} />
      );
    }

    return (
      <TouchableOpacity onPress={() => this.props.onSelect(this.props.code, room.name)}>
        <View style={_styles.room}>
          {icon}
          <View style={_styles.roomDescription}>
            {room.altName == null ? null : <Text style={_styles.roomType}>{room.altName}</Text>}
            <Text style={_styles.roomName}>{room.name}</Text>
            <Text style={_styles.roomType}>{room.type}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  /**
   * Renders a separator line between rows.
   *
   * @param {any} sectionID section id
   * @param {any} rowID     row id
   * @returns {ReactElement<any>} a separator for the list of settings
   */
  _renderSeparator(sectionID: any, rowID: any): ReactElement < any > {
    return (
      <View
          key={`Separator,${sectionID},${rowID}`}
          style={_styles.separator} />
    );
  }

  /**
   * Returns a list of touchable views listing the room names.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement < any > {
    return (
      <View style={_styles.container}>
        <View style={_styles.headerSeparator} />
        <ListView
            dataSource={this.state.dataSource}
            enableEmptySections={true}
            renderHeader={this._renderHeader.bind(this)}
            renderRow={this._renderRow.bind(this)}
            renderSeparator={this._renderSeparator.bind(this)}
            style={_styles.container} />
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.Colors.primaryBackground,
  },
  room: {
    flex: 1,
    marginTop: Constants.Sizes.Margins.Expanded,
    marginBottom: Constants.Sizes.Margins.Expanded,
    marginRight: Constants.Sizes.Margins.Expanded,
    alignItems: 'center',
    flexDirection: 'row',
  },
  roomDescription: {
    marginRight: Constants.Sizes.Margins.Regular,
    flex: 1,
  },
  roomName: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
    marginTop: Constants.Sizes.Margins.Condensed,
    marginBottom: Constants.Sizes.Margins.Condensed,
  },
  roomType: {
    color: Constants.Colors.secondaryWhiteText,
    fontSize: Constants.Sizes.Text.Caption,
  },
  headerSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Constants.Colors.primaryWhiteText,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Constants.Sizes.Margins.Expanded,
    backgroundColor: Constants.Colors.primaryWhiteText,
  },
});
