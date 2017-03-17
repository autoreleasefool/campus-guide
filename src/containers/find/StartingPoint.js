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
 * @created 2017-03-17
 * @file StartingPoint.js
 * @description Allows the user to select their starting position
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  Navigator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Redux imports
import { connect } from 'react-redux';
import * as actions from 'actions';

// Types
import type { Building, Destination, Language, Route, VoidFunction } from 'types';

// Type definition for component props.
type Props = {
  clearSearch: VoidFunction,                                      // Clear the current search
  destination: ?Destination,                                      // The user's selected destination
  filter: ?string,                                                // Current search terms
  language: Language,                                             // The current language, selected by the user
  onStartingPointSelected: (code: string, room: ?string) => void, // Selects a starting point for navigation
}

// Type definition for component state.
type State = {
  selectedBuilding: ?Building,  // The building the user has selected to navigate from
  viewingMap: boolean,          // True if the user is viewing the map to select a starting point
}

// Imports
import Header from 'Header';
import BuildingGrid from 'BuildingGrid';
import PaddedIcon from 'PaddedIcon';
import RoomGrid from 'RoomGrid';
import * as Constants from 'Constants';
import * as TextUtils from 'TextUtils';
import * as Translations from 'Translations';

// Number of columns to display in building grid
const BUILDING_COLUMNS: number = 3;

// ID of route to select a building
const SELECT_BUILDING: number = 0;
// ID of route to select a room
const SELECT_ROOM: number = 1;

