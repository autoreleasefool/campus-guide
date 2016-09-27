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
 * @file NavigationHome.js
 * @providesModule NavigationHome
 * @description Allows the user to confirm their starting and ending location for navigation.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  Dimensions,
  LayoutAnimation,
  Navigator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Type imports
import type {
  Building,
  CampusDestination,
  LatLong,
  LatLongDelta,
  Route,
} from 'types';

// Type definition for component props.
type Props = {
  destination: CampusDestination,
}

// Type definition for component state.
type State = {
  findLocationOnMap: boolean,
  loaded: boolean,
  region: ?(LatLong & LatLongDelta),
  startingPoint: {buildingCode?: string, roomName?: string},
}

// Imports
const BuildingGrid = require('BuildingGrid');
const Configuration = require('Configuration');
const Constants = require('Constants');
const MapView = require('react-native-maps');
const MaterialIcons = require('react-native-vector-icons/MaterialIcons');
const Preferences = require('Preferences');
const RoomList = require('RoomList');
const SectionHeader = require('SectionHeader');
const TranslationUtils = require('TranslationUtils');

const {width} = Dimensions.get('window');

/** Represents the route to select a building. */
const BUILDING_SELECT = 0;

/** Represents the route to select a room in a building. */
const ROOM_SELECT = 1;

class NavigationHome extends React.Component {

