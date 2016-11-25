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
 * @file TransitStops.js
 * @providesModule TransitStops
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
  TimeFormat,
  TransitCampus,
} from 'types';

// Type definition for component props.
type Props = {
  campus: TransitCampus,                // Information about the campus with transit service
  filter: ?string,                      // Filter stops and times
  language: Language,                   // The current language, selected by the user
  onSelect: (stopId: ?string) => void,  // Callback for when a stop is selected
  stops: Object,                        // Set of stop ids mapped to details about the stop
  timeFormat: TimeFormat,               // Format to display times in
};

// Type definition for component state.
type State = {
  dataSourceStops: ListView.DataSource, // List of transit stops near the campus
  dataSourceTimes: ListView.DataSource, // List of times that buses visit the stops
  selectedStopId: ?string,              // Currently selected stop to display details for
};

// Imports
import {renderConnector, getConnectorWidth} from 'Connector';
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
// Time that transit schedules roll over
const TRANSIT_SCHEDULE_ROLLOVER: number = 4;

export default class TransitStops extends React.Component {

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
        sectionHeaderHasChanged: (s1: any, s2: any) => s1 !== s2,
      }),
      dataSourceTimes: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
      }),
      selectedStopId: null,
    };
  }

  /**
   * If the stops have not beed loaded, then loads them.
   */
  componentDidMount(): void {
    this._onStopSearch(this.props.filter);
  }

  /**
   * If a new filter is provided, update the list of stops or times.
   *
   * @param {Props} nextProps the new props being received
   */
  componentWillReceiveProps(nextProps: Props): void {
    const routes = this.refs.Navigator.getCurrentRoutes();
    if (routes.length > 0) {
      if (routes[routes.length - 1].id === STOPS
          && (nextProps.filter != this.props.filter || nextProps.language != this.props.language)) {
        this._onStopSearch(nextProps.filter);
      } else if (routes[routes.length - 1].id === TIMES
          && (nextProps.filter != this.props.filter
              || nextProps.language != this.props.language
              || nextProps.timeFormat != this.props.timeFormat)) {
        this._onTimeSearch(null, nextProps.filter);
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
   * @param {string} stopId identifies the stop to display details about
   */
  _pressRow(stopId: string): void {
    this.props.onSelect(stopId);
    this._onTimeSearch(stopId, null);
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
    if (now.getHours() < TRANSIT_SCHEDULE_ROLLOVER) {
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
                let time = TextUtils.get24HourAdjustedTime(days[day][i + j]);
                time = TextUtils.convertTimeFormat(this.props.timeFormat, time);
                upcomingTimes.push(time);
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
      return upcomingTimes.join('    ');
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
  _sortByRouteNumber(routes: Array < Object >): Array < Object > {
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

    const stops: Object = {};
    for (const stopId in this.props.campus.stops) {
      if (this.props.campus.stops.hasOwnProperty(stopId)) {
        const stop = this.props.stops[stopId];
        let matches: boolean = false;

        // Sort the list of routes, if they haven't been sorted yet
        if (!stop.sorted) {
          this._sortByRouteNumber(this.props.campus.stops[stopId]);
          stop.sorted = true;
        }

        // Compare stop details to the search terms
        matches = adjustedSearchTerms == null
            || stop.code.toString().indexOf(adjustedSearchTerms) >= 0
            || stop.name.toUpperCase().indexOf(adjustedSearchTerms) >= 0;

        // Compare each route number to the search terms until one matches
        for (let j = 0; j < this.props.campus.stops[stopId].length && !matches; j++) {
          if (adjustedSearchTerms == null
              || this.props.campus.stops[stopId][j].number.toString().indexOf(adjustedSearchTerms) >= 0
              || this.props.campus.stops[stopId][j].sign.indexOf(adjustedSearchTerms) >= 0) {
            matches = true;
            break;
          }
        }

        if (matches) {
          stops[stopId] = this.props.campus.stops[stopId];
        }
      }
    }

    this.setState({
      dataSourceStops: this.state.dataSourceStops.cloneWithRowsAndSections(stops),
    });
  }

  /**
   * Filters the routes for which times are displayed, based on the provided search terms.
   *
   * @param {?string} newStopId   the stop id to search for routes and times, or null to use state
   * @param {?string} searchTerms a string of search terms, or null for an empty search (all results should return)
   */
  _onTimeSearch(newStopId: ?string, searchTerms: ?string): void {
    const stopId = newStopId || this.state.selectedStopId;
    if (stopId == null) {
      return;
    }

    // Ignore the case of the search terms
    const adjustedSearchTerms: ?string = (searchTerms == null || searchTerms.length === 0)
        ? null
        : searchTerms.toUpperCase();

    const stopRoutes = this.props.campus.stops[stopId];
    const routesAndTimes: Array < RouteDetails > = [];
    if (this.props.campus.stops[stopId] != null) {
      for (let i = 0; i < stopRoutes.length; i++) {
        let matches: boolean = false;
        matches = adjustedSearchTerms == null
            || stopRoutes[i].number.toString().indexOf(adjustedSearchTerms) >= 0
            || stopRoutes[i].sign.toUpperCase().indexOf(adjustedSearchTerms) >= 0;

        for (const day in stopRoutes[i].days) {
          if (!matches && adjustedSearchTerms != null && stopRoutes[i].days.hasOwnProperty(day)) {
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
            number: stopRoutes[i].number,
            sign: stopRoutes[i].sign,
            days: stopRoutes[i].days,
          });
        }
      }
    }

    this._sortByRouteNumber(routesAndTimes);
    this.setState({
      dataSourceTimes: this.state.dataSourceTimes.cloneWithRows(routesAndTimes),
      selectedStopId: stopId,
    });
  }

  /**
   * Shows the name and code of a stop.
   *
   * @param {Object} sectionData section object
   * @param {string} stopId      id of the stop
   * @returns {ReactElement<any>} details of the stop and its code
   */
  _renderStopHeader(sectionData: Object, stopId: string): ReactElement < any > {
    const stop = this.props.stops[stopId];
    return (
      <TouchableOpacity onPress={this._pressRow.bind(this, stopId)}>
        <View style={_styles.stopHeaderContainer}>
          {renderConnector({large: true, bottomConnection: true, color: Constants.Colors.lightGrey})}
          <View style={_styles.stopHeader}>
            <Text style={_styles.headerTitle}>{stop.name}</Text>
            <Text style={_styles.headerSubtitle}>{stop.code}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  /**
   * Shows details of a route serving a stop
   *
   * @param {string} route  the route
   * @param {string} stopId stop id
   * @returns {ReactElement<any>} a route that serves the stop
   */
  _renderStopRow(route: RouteDetails, stopId: string): ReactElement < any > {
    const needsBottom = route !== this.props.campus.stops[stopId][this.props.campus.stops[stopId].length - 1];
    return (
      <TouchableOpacity onPress={this._pressRow.bind(this, stopId)}>
        <View style={_styles.stopRowContainer}>
          {renderConnector({topConnection: true, bottomConnection: needsBottom, color: Constants.Colors.lightGrey})}
          <Text
              key={route.number}
              style={_styles.stopRoute}>
            {`${route.number} - ${route.sign}`}
          </Text>
        </View>
      </TouchableOpacity>
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
        <View style={_styles.timeHeader}>
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
            style={[_styles.container, _styles.timeContainer]} />
      );
    } else {
      return (
        <ListView
            dataSource={this.state.dataSourceStops}
            enableEmptySections={true}
            renderRow={this._renderStopRow.bind(this)}
            renderSectionHeader={this._renderStopHeader.bind(this)}
            style={[_styles.container, _styles.stopContainer]} />
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
    backgroundColor: Constants.Colors.primaryBackground,
  },
  timeContainer: {
    backgroundColor: Constants.Colors.secondaryBackground,
  },
  stopHeaderContainer: {
    height: 40,
    justifyContent: 'center',
    backgroundColor: Constants.Colors.primaryBackground,
  },
  stopHeader: {
    marginLeft: getConnectorWidth() + Constants.Sizes.Margins.Regular,
    marginRight: Constants.Sizes.Margins.Expanded,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stopRowContainer: {
    height: 24,
    justifyContent: 'center',
  },
  stopRoute: {
    marginLeft: getConnectorWidth() + Constants.Sizes.Margins.Expanded,
    marginRight: Constants.Sizes.Margins.Regular,
    fontSize: Constants.Sizes.Text.Body,
    color: Constants.Colors.primaryWhiteText,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'left',
    fontSize: Constants.Sizes.Text.Subtitle,
    color: Constants.Colors.primaryWhiteText,
  },
  headerSubtitle: {
    textAlign: 'right',
    fontSize: Constants.Sizes.Text.Caption,
    color: Constants.Colors.secondaryWhiteText,
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Constants.Sizes.Margins.Expanded,
    marginRight: Constants.Sizes.Margins.Expanded,
    marginTop: Constants.Sizes.Margins.Expanded,
  },
  stopTimes: {
    marginLeft: Constants.Sizes.Margins.Expanded,
    marginRight: Constants.Sizes.Margins.Expanded,
    marginTop: Constants.Sizes.Margins.Regular,
    marginBottom: Constants.Sizes.Margins.Expanded,
    fontStyle: 'italic',
    fontSize: Constants.Sizes.Text.Body,
    color: Constants.Colors.secondaryWhiteText,
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    marginLeft: Constants.Sizes.Margins.Expanded,
    marginRight: Constants.Sizes.Margins.Expanded,
    backgroundColor: Constants.Colors.secondaryWhiteText,
  },
});
