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
 * @file RoomGrid.tsx
 * @description Displays the list of rooms in a certain building.
 */
'use strict';

// React imports
import React from 'react';
import {
  FlatList,
  InteractionManager,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Imports
import PaddedIcon from './PaddedIcon';
import * as Configuration from '../util/Configuration';
import * as Constants from '../constants';
import * as Display from '../util/Display';
import * as Translations from '../util/Translations';
import { filterRoom } from '../util/Search';

// Types
import { Language } from '../util/Translations';
import { BuildingRoom } from '../../typings/university';

interface Props {
  shorthand: string;                                    // Unique shorthand identifier for the building
  filter: string;                                       // Filter the list of rooms
  language: Language;                                   // Language to display building names in
  rooms: BuildingRoom[];                                // The list of rooms in the building
  renderHeader?(): JSX.Element;                         // Render a custom header at the top of the list
  onSelect(sh: string, room: string | undefined): void; // Callback function for when a room is selected
}

interface State {
  loaded: boolean;        // Indicates if the room data has been loaded
  rooms: BuildingRoom[];  // List of rooms
}

export default class RoomGrid extends React.PureComponent<Props, State> {

  /** Room type descriptions. */
  _roomTypes: any;

  /** List of available room type IDs. */
  _roomTypeIds: string[];

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
  }

  /**
   * Loads configuration file containing data of rooms.
   */
  componentDidMount(): void {
    if (!this.state.loaded) {
      InteractionManager.runAfterInteractions(() => this.loadConfiguration());
    }
  }

  /**
   * If a new filter is provided, update the list of rooms.
   *
   * @param {Props} nextProps the new props being received
   */
  componentWillReceiveProps(nextProps: Props): void {
    if (nextProps.filter !== this.props.filter || nextProps.language !== this.props.language) {
      this._filterRooms(nextProps);
    }
  }

  /**
   * Asynchronously load relevant configuration files and cache the results.
   */
  async loadConfiguration(): Promise<void> {
    try {
      const roomTypeInfo = await Configuration.getConfig('/room_types.json');
      this._roomTypes = roomTypeInfo.types;
      this._roomTypeIds = roomTypeInfo.ids;
      this._filterRooms(this.props);
    } catch (err) {
      console.error('Configuration could not be initialized for room grid.', err);
    }
  }

  /**
   * Filters the rooms in the building and displays them to the user.
   *
   * @param {Props} props the props to filter with
   */
  _filterRooms({ shorthand, filter, language, rooms }: Props): void {
    // If configuration hasn't been loaded, don't filter
    if (this._roomTypes == undefined || this._roomTypeIds == undefined) {
      return;
    }

    // Ignore the case of the search terms
    const adjustedFilter = filter.toUpperCase();

    // Create array for sets of rooms
    const filteredRooms: BuildingRoom[] = [];

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
        filteredRooms.push(room);
      }
    });

    // Update the state so the app reflects the changes made
    this.setState({
      loaded: true,
      rooms: filteredRooms,
    });
  }

  /**
   * Renders a header for the list of rooms.
   *
   * @returns {JSX.Element|undefined} the header, if this.propsrenderHeader is provided
   */
  _renderHeader(): JSX.Element | undefined {
    /* tslint:disable no-null-keyword */
    /* Allow null since ReactNative doesn't like undefined components in their lists. */
    return this.props.renderHeader ? this.props.renderHeader() : null;
    /* tslint:enable no-null-keyword */
  }

  /**
   * Renders an item describing a single room in the building.
   *
   * @param {BuildingRoom} room a room to display in this row
   * @returns {JSX.ElementReactElement<any>} a view describing a set of room
   */
  _renderRow({ item }: { item: BuildingRoom }): JSX.Element {
    const roomType = this._roomTypes[item.type || Constants.DefaultRoomType];
    const icon = Display.getPlatformIcon(Platform.OS, roomType);
    let rowIcon: JSX.Element | undefined;
    if (icon) {
      rowIcon = (
        <PaddedIcon
            color={Constants.Colors.primaryWhiteText}
            icon={icon} />
      );
    }

    const altName = Translations.getVariant(this.props.language, 'alt_name', item);

    return (
      <TouchableOpacity onPress={(): void => this.props.onSelect(this.props.shorthand, item.name)}>
        <View style={_styles.room}>
          {rowIcon}
          <View style={_styles.roomDescription}>
            {altName ? <Text style={_styles.roomType}>{altName}</Text> : undefined}
            <Text style={_styles.roomName}>{`${this.props.shorthand} ${item.name}`}</Text>
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
   * @returns {JSX.Element} a separator for the list of rooms
   */
  _renderSeparator(): JSX.Element {
    return <View style={_styles.separator} />;
  }

  /**
   * Returns a list of touchable views listing the room names.
   *
   * @returns {JSX.Element} the hierarchy of views to render
   */
  render(): JSX.Element {
    return (
      <View style={_styles.container}>
        <FlatList
            ItemSeparatorComponent={this._renderSeparator.bind(this)}
            ListHeaderComponent={this._renderHeader.bind(this)}
            data={this.state.rooms}
            keyExtractor={(room: BuildingRoom): string => room.name}
            renderItem={this._renderRow.bind(this)} />
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    backgroundColor: Constants.Colors.primaryBackground,
    flex: 1,
  },
  room: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    marginBottom: Constants.Sizes.Margins.Expanded,
    marginRight: Constants.Sizes.Margins.Expanded,
    marginTop: Constants.Sizes.Margins.Expanded,
  },
  roomDescription: {
    flex: 1,
  },
  roomName: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
    marginBottom: Constants.Sizes.Margins.Condensed,
    marginTop: Constants.Sizes.Margins.Condensed,
  },
  roomType: {
    color: Constants.Colors.secondaryWhiteText,
    fontSize: Constants.Sizes.Text.Caption,
  },
  separator: {
    backgroundColor: Constants.Colors.primaryWhiteText,
    height: StyleSheet.hairlineWidth,
    marginLeft: Constants.Sizes.Margins.Expanded,
  },
});
