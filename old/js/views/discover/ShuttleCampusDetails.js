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
 * @file ShuttleCampusDetails.js
 * @providesModule ShuttleCampusDetails
 * @description Displays details about the departure times of the shuttle from a single campus.
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
  ShuttleCampus,
  University,
} from 'types';

// Type definition for component props.
type Props = {
  campusColor: string,
  campusName: string,
};

// Type definition for component state.
type State = {
  campus: ?ShuttleCampus,
  region: ?(LatLong & LatLongDelta),
};

// Imports
const Configuration = require('Configuration');
const TranslationUtils = require('TranslationUtils');
const MapView = require('react-native-maps');
const Preferences = require('Preferences');

class ShuttleCampusDetails extends React.Component {

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
    (this:any)._getCampusMap = this._getCampusMap.bind(this);
    (this:any)._loadCampusInfo = this._loadCampusInfo.bind(this);
  }

  /**
   * If the campus info has not been loaded yet, then load it.
   */
  componentDidMount(): void {
    if (this.state.campus == null) {
      Configuration.init()
          .then(this._loadCampusInfo())
          .catch(err => console.error('Configuration could not be initialized for shuttle campus details.', err));
    }
  }

  /**
   * Renders a map with a list of markers to denote bus stops near the campus.
   *
   * @param {Object} Translations translations in the current language of certain text.
   * @returns {ReactElement<any>} a map view with a marker
   */
  _getCampusMap(Translations: Object): ReactElement < any > {
    let initialRegion: LatLong & LatLongDelta;
    let marker: ?ReactElement < any >;

    if (this.state.campus == null) {
      const university: ?University = Configuration.getUniversity();
      if (university != null) {
        initialRegion = {
          latitude: university.lat,
          longitude: university.long,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
      }
    } else {
      const lat = this.state.campus.lat;
      const long = this.state.campus.lat;
      initialRegion = {
        latitude: lat,
        longitude: long,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      marker = (
        <MapView.Marker
            coordinate={initialRegion}
            description={TranslationUtils.getTranslatedName(Preferences.getSelectedLanguage(), this.state.campus)}
            title={Translations.shuttle_stop} />
      );
    }

    return (
      <MapView
          region={initialRegion}
          style={_styles.map}>
        {marker}
      </MapView>
    );
  }

  /**
   * Retrieves data about the campus provided as this.props.campusName.
   */
  _loadCampusInfo(): void {
    Configuration.getConfig('/shuttle.json')
        .then(campuses => {
          if (this.props.campusName in campuses) {
            this.setState({
              campus: campuses[this.props.campusName],
            });
          }
        })
        .catch(err => console.error('Could not get /shuttle.json.', err));
  }

  /**
   * Renders a map and details about the shuttle drop off times at the campus specified by {this.props.campusName}.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement < any > {
    // Get current language for translations
    const Translations: Object = TranslationUtils.getTranslations(Preferences.getSelectedLanguage());

    return (
      <View style={[_styles.container, {backgroundColor: this.props.campuscolor}]}>
        <View style={_styles.mapContainer}>
          {this._getCampusMap(Translations)}
        </View>
        <View style={_styles.timeContainer} />
      </View>
    );
  }
}

// Private styles for the component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 3,
  },
  timeContainer: {
    flex: 4,
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

module.exports = ShuttleCampusDetails;
