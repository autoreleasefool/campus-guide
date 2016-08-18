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
 * @file StopDetails.js
 * @providesModule StopDetails
 * @description Displays details about the stops provided. Navigates between a list of stops and their individual
 *              details.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  ListView,
  Navigator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Type imports
import type {
  DetailedRouteInfo,
  Language,
  TransitCampus,
} from 'types';

import type {
  SearchListener,
} from 'SearchManager';

// Type definition for component props.
type Props = {
  campus: TransitCampus,
  campusName: string,
  onStopSelected: ?(stop: any) => any,
  backgroundIsDark: boolean,
};

// Type definition for component state.
type State = {
  dataSourceStops: ListView.DataSource,
  dataSourceTimes: ListView.DataSource,
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
  routes: Array< number >,
  key: number,
};

// Type definition for navigator routes.
type NavigatorRoute = {
  id: number,
  stop: ?StopInfo,
};

// Imports
const Configuration = require('Configuration');
const Constants = require('Constants');
const Preferences = require('Preferences');
const SearchManager = require('SearchManager');
const SectionHeader = require('SectionHeader');
const TextUtils = require('TextUtils');
const TranslationUtils = require('TranslationUtils');

// Identifier for the navigator, indicating the list of stops is being shown.
const LIST: number = 0;
// Identifier for the navigator, indicating the details of a stop are shown.
const DETAILS: number = 1;
// Maximum number of upcoming bus arrival times to show.
const MAX_UPCOMING_TIMES: number = 4;
// Number of days in a week
const DAYS_IN_WEEK: number = 7;
// Time that bus schedules roll over
const BUS_SCHEDULE_ROLLOVER: number = 4;

class Stops extends React.Component {

  /**
   * Properties which the parent component should make available to this component.
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
    (this:any)._displayStopDetails = this._displayStopDetails.bind(this);
    (this:any)._onStopSearch = this._onStopSearch.bind(this);
    (this:any)._onTimeSearch = this._onTimeSearch.bind(this);
    (this:any)._pressRow = this._pressRow.bind(this);

    // Create the room search listener
    this._stopSearchListener = {
      onSearch: this._onStopSearch,
    };

    // Create the room search listener
    this._timeSearchListener = {
      onSearch: this._onTimeSearch,
    };
  }

  /**
   * If the stops have not beed loaded, then loads them.
   */
  componentDidMount(): void {
    // Register search listener if the app should not search all by default
    if (!Preferences.getAlwaysSearchAll()) {
      SearchManager.addSearchListener(this._stopSearchListener);
      SearchManager.addSearchListener(this._timeSearchListener);
    }

    if (!this.state.loaded) {
      Configuration.init()
          .then(this._onStopSearch)
          .catch(err => console.error('Configuration could not be initialized for stop details.', err));
    }
  }

  /**
   * Clears the cached stops.
   */
  componentWillUnmount(): void {
    SearchManager.removeSearchListener(this._stopSearchListener);
    SearchManager.removeSearchListener(this._timeSearchListener);
    this._cachedCampusStops = null;
  }

  // Contents of /transit_times.json, cached when first loaded
  _cachedCampusStops: ?Object = null;

  /** Listener for search input, when viewing stops. */
  _stopSearchListener: SearchListener;

  /** Listener for search input, when viewing times. */
  _timeSearchListener: SearchListener;

  /** Current scene on display in the navigator. */
  _currentScene: number = 0;

  /** The stop selected by the user. */
  _selectedStop: ?StopInfo = null;

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
   * Displays details about a single stop.
   *
   * @param {campuses} campuses data for all stops
   * @param {StopInfo} stop details about the stop to display.
   */
  _displayStopDetails(campuses: Object, stop: StopInfo): void {
    if (this._cachedCampusStops == null) {
      this._cachedCampusStops = campuses;
    }

    this.refs.Navigator.push({id: DETAILS, stop: stop});
    this._selectedStop = stop;
    this._onTimeSearch(null);
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

    if (this._cachedCampusStops == null) {
      Configuration.getConfig('/transit_times.json')
          .then(campuses => this._displayStopDetails(campuses, stop))
          .catch(err => console.error('Could not get /transit_times.json.', err));
    } else {
      this._displayStopDetails(this._cachedCampusStops, stop);
    }
  }

