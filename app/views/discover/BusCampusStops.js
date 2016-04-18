/*************************************************************************
 *
 * @license
 *
 * Copyright 2016 Joseph Roque
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
 *************************************************************************
 *
 * @file
 * BusCampusStops.js
 *
 * @description
 * Displays a campus' location on a map, relative to a user's location, as
 * well as a list of the stops near the campus.
 *
 * @author
 * Joseph Roque
 *
 *************************************************************************
 *
 * @external
 * @flow
 *
 ************************************************************************/
'use strict';

// React Native imports
const React = require('react-native');
const {
  Component,
  Image,
  StyleSheet,
  View,
} = React;

// Imports
const Configuration = require('../../util/Configuration');
const Constants = require('../../Constants');
const DisplayUtils = require('../../util/DisplayUtils');
const MapView = require('react-native-maps');
const Stops = require('./components/Stops');

class CampusStops extends Component {

  /**
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    campusName: React.PropTypes.string.isRequired,
    campusColor: React.PropTypes.string.isRequired,
  };

  /**
   * Pass props and declares initial state.
   *
   * @param props properties passed from container to this component.
   */
  constructor(props) {
    super(props);

    this.state = {
      campus: null,
      region: null,
    }

    // Explicitly binding 'this' to all methods that need it
    this._busStopSelected = this._busStopSelected.bind(this);
    this._getCampusMap = this._getCampusMap.bind(this);
    this._getCampusStops = this._getCampusStops.bind(this);
    this._loadCampusInfo = this._loadCampusInfo.bind(this);
  };

  /**
   * Invoked when the user selects a stop.
   *
   * @param stop properties of the selected stop.
   */
  _busStopSelected(stop) {
    if (stop === null) {
      this.setState({
        region: null,
      });
    } else {
      this.setState({
        region: {
          latitude: stop.lat,
          longitude: stop.long,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
      });
    }
  }

  /**
   * Renders a map with a list of markers to denote bus stops near the campus.
   *
   * @return a {MapView} with a list of markers placed at the stops on the
   *         campus.
   */
  _getCampusMap() {
    let lat = 0;
    let long = 0;
    let markers = []
    let initialRegion = {};

    if (this.state.campus == null) {
      let university = Configuration.getUniversity();
      lat = university['lat'];
      long = university['long'];
      initialRegion = {
        latitude: lat,
        longitude: long,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    } else {
      lat = this.state.campus['lat'];
      long = this.state.campus['long'];
      initialRegion = {
        latitude: lat,
        longitude: long,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      for (let stop in this.state.campus['stops']) {
        markers.push({
          'title': this.state.campus['stops'][stop].name,
          'desc': this.state.campus['stops'][stop].code,
          'id': stop,
          'latlng': {
            'latitude': this.state.campus['stops'][stop].lat,
            'longitude': this.state.campus['stops'][stop].long,
          },
        });
      }

    }

    return (
      <MapView
          style={_styles.map}
          region={this.state.region || initialRegion}>
        {markers.map((marker) => (
          <MapView.Marker
              key={marker.id}
              coordinate={marker.latlng}
              title={marker.title}
              description={marker.desc}>
          </MapView.Marker>
        ))}
      </MapView>
    );
  };

  /**
   * Returns a view containing a header and list with the stops surrounding the
   * campus provided by {this.props.campusName}.
   *
   * @return a {Stops} view with details about the various stops on the campus.
   */
  _getCampusStops() {
    if (this.state.campus == null) {
      return (
        <View style={_styles.container} />
      );
    } else {
      return (
        <Stops
            campus={this.state.campus}
            campusName={this.props.campusName}
            onStopSelected={this._busStopSelected}
            backgroundIsDark={DisplayUtils.isColorDark(this.props.campusColor)}/>
      )
    }
  };

  /**
   * Retrieves data about the campus provided as {this.props.campusName}.
   */
  _loadCampusInfo() {
    let campuses = require('../../../assets/static/json/transit_stops.json');
    if (this.props.campusName in campuses) {
      this.setState({
        campus: campuses[this.props.campusName],
      });
    }
  };

  /**
   * If the campus details have not been loaded, then loads them.
   */
  componentDidMount() {
    if (this.state.campus == null) {
      this._loadCampusInfo();
    }
  };

  /**
   * Renders a map and list of routes and stop times at the various stops.
   *
   * @return the hierarchy of views to render.
   */
  render() {
    return (
      <View style={[_styles.container, {backgroundColor: this.props.campusColor}]}>
        <View style={_styles.container}>
          {this._getCampusMap()}
        </View>
        {this._getCampusStops()}
      </View>
    );
  };
};

// Private styles for the component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

// Expose component to app
module.exports = CampusStops;
