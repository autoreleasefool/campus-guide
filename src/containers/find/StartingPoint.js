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
  Alert,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Navigator } from 'react-native-deprecated-custom-components';

// Redux imports
import { connect } from 'react-redux';
import * as actions from 'actions';

// Types
import type {
  Building,
  Destination,
  Language,
  LatLong,
  LatLongDelta,
  Name,
  TranslatedName,
  Route,
  VoidFunction,
} from 'types';

// Type definition for component props.
type Props = {
  buildingList: Array < Object >,                                 // List of buildings to display
  clearSearch: VoidFunction,                                      // Clear the current search
  showSearch: (show: boolean) => void,                            // Hide or show the search box
  destination: ?Destination,                                      // The user's selected destination
  filter: ?string,                                                // Current search terms
  language: Language,                                             // The current language, selected by the user
  universityLocation: LatLong,                                    // Location of the university
  universityName: (Name | TranslatedName),                        // Name of the university
  onStartingPointSelected: (code: string, room: ?string) => void, // Selects a starting point for navigation
}

// Type definition for component state.
type State = {
  closestBuilding: ?Building,   // The closest building, or null if no buildings are nearby
  locating: boolean,            // Indicates if the app is searching for the closest building
  selectedBuilding: ?Building,  // The building the user has selected to navigate from
  viewingMap: boolean,          // True if the user is viewing the map to select a starting point
}

// Imports
import Header from 'Header';
import BuildingGrid from 'BuildingGrid';
import MapView from 'react-native-maps';
import PaddedIcon from 'PaddedIcon';
import RoomGrid from 'RoomGrid';
import Suggestion from 'Suggestion';
import * as Constants from 'Constants';
import * as ExternalUtils from 'ExternalUtils';
import * as TextUtils from 'TextUtils';
import * as Translations from 'Translations';

// Number of columns to display in building grid
const BUILDING_COLUMNS: number = 3;

// ID of route to select a building
const SELECT_BUILDING: number = 0;
// ID of route to select a room
const SELECT_ROOM: number = 1;

