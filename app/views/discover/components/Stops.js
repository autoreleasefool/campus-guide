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
 * @file Stops.js
 * @module Stops
 * @description Displays details about the stops provided. Navigates between a list of
 *              stops and their individual details.
 * @flow
 *
 */
'use strict';

// React Native imports
import React from 'react';
import {
  ListView,
  Navigator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Import type definition icons.
import type {
  DetailedRouteInfo,
  TransitCampus,
} from '../../../Types';

// Imports
const Constants = require('../../../Constants');
const LanguageUtils = require('../../../util/LanguageUtils');
const Preferences = require('../../../util/Preferences');
const SectionHeader = require('../../../components/SectionHeader');
const TextUtils = require('../../../util/TextUtils');

// Identifier for the navigator, indicating the list of stops is being shown.
const LIST: number = 0;
// Identifier for the navigator, indicating the details of a stop are shown.
const DETAILS: number = 1;
// Maximum number of upcoming bus arrival times to show.
const MAX_UPCOMING_TIMES: number = 4;

// Type definition for component props.
type Props = {
  campus: TransitCampus,
  campusName: string,
  onStopSelected: ?(stop: any) => any,
  backgroundIsDark: boolean,
};

// Type definition for component state.
type State = {
  dataSourceStops: ReactClass,
  dataSourceTimes: ReactClass,
  loaded: boolean,
  primaryTextColor: string,
  secondaryTextColor: string,
};

// Type definition for information about transit stops.
type StopInfo = {
  code: string,
  name: string,
  lat: number,
  long: number,
  routes: Array<number>,
  key: number,
};

// Type definition for navigator routes.
type NavigatorRoute = {
  id: number,
  stop: ?StopInfo,
};

class Stops extends React.Component {

  /**
   * Properties which the parent component should make available to this
   * component.
   */
  static propTypes = {
    backgroundIsDark: React.PropTypes.bool,
    campus: React.PropTypes.object.isRequired,
    campusName: React.PropTypes.string.isRequired,
    onStopSelected: React.PropTypes.func,
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

    const primaryTextColor = (this.props.backgroundIsDark)
        ? Constants.Colors.primaryWhiteText
        : Constants.Colors.primaryBlackText;
    const secondaryTextColor = (this.props.backgroundIsDark)
        ? Constants.Colors.secondaryWhiteText
        : Constants.Colors.secondaryBlackText;

    this.state = {
      dataSourceStops: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
      }),
      dataSourceTimes: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
      }),
      loaded: false,
      primaryTextColor: primaryTextColor,
      secondaryTextColor: secondaryTextColor,
    };

    // Explicitly binding 'this' to all methods that need it
    (this:any)._loadStops = this._loadStops.bind(this);
    (this:any)._pressRow = this._pressRow.bind(this);
  }

  /**
   * If the stops have not beed loaded, then loads them.
   */
  componentDidMount(): void {
    if (!this.state.loaded) {
      this._loadStops();
    }
  }

  /**
   * Informs parent that no stop is selected.
   */
  _clearStop(): void {
    this.refs.Navigator.pop();
    if (this.props.onStopSelected) {
      this.props.onStopSelected(null);
    }
  }

  /**
   * Sets the transition between two views in the navigator.
   *
   * @returns {Object} a configuration for transitions between scenes.
   */
  _configureScene(): Object {
    return Navigator.SceneConfigs.PushFromRight;
  }

  /**
   * Loads information about each of the stops on the campus into a list to display.
   */
  _loadStops(): void {
    const stops: Array<StopInfo> = [];
    for (let i = 0; i < this.props.campus.stops.length; i++) {
      const stopInfo: StopInfo = {
        code: this.props.campus.stops[i].code,
        name: this.props.campus.stops[i].name,
        lat: this.props.campus.stops[i].lat,
        long: this.props.campus.stops[i].long,
        routes: this.props.campus.stops[i].routes,
        key: i,
      };

      stops.push(stopInfo);
    }

    this.setState({
      dataSourceStops: this.state.dataSourceStops.cloneWithRows(stops),
      loaded: true,
    });
  }

  /**
   * Displays details about a single stop.
   *
   * @param {StopInfo} stop details about the stop to display.
   */
  _pressRow(stop: StopInfo): void {
    if (this.props.onStopSelected) {
      this.props.onStopSelected(stop);
    }

    const campuses: Array<TransitCampus> = require('../../../../assets/json/transit_times.json');
    let routeInfo: ?Array<DetailedRouteInfo> = null;
    for (let i = 0; i < campuses.length; i++) {
      if (campuses[i].id === this.props.campusName) {
        routeInfo = campuses[i].stops[stop.key].routes;
        break;
      }
    }

    const routesAndTimes: Array<DetailedRouteInfo> = [];
    if (routeInfo != null) {
      for (let i = 0; i < routeInfo.length; i++) {
        routesAndTimes.push({
          number: routeInfo[i].number,
          sign: routeInfo[i].sign,
          days: routeInfo[i].days,
        });
      }
    }

    this.refs.Navigator.push({id: DETAILS, stop: stop});
    this.setState({
      dataSourceTimes: this.state.dataSourceTimes.cloneWithRows(routesAndTimes),
    });
  }

  /**
   * Returns a list of times for the current day that will be the next to occur.
   *
   * @param {Object} days         a dictionary of days mapped to times.
   * @returns {string} a list of up to 3 times, formatted as a string.
   */
  _retrieveUpcomingTimes(days: Object): string {
    // Get current language for translations
    let Translations: Object = {};
    if (Preferences.getSelectedLanguage() === 'fr') {
      Translations = require('../../../../assets/js/Translations.fr.js');
    } else {
      Translations = require('../../../../assets/js/Translations.en.js');
    }

    const upcomingTimes = [];
    const now = new Date();
    const currentDay = now.getDay().toString();
    const currentTime = TextUtils.leftPad(now.getHours().toString(), 2, '0')
        + ':'
        + TextUtils.leftPad(now.getMinutes().toString(), 2, '0');
    for (const day in days) {
      if (days.hasOwnProperty(day)) {
        if (day.indexOf(currentDay) > -1) {
          let i = days[day].length - 1;
          while (i >= 0) {
            if (days[day][i].localeCompare(currentTime) < 0 || i == 0) {
              let j = 1;
              while (j < MAX_UPCOMING_TIMES && i + j < days[day].length) {
                upcomingTimes.push(TextUtils.get24HourAdjustedTime(days[day][i + j]));
                j += 1;
              }
              break;
            }
            i -= 1;
          }
        }
      }
    }

    if (upcomingTimes.length > 0) {
      return upcomingTimes.join('   ');
    } else {
      return Translations.no_upcoming_buses;
    }
  }

  /**
   * Shows partial details about a stop.
   *
   * @param {StopInfo} stop       details about the stop to display.
   * @param {string} sectionIndex index of the section the stop is in.
   * @param {number} rowIndex     index of the row the stop is in.
   * @returns {ReactElement} Pthe name of the stop, its unique code, and the list of routes
   *         that serve the stop.
   */
  _renderStopRow(stop: StopInfo, sectionIndex: string, rowIndex: number): ReactElement {
    return (
      <View>
        <TouchableOpacity onPress={() => this._pressRow(stop)}>
          <View style={_styles.header}>
            <Text style={[_styles.headerTitle, {color: this.state.primaryTextColor}]}>
              {stop.name}
            </Text>
            <Text style={[_styles.headerSubtitle, {color: this.state.secondaryTextColor}]}>
              {stop.code}
            </Text>
          </View>
          <Text style={[_styles.stopRoutes, {color: this.state.primaryTextColor}]}>
            {stop.routes.join(', ')}
          </Text>
        </TouchableOpacity>
        {(rowIndex < this.state.dataSourceStops.getRowCount() - 1)
            ? <View style={_styles.divider} />
            : null}
      </View>
    );
  }

  /**
   * Shows partial details about a route.
   *
   * @param {DetailedRouteInfo} route details about the route to display.
   * @param {string} sectionIndex     index of the section the route is in.
   * @param {number} rowIndex         index of the row the route is in.
   * @returns {ReactElement} the headline and number of the route, and the upcoming times.
   */
  _renderTimeRow(route: DetailedRouteInfo, sectionIndex: string, rowIndex: number): ReactElement {
    return (
      <View>
        <View style={_styles.header}>
          <Text style={[_styles.headerTitle, {color: this.state.primaryTextColor}]}>
            {route.sign}
          </Text>
          <Text style={[_styles.headerSubtitle, {color: this.state.secondaryTextColor}]}>
            {route.number}
          </Text>
        </View>
        <Text style={[_styles.stopTimes, {color: this.state.primaryTextColor}]}>
          {this._retrieveUpcomingTimes(route.days)}
        </Text>
        {(rowIndex < this.state.dataSourceTimes.getRowCount() - 1)
            ? <View style={_styles.divider} />
            : null}
      </View>
    );
  }

  /**
   * Renders a view according to the current route of the navigator.
   *
   * @param {NavigatorRoute} route object with properties to identify the route to display.
   * @returns {ReactElement} the view to render, based on {route}.
   */
  _renderScene(route: NavigatorRoute): ReactElement {
    if (route.id === DETAILS && route.stop != null) {
      const routeStop = route.stop;
      let icon = {
        class: 'material',
        name: 'arrow-back',
      };
      if (Platform.OS === 'ios') {
        icon = {
          class: 'ionicon',
          name: 'ios-arrow-back',
        };
      }

      return (
        <View style={_styles.container}>
          <SectionHeader
              sectionIcon={icon.name}
              sectionIconClass={icon.class}
              sectionIconOnClick={this._clearStop.bind(this)}
              sectionName={routeStop.name}
              subtitleName={routeStop.code} />
          <ListView
              dataSource={this.state.dataSourceTimes}
              renderRow={this._renderTimeRow.bind(this)} />
        </View>
      );
    } else {
      return (
        <View style={_styles.container}>
          <SectionHeader
              sectionIcon={'directions-bus'}
              sectionIconClass={'material'}
              sectionName={LanguageUtils.getTranslatedName(Preferences.getSelectedLanguage(), this.props.campus)} />
          <ListView
              dataSource={this.state.dataSourceStops}
              renderRow={this._renderStopRow.bind(this)} />
        </View>
      );
    }
  }

  /**
   * Renders a navigator which handles the scene rendering.
   *
   * @returns {ReactElement} the hierarchy of views to render.
   */
  render(): ReactElement {
    return (
      <View style={_styles.container}>
        <Navigator
            configureScene={this._configureScene}
            initialRoute={{id: LIST}}
            ref='Navigator'
            renderScene={this._renderScene.bind(this)} />
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'left',
    fontSize: Constants.Text.Large,
  },
  headerSubtitle: {
    textAlign: 'right',
    fontSize: Constants.Text.Small,
  },
  stopRoutes: {
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
    fontSize: Constants.Text.Medium,
  },
  stopTimes: {
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
    fontStyle: 'italic',
    fontSize: Constants.Text.Medium,
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: Constants.Colors.secondaryWhiteText,
  },
});

// Expose component to app
module.exports = Stops;
