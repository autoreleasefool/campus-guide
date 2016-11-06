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
 * @created 2016-11-5
 * @file BusStops.js
 * @providesModule BusStops
 * @description Displays details about the city transit stops.
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
  Language,
  Route,
  RouteDetails,
  TransitCampus,
  TransitStop,
} from 'types';

// Type definition for component props.
type Props = {
  campus: TransitCampus,        // Information about the campus with transit service
  language: Language,           // The current language, selected by the user
  onSelect: (stop: any) => any, // Callback for when a stop is selected
  stopFilter: ?string,          // Filter stops
  timeFilter: ?string,          // Filter times
};

// Type definition for component state.
type State = {
  dataSourceStops: ListView.DataSource, // List of transit stops near the campus
  dataSourceTimes: ListView.DataSource, // List of times that buses visit the stops
  loaded: boolean,                      // Indicates if the data has been loaded
  selectedStop: ?TransitStop,           // Currently selected stop to display details for
};

// Imports
import * as Configuration from 'Configuration';
import * as Constants from 'Constants';
import * as TextUtils from 'TextUtils';
import * as TranslationUtils from 'TranslationUtils';

// Identifier for the navigator, indicating the list of stops is being shown.
const STOPS: number = 0;
// Identifier for the navigator, indicating the times of a stop are shown.
const TIMES: number = 1;

// Maximum number of upcoming bus arrival times to show.
const MAX_UPCOMING_TIMES: number = 4;
// Number of days in a week
const DAYS_IN_WEEK: number = 7;
// Time that bus schedules roll over
const BUS_SCHEDULE_ROLLOVER: number = 4;

export default class BusStops extends React.Component {

  /**
   * Properties this component expects to be provided by its parent.
   */
  props: Props;

  /**
   * Current state of the component.
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
      dataSourceStops: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
      }),
      dataSourceTimes: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
      }),
      loaded: false,
      selectedStop: null,
    };
  }

  /**
   * If the stops have not beed loaded, then loads them.
   */
  componentDidMount(): void {
    if (!this.state.loaded) {
      Configuration.init()
          .then(() => this._onStopSearch(this.props.stopFilter))
          .catch((err: any) => console.error('Configuration could not be initialized for stop details.', err));
    }
  }

  /**
   * If a new filter is provided, update the list of stops or times.
   *
   * @param {Props} nextProps the new props being received
   */
  componentWillReceiveProps(nextProps: Props): void {
    const routes = this.refs.Navigator.getCurrentRoutes();
    if (routes.length > 0) {
      if (routes[routes.length - 1].id === STOPS && this.props.stopFilter != nextProps.stopFilter) {
        this._onStopSearch(nextProps.stopFilter);
      } else if (routes[routes.length - 1].id === TIMES && this.props.timeFilter != nextProps.timeFilter) {
        this._onTimeSearch(null, nextProps.timeFilter);
      }
    }
  }

