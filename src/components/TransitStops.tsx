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
 * @created 2016-11-5
 * @file TransitStops.tsx
 * @description Displays details about the city transit stops.
 */
'use strict';

// React imports
import React from 'react';
import {
  FlatList,
  InteractionManager,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Navigator } from 'react-native-deprecated-custom-components';

// Imports
import Header from './Header';
import * as Connector from './Connector';
import * as Constants from '../constants';
import * as TextUtils from '../util/TextUtils';
import * as Translations from '../util/Translations';

// Types
import { Language } from '../util/Translations';
import { Route, Section, TimeFormat } from '../../typings/global';
import { RouteDetails, TransitCampus } from '../../typings/transit';

interface Props {
  campus: TransitCampus;                      // Information about the campus with transit service
  filter: string;                             // Filter stops and times
  language: Language;                         // The current language, selected by the user
  stops: any;                                 // Set of stop ids mapped to details about the stop
  style?: any;                                // View style
  timeFormat: TimeFormat;                     // Format to display times in
  onSelect(stopId: string | undefined): void; // Callback for when a stop is selected
}

interface State {
  stops: Section < RouteDetails >[];   // List of transit stops near the campus
  times: RouteDetails[];              // List of times that buses visit the stops
  selectedStopId: string | undefined; // Currently selected stop to display details for
}

// Identifier for the navigator, indicating the list of stops is being shown.
const STOPS = 0;
// Identifier for the navigator, indicating the times of a stop are shown.
const TIMES = 1;

// Maximum number of upcoming bus arrival times to show.
const MAX_UPCOMING_TIMES = 4;
// Number of days in a week
const DAYS_IN_WEEK = 7;
// Time that transit schedules roll over
const TRANSIT_SCHEDULE_ROLLOVER = 4;

export default class TransitStops extends React.PureComponent<Props, State> {

