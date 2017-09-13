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
 * @file TransitCampusMap.tsx
 * @description Displays a campus' location on a map, relative to a user's location, as well as a list of the stops
 *              near the campus.
 */
'use strict';

// React imports
import React from 'react';
import {
  InteractionManager,
  LayoutAnimation,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

// Imports
import TransitStops from './TransitStops';
import Header from './Header';
import MapView from 'react-native-maps';
import * as Configuration from '../util/Configuration';
import * as Constants from '../constants';
import * as Translations from '../util/Translations';

// Types
import { Language } from '../util/Translations';
import { LatLong, LatLongDelta, TimeFormat } from '../../typings/global';
import { TransitCampus } from '../../typings/transit';

interface Props {
  campusId: string;           // Identifier for the transit campus info to display
  filter: string;             // The current filter for transit routes
  language: Language;         // The current language, selected by the user
  timeFormat: TimeFormat;     // Format to display times in
  resetFilter(): void;        // Should reset the search filter
}

interface State {
  campus: TransitCampus | undefined;          // Name and routes that visit the campus
  initialRegion: LatLong & LatLongDelta;      // Initial location to display on map
  region: LatLong & LatLongDelta | undefined; // Current region displayed by map
  routesExpanded: boolean;                    // True to indicate the routes and times are expanded
  stops: any;                                 // Set of stop details
}

export default class TransitCampusMap extends React.PureComponent<Props, State> {

  /**
   * Constructor.
   *
   * @param {props} props component props
   */
  constructor(props: Props) {
    super(props);

    this.state = {
      campus: undefined,
      initialRegion: Constants.Map.InitialRegion,
      region: undefined,
      routesExpanded: false,
      stops: {},
    };
  }

  /**
   * If the campus details have not been loaded, then loads them.
   */
  componentDidMount(): void {
    if (this.state.campus == undefined) {
      InteractionManager.runAfterInteractions(() => this.loadConfiguration());
    }
  }

  /**
   * Asynchronously load relevant configuration files and cache the results.
   */
  async loadConfiguration(): Promise<void> {
    try {
      const transitSystem = await Configuration.getConfig('/transit.json');
      const campuses = transitSystem.campuses;
      const stops = transitSystem.stopDetails;
      for (const campus of campuses) {
        if (campus.id === this.props.campusId) {
          this.setState({
            campus,
            initialRegion: {
              latitude: campus.latitude,
              latitudeDelta: Constants.Map.DefaultDelta,
              longitude: campus.longitude,
              longitudeDelta: Constants.Map.DefaultDelta,
            },
            stops,
          });
        }
      }
    } catch (err) {
      console.error('Configuration could not be initialized for transit campus.', err);
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
   * @param {string|undefined} stopId id of the selected stop
   */
  _stopSelected(stopId: string | undefined): void {
    if (stopId == undefined) {
      this.setState({ region: undefined });
    } else {
      this.props.resetFilter();

      // Show stop name and code
      (this.refs[this._getMarkerReference(stopId)] as any).showCallout();

      // Center on the stop
      this.setState({
        region: {
          latitude: this.state.stops[stopId].latitude,
          latitudeDelta: Constants.Map.DefaultDelta,
          longitude: this.state.stops[stopId].longitude,
          longitudeDelta: Constants.Map.DefaultDelta,
        },
      });
    }
  }

  /**
   * Toggles whether the route/stop container is expanded or not.
   */
  _toggleRoutesExpanded(): void {
    LayoutAnimation.easeInEaseOut(undefined, undefined);
    this.setState({
      routesExpanded: !this.state.routesExpanded,
    });
  }

  /**
   * Renders a map with a list of markers to denote transit stops near the campus.
   *
   * @returns {JSX.Element} a {MapView} with a list of markers placed at the stops on the campus
   */
  _renderCampusMap(): JSX.Element {
    const markers: string[] = [];

    if (this.state.campus != undefined) {
      for (const stopId in this.state.campus.stops) {
        if (this.state.campus.stops.hasOwnProperty(stopId)) {
          markers.push(stopId);
        }
      }
    }

    return (
      <MapView
          region={this.state.region || this.state.initialRegion}
          style={_styles.map}
          onRegionChange={(region: LatLong & LatLongDelta): void => this.setState({ region })}>
        {markers.map((stopId: string) => {
          const stop = this.state.stops[stopId];

          return (
            <MapView.Marker
                coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
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
   * @returns {JSX.Element} a {Stops} view with details about the various stops on the campus, or an empty view
   */
  _renderCampusStops(): JSX.Element {
    const campus = this.state.campus;
    const stops = this.state.stops;
    if (campus == undefined || stops == undefined) {
      return (
        <View />
      );
    }

    let expandIcon = 'expand-less';
    let routeStyle: any = { flexShrink: 0 };
    let stopStyle: any = { height: 0 };
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
              title={Translations.get('routes_and_times')} />
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
   * @returns {JSX.Element} the hierarchy of views to render
   */
  render(): JSX.Element {
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
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
