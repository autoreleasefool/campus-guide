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
 * @created 2017-03-03
 * @file Shuttle.js
 * @description Displays shuttle bus information for the university.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

// Redux imports
import { connect } from 'react-redux';

// Types
import type {
  Language,
  LatLong,
  LatLongDelta,
  ShuttleDirection,
  ShuttleInfo,
  TimeFormat,
} from 'types';

// Type definition for component props.
type Props = {
  language: Language,                   // The current language, selected by the user
  showSearch: (show: boolean) => void,  // Shows or hides the search button
  timeFormat: TimeFormat,               // Format to display times in
}

// Type definition for component state.
type State = {
  direction: number,              // Current direction for the schedule being viewed
  initialPage: number,            // Initial schedule to display
  region: LatLong & LatLongDelta, // Latitude and longitude for map to display
  schedule: number,               // Current schedule being viewed
  shuttle: ?ShuttleInfo,          // Information about the university shuttle
}

// Imports
import Header from 'Header';
import MapView from 'react-native-maps';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import ShuttleTable from 'ShuttleTable';
import * as Configuration from 'Configuration';
import * as Constants from 'Constants';
import * as Translations from 'Translations';

class Shuttle extends React.Component {

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
      direction: 0,
      initialPage: 0,
      region: Constants.Map.InitialRegion,
      schedule: 0,
      shuttle: null,
    };
  }

  /**
   * If the shuttle info has not been loaded, then load it.
   */
  componentDidMount(): void {
    if (this.state.shuttle == null) {
      Configuration.init()
          .then(() => Configuration.getConfig('/shuttle.json'))
          .then((shuttle: ShuttleInfo) => this.setState({ shuttle }))
          .catch((err: any) => console.error('Configuration could not be initialized for shuttle.', err));
    }
  }

  /**
   * Switches direction being rendered
   */
  _switchDirection(): void {
    const nextDirection = (this.state.direction + 1) % 2;
    this.setState({ direction: nextDirection });
  }

  /**
   * Renders a map of locations which the shuttle makes stops at.
   *
   * @returns {ReactElement<any>} the map component
   */
  _renderMap(): ReactElement < any > {
    const shuttle = this.state.shuttle;
    if (shuttle == null) {
      return (
        <View style={_styles.container} />
      );
    }

    return (
      <View style={_styles.container}>
        <MapView
            region={this.state.region}
            style={_styles.map}
            onRegionChange={(region) => this.setState({ region })}>
          {shuttle.stops.map((stop) => (
            <MapView.Marker
                coordinate={{ latitude: stop.lat, longitude: stop.long }}
                identifier={stop.id}
                key={stop.id}
                title={Translations.getName(this.props.language, stop)} />
          ))}
        </MapView>
      </View>
    );
  }

  /**
   * Renders details about the route the shuttle takes.
   *
   * @param {ShuttleDirection} direction shuttle direction to render
   * @returns {ReactElement<any>} the route header and description
   */
  _renderRoute(direction: ShuttleDirection): ReactElement < any > {
    const route = Translations.getVariant(this.props.language, 'route', direction);
    return (
      <View style={_styles.dark}>
        <Text style={_styles.routeText}>{route}</Text>
      </View>
    );
  }

  /**
   * Renders each of the sections, with one of them focused and showing an image.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement < any > {
    const shuttle = this.state.shuttle;
    if (shuttle == null) {
      return (
        <View style={_styles.container} />
      );
    }

    const currentSchedule = shuttle.schedules[this.state.schedule];
    const direction = currentSchedule.directions[this.state.direction % currentSchedule.directions.length];
    const directionName = Translations.getName(this.props.language, direction) || '';
    const arrow = this.state.direction === 0 ? 'md-arrow-forward' : 'md-arrow-back';

    return (
      <View style={_styles.container}>
        {this._renderMap()}
        <Header
            backgroundColor={Constants.Colors.primaryBackground}
            icon={{ name: arrow, class: 'ionicon' }}
            subtitleCallback={this._switchDirection.bind(this)}
            subtitleIcon={{ name: 'compare-arrows', class: 'material' }}
            title={directionName} />
        {this._renderRoute(direction)}
        <ScrollableTabView
            initialPage={this.state.initialPage}
            style={_styles.tabContainer}
            tabBarActiveTextColor={Constants.Colors.primaryWhiteText}
            tabBarBackgroundColor={Constants.Colors.darkGrey}
            tabBarInactiveTextColor={Constants.Colors.secondaryWhiteText}
            tabBarPosition='top'
            tabBarUnderlineStyle={{ backgroundColor: Constants.Colors.polarGrey }}
            onChangeTab={(newTab: { i: number }) => this.setState({ schedule: newTab.i })}>
          {(shuttle.schedules.map((schedule) => {
            const name = Translations.getName(this.props.language, schedule);
            return (
              <ShuttleTable
                  direction={this.state.direction}
                  key={name}
                  language={this.props.language}
                  schedule={schedule}
                  tabLabel={name}
                  timeFormat={this.props.timeFormat} />
            );
          }))}
        </ScrollableTabView>
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
  dark: {
    backgroundColor: Constants.Colors.secondaryBackground,
  },
  routeText: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
    margin: Constants.Sizes.Margins.Expanded,
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

const mapStateToProps = (store) => {
  return {
    language: store.config.options.language,
    timeFormat: store.config.options.preferredTimeFormat,
  };
};

export default connect(mapStateToProps)(Shuttle);