  /**
   * Pass props and declares initial state.
   *
   * @param {Props} props properties passed from container to this component
   */
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedStopId: undefined,
      stops: [],
      times: [],
    };
  }

  /**
   * If the stops have not beed loaded, then loads them.
   */
  componentDidMount(): void {
    InteractionManager.runAfterInteractions(() => this._onStopSearch(this.props));
  }

  /**
   * If a new filter is provided, update the list of stops or times.
   *
   * @param {Props} nextProps the new props being received
   */
  componentWillReceiveProps(nextProps: Props): void {
    const routes = (this.refs.Navigator as any).getCurrentRoutes();
    if (routes.length > 0) {
      if (routes[routes.length - 1].id === STOPS
          && (nextProps.filter !== this.props.filter || nextProps.language !== this.props.language)) {
        this._onStopSearch(nextProps);
      } else if (routes[routes.length - 1].id === TIMES
          && (nextProps.filter !== this.props.filter
              || nextProps.language !== this.props.language
              || nextProps.timeFormat !== this.props.timeFormat)) {
        this._onTimeSearch(undefined, nextProps);
      }
    }
  }

  /**
   * Informs parent that no stop is selected.
   */
  _clearStop(): void {
    (this.refs.Navigator as any).pop();
    this.props.onSelect(undefined);
  }

  /**
   * Sets the transition between two views in the navigator.
   *
   * @returns {any} a configuration for transitions between scenes
   */
  _configureScene(): any {
    return Navigator.SceneConfigs.PushFromRight;
  }

  /**
   * Clone the props object. Workaround for spread operator { ...this.props } not working.
   *
   * @param {Props} props the props object to clone
   */
  _propCloneWorkaround(props: Props): Props {
    return {
      campus: props.campus,
      filter: props.filter,
      language: props.language,
      onSelect: props.onSelect,
      stops: props.stops,
      timeFormat: props.timeFormat,
    };
  }

  /**
   * Displays details about a single stop.
   *
   * @param {RouteDetails} routeDetails route details which belong to the stop to display
   */
  _selectStopByRoute(routeDetails: RouteDetails): void {
    let selectedStop: Section<RouteDetails>;
    for (const section of this.state.stops) {
      for (const route of section.data) {
        if (route === routeDetails) {
          selectedStop = section;
        }
      }
    }

    if (selectedStop) {
      this._selectStop(selectedStop.key);
    }
  }

  /**
   * Displays details about a single stop.
   *
   * @param {string} stopId id of the stop to display
   */
  _selectStop(stopId: string): void {
    this.props.onSelect(stopId);

    const props = this._propCloneWorkaround(this.props);
    props.filter = '';
    this._onTimeSearch(stopId, props);
    (this.refs.Navigator as any).push({ id: TIMES });
  }

  /**
   * Returns a list of times for the current day that will be the next to occur.
   *
   * @param {any}        days       a dictionary of days mapped to times
   * @param {TimeFormat} timeFormat the user's preferred time format
   * @returns {string} a list of up to 3 times, formatted as a string
   */
  _retrieveUpcomingTimes(days: any, timeFormat: TimeFormat): string {
    const upcomingTimes = [];
    const now = new Date();
    const currentTime =
        `${TextUtils.leftPad(now.getHours().toString(), 2, '0')}:`
        + `${TextUtils.leftPad(now.getMinutes().toString(), 2, '0')}`;

    let currentDay: string | number = ((now.getDay() - 1) % DAYS_IN_WEEK);
    if (now.getHours() < TRANSIT_SCHEDULE_ROLLOVER) {
      currentDay = (currentDay - 1) % DAYS_IN_WEEK;
    }
    currentDay = currentDay.toString();

    for (const day in days) {
      if (days.hasOwnProperty(day)) {
        if (day.indexOf(currentDay) > -1) {
          let i = days[day].length - 1;
          while (i >= 0) {
            if (days[day][i].localeCompare(currentTime) < 0 || i === 0) {
              let j = 1;
              while (j < MAX_UPCOMING_TIMES && i + j < days[day].length) {
                let time = TextUtils.get24HourAdjustedTime(days[day][i + j]);
                time = TextUtils.convertTimeFormat(timeFormat, time);
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
      return Translations.get('no_upcoming_buses');
    }
  }

  /**
   * Sorts the routes by their number, from lowest to highest.
   *
   * @param {RouteDetails[]} routes list of routes to sort
   * @returns {RouteDetails[]} the modified, sorted list
   */
  _sortByRouteNumber(routes: RouteDetails[]): RouteDetails[] {
    routes.sort((a: RouteDetails, b: RouteDetails) => {
      return a.number - b.number;
    });

    return routes;
  }

  /**
   * Filters the stops for which routes are displayed, based on the provided search terms.
   *
   * @param {Props} props the props to filter with
   */
  _onStopSearch({ campus, filter, stops }: Props): void {
    // Ignore the case of the search terms
    const adjustedSearchTerms = filter.toUpperCase();

    const matchedStops: Section<RouteDetails>[] = [];
    for (const stopId in campus.stops) {
      if (campus.stops.hasOwnProperty(stopId)) {
        const stop = stops[stopId];
        let matches = false;

        // Sort the list of routes, if they haven't been sorted yet
        if (!stop.sorted) {
          this._sortByRouteNumber(campus.stops[stopId]);
          stop.sorted = true;
        }

        // Compare stop details to the search terms
        matches = adjustedSearchTerms.length === 0
            || stop.code.toString().indexOf(adjustedSearchTerms) >= 0
            || stop.name.toUpperCase().indexOf(adjustedSearchTerms) >= 0;

        // Compare each route number to the search terms until one matches
        for (let j = 0; j < campus.stops[stopId].length && !matches; j++) {
          if (adjustedSearchTerms.length === 0
              || campus.stops[stopId][j].number.toString().indexOf(adjustedSearchTerms) >= 0
              || campus.stops[stopId][j].sign.indexOf(adjustedSearchTerms) >= 0) {
            matches = true;
            break;
          }
        }

        if (matches) {
          matchedStops.push({
            data: campus.stops[stopId],
            key: stopId,
          });
        }
      }
    }

    this.setState({ stops: matchedStops });
  }

  /**
   * Filters the routes for which times are displayed, based on the provided search terms.
   *
   * @param {string|undefined} newStopId the stop id to search for routes and times, or undefined to use state
   * @param {Props}            props     the props to filter with
   */
  _onTimeSearch(newStopId: string | undefined, { campus, filter }: Props): void {
    const stopId = newStopId || this.state.selectedStopId;
    if (stopId == undefined) {
      return;
    }

    // Ignore the case of the search terms
    const adjustedSearchTerms = filter.toUpperCase();

    const stopRoutes = campus.stops[stopId];
    const routesAndTimes: RouteDetails[] = [];
    if (campus.stops[stopId] != undefined) {
      for (const stopRoute of stopRoutes) {
        let matches = false;
        matches = adjustedSearchTerms.length === 0
            || stopRoute.number.toString().indexOf(adjustedSearchTerms) >= 0
            || stopRoute.sign.toUpperCase().indexOf(adjustedSearchTerms) >= 0;

        for (const day in stopRoute.days) {
          if (!matches && adjustedSearchTerms != undefined && stopRoute.days.hasOwnProperty(day)) {
            for (let j = 0; j < day.length; j++) {
              const weekday = Constants.Days[Translations.getLanguage()][parseInt(day.charAt(j))];

              if (weekday != undefined && weekday.toUpperCase().indexOf(adjustedSearchTerms) >= 0) {
                matches = true;
              }
            }
          }
        }

        if (matches) {
          routesAndTimes.push({
            days: stopRoute.days,
            number: stopRoute.number,
            sign: stopRoute.sign,
          });
        }
      }
    }

    this._sortByRouteNumber(routesAndTimes);
    this.setState({
      selectedStopId: stopId,
      times: routesAndTimes,
    });
  }

  /**
   * Shows the name and code of a stop.
   *
   * @param {Section<RouteDetails>} section the section to render a header for
   * @returns {JSX.Element} details of the stop and its code
   */
  _renderStopHeader({ section }: { section: Section <RouteDetails> }): JSX.Element {
    const stop = this.props.stops[section.key];

    return (
      <View style={_styles.stopHeaderContainerContainer}>
        <TouchableOpacity onPress={this._selectStop.bind(this, section.key)}>
          <View style={_styles.stopHeaderContainer}>
            {Connector.renderConnector({
              bottom: true,
              circleColor: Constants.Colors.secondaryBackground,
              large: true,
              lineColor: Constants.Colors.secondaryBackground,
            })}
            <View style={_styles.stopHeader}>
              <Text style={[ _styles.headerTitle, { color: Constants.Colors.primaryBlackText }]}>{stop.name}</Text>
              <Text style={[ _styles.headerSubtitle, { color: Constants.Colors.secondaryBlackText }]}>{stop.code}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  /**
   * Shows details of a route serving a stop
   *
   * @param {string} route  the route
   * @returns {JSX.Element} a route that serves the stop
   */
  _renderStopRow({ item }: { item: RouteDetails }): JSX.Element {
    return (
      <TouchableOpacity onPress={this._selectStopByRoute.bind(this, item)}>
        <View style={_styles.stopRowContainer}>
          {Connector.renderConnector({
            bottom: true,
            circleColor: Constants.Colors.tertiaryBackground,
            lineColor: Constants.Colors.tertiaryBackground,
            top: true,
          })}
          <Text
              key={item.number}
              style={_styles.stopRoute}>
            {`${item.number} - ${item.sign}`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  /**
   * Shows partial details about a route.
   *
   * @param {RouteDetails} item details about the route to display
   * @returns {ReactElement<any>} the headline and number of the route, and the upcoming times
   */
  _renderTimeRow({ item }: { item: RouteDetails }): JSX.Element {
    return (
      <View>
        <View style={_styles.timeHeader}>
          <Text style={[ _styles.headerTitle, { color: Constants.Colors.primaryWhiteText }]}>{item.sign}</Text>
          <Text style={[ _styles.headerSubtitle, { color: Constants.Colors.secondaryWhiteText }]}>{item.number}</Text>
        </View>
        <Text style={_styles.stopTimes}>
          {this._retrieveUpcomingTimes(item.days, this.props.timeFormat)}
        </Text>
      </View>
    );
  }

  /**
   * Renders row separator.
   *
   * @returns {JSX.Element} a separator styled view
   */
  _renderSeparator(): JSX.Element {
    return <View style={_styles.separator} />;
  }

  /**
   * Renders section separator.
   *
   * @returns {JSX.Element} a separator styled view
   */
  _renderSectionSeparator(): JSX.Element {
    return (
      <View style={_styles.sectionSeparator}>
        {Connector.renderConnector({
          cap: true,
          lineColor: Constants.Colors.tertiaryBackground,
        })}
      </View>
    );
  }

  /**
   * Renders a view according to the current route of the navigator.
   *
   * @param {Route} route object with properties to identify the route to display
   * @returns {JSX.Element} the view to render, based on {route}
   */
  _renderScene(route: Route): JSX.Element {
    if (route.id === TIMES) {
      const stop = this.props.stops[this.state.selectedStopId];

      return (
        <View style={_styles.container}>
          <TouchableOpacity onPress={(): void => (this.refs.Navigator as any).pop()}>
            <Header
                backgroundColor={Constants.Colors.tertiaryBackground}
                icon={{ name: 'chevron-left', class: 'material' }}
                subtitle={stop.code}
                title={stop.name} />
          </TouchableOpacity>
          <FlatList
              ItemSeparatorComponent={this._renderSeparator.bind(this)}
              data={this.state.times}
              keyExtractor={(routeDetails: RouteDetails): string => `${routeDetails.number} - ${routeDetails.sign}`}
              renderItem={this._renderTimeRow.bind(this)}
              style={_styles.container} />
        </View>
      );
    } else {
      return (
        <SectionList
            renderSectionFooter={this._renderSectionSeparator.bind(this)}
            keyExtractor={(routeDetails: RouteDetails): string => `${routeDetails.number} - ${routeDetails.sign}`}
            renderItem={this._renderStopRow.bind(this)}
            renderSectionHeader={this._renderStopHeader.bind(this)}
            sections={this.state.stops}
            style={_styles.container} />
      );
    }
  }

  /**
   * Renders a navigator which handles the scene rendering.
   *
   * @returns {JSX.Element} the hierarchy of views to render
   */
  render(): JSX.Element {
    return (
      <Navigator
          configureScene={this._configureScene}
          initialRoute={{ id: STOPS }}
          ref='Navigator'
          renderScene={this._renderScene.bind(this)}
          style={[ _styles.container, this.props.style ]} />
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    backgroundColor: Constants.Colors.secondaryBackground,
    flex: 1,
  },
  headerSubtitle: {
    fontSize: Constants.Sizes.Text.Caption,
    textAlign: 'right',
  },
  headerTitle: {
    flex: 1,
    fontSize: Constants.Sizes.Text.Subtitle,
    textAlign: 'left',
  },
  sectionSeparator: {
    height: Constants.Sizes.Margins.Regular,
  },
  separator: {
    backgroundColor: Constants.Colors.tertiaryBackground,
    height: StyleSheet.hairlineWidth,
    marginLeft: Constants.Sizes.Margins.Expanded,
  },
  stopHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: Connector.getConnectorWidth() + Constants.Sizes.Margins.Regular,
    marginRight: Constants.Sizes.Margins.Expanded,
  },
  stopHeaderContainer: {
    backgroundColor: Constants.Colors.tertiaryBackground,
    height: 50,
    justifyContent: 'center',
  },
  stopHeaderContainerContainer: {
    backgroundColor: Constants.Colors.secondaryBackground,
  },
  stopRoute: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
    marginLeft: Connector.getConnectorWidth() + Constants.Sizes.Margins.Regular,
    marginRight: Constants.Sizes.Margins.Regular,
  },
  stopRowContainer: {
    height: 40,
    justifyContent: 'center',
  },
  stopTimes: {
    color: Constants.Colors.secondaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
    fontStyle: 'italic',
    marginBottom: Constants.Sizes.Margins.Expanded,
    marginLeft: Constants.Sizes.Margins.Expanded,
    marginRight: Constants.Sizes.Margins.Expanded,
    marginTop: Constants.Sizes.Margins.Regular,
  },
  timeHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: Constants.Sizes.Margins.Expanded,
    marginRight: Constants.Sizes.Margins.Expanded,
    marginTop: Constants.Sizes.Margins.Expanded,
  },
});