// Maximum distance to consider a building 'nearby'
const MAXIMUM_DISTANCE = 0.1; // 100 metres

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

    // Set the initial map region
    if (props.universityLocation) {
      this._initialRegion = {
        ...props.universityLocation,
        latitudeDelta: Constants.Map.DefaultDelta,
        longitudeDelta: Constants.Map.DefaultDelta,
      };
    } else {
      this._initialRegion = Constants.Map.InitialRegion;
    }

    this.state = {
      closestBuilding: null,
      locating: false,
      selectedBuilding: null,
      viewingMap: false,
    };

    // Buttons for viewing directions to the university
    this._directionsButtons = [
      { text: 'Google Maps', onPress: this._openMap.bind(this, 'google') },
      { text: Translations.get(this.props.language, 'cancel'), style: 'cancel' },
    ];

    if (Platform.OS === 'ios') {
      this._directionsButtons.splice(1, 0, { text: 'Apple Maps', onPress: this._openMap.bind(this, 'apple') });
    }
  }

  /**
   * Sets up the closest building to the user.
   */
  componentDidMount(): void {
    this._findClosestBuilding();
  }

  /** Starting region to display on map. */
  _initialRegion: LatLong & LatLongDelta;

  /** Buttons for viewing directions to the university */
  _directionsButtons: Array < Object >;

  /**
   * Sets the transition between two views in the navigator.
   *
   * @returns {Object} a configuration for the transition between scenes.
   */
  _configureScene(): Object {
    return Navigator.SceneConfigs.PushFromRight;
  }

  /**
   * Finds and displays the closest building.
   */
  _findClosestBuilding(): void {
    this.setState({ locating: true });
    navigator.geolocation.getCurrentPosition(
      (position: Object) => {
        const location = { latitude: position.coords.latitude, longitude: position.coords.longitude };

        let closestBuilding = null;
        let minDistance = -1;
        const totalBuildings = this.props.buildingList.length;
        for (let i = 0; i < totalBuildings; i++) {
          const building = this.props.buildingList[i];
          const distance = ExternalUtils.getDistanceBetweenCoordinates(
            building.lat,
            building.long,
            location.latitude,
            location.longitude
          );

          if (distance < minDistance || minDistance === -1) {
            minDistance = distance;
            closestBuilding = building;
          }
        }

        // Nearest building must be within a certain distance to be considered
        if (minDistance > MAXIMUM_DISTANCE) {
          closestBuilding = null;
        }

        this.setState({
          locating: false,
          closestBuilding,
        });
      },
      (err: any) => console.error('Could not get user location.', err),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  }

  /**
   * Opens the location of the university in either Google or Apple maps.
   *
   * @param {string} provider either 'google' or 'apple'
   */
  _openMap(provider: 'google' | 'apple'): void {
    const lat = this.props.universityLocation.latitude;
    const long = this.props.universityLocation.longitude;
    const link = provider === 'google'
        ? `https://www.google.com/maps/@${lat},${long},16z`
        : `http://maps.apple.com/?ll=${lat},${long}`;
    Linking.openURL(link).catch((err: any) => console.error('Could not open Google Maps link', err));
  }

  /**
   * Hides or shows the map to select the user's destination.
   */
  _toggleViewingMap(): void {
    this.props.showSearch(this.state.viewingMap);
    this.setState({ viewingMap: !this.state.viewingMap });
  }

  /**
   * Callback when the user has selected the nearest building.
   */
  _onClosestBuildingSelected(): void {
    if (this.state.closestBuilding) {
      this.props.onStartingPointSelected(this.state.closestBuilding.code, null);
    } else {
      const universityName = Translations.getName(this.props.language, this.props.universityName);
      Alert.alert(
        universityName,
        Translations.get(this.props.language, 'get_directions_to_university'),
        this._directionsButtons
      );
    }
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
          buildingList={this.props.buildingList}
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
   * Renders a navigator to switch between selecting a building or room.
   *
   * @returns {ReactElement<any>} a navigator component
   */
  _renderStartingPointList(): ReactElement < any > {
    return (
      <Navigator
          configureScene={this._configureScene}
          initialRoute={{ id: SELECT_BUILDING }}
          ref='Navigator'
          renderScene={this._renderScene.bind(this)} />
    );
  }

  /**
   * Renders a map to select a starting location.
   *
   * @returns {ReactElement<any>} a map component
   */
  _renderStartingPointMap(): ReactElement < any > {
    const suggestion = this.state.closestBuilding
        ? Translations.getName(this.props.language, this.state.closestBuilding)
        : Translations.get(this.props.language, 'no_buildings_nearby');

    console.log(suggestion);
    return (
      <View style={_styles.container}>
        <MapView
            followsUserLocation={true}
            initialRegion={this._initialRegion}
            showsUserLoction={true}
            style={_styles.map} />
        <Suggestion
            backgroundColor={Constants.Colors.secondaryBackground}
            language={this.props.language}
            loading={this.state.locating}
            suggestion={suggestion}
            onRefresh={this._findClosestBuilding.bind(this)}
            onSelect={this._onClosestBuildingSelected.bind(this)} />
      </View>
    );
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
        {this.state.viewingMap
          ? this._renderStartingPointMap()
          : this._renderStartingPointList()}
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
  map: {
    flex: 1,
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
    universityLocation: store.config.options.universityLocation,
    universityName: store.config.options.universityName,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    clearSearch: () => dispatch(actions.search(null)),
    onStartingPointSelected: (code: string, room: ?string) => {
      dispatch(actions.setStartingPoint({ code, room }));
      dispatch(actions.switchFindView(Constants.Views.Find.Steps));
    },
    showSearch: (show: boolean) => dispatch(actions.showSearch(show)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(StartingPoint);
