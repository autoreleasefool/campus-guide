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
 * @file Shuttle.tsx
 * @description Displays shuttle bus information for the university.
 */
'use strict';

// React imports
import React from 'react';
import {
  InteractionManager,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// Redux imports
import { connect } from 'react-redux';

// Imports
import Header from '../../components/Header';
import MapView from 'react-native-maps';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import ShuttleTable from '../../components/ShuttleTable';
import * as Configuration from '../../util/Configuration';
import * as Constants from '../../constants';
import * as Translations from '../../util/Translations';

// Types
import { Language } from '../../util/Translations';
import { LatLong, LatLongDelta, TimeFormat } from '../../../typings/global';
import { ShuttleDirection, ShuttleInfo, ShuttleSchedule, ShuttleStop } from '../../../typings/transit';

interface Props {
  language: Language;               // The current language, selected by the user
  timeFormat: TimeFormat;           // Format to display times in
  showSearch(show: boolean): void;  // Shows or hides the search button
}

interface State {
  direction: number;                // Current direction for the schedule being viewed
  initialPage: number;              // Initial schedule to display
  region: LatLong & LatLongDelta;   // Latitude and longitude for map to display
  schedule: number;                 // Current schedule being viewed
  shuttle: ShuttleInfo | undefined; // Information about the university shuttle
}

class Shuttle extends React.PureComponent<Props, State> {

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
      shuttle: undefined,
    };
  }

  /**
   * If the shuttle info has not been loaded, then load it.
   */
  componentDidMount(): void {
    if (this.state.shuttle == undefined) {
      InteractionManager.runAfterInteractions(() => this.loadConfiguration());
    }
  }

  /**
   * Asynchronously load relevant configuration files and cache the results.
   */
  async loadConfiguration(): Promise<void> {
    try {
      const shuttle = await Configuration.getConfig('/shuttle.json');
      this.setState({ shuttle });
    } catch (err) {
      console.error('Configuration could not be initialized for shuttle.', err);
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
   * @returns {JSX.Element} the map component
   */
  _renderMap(): JSX.Element {
    const shuttle = this.state.shuttle;
    if (shuttle == undefined) {
      return (
        <View style={_styles.container} />
      );
    }

    return (
      <View style={_styles.container}>
        <MapView
            region={this.state.region}
            style={_styles.map}
            onRegionChange={(region: LatLong & LatLongDelta): void => this.setState({ region })}>
          {shuttle.stops.map((stop: ShuttleStop) => (
            <MapView.Marker
                coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
                identifier={stop.id}
                key={stop.id}
                title={Translations.getName(stop)} />
          ))}
        </MapView>
      </View>
    );
  }

  /**
   * Renders details about the route the shuttle takes.
   *
   * @param {ShuttleDirection} direction shuttle direction to render
   * @returns {JSX.Element} the route header and description
   */
  _renderRoute(direction: ShuttleDirection): JSX.Element {
    return (
      <View style={_styles.dark}>
        <Text style={_styles.routeText}>{Translations.getVariant('route', direction)}</Text>
      </View>
    );
  }

  /**
   * Renders each of the sections, with one of them focused and showing an image.
   *
   * @returns {JSX.Element} the hierarchy of views to render
   */
  render(): JSX.Element {
    const shuttle = this.state.shuttle;
    if (shuttle == undefined) {
      return (
        <View style={_styles.container} />
      );
    }

    const currentSchedule = shuttle.schedules[this.state.schedule];
    const direction = currentSchedule.directions[this.state.direction % currentSchedule.directions.length];
    const directionName = Translations.getName(direction) || '';
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
            tabBarActiveTextColor={Constants.Colors.primaryWhiteText}
            tabBarBackgroundColor={Constants.Colors.darkGrey}
            tabBarInactiveTextColor={Constants.Colors.secondaryWhiteText}
            tabBarPosition='top'
            tabBarUnderlineStyle={{ backgroundColor: Constants.Colors.polarGrey }}
            onChangeTab={(newTab: { i: number }): void => this.setState({ schedule: newTab.i })}>
          {(shuttle.schedules.map((schedule: ShuttleSchedule): JSX.Element => {
            const name = Translations.getName(schedule);

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
    backgroundColor: Constants.Colors.primaryBackground,
    flex: 1,
  },
  dark: {
    backgroundColor: Constants.Colors.secondaryBackground,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  routeText: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
    margin: Constants.Sizes.Margins.Expanded,
  },
});

const mapStateToProps = (store: any): any => {
  return {
    language: store.config.options.language,
    timeFormat: store.config.options.preferredTimeFormat,
  };
};

export default connect(mapStateToProps)(Shuttle) as any;
