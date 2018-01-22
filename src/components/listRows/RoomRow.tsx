/**
 *
 * @license
 * Copyright (C) 2018 Joseph Roque
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
 * @created 2018-01-22
 * @file RoomRow.tsx
 * @description Displays the list of rooms in a certain building.
 */
'use strict';

// React imports
import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Imports
import PaddedIcon from './../PaddedIcon';
import * as Constants from '../../constants';
import * as Display from '../../util/Display';
import * as Translations from '../../util/Translations';

// Types
import { BuildingRoom } from '../../../typings/university';

interface Props {
  room: BuildingRoom;                                   // Room to render
  roomType: any;                                        // Type of room
  shorthand: string;                                    // Unique shorthand identifier for the building
  onSelect(sh: string, room: string | undefined): void; // Callback function for when a room is selected
}

interface State {}

export default class RoomRow extends React.PureComponent<Props, State> {

  /**
   * Handle a tap event on this room.
   */
  _onPress = (): void => {
    this.props.onSelect(this.props.shorthand, this.props.room.name);
  }

  /**
   * Renders an item describing a single room in the building.
   *
   * @param {BuildingRoom} room a room to display in this row
   * @returns {JSX.Element} a view describing a set of room
   */
  render(): JSX.Element {
    const { room, roomType, shorthand }: Props = this.props;
    const icon = Display.getPlatformIcon(Platform.OS, roomType);
    let rowIcon: JSX.Element | undefined;
    if (icon) {
      rowIcon = (
        <PaddedIcon
            color={Constants.Colors.primaryWhiteText}
            icon={icon} />
      );
    }

    const altName = Translations.getVariant('alt_name', room);

    return (
      <TouchableOpacity onPress={this._onPress}>
        <View style={_styles.room}>
          {rowIcon}
          <View style={_styles.roomDescription}>
            {altName ? <Text style={_styles.roomType}>{altName}</Text> : undefined}
            <Text style={_styles.roomName}>{`${shorthand} ${room.name}`}</Text>
            <Text style={_styles.roomType}>
              {Translations.getName(roomType)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
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
});
