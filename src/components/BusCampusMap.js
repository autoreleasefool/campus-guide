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
 * @created 2016-11-3
 * @file BusCampusMap.js
 * @providesModule BusCampusMap
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

// Type imports
import type {
  Language,
  LatLong,
  LatLongDelta,
  TransitCampus,
  TransitInfo,
  TransitStop,
} from 'types';

// Type definition for component props.
type Props = {
  backgroundColor: string,  // Background color for the view
  campusId: string,         // Identifier for the bus campus info to display
  language: Language,       // The current language, selected by the user
};

// Type definition for component state.
type State = {
  campus: ?TransitCampus,
  initialRegion: LatLong & LatLongDelta,
  region: ?(LatLong & LatLongDelta),
  routesExpanded: boolean,
};

// Imports
import BusStops from 'BusStops';
import Header from 'Header';
import MapView from 'react-native-maps';
import * as Configuration from 'Configuration';
import * as Constants from 'Constants';
import * as TranslationUtils from 'TranslationUtils';

// Default delta in latitude and longitude to show
const DEFAULT_LOCATION_DELTA = 0.02;

export default class CampusMap extends React.Component {

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

      // TODO: figure out better way to define default position
      initialRegion: {
        latitude: 45.4222,
        longitude: -75.6824,
        latitudeDelta: DEFAULT_LOCATION_DELTA,
        longitudeDelta: DEFAULT_LOCATION_DELTA,
      },

      region: null,
      routesExpanded: false,
    };
  }

  /**
   * If the campus details have not been loaded, then loads them.
   */
  componentDidMount(): void {
    if (this.state.campus == null) {
      Configuration.init()
          .then(() => Configuration.getConfig('/bus.json'))
          .then((busInfo: TransitInfo) => {
            const campuses = busInfo.campuses;
            for (let i = 0; i < campuses.length; i++) {
              if (campuses[i].id === this.props.campusId) {
                this.setState({
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
          .catch((err: any) => console.error('Configuration could not be initialized for bus campus.', err));
    }
  }

  /**
   * Gets a string which can be used to identify a marker on the map for a particular stop.
   *
   * @param {TransitStop} stop bus stop to get marker reference name
   * @returns {string} marker reference name
   */
  _getMarkerReference(stop: TransitStop): string {
    return `Marker${stop.id}`;
  }

  /**
   * Invoked when the user selects a stop.
   *
   * @param {?TransitStop} stop properties of the selected stop
   */
  _stopSelected(stop: ?TransitStop): void {
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
   * Renders a map with a list of markers to denote bus stops near the campus.
   *
   * @returns {ReactElement<any>} a {MapView} with a list of markers placed at the stops on the campus
   */
  _renderCampusMap(): ReactElement < any > {
    let markers: Array < TransitStop > = [];

    if (this.state.campus != null) {
      markers = this.state.campus.stops;
    }

    // TODO: onCalloutPress (below) does not currently work for iOS
    // Follow progress at https://github.com/airbnb/react-native-maps/issues/286

    return (
      <MapView
          region={this.state.region || this.state.initialRegion}
          style={_styles.map}>
        {markers.map((stop: TransitStop) => (
          <MapView.Marker
              coordinate={{latitude: stop.lat, longitude: stop.long}}
              description={stop.code}
              key={stop.id}
              ref={this._getMarkerReference(stop)}
              title={stop.name}
              onCalloutPress={this._stopSelected.bind(this, stop)} />
        ))}
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
    if (campus == null) {
      return (
        <View />
      );
    }

    // Get current language for translations
    const Translations: Object = TranslationUtils.getTranslations(this.props.language);

    let expandIcon = 'expand-less';
    let routeStyle = {};
    let stopStyle = {height: 0};
    if (this.state.routesExpanded) {
      expandIcon = 'expand-more';
      routeStyle = {flex: 3};
      stopStyle = _styles.container;
    }

    return (
      <View style={routeStyle}>
        <TouchableOpacity onPress={this._toggleRoutesExpanded.bind(this)}>
          <Header
              icon={{name: 'md-time', class: 'ionicon'}}
              subtitleIcon={{name: expandIcon, class: 'material'}}
              title={Translations.routes_and_times} />
        </TouchableOpacity>
        <BusStops
            campus={campus}
            language={this.props.language}
            stopFilter={null}
            style={stopStyle}
            timeFilter={null}
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
      <View style={[_styles.container, {backgroundColor: Constants.Colors.primaryBackground}]}>
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
