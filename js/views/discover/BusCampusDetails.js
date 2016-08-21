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
 * @file BusCampusDetails.js
 * @providesModule BusCampusDetails
 * @description Displays a campus' location on a map, relative to a user's location, as well as a list of the stops
 *              near the campus.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

// Type imports
import type {
  LatLong,
  LatLongDelta,
  TransitCampus,
  TransitStop,
  University,
} from 'types';

// Type definition for component props.
type Props = {
  campusColor: string,
  campusName: string,
};

// Type definition for component state.
type State = {
  campus: ?TransitCampus,
  region: ?(LatLong & LatLongDelta),
};

// Imports
const Configuration = require('Configuration');
const DisplayUtils = require('DisplayUtils');
const MapView = require('react-native-maps');
const StopDetails = require('StopDetails');

class BusCampusDetails extends React.Component {

  /**
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    campusColor: React.PropTypes.string.isRequired,
    campusName: React.PropTypes.string.isRequired,
  };

  /**
   * Define type for the component state.
   */
  state: State;

  /**
   * Pass props and declares initial state.
   *
   * @param {Props} props properties passed from container to this component.
   */
  constructor(props: Props) {
    super(props);

    this.state = {
      campus: null,
      region: null,
    };

    // Explicitly binding 'this' to all methods that need it
    (this:any)._busStopSelected = this._busStopSelected.bind(this);
    (this:any)._getCampusMap = this._getCampusMap.bind(this);
    (this:any)._getCampusStops = this._getCampusStops.bind(this);
    (this:any)._loadCampusInfo = this._loadCampusInfo.bind(this);
  }

  /**
   * If the campus details have not been loaded, then loads them.
   */
  componentDidMount(): void {
    if (this.state.campus == null) {
      Configuration.init()
          .then(this._loadCampusInfo())
          .catch(err => console.error('Configuration could not be initialized for bus campus details.', err));
    }
  }

  /**
   * Invoked when the user selects a stop.
   *
   * @param {?TransitStop} stop properties of the selected stop.
   */
  _busStopSelected(stop: ?TransitStop): void {
    if (stop == null) {
      this.setState({
        region: null,
      });
    } else {
      // Show stop name and code
      this.refs[this._getMarkerReference(stop)].showCallout();

      // Center on the stop
      this.setState({
        region: {
          latitude: stop.lat,
          longitude: stop.long,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
      });
    }
  }

  /**
   * Renders a map with a list of markers to denote bus stops near the campus.
   *
   * @returns {ReactElement<any>} a {MapView} with a list of markers placed at the stops on the campus.
   */
  _getCampusMap(): ReactElement<any> {
    let markers: Array<TransitStop> = [];
    let lat: number = 0;
    let long: number = 0;
    let initialRegion: LatLong & LatLongDelta;

    if (this.state.campus == null) {
      const university: ?University = Configuration.getUniversity();
      if (university == null) {
        initialRegion = {
          latitude: 45.4222,
          longitude: -75.6824,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
      } else {
        lat = university.lat;
        long = university.long;
        initialRegion = {
          latitude: lat,
          longitude: long,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
      }
    } else {
      lat = this.state.campus.lat;
      long = this.state.campus.long;
      initialRegion = {
        latitude: lat,
        longitude: long,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      markers = this.state.campus.stops;
    }

    // TODO: onCalloutPress (below) does not currently work for iOS
    // Follow progress at https://github.com/lelandrichardson/react-native-maps/issues/286

    return (
      <MapView
          region={this.state.region || initialRegion}
          style={_styles.map}>
        {markers.map(stop => (
          <MapView.Marker
              coordinate={{latitude: stop.lat, longitude: stop.long}}
              description={stop.code}
              key={stop.id}
              ref={this._getMarkerReference(stop)}
              title={stop.name}
              onCalloutPress={() => this._busStopSelected(stop)} />
        ))}
      </MapView>
    );
  }

  /**
   * Returns a view containing a header and list with the stops surrounding the campus provided by
   * {this.props.campusName}.
   *
   * @returns {ReactElement<any>} a {Stops} view with details about the various stops on the campus, or an empty view
   */
  _getCampusStops(): ReactElement<any> {
    if (this.state.campus == null) {
      return (
        <View style={_styles.container} />
      );
    } else {
      return (
        <StopDetails
            backgroundIsDark={DisplayUtils.isColorDark(this.props.campusColor)}
            campus={this.state.campus}
            campusName={this.props.campusName}
            onStopSelected={this._busStopSelected} />
      );
    }
  }

  /**
   * Gets a string which can be used to identify a marker on the map for a particular stop.
   *
   * @param {TransitStop} stop bus stop to get marker reference name
   * @returns {string} marker reference name
   */
  _getMarkerReference(stop: TransitStop): string {
    return (String:any).format('Marker{0}', stop.id);
  }

  /**
   * Retrieves data about the campus provided as {this.props.campusName}.
   */
  _loadCampusInfo(): void {
    Configuration.getConfig('/transit_times.json')
        .then(campuses => {
          for (let i = 0; i < campuses.length; i++) {
            if (campuses[i].id === this.props.campusName) {
              this.setState({
                campus: campuses[i],
              });
            }
          }
        })
        .catch(err => console.error('Could not get /transit_times.json.', err));
  }

  /**
   * Renders a map and list of routes and stop times at the various stops.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement<any> {
    return (
      <View style={[_styles.container, {backgroundColor: this.props.campusColor}]}>
        <View style={_styles.mapContainer}>
          {this._getCampusMap()}
        </View>
        <View style={_styles.stopsContainer}>
          {this._getCampusStops()}
        </View>
      </View>
    );
  }
}

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
  mapContainer: {
    flex: 1,
  },
  stopsContainer: {
    flex: 2,
  },
});

module.exports = BusCampusDetails;