class StartingPoint extends React.Component {

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
      selectedBuilding: null,
      viewingMap: false,
    };
  }

  /**
   * Sets the transition between two views in the navigator.
   *
   * @returns {Object} a configuration for the transition between scenes.
   */
  _configureScene(): Object {
    return Navigator.SceneConfigs.PushFromRight;
  }

  /**
   * Hides or shows the map to select the user's destination.
   */
  _toggleViewingMap(): void {
    this.setState({ viewingMap: !this.state.viewingMap });
  }

  /**
   * Displays the rooms of the selected building
   *
   * @param {Building} building object describing the building
   */
  _onBuildingSelected(building: ?Building): void {
    if (building != null) {
      this.props.clearSearch();
      this.refs.Navigator.push({ id: SELECT_ROOM, data: building });
    }
  }

  /**
   * Sets the user's starting point for navigation
   *
   * @param {string}  code code of the building that has been selected
   * @param {?string} room name of the room selected, or null if a building was selected
   */
  _onRoomSelected(code: string, room: ?string): void {
    this.props.onStartingPointSelected(code, room);
  }

  /**
   * Renders the list of buildings for the user to select as their starting point.
   *
   * @returns {ReactElement<any>} a building grid
   */
  _renderBuildingGrid(): ReactElement < any > {
    return (
      <BuildingGrid
          columns={BUILDING_COLUMNS}
          filter={this.props.filter}
          language={this.props.language}
          onSelect={this._onBuildingSelected.bind(this)} />
    );
  }

  /**
   * Renders an option to navigate to a building's lobby
   *
   * @param {string} code the building code
   * @returns {ReactElement<any>} a text view displaying the building's code
   */
  _renderBuildingLobby(code: string): ReactElement < any > {
    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity onPress={() => this._onRoomSelected(code, null)}>
          <View style={_styles.buildingLobby}>
            <PaddedIcon
                color={Constants.Colors.primaryWhiteIcon}
                icon={{ name: 'store', class: 'material' }} />
            <Text style={_styles.lobbyText}>
              {`${code} ${Translations.get(this.props.language, 'lobby').toLowerCase()}`}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={_styles.separator} />
      </View>
    );
  }

  /**
   * Renders a view describing the user's selected destination.
   *
   * @returns {?ReactElement<any>} a Header and Text view
   */
  _renderDestination(): ?ReactElement < any > {
    const destination = this.props.destination;
    if (destination == null) {
      return null;
    }

    return (
      <View>
        <Header
            backgroundColor={Constants.Colors.tertiaryBackground}
            icon={{ name: 'directions', class: 'material' }}
            title={Translations.get(this.props.language, 'navigating_to')} />
        <Text style={_styles.navigatingTo}>{TextUtils.destinationToString(destination)}</Text>
      </View>
    );
  }

  /**
   * Renders a header, with a callback to switch between viewing a list of buildings, and a map.
   *
   * @returns {ReactElement<any>} a Header view, with subtitle to switch between list and map
   */
  _renderStartingPointHeader(): ReactElement < any > {
    let subtitleText;
    let subtitleIcon;
    if (this.state.viewingMap) {
      subtitleText = Translations.get(this.props.language, 'view_list');
      subtitleIcon = { name: 'view-list', class: 'material' };
    } else {
      subtitleText = Translations.get(this.props.language, 'view_map');
      subtitleIcon = { name: 'map', class: 'material' };
    }

    return (
      <Header
          backgroundColor={Constants.Colors.tertiaryBackground}
          icon={{ name: 'place', class: 'material' }}
          subtitle={subtitleText}
          subtitleCallback={this._toggleViewingMap.bind(this)}
          subtitleIcon={subtitleIcon}
          title={Translations.get(this.props.language, 'starting_point')} />
    );
  }

  /**
   * Renders a list of rooms to select from a building.
   *
   * @param {Building} building the building to render rooms from
   * @returns {ReactElement<any>} a room grid
   */
  _renderRoomGrid(building: Building): ReactElement < any > {
    return (
      <View style={_styles.container}>
        <Header
            icon={{ name: 'chevron-left', class: 'material' }}
            iconCallback={() => this.refs.Navigator.pop()}
            title={Translations.getName(this.props.language, building) || ''} />
        <RoomGrid
            code={building.code}
            defaultRoomType={Constants.DefaultRoomType}
            filter={this.props.filter}
            language={this.props.language}
            renderHeader={this._renderBuildingLobby.bind(this, building.code)}
            rooms={building.rooms}
            onSelect={this._onRoomSelected.bind(this)} />
      </View>
    );
  }

  /**
   * Renders a view according to the current route of the navigator.
   *
   * @param {Route} route object with properties to identify the route to display.
   * @returns {ReactElement<any>} the view to render, based on {route}.
   */
  _renderScene(route: Route): ReactElement < any > {
    switch (route.id) {
      case SELECT_BUILDING:
        return this._renderBuildingGrid();
      case SELECT_ROOM:
        return this._renderRoomGrid(route.data);
      default:
        // TODO: generic error view?
        return (
          <View style={_styles.container} />
        );
    }
  }

  /**
   * Renders a navigator to switch between selecting a building and a room
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement < any > {
    return (
      <View style={_styles.container}>
        {this._renderDestination()}
        {this._renderStartingPointHeader()}
        <Navigator
            configureScene={this._configureScene}
            initialRoute={{ id: SELECT_BUILDING }}
            ref='Navigator'
            renderScene={this._renderScene.bind(this)} />
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
  navigatingTo: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Subtitle,
    margin: Constants.Sizes.Margins.Expanded,
  },
  buildingLobby: {
    flex: 1,
    flexDirection: 'row',
    marginTop: Constants.Sizes.Margins.Expanded,
    marginRight: Constants.Sizes.Margins.Expanded,
    marginBottom: Constants.Sizes.Margins.Expanded,
    alignItems: 'center',
  },
  lobbyText: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Constants.Sizes.Margins.Expanded,
    backgroundColor: Constants.Colors.tertiaryBackground,
  },
});

const mapStateToProps = (store) => {
  return {
    destination: store.directions.destination,
    filter: store.search.terms,
    language: store.config.options.language,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    clearSearch: () => dispatch(actions.search(null)),
    onStartingPointSelected: (code: string, room: ?string) => {
      dispatch(actions.setStartingPoint({ code, room }));
      dispatch(actions.switchFindView(Constants.Views.Find.Steps));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(StartingPoint);