  /**
   * Returns a list of times for the current day that will be the next to occur.
   *
   * @param {Object} days         a dictionary of days mapped to times.
   * @returns {string} a list of up to 3 times, formatted as a string.
   */
  _retrieveUpcomingTimes(days: Object): string {
    // Get current language for translations
    const Translations: Object = TranslationUtils.getTranslations(Preferences.getSelectedLanguage());

    const upcomingTimes = [];
    const now = new Date();
    const currentTime = TextUtils.leftPad(now.getHours().toString(), 2, '0')
        + ':'
        + TextUtils.leftPad(now.getMinutes().toString(), 2, '0');

    let currentDay = ((now.getDay() - 1) % DAYS_IN_WEEK);
    if (now.getHours() < BUS_SCHEDULE_ROLLOVER) {
      currentDay = (currentDay - 1) % DAYS_IN_WEEK;
    }
    currentDay = currentDay.toString();

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
   * Filters the stops for which routes are displayed, based on the provided search terms.
   *
   * @param {?string} searchTerms a string of search terms, or null for an empty search (all results should return)
   */
  _onStopSearch(searchTerms: ?string) {
    if (this._currentScene !== LIST) {
      return;
    }

    // Ignore the case of the search terms
    const adjustedSearchTerms: ?string = (searchTerms == null || searchTerms.length === 0)
        ? null
        : searchTerms.toUpperCase();

    const stops: Array<StopInfo> = [];
    for (let i = 0; i < this.props.campus.stops.length; i++) {
      const stop = this.props.campus.stops[i];
      let matches: boolean = false;

      // Compare stop details to the search terms
      matches = adjustedSearchTerms == null
          || stop.code.toString().indexOf(adjustedSearchTerms) >= 0
          || stop.name.toUpperCase().indexOf(adjustedSearchTerms) >= 0;

      // Compare each route number to the search terms until one matches
      for (let j = 0; j < stop.routes.length && !matches; j++) {
        if (stop.routes[j].toString().indexOf(adjustedSearchTerms) >= 0) {
          matches = true;
        }
      }

      if (matches) {
        stops.push({
          code: stop.code,
          name: stop.name,
          lat: stop.lat,
          long: stop.long,
          routes: stop.routes,
          key: i,
        });
      }
    }

    this.setState({
      dataSourceStops: this.state.dataSourceStops.cloneWithRows(stops),
      loaded: true,
    });
  }

  /**
   * Filters the routes for which times are displayed, based on the provided search terms.
   *
   * @param {?string} searchTerms a string of search terms, or null for an empty search (all results should return)
   */
  _onTimeSearch(searchTerms: ?string) {
    if (this._currentScene !== DETAILS || this._cachedCampusStops == null || this._selectedStop == null) {
      return;
    }

    // Ignore the case of the search terms
    const adjustedSearchTerms: ?string = (searchTerms == null || searchTerms.length === 0)
        ? null
        : searchTerms.toUpperCase();

    let routeInfo: ?Array<DetailedRouteInfo> = null;
    for (let i = 0; i < this._cachedCampusStops.length; i++) {
      if (this._cachedCampusStops[i].id === this.props.campusName) {
        routeInfo = this._cachedCampusStops[i].stops[this._selectedStop.key].routes;
        break;
      }
    }

    const language: Language = Preferences.getSelectedLanguage();
    const routesAndTimes: Array<DetailedRouteInfo> = [];
    if (routeInfo != null) {
      for (let i = 0; i < routeInfo.length; i++) {
        let matches: boolean = false;
        matches = adjustedSearchTerms == null
            || routeInfo[i].number.toString().indexOf(adjustedSearchTerms) >= 0
            || routeInfo[i].sign.toUpperCase().indexOf(adjustedSearchTerms) >= 0;

        for (const day in routeInfo[i].days) {
          if (!matches && adjustedSearchTerms != null && routeInfo[i].days.hasOwnProperty(day)) {
            for (let j = 0; j < day.length; j++) {
              const weekday = TranslationUtils.numberToDay(language, parseInt(day.charAt(j)));

              if (weekday != null && weekday.toUpperCase().indexOf(adjustedSearchTerms) >= 0) {
                matches = true;
              }
            }
          }
        }

        if (matches) {
          routesAndTimes.push({
            number: routeInfo[i].number,
            sign: routeInfo[i].sign,
            days: routeInfo[i].days,
          });
        }
      }
    }

    this.setState({
      dataSourceTimes: this.state.dataSourceTimes.cloneWithRows(routesAndTimes),
    });
  }

  /**
   * Shows partial details about a stop.
   *
   * @param {StopInfo} stop       details about the stop to display.
   * @param {string} sectionIndex index of the section the stop is in.
   * @param {number} rowIndex     index of the row the stop is in.
   * @returns {ReactElement<any>} the name of the stop, its unique code, and the list of routes
   *         that serve the stop.
   */
  _renderStopRow(stop: StopInfo, sectionIndex: string, rowIndex: number): ReactElement<any> {
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
   * @returns {ReactElement<any>} the headline and number of the route, and the upcoming times.
   */
  _renderTimeRow(route: DetailedRouteInfo, sectionIndex: string, rowIndex: number): ReactElement<any> {
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
   * @returns {ReactElement<any>} the view to render, based on {route}.
   */
  _renderScene(route: NavigatorRoute): ReactElement<any> {
    this._currentScene = route.id;

    if (route.id === DETAILS && route.stop != null) {
      const routeStop = route.stop;

      return (
        <View style={_styles.container}>
          <SectionHeader
              sectionIcon={'ios-arrow-back'}
              sectionIconClass={'ionicon'}
              sectionIconOnClick={this._clearStop.bind(this)}
              sectionName={routeStop.name}
              subtitleName={routeStop.code} />
          <ListView
              dataSource={this.state.dataSourceTimes}
              enableEmptySections={true}
              renderRow={this._renderTimeRow.bind(this)} />
        </View>
      );
    } else {
      return (
        <View style={_styles.container}>
          <SectionHeader
              sectionIcon={'directions-bus'}
              sectionIconClass={'material'}
              sectionName={TranslationUtils.getTranslatedName(Preferences.getSelectedLanguage(), this.props.campus)} />
          <ListView
              dataSource={this.state.dataSourceStops}
              enableEmptySections={true}
              renderRow={this._renderStopRow.bind(this)} />
        </View>
      );
    }
  }

  /**
   * Renders a navigator which handles the scene rendering.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement<any> {
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
    backgroundColor: Constants.Colors.garnet,
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

module.exports = Stops;
