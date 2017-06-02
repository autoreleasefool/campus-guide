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
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Types
import type { BuildingRoom, Language, RoomTypeInfo } from 'types';

// Type definition for component props.
type Props = {
  shorthand: string,                                    // Unique shorthand identifier for the building
  filter: ?string,                                      // Filter the list of rooms
  language: Language,                                   // Language to display building names in
  onSelect: (shorthand: string, room: ?string) => void, // Callback function for when a room is selected
  renderHeader: ?() => ReactElement < any >,            // Render a custom header at the top of the list
  rooms: Array < BuildingRoom >,                        // The list of rooms in the building
};

// Type definition for component state.
type State = {
  loaded: boolean,                // Indicates if the room data has been loaded
  rooms: Array < FilteredRoom >,  // List of rooms
};

// Data required for rendering the list of filtered rooms.
type FilteredRoom = {
  altName: ?string, // Alternate display name for the room
  key: string,      // Unique name/number of the room
  typeId: string,   // Type of room
};

// Imports
import PaddedIcon from 'PaddedIcon';
import * as Configuration from 'Configuration';
import * as Constants from 'Constants';
import * as DisplayUtils from 'DisplayUtils';
import * as Translations from 'Translations';
import { filterRoom } from 'Search';

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
      loaded: false,
      rooms: [],
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
          .then(() => Configuration.getConfig('/room_types.json'))
          .then((roomTypeInfo: RoomTypeInfo) => {
            this._roomTypes = roomTypeInfo.types;
            this._roomTypeIds = roomTypeInfo.ids;
            this._filterRooms(this.props);
          })
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
      this._filterRooms(nextProps);
    }
  }

  /** Room type descriptions. */
  _roomTypes: Object;

  /** List of available room type IDs. */
  _roomTypeIds: Array < string >;

  /**
   * Filters the rooms in the building and displays them to the user.
   *
   * @param {Props} props the props to filter with
   */
  _filterRooms({ shorthand, filter, language, rooms }: Props): void {
    // Ignore the case of the search terms
    const adjustedFilter = (filter == null || filter.length === 0) ? '' : filter.toUpperCase();

    // Create array for sets of rooms
    const filteredRooms: Array < FilteredRoom > = [];

    // Cache list of room types that match the search terms
    const matchingRoomTypes = new Set();
    this._roomTypeIds.forEach((id: string) => {
      const name = Translations.getName(language, this._roomTypes[id]);
      if (adjustedFilter.length === 0 || (name && name.toUpperCase().indexOf(adjustedFilter) >= 0)) {
        matchingRoomTypes.add(id);
      }
    });

    // True if the building code matches the search terms
    const codeMatches = adjustedFilter.length === 0 || shorthand.indexOf(adjustedFilter) >= 0;

    rooms.forEach((room: BuildingRoom) => {
      let matches = false;
      if (codeMatches) {
        matches = true;
      }

      if (!matches) {
        const result = filterRoom(language, adjustedFilter, matchingRoomTypes, shorthand, room);
        matches = result.success;
      }

      if (matches) {
        const altName = Translations.getVariant(language, 'alt_name', room);
        filteredRooms.push({
          altName,
          typeId: room.type || Constants.DefaultRoomType,
          key: room.name.toUpperCase(),
        });
      }
    });

    // Update the state so the app reflects the changes made
    this.setState({
      rooms: filteredRooms,
      loaded: true,
    });
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
   * @param {FilteredRoom} room a room to display in this row
   * @returns {ReactElement<any>} a view describing a set of room
   */
  _renderRow({ item }: { item: FilteredRoom }): ReactElement < any > {
    const roomType = this._roomTypes[item.typeId];
    const icon = DisplayUtils.getPlatformIcon(Platform.OS, roomType);
    let rowIcon: ?ReactElement < any > = null;
    if (icon) {
      rowIcon = (
        <PaddedIcon
            color={Constants.Colors.primaryWhiteText}
            icon={icon} />
      );
    }

    return (
      <TouchableOpacity onPress={() => this.props.onSelect(this.props.shorthand, item.key)}>
        <View style={_styles.room}>
          {rowIcon}
          <View style={_styles.roomDescription}>
            {item.altName ? null : <Text style={_styles.roomType}>{item.altName}</Text>}
            <Text style={_styles.roomName}>{`${this.props.shorthand} ${item.key}`}</Text>
            <Text style={_styles.roomType}>
              {Translations.getName(this.props.language, roomType)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  /**
   * Renders a separator line between rows.
   *
   * @returns {ReactElement<any>} a separator for the list of rooms
   */
  _renderSeparator(): ReactElement < any > {
    return <View style={_styles.separator} />;
  }

  /**
   * Returns a list of touchable views listing the room names.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement < any > {
    return (
      <View style={_styles.container}>
        <FlatList
            ItemSeparatorComponent={this._renderSeparator}
            ListHeaderComponent={this._renderHeader.bind(this)}
            data={this.state.rooms}
            renderItem={this._renderRow.bind(this)} />
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
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Constants.Sizes.Margins.Expanded,
    backgroundColor: Constants.Colors.primaryWhiteText,
  },
});
