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
 * @file StartingPoint.tsx
 * @description Allows the user to select their starting position
 */
'use strict';

// React imports
import React from 'react';
import {
  Alert,
  InteractionManager,
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
import * as actions from '../../actions';

// Imports
import Header from '../../components/Header';
import ImageGrid from '../../components/ImageGrid';
import MapView from 'react-native-maps';
import PaddedIcon from '../../components/PaddedIcon';
import RoomGrid from '../../components/RoomGrid';
import Suggestion from '../../components/Suggestion';
import * as Constants from '../../constants';
import * as Navigation from '../../util/Navigation';
import * as TextUtils from '../../util/TextUtils';
import * as Translations from '../../util/Translations';

// Types
import { AlertButton } from 'react-native';
import { Language } from '../../util/Translations';
import { LatLong, LatLongDelta, Name, Route } from '../../../typings/global';
import { Building, Destination } from '../../../typings/university';

/** Wrapper for an error when location handling occurs. */
interface LocationError {
  message: string;  // Error message
  onPress?(): void; // Handler for when user takes action
}

interface Props {
  buildingList: Building[];             // List of buildings to display
  destination: Destination | undefined; // The user's selected destination
  filter: string;                       // Current search terms
  language: Language;                   // The current language, selected by the user
  universityLocation: LatLong;          // Location of the university
  universityName: Name;                 // Name of the university
  clearSearch(): void;                  // Clear the current search
  onStartingPointSelected(shorthand: string, room: string | undefined): void;
                                        // Selects a starting point for navigation
  showSearch(show: boolean): void;      // Hide or show the search box
}

interface State {
  closestBuilding: Building | undefined;    // The closest building, or undefined if no buildings are nearby
  locating: boolean;                        // Indicates if the app is searching for the closest building
  locationError: LocationError | undefined; // If an error occurred getting the user's location, it is provided here
  region: LatLong & LatLongDelta;           // Current region displayed on the map
  selectedBuilding: Building | undefined;   // The building the user has selected to navigate from
  viewingMap: boolean;                      // True if the user is viewing the map to select a starting point
}

// Number of columns to display in building grid
const BUILDING_COLUMNS = 3;

// ID of route to select a building
const SELECT_BUILDING = 0;
// ID of route to select a room
const SELECT_ROOM = 1;

// Maximum distance to consider a building 'nearby'
const MAXIMUM_DISTANCE = 0.1; // 100 metres

class StartingPoint extends React.PureComponent<Props, State> {

  /** Starting region to display on map. */
  _initialRegion: LatLong & LatLongDelta;

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
      closestBuilding: undefined,
      locating: false,
      locationError: undefined,
      region: this._initialRegion,
      selectedBuilding: undefined,
      viewingMap: false,
    };
  }

  /**
   * Sets up the closest building to the user.
   */
  componentDidMount(): void {
    InteractionManager.runAfterInteractions(() => this._findClosestBuilding());
  }

  /**
   * Sets the transition between two views in the navigator.
   *
   * @returns {any} a configuration for the transition between scenes
   */
  _configureScene(): any {
    return Navigator.SceneConfigs.PushFromRight;
  }

  /**
   * Finds and displays the closest building.
   */
  _findClosestBuilding(): void {
    this.setState({ locating: true });
    navigator.geolocation.getCurrentPosition((position: any) => {
      const location = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      this.setState({
        closestBuilding: Navigation.findClosestBuilding(location, this.props.buildingList, MAXIMUM_DISTANCE),
        locating: false,
        locationError: undefined,
      });
    },
      (err: any) => this._showLocationErrorMessage(err),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  }

  /**
   * Opens the location of the university in either Google or Apple maps.
   *
   * @param {string} provider either 'google' or 'apple'
   */
  _openMap(provider: 'google' | 'apple'): void {
    const latitude = this.props.universityLocation.latitude;
    const longitude = this.props.universityLocation.longitude;
    const link = provider === 'google'
        ? `https://www.google.com/maps/@${latitude},${longitude},16z`
        : `http://maps.apple.com/?ll=${latitude},${longitude}`;
    Linking.openURL(link).catch((err: any) => console.error('Could not open Google Maps link', err));
  }

  /**
   * Informs user of an error when their location could not be determined.
   *
   * @param {Error} error the error thrown when requesting user location.
   */
  _showLocationErrorMessage(error: any): void {
    console.log('Could not get user location', error);
    let locationError: LocationError = {
      message: error.message,
    };

    /* tslint:disable prefer-switch */
    /* error.PERMISSION_DENIED and others may not exist on error. */

    if (error.code === error.PERMISSION_DENIED) {
      locationError = {
        message: 'location_permission_denied',
      };
    } else if (error.code === error.TIMEOUT) {
      locationError = {
        message: 'location_timeout',
        onPress: (): void => this._findClosestBuilding(),
      };
    } else if (error.code === error.POSITION_UNAVAILABLE) {
      locationError = {
        message: 'location_position_unavailable',
        onPress: (): void => this._findClosestBuilding(),
      };
    }

    /* tslint:enable prefer-switch */

    this.setState({ locationError });
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
      // TODO: remove undefined
      this.props.onStartingPointSelected(this.state.closestBuilding.shorthand, undefined);
    } else {
      const universityName = Translations.getName(this.props.universityName);

      // Buttons for viewing directions to the university
      const buttons: AlertButton[] = [
        { text: Translations.get('cancel'), style: 'cancel' },
        { text: 'Google Maps', onPress: this._openMap.bind(this, 'google') },
      ];

      if (Platform.OS === 'ios') {
        buttons.splice(1, 0, { text: 'Apple Maps', onPress: this._openMap.bind(this, 'apple') });
      }

      Alert.alert(
        universityName,
        Translations.get('get_directions_to_university'),
        buttons
      );
    }
  }

  /**
   * Displays the rooms of the selected building
   *
   * @param {Building|undefined} building object describing the building
   */
  _onBuildingSelected(building: Building | undefined): void {
    if (building != undefined) {
      this.props.clearSearch();
      (this.refs.Navigator as any).push({ id: SELECT_ROOM, data: building });
    }
  }

  /**
   * Sets the user's starting point for navigation
   *
   * @param {string}           shorthand shorthand code of the building that has been selected
   * @param {string|undefined} room      name of the room selected, or undefined if a building was selected
   */
  _onRoomSelected(shorthand: string, room: string | undefined): void {
    this.props.onStartingPointSelected(shorthand, room);
  }

  /**
   * Renders the list of buildings for the user to select as their starting point.
   *
   * @returns {JSX.Element} a grid of images
   */
  _renderImageGrid(): JSX.Element {
    return (
      <ImageGrid
          columns={BUILDING_COLUMNS}
          filter={this.props.filter}
          images={this.props.buildingList}
          language={this.props.language}
          onSelect={this._onBuildingSelected.bind(this)} />
    );
  }

  /**
   * Renders an option to navigate to a building's lobby
   *
   * @param {string} shorthand the building shorthand code
   * @returns {JSX.Element} a text view displaying the building's code
   */
  _renderBuildingLobby(shorthand: string): JSX.Element {
    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity onPress={(): void => this._onRoomSelected(shorthand, undefined)}>
          <View style={_styles.buildingLobby}>
            <PaddedIcon
                color={Constants.Colors.primaryWhiteIcon}
                icon={{ name: 'store', class: 'material' }} />
            <Text style={_styles.lobbyText}>
              {`${shorthand} ${Translations.get('lobby').toLowerCase()}`}
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
   * @returns {JSX.Element|undefined} a Header and Text view
   */
  _renderDestination(): JSX.Element | undefined {
    const destination = this.props.destination;
    if (destination == undefined) {
      return undefined;
    }

    return (
      <View>
        <Header
            backgroundColor={Constants.Colors.tertiaryBackground}
            icon={{ name: 'directions', class: 'material' }}
            title={Translations.get('navigating_to')} />
        <Text style={_styles.navigatingTo}>{TextUtils.destinationToString(destination)}</Text>
      </View>
    );
  }

  /**
   * Renders a header, with a callback to switch between viewing a list of buildings, and a map.
   *
   * @returns {JSX.Element} a Header view, with subtitle to switch between list and map
   */
  _renderStartingPointHeader(): JSX.Element {
    let subtitleText;
    let subtitleIcon;
    if (this.state.viewingMap) {
      subtitleText = Translations.get('view_list');
      subtitleIcon = { name: 'view-list', class: 'material' };
    } else {
      subtitleText = Translations.get('view_map');
      subtitleIcon = { name: 'map', class: 'material' };
    }

    return (
      <Header
          backgroundColor={Constants.Colors.tertiaryBackground}
          icon={{ name: 'place', class: 'material' }}
          subtitle={subtitleText}
          subtitleCallback={this._toggleViewingMap.bind(this)}
          subtitleIcon={subtitleIcon}
          title={Translations.get('starting_point')} />
    );
  }

  /**
   * Renders a list of rooms to select from a building.
   *
   * @param {Building} building the building to render rooms from
   * @returns {JSX.Element} a room grid
   */
  _renderRoomGrid(building: Building): JSX.Element {
    return (
      <View style={_styles.container}>
        <Header
            icon={{ name: 'chevron-left', class: 'material' }}
            iconCallback={(): void => (this.refs.Navigator as any).pop()}
            title={Translations.getName(building) || ''} />
        <RoomGrid
            filter={this.props.filter}
            language={this.props.language}
            renderHeader={this._renderBuildingLobby.bind(this, building.shorthand)}
            rooms={building.rooms}
            shorthand={building.shorthand}
            onSelect={this._onRoomSelected.bind(this)} />
      </View>
    );
  }

  /**
   * Renders a view according to the current route of the navigator.
   *
   * @param {Route} route object with properties to identify the route to display
   * @returns {JSX.Element} the view to render, based on {route}
   */
  _renderScene(route: Route): JSX.Element {
    switch (route.id) {
      case SELECT_BUILDING:
        return this._renderImageGrid();
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
   * @returns {JSX.Element} a navigator component
   */
  _renderStartingPointList(): JSX.Element {
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
   * @returns {JSX.Element} a map component
   */
  _renderStartingPointMap(): JSX.Element {
    if (this.state.locationError) {
      return (
        <View style={_styles.container}>
          <View style={_styles.locationErrorContainer}>
            <TouchableOpacity onPress={this.state.locationError.onPress}>
              <Text style={_styles.locationError}>
                {Translations.get(this.state.locationError.message)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    const suggestion = this.state.closestBuilding
        ? Translations.getName(this.state.closestBuilding)
        : Translations.get('no_buildings_nearby');

    return (
      <View style={_styles.container}>
        <MapView
            followsUserLocation={true}
            initialRegion={this._initialRegion}
            showsUserLocation={true}
            style={_styles.map}
            onRegionChange={(region: LatLong & LatLongDelta): void => this.setState({ region })} />
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
   * @returns {JSX.Element} the hierarchy of views to render
   */
  render(): JSX.Element {
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
  buildingLobby: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    marginBottom: Constants.Sizes.Margins.Expanded,
    marginRight: Constants.Sizes.Margins.Expanded,
    marginTop: Constants.Sizes.Margins.Expanded,
  },
  container: {
    backgroundColor: Constants.Colors.primaryBackground,
    flex: 1,
  },
  lobbyText: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
  },
  locationError: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Subtitle,
    textAlign: 'center',
  },
  locationErrorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    margin: Constants.Sizes.Margins.Regular,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  navigatingTo: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Subtitle,
    margin: Constants.Sizes.Margins.Expanded,
  },
  separator: {
    backgroundColor: Constants.Colors.tertiaryBackground,
    height: StyleSheet.hairlineWidth,
    marginLeft: Constants.Sizes.Margins.Expanded,
  },
});

const mapStateToProps = (store: any): any => {
  return {
    destination: store.directions.destination,
    filter: store.search.tabTerms.find,
    language: store.config.options.language,
    universityLocation: store.config.options.universityLocation,
    universityName: store.config.options.universityName,
  };
};

const mapDispatchToProps = (dispatch: any): any => {
  return {
    clearSearch: (): void => dispatch(actions.search('find', '')),
    onStartingPointSelected: (shorthand: string, room: string | undefined): void => {
      dispatch(actions.setHeaderTitle('directions', 'find', Constants.Views.Find.Steps));
      dispatch(actions.setStartingPoint({ shorthand, room }));
      dispatch(actions.switchFindView(Constants.Views.Find.Steps));
    },
    showSearch: (show: boolean): void => dispatch(actions.showSearch(show)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(StartingPoint) as any;
