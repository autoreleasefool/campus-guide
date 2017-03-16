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
 * @created 2016-11-3
 * @file TransitCampusMap.js
 * @providesModule TransitCampusMap
 * @description Displays a campus' location on a map, relative to a user's location, as well as a list of the stops
 *              near the campus.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  LayoutAnimation,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

// Types
import type {
  Language,
  LatLong,
  LatLongDelta,
  TimeFormat,
  TransitCampus,
  TransitSystem,
  VoidFunction,
} from 'types';

// Type definition for component props.
type Props = {
  backgroundColor: string,    // Background color for the view
  campusId: string,           // Identifier for the transit campus info to display
  filter: ?string,            // The current filter for transit routes
  language: Language,         // The current language, selected by the user
  resetFilter: VoidFunction,  // Should reset the search filter
  timeFormat: TimeFormat,     // Format to display times in
};

// Type definition for component state.
type State = {
  campus: ?TransitCampus,                 // Name and routes that visit the campus
  initialRegion: LatLong & LatLongDelta,  // Initial location to display on map
  region: ?(LatLong & LatLongDelta),      // Current region displayed by map
  routesExpanded: boolean,                // True to indicate the routes and times are expanded
  stops: Object,                          // Set of stop details
};

// Imports
import TransitStops from 'TransitStops';
import Header from 'Header';
import MapView from 'react-native-maps';
import * as Configuration from 'Configuration';
import * as Constants from 'Constants';
import * as Translations from 'Translations';

// Default delta in latitude and longitude to show
const DEFAULT_LOCATION_DELTA = 0.02;

export default class TransitCampusMap extends React.Component {

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
      campus: null,

      // FIXME: figure out better way to define default position
      initialRegion: {
        latitude: 45.4222,
        longitude: -75.6824,
        latitudeDelta: DEFAULT_LOCATION_DELTA,
        longitudeDelta: DEFAULT_LOCATION_DELTA,
      },

      region: null,
      routesExpanded: false,
      stops: {},
    };
  }

  /**
   * If the campus details have not been loaded, then loads them.
   */
  componentDidMount(): void {
    if (this.state.campus == null) {
      Configuration.init()
          .then(() => Configuration.getConfig('/transit.json'))
          .then((transitSystem: TransitSystem) => {
            const campuses = transitSystem.campuses;
            const stops = transitSystem.stopDetails;
            for (let i = 0; i < campuses.length; i++) {
              if (campuses[i].id === this.props.campusId) {
                this.setState({
                  stops: stops,
                  campus: campuses[i],
                  initialRegion: {
                    latitude: campuses[i].lat,
                    longitude: campuses[i].long,
                    latitudeDelta: DEFAULT_LOCATION_DELTA,
                    longitudeDelta: DEFAULT_LOCATION_DELTA,
                  },
                });
              }
            }
          })
          .catch((err: any) => console.error('Configuration could not be initialized for transit campus.', err));
    }
  }

  /**
   * Gets a string which can be used to identify a marker on the map for a particular stop.
   *
   * @param {string} stopId unique id of the transit stop
   * @returns {string} marker reference name
   */
  _getMarkerReference(stopId: string): string {
    return `Marker${stopId}`;
  }

  /**
   * Invoked when the user selects a stop.
   *
   * @param {?string} stopId id of the selected stop
   */
  _stopSelected(stopId: ?string): void {
    if (stopId == null) {
      this.setState({
        region: null,
      });
    } else {
      this.props.resetFilter();

      // Show stop name and code
      this.refs[this._getMarkerReference(stopId)].showCallout();

      // Center on the stop
      this.setState({
        region: {
          latitude: this.state.stops[stopId].lat,
          longitude: this.state.stops[stopId].long,
          latitudeDelta: DEFAULT_LOCATION_DELTA,
          longitudeDelta: DEFAULT_LOCATION_DELTA,
        },
      });
    }
  }

  /**
   * Toggles whether the route/stop container is expanded or not.
   */
  _toggleRoutesExpanded(): void {
    LayoutAnimation.easeInEaseOut();
    this.setState({
      routesExpanded: !this.state.routesExpanded,
    });
  }

  /**
   * Renders a map with a list of markers to denote transit stops near the campus.
   *
   * @returns {ReactElement<any>} a {MapView} with a list of markers placed at the stops on the campus
   */
  _renderCampusMap(): ReactElement < any > {
    const markers: Array < string > = [];

    if (this.state.campus != null) {
      for (const stopId in this.state.campus.stops) {
        if (this.state.campus.stops.hasOwnProperty(stopId)) {
          markers.push(stopId);
        }
      }
    }

    return (
      <MapView
          region={this.state.region || this.state.initialRegion}
          style={_styles.map}>
        {markers.map((stopId: string) => {
          const stop = this.state.stops[stopId];
          return (
            <MapView.Marker
                coordinate={{ latitude: stop.lat, longitude: stop.long }}
                description={stop.code}
                key={stopId}
                ref={this._getMarkerReference(stopId)}
                title={stop.name}
                onCalloutPress={this._stopSelected.bind(this, stopId)} />
          );
        })}
      </MapView>
    );
  }

  /**
   * Returns a view containing a header and list with the stops surrounding the campus provided by
   * {this.props.campusId}.
   *
   * @returns {ReactElement<any>} a {Stops} view with details about the various stops on the campus, or an empty view
   */
  _renderCampusStops(): ReactElement < any > {
    const campus = this.state.campus;
    const stops = this.state.stops;
    if (campus == null || stops == null) {
      return (
        <View />
      );
    }

    let expandIcon = 'expand-less';
    let routeStyle = { flexShrink: 0 };
    let stopStyle = { height: 0 };
    if (this.state.routesExpanded) {
      expandIcon = 'expand-more';
      routeStyle = { flex: 3 };
      stopStyle = _styles.container;
    }

    return (
      <View style={routeStyle}>
        <TouchableOpacity onPress={this._toggleRoutesExpanded.bind(this)}>
          <Header
              icon={{ name: 'md-time', class: 'ionicon' }}
              subtitleIcon={{ name: expandIcon, class: 'material' }}
              title={Translations.get(this.props.language, 'routes_and_times')} />
        </TouchableOpacity>
        <TransitStops
            campus={campus}
            filter={this.props.filter}
            language={this.props.language}
            stops={stops}
            style={stopStyle}
            timeFormat={this.props.timeFormat}
            onSelect={this._stopSelected.bind(this)} />
      </View>
    );
  }

  /**
   * Renders a map and list of routes and stop times at the various stops.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement < any > {
    return (
      <View style={[ _styles.container, { backgroundColor: Constants.Colors.primaryBackground }]}>
        <View style={_styles.container}>
          {this._renderCampusMap()}
        </View>
        {this._renderCampusStops()}
      </View>
    );
  }
}

// Private styles for the component
const _styles = StyleSheet.create({
  container: {
    flex: 2,
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