  /**
   * Informs parent that no stop is selected.
   */
  _clearStop(): void {
    this.refs.Navigator.pop();
    this.props.onSelect(null);
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
   * @param {TransitStop} stop details about the stop to display.
   */
  _pressRow(stop: TransitStop): void {
    this.props.onSelect(stop);
    this._onTimeSearch(stop, this.props.timeFilter);
    this.refs.Navigator.push({id: TIMES});
  }

  /**
   * Returns a list of times for the current day that will be the next to occur.
   *
   * @param {Object} days a dictionary of days mapped to times.
   * @returns {string} a list of up to 3 times, formatted as a string.
   */
  _retrieveUpcomingTimes(days: Object): string {
    // Get current language for translations
    const Translations: Object = TranslationUtils.getTranslations(this.props.language);

    const upcomingTimes = [];
    const now = new Date();
    const currentTime = TextUtils.leftPad(now.getHours().toString(), 2, '0') + ':'
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
   * Sorts the routes by their number, from lowest to highest.
   *
   * @param {Array<{number: number}>} routes list of routes to sort
   * @returns {Array<{number: number}>} the modified, sorted list
   */
  _sortByRouteNumber(routes: Array < { number: number } & Object >): Array < { number: number } & Object > {
    routes.sort((a, b) => {
      return a.number - b.number;
    });
    return routes;
  }

  /**
   * Filters the stops for which routes are displayed, based on the provided search terms.
   *
   * @param {?string} searchTerms a string of search terms, or null for an empty search (all results should return)
   */
  _onStopSearch(searchTerms: ?string): void {
    // Ignore the case of the search terms
    const adjustedSearchTerms: ?string = (searchTerms == null || searchTerms.length === 0)
        ? null
        : searchTerms.toUpperCase();

    const stops: Array < TransitStop > = [];
    for (let i = 0; i < this.props.campus.stops.length; i++) {
      const stop = this.props.campus.stops[i];
      let matches: boolean = false;

      // Sort the list of routes, if they haven't been sorted yet
      if (!stop.sorted) {
        this._sortByRouteNumber(stop.routes);
        stop.sorted = true;
      }

      // Compare stop details to the search terms
      matches = adjustedSearchTerms == null
          || stop.code.toString().indexOf(adjustedSearchTerms) >= 0
          || stop.name.toUpperCase().indexOf(adjustedSearchTerms) >= 0;

      // Compare each route number to the search terms until one matches
      for (let j = 0; j < stop.routes.length && !matches; j++) {
        if (adjustedSearchTerms == null
            || stop.routes[j].number.toString().indexOf(adjustedSearchTerms) >= 0
            || stop.routes[j].sign.indexOf(adjustedSearchTerms) >= 0) {
          matches = true;
          break;
        }
      }

      if (matches) {
        stop.key = stops.length;
        stops.push(stop);
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
   * @param {?TransitStop} newStop     the stop to search for routes and times, or null to use state
   * @param {?string}      searchTerms a string of search terms, or null for an empty search (all results should return)
   */
  _onTimeSearch(newStop: ?TransitStop, searchTerms: ?string): void {
    const stop = newStop || this.state.selectedStop;
    if (stop == null) {
      return;
    }

    // Ignore the case of the search terms
    const adjustedSearchTerms: ?string = (searchTerms == null || searchTerms.length === 0)
        ? null
        : searchTerms.toUpperCase();

    const routesAndTimes: Array < RouteDetails > = [];
    if (stop.routes != null) {
      for (let i = 0; i < stop.routes.length; i++) {
        let matches: boolean = false;
        matches = adjustedSearchTerms == null
            || stop.routes[i].number.toString().indexOf(adjustedSearchTerms) >= 0
            || stop.routes[i].sign.toUpperCase().indexOf(adjustedSearchTerms) >= 0;

        for (const day in stop.routes[i].days) {
          if (!matches && adjustedSearchTerms != null && stop.routes[i].days.hasOwnProperty(day)) {
            for (let j = 0; j < day.length; j++) {
              const weekday = TranslationUtils.numberToDay(this.props.language, parseInt(day.charAt(j)));

              if (weekday != null && weekday.toUpperCase().indexOf(adjustedSearchTerms) >= 0) {
                matches = true;
              }
            }
          }
        }

        if (matches) {
          routesAndTimes.push({
            number: stop.routes[i].number,
            sign: stop.routes[i].sign,
            days: stop.routes[i].days,
          });
        }
      }
    }

    this._sortByRouteNumber(routesAndTimes);
    this.setState({
      dataSourceTimes: this.state.dataSourceTimes.cloneWithRows(routesAndTimes),
      selectedStop: stop,
    });
  }

  /**
   * Shows partial details about a stop.
   *
   * @param {TransitStop} stop         details about the stop to display.
   * @param {string}      sectionIndex index of the section the stop is in.
   * @param {number}      rowIndex     index of the row the stop is in.
   * @returns {ReactElement<any>} the name of the stop, its unique code, and the list of routes
   *                              that serve the stop.
   */
  _renderStopRow(stop: TransitStop, sectionIndex: string, rowIndex: number): ReactElement < any > {
    return (
      <View>
        <TouchableOpacity onPress={this._pressRow.bind(this, stop)}>
          <View style={_styles.header}>
            <Text style={_styles.headerTitle}>{stop.name}</Text>
            <Text style={_styles.headerSubtitle}>{stop.code}</Text>
          </View>
          {stop.routes.map((route: RouteDetails) => (
            <Text
                key={route.number}
                style={_styles.stopRoutes}>
              {`${route.number} - ${route.sign}`}
            </Text>
          ))}
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
   * @param {RouteDetails} route        details about the route to display
   * @param {string}       sectionIndex index of the section the route is in
   * @param {number}       rowIndex     index of the row the route is in
   * @returns {ReactElement<any>} the headline and number of the route, and the upcoming times
   */
  _renderTimeRow(route: RouteDetails, sectionIndex: string, rowIndex: number): ReactElement < any > {
    return (
      <View>
        <View style={_styles.header}>
          <Text style={_styles.headerTitle}>{route.sign}</Text>
          <Text style={_styles.headerSubtitle}>{route.number}</Text>
        </View>
        <Text style={_styles.stopTimes}>{this._retrieveUpcomingTimes(route.days)}</Text>
        {(rowIndex < this.state.dataSourceTimes.getRowCount() - 1)
            ? <View style={_styles.divider} />
            : null}
      </View>
    );
  }

  /**
   * Renders a view according to the current route of the navigator.
   *
   * @param {Route} route object with properties to identify the route to display.
   * @returns {ReactElement<any>} the view to render, based on {route}.
   */
  _renderScene(route: Route): ReactElement < any > {
    if (route.id === TIMES) {
      return (
        <ListView
            dataSource={this.state.dataSourceTimes}
            enableEmptySections={true}
            renderRow={this._renderTimeRow.bind(this)}
            style={_styles.timeContainer} />
      );
    } else {
      return (
        <ListView
            dataSource={this.state.dataSourceStops}
            enableEmptySections={true}
            renderRow={this._renderStopRow.bind(this)}
            style={_styles.stopContainer} />
      );
    }
  }

  /**
   * Renders a navigator which handles the scene rendering.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render
   */
  render(): ReactElement < any > {
    return (
      <Navigator
          configureScene={this._configureScene}
          initialRoute={{id: STOPS}}
          ref='Navigator'
          renderScene={this._renderScene.bind(this)}
          style={_styles.container} />
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stopContainer: {
    flex: 1,
    backgroundColor: Constants.Colors.primaryBackground,
  },
  timeContainer: {
    flex: 1,
    backgroundColor: Constants.Colors.secondaryBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Constants.Sizes.Margins.Regular,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'left',
    fontSize: Constants.Sizes.Text.Title,
    color: Constants.Colors.primaryWhiteText,
  },
  headerSubtitle: {
    textAlign: 'right',
    fontSize: Constants.Sizes.Text.Caption,
    color: Constants.Colors.secondaryWhiteText,
  },
  stopRoutes: {
    marginLeft: Constants.Sizes.Margins.Expanded * 2,
    marginRight: Constants.Sizes.Margins.Regular,
    marginBottom: Constants.Sizes.Margins.Regular,
    fontSize: Constants.Sizes.Text.Caption,
    color: Constants.Colors.primaryWhiteText,
  },
  stopTimes: {
    marginLeft: Constants.Sizes.Margins.Regular,
    marginRight: Constants.Sizes.Margins.Regular,
    marginBottom: Constants.Sizes.Margins.Regular,
    fontStyle: 'italic',
    fontSize: Constants.Sizes.Text.Body,
    color: Constants.Colors.secondaryWhiteText,
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    marginLeft: Constants.Sizes.Margins.Regular,
    marginRight: Constants.Sizes.Margins.Regular,
    backgroundColor: Constants.Colors.secondaryWhiteText,
  },
});