  /**
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    destination: React.PropTypes.object.isRequired,
  };

  state: State;

  /**
   * Pass props and declares initial state.
   *
   * @param {Props} props properties passed from container to this component.
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      findLocationOnMap: false,
      loaded: false,
      region: null,
      startingPoint: {},
    };

    // Explicitly bind 'this' to methods that require it
    (this:any)._setFindLocationOnmap = this._setFindLocationOnmap.bind(this);
  }

  componentDidMount(): void {
    if (!this.state.loaded) {
      Configuration.init()
          .then(this._prepareInitialRegion.bind(this))
          .catch(err => console.log('Could not initialize configuration for navigation.', err));
    }
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
   * Gets the location of the University as a default starting location for the map.
   */
  _prepareInitialRegion(): void {
    const university = Configuration.getUniversity();
    if (university == null) {
      this.setState({
        region: {
          latitude: 45.4222,
          longitude: -75.6824,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        loaded: true,
      });
    } else {
      this.setState({
        region: {
          latitude: university.lat,
          longitude: university.long,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        loaded: true,
      });
    }
  }

  /**
   * Switches between views to find the user's location with the GPS or by selecting a building.
   *
   * @param {boolean} findLocationOnMap true to use GPS, false to use building
   */
  _setFindLocationOnmap(findLocationOnMap: boolean): void {
    LayoutAnimation.easeInEaseOut();
    this.setState({
      findLocationOnMap: findLocationOnMap,
    });
  }

  /**
   * Sets the selected building.
   *
   * @param {Building} building details of the selected building
   */
  _onBuildingSelected(building: Building): void {
    this.setState({
      startingPoint: {buildingCode: building.code},
    });
    this.refs.Navigator.push({id: ROOM_SELECT, data: {building: building}});
  }

  /**
   * Sets the selected room.
   *
   * @param {string} buildingCode unique building code.
   * @param {string} roomName     name of the room within the building.
   */
  _onRoomSelected(buildingCode: string, roomName: string): void {
    this.setState({
      startingPoint: {buildingCode: buildingCode, roomName: roomName},
    });
  }

  _onRegionChange(region: LatLong & LatLongDelta): void {
    this.setState({
      region: region,
    });
  }

  /**
   * Depending on the route id provided, displays either a BuildingGrid or a RoomList.
   *
   * @param {Route} route id to determine view and data to pass to the view.
   * @returns {ReactElement<any>} views to render
   */
  _renderBuildingOrRoom(route: Route): ReactElement < any > {
    // Get current language for translations
    const Translations: Object = TranslationUtils.getTranslations(Preferences.getSelectedLanguage());

    if (route.id === BUILDING_SELECT) {
      return (
        <View style={_styles.container}>
          <SectionHeader
              sectionIcon={'store'}
              sectionIconClass={'material'}
              sectionName={Translations.building_directory} />
          <View style={_styles.separator} />
          <BuildingGrid selectBuilding={this._onBuildingSelected.bind(this)} />
        </View>
      );
    } else if (route.id === ROOM_SELECT) {
      // Get icon for back button
      let backIconName: string;
      let backIconClass: string;
      if (Platform.OS === 'ios') {
        backIconName = 'ios-arrow-back';
        backIconClass = 'ionicon';
      } else {
        backIconName = 'arrow-back';
        backIconClass = 'material';
      }

      return (
        <View style={_styles.container}>
          <TouchableOpacity onPress={() => this.refs.Navigator.pop()}>
            <SectionHeader
                sectionIcon={backIconName}
                sectionIconClass={backIconClass}
                sectionName={Translations.return_to_buildings} />
          </TouchableOpacity>
          <View style={_styles.separator} />
          <RoomList
              buildingCode={route.data.building.code}
              roomSelected={this._onRoomSelected.bind(this)}
              rooms={route.data.building.rooms} />
        </View>
      );
    } else {
      throw new Error('Invalid route. Can only select room and building. Route is ' + route.id);
    }
  }

  /**
   * Displays views to describe the user's selected starting location, and their destination.
   *
   * @returns {ReactElement<any>} a set of views and icons.
   */
  _renderDestination(): ReactElement < any > {
    // Get current language for translations
    const Translations: Object = TranslationUtils.getTranslations(Preferences.getSelectedLanguage());

    let startingPoint: string;
    if (this.state.startingPoint.buildingCode) {
      if (this.state.startingPoint.roomName) {
        startingPoint = (String:any).format(
          Translations.x_greater_than_y,
          this.state.startingPoint.buildingCode,
          this.state.startingPoint.roomName
        );
      } else {
        startingPoint = (String:any).format(
          Translations.x_greater_than_y,
          this.state.startingPoint.buildingCode,
          Translations.lobby
        );
      }
    } else {
      startingPoint = Translations.choose_starting_point;
    }

    let destination: string;
    if (this.props.destination.roomName) {
      destination = (String:any).format(
        Translations.x_greater_than_y,
        this.props.destination.buildingCode,
        this.props.destination.roomName
      );
    } else {
      destination = (String:any).format(
        Translations.x_greater_than_y,
        this.props.destination.buildingCode,
        Translations.lobby
      );
    }

    return (
      <View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <View style={{flexDirection: 'column', flex: 1}}>
            <SectionHeader
                backgroundOverride={Constants.Colors.garnet}
                sectionIcon={'near-me'}
                sectionIconClass={'material'}
                sectionName={startingPoint} />
            <SectionHeader
                sectionIcon={'place'}
                sectionIconClass={'material'}
                sectionName={destination} />
          </View>
          <TouchableOpacity style={_styles.directionsIconContainer}>
            <MaterialIcons
                color={'white'}
                name={'directions'}
                size={Constants.Icon.Large}
                style={_styles.directionsIcon} />
          </TouchableOpacity>
        </View>
        <Text style={_styles.instruction}>{Translations.select_building_or_locate}</Text>
        <View style={_styles.separator} />
      </View>
    );
  }

  /**
   * Renders a set of views so the user can select their starting location.
   *
   * @returns {ReactElement<any>} either a navigator for narrowing user location with building/rooms, or a map.
   */
  _renderStartingLocation(): ReactElement < any > {
    // Get current language for translations
    const Translations: Object = TranslationUtils.getTranslations(Preferences.getSelectedLanguage());

    if (this.state.findLocationOnMap) {
      return (
        <View style={_styles.container}>
          <MapView
              region={this.state.region}
              showUserLocation={true}
              style={_styles.map}
              onRegionChange={this._onRegionChange.bind(this)} />
          <TouchableOpacity onPress={() => this._setFindLocationOnmap(!this.state.findLocationOnMap)}>
            <SectionHeader
                backgroundOverride={Constants.Colors.garnet}
                sectionIcon={'store'}
                sectionIconClass={'material'}
                sectionName={Translations.pick_location} />
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <View style={_styles.container}>
          <Navigator
              configureScene={this._configureScene}
              initialRoute={{id: BUILDING_SELECT}}
              ref='Navigator'
              renderScene={this._renderBuildingOrRoom.bind(this)}
              style={_styles.container} />
          <TouchableOpacity onPress={() => this._setFindLocationOnmap(!this.state.findLocationOnMap)}>
            <SectionHeader
                backgroundOverride={Constants.Colors.garnet}
                sectionIcon={'map'}
                sectionIconClass={'material'}
                sectionName={Translations.locate_me} />
          </TouchableOpacity>
        </View>
      );
    }
  }

  /**
   * Renders the user's upcoming classes for the day and a list of buildings on campus.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement < any > {
    if (!this.state.loaded) {
      return <View style={_styles.container} />;
    }

    return (
      <View style={_styles.container}>
        {this._renderDestination()}
        {this._renderStartingLocation()}
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    backgroundColor: Constants.Colors.garnet,
    flex: 1,
  },
  directionsIcon: {
    marginLeft: 10,
    marginRight: 10,
    marginTop: 20,
    marginBottom: 20,
  },
  directionsIconContainer: {
    alignSelf: 'center',
  },
  instruction: {
    color: Constants.Colors.primaryWhiteText,
    textAlign: 'center',
    fontSize: Constants.Text.Large,
    margin: 10,
  },
  map: {
    flex: 1,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    width: width,
    backgroundColor: 'white',
  },
});

module.exports = NavigationHome;
