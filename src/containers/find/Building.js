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
 * @file Building.js
 * @description Provides details on a single building on campus.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

// Redux imports
import { connect } from 'react-redux';
import * as actions from 'actions';

// Types
import type { Building, Language } from 'types';

// Imports
import BuildingHeader from 'BuildingHeader';
import Header from 'Header';
import RoomGrid from 'RoomGrid';
import * as Constants from 'Constants';
import * as Translations from 'Translations';

class BuildingComponent extends React.Component {

  /**
   * Properties this component expects to be provided by its parent.
   */
  props: {
    building: Building,                                                 // Building to display details for
    filter: ?string,                                                    // The current filter for rooms
    language: Language,                                                 // The current language, selected by the user
    onDestinationSelected: (shorthand: string, room: ?string) => void,  // Callback for when a room is selected
  }

  /**
   * Informs parent that the user has selected a destination.
   *
   * @param {string} shorthand shorthand code of the building that has been selected
   * @param {?string} roomName name of the room selected, or null if a building was selected
   */
  _onDestinationSelected(shorthand: string, roomName: ?string): void {
    this.props.onDestinationSelected(shorthand, roomName);
  }

  /**
   * Returns a view which allows the user to navigate to the building depicted.
   *
   * @returns {ReactElement<any>} a touchable view
   */
  _renderBuildingDirections(): ReactElement < any > {
    const navigateToBuilding = `${Translations.get(this.props.language, 'navigate_to')} `
        + (Translations.getName(this.props.language, this.props.building) || '');

    return (
      <TouchableOpacity onPress={() => this._onDestinationSelected(this.props.building.shorthand, null)}>
        <Header
            backgroundColor={Constants.Colors.tertiaryBackground}
            icon={{ name: Platform.OS === 'ios' ? 'ios-navigate' : 'md-navigate', class: 'ionicon' }}
            title={navigateToBuilding} />
      </TouchableOpacity>
    );
  }

  /**
   * Renders a view with various specifics of the building, as well as an image.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render
   */
  _renderHeader(): ReactElement < any > {
    const building: Building = this.props.building;
    const buildingName = Translations.getName(this.props.language, building) || '';
    const buildingAddress = Translations.getVariant(this.props.language, 'address', building) || '';

    return (
      <View>
        <BuildingHeader
            address={buildingAddress}
            facilities={building.facilities}
            image={building.image}
            language={this.props.language}
            name={buildingName}
            shorthand={building.shorthand} />
        {this._renderBuildingDirections()}
      </View>
    );
  }

  /**
   * Renders a view containing an image of the building, it's name, and a list of its rooms and facilities.
   *
   * @returns {ReactElement<any>} a view describing a building.
   */
  render(): ReactElement < any > {
    const building: Building = this.props.building;

    return (
      <View style={_styles.container}>
        <RoomGrid
            defaultRoomType={Constants.DefaultRoomType}
            filter={this.props.filter}
            language={this.props.language}
            renderHeader={this._renderHeader.bind(this)}
            rooms={building.rooms}
            shorthand={building.shorthand}
            onSelect={this._onDestinationSelected.bind(this)} />
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
});

const mapStateToProps = (store) => {
  return {
    building: store.directions.building,
    filter: store.search.terms,
    language: store.config.options.language,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onDestinationSelected: (shorthand: string, room: ?string) => {
      dispatch(actions.setDestination({ shorthand, room }));
      dispatch(actions.setHeaderTitle('directions', 'find'));
      dispatch(actions.switchFindView(Constants.Views.Find.StartingPoint));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(BuildingComponent);
