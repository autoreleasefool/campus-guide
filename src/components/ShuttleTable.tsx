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
 * @created 2017-03-05
 * @file ShuttleTable.tsx
 * @description Renders information about a shuttle schedule in a table
 */
'use strict';

// React imports
import React from 'react';
import {
  Dimensions,
  ListView,
  ScaledSize,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// Imports
import Header from './Header';
import MapView from 'react-native-maps';
import moment from 'moment';
import * as Constants from '../constants';
import * as TextUtils from '../util/TextUtils';
import * as Translations from '../util/Translations';
import { NavbarHeight } from './AppHeader';
import { HeaderHeight } from './Header';

// Types
import { Language } from '../util/Translations';
import { LatLong, LatLongDelta, TimeFormat } from '../../typings/global';
import { ShuttleDirection, ShuttleSchedule, ShuttleStop } from '../../typings/transit';

interface Props {
  direction: number;          // Which direction of the schedule
  language: Language;         // The user's currently selected language
  schedule: ShuttleSchedule;  // The schedule to render
  stops: ShuttleStop[];       // Stops which the shuttle makes
  tabLabel?: string;          // Tab label
  timeFormat: TimeFormat;     // The user's preferred time format
}

interface State {
  dataSource: any;                // List of times for the shuttle and days they occur
  region: LatLong & LatLongDelta; // Latitude and longitude for map to display
  screenHeight: number;           // Active height of the screen
  screenWidth: number;            // Active width of the screen
}

// Max number of shuttle times to display in a single row
const TIMES_PER_ROW = 2;

// tslint:disable no-magic-numbers
// Number of Headers which are rendered around the map
const CONTENT_SPACE = NavbarHeight + HeaderHeight * 6;
// tslint:enable no-magic-numbers

export default class ShuttleTable extends React.PureComponent<Props, State> {

  /** Starting region to display on map. */
  _initialRegion: LatLong & LatLongDelta;

  /**
   * Update the screen width, and rerender component.
   *
   * @param {ScaledSize} dims the new dimensions
   */
  _dimensionsHandler = (dims: { window: ScaledSize }): void =>
      this.setState({ screenWidth: dims.window.width, screenHeight: dims.window.height })

  /**
   * Constructor.
   *
   * @param {props} props component props
   */
  constructor(props: Props) {
    super(props);

    let dataSource = new ListView.DataSource({
      rowHasChanged: (r1: any, r2: any): boolean => r1 !== r2,
      sectionHeaderHasChanged: (s1: any, s2: any): boolean => s1 !== s2,
    });

    const data: any = { ...props.schedule.directions[props.direction].day_times };
    data.excluded_dates = props.schedule.excluded_dates;
    dataSource = dataSource.cloneWithRowsAndSections(data);
    const screenSize = Dimensions.get('window');
    this.state = {
      dataSource,
      region: Constants.Map.InitialRegion,
      screenHeight: screenSize.height,
      screenWidth: screenSize.width,
    };

    this._initialRegion = Constants.Map.InitialRegion;
  }

  /**
   * Add listener to screen dimensions.
   */
  componentDidMount(): void {
    Dimensions.addEventListener('change', this._dimensionsHandler as any);
  }

  /**
   * Removes screen dimension listener.
   */
  componentWillUnmount(): void {
    Dimensions.removeEventListener('change', this._dimensionsHandler as any);
  }

  /**
   * Update schedule times when requested schedule changes.
   *
   * @param {Props} nextProps the new props being received
   */
  componentWillReceiveProps(nextProps: Props): void {
    if (this.props.direction !== nextProps.direction || this.props.schedule !== nextProps.schedule) {
      const data: any = { ...nextProps.schedule.directions[nextProps.direction].day_times };
      data.excluded_dates = nextProps.schedule.excluded_dates;
      this.setState({ dataSource: this.state.dataSource.cloneWithRowsAndSections(data) });
    }
  }

  /**
   * Renders the header of the list, with important information about the shuttle.
   *
   * @returns {JSX.Element} a set of text views with information
   */
  _renderHeader(): JSX.Element {
    const textInfo: JSX.Element[] = [
      <Text key={'travel_time'} style={_styles.info}>{Translations.get('shuttle_travel_time')}</Text>,
      <Text key={'id_required'} style={_styles.info}>{Translations.get('shuttle_id_required')}</Text>,
      <Text key={'approx_times'} style={_styles.info}>{Translations.get('transit_approximate_times')}</Text>,
    ];

    const currentDate: string = moment().format('YYYY-MM-DD');
    if (this.props.schedule.excluded_dates.indexOf(currentDate) >= 0) {
      // Warning to notify users if current date is excluded from schedule
      textInfo.unshift(
        <Text key={'date_excluded'} style={[_styles.info, _styles.warning]}>
          {Translations.get('shuttle_not_in_service')}
        </Text>
      );
    }

    const currentSchedule = this.props.schedule;
    const direction = currentSchedule.directions[this.props.direction % currentSchedule.directions.length];

    return (
      <View>
        {this._renderMap(direction)}
        {this._renderRoute(direction)}
        <Header
            backgroundColor={Constants.Colors.tertiaryBackground}
            title={Translations.get('departure_times')} />
        <View style={_styles.fullSeparator} />
        <View style={_styles.header}>
          {(textInfo.map((text: JSX.Element) => text))}
        </View>
      </View>
    );
  }

  /**
   * Renders a map of locations which the shuttle makes stops at.
   *
   * @param {ShuttleDirection} direction shuttle direction to render
   * @returns {JSX.Element} the map component
   */
  _renderMap(direction: ShuttleDirection): JSX.Element {
    const mapContainer = {
      height: this.state.screenHeight - CONTENT_SPACE,
      width: this.state.screenWidth,
    };

    return (
      <View style={mapContainer}>
        <MapView
            followsUserLocation={true}
            initialRegion={this._initialRegion}
            region={this.state.region}
            showsUserLocation={true}
            style={_styles.map}
            onRegionChange={(region: LatLong & LatLongDelta): void => this.setState({ region })}>
          {this.props.stops.map((stop: ShuttleStop) => (
            <MapView.Marker
                coordinate={{ latitude: stop[direction.id].latitude, longitude: stop[direction.id].longitude }}
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
      <View style={_styles.routeTextContainer}>
        <Text style={_styles.routeText}>{Translations.getVariant('route', direction)}</Text>
      </View>
    );
  }

  /**
   * Returns a view to head and define a section.
   *
   * @param {any}    _      section data
   * @param {string} header title of the header
   * @returns {JSX.Element} the header for a certain section
   */
  _renderSectionHeader(_: any, header: string): JSX.Element {
    const sectionHeaderWidth = { width: this.state.screenWidth };

    if (header === 'excluded_dates') {
      return (
        <View style={[ _styles.sectionHeaderContainer, sectionHeaderWidth ]}>
          <Text style={[ _styles.sectionHeader, sectionHeaderWidth ]}>{Translations.get('excluded_dates')}</Text>
        </View>
      );
    } else {
      const firstDay = Constants.Days[Translations.getLanguage()][parseInt(header.substr(0, 1))];
      const lastDay = Constants.Days[Translations.getLanguage()][parseInt(header.substr(header.length - 1))];
      const period = firstDay === lastDay ? firstDay : `${firstDay} - ${lastDay}`;

      return (
        <View style={[ _styles.sectionHeaderContainer, sectionHeaderWidth ]}>
          <Text style={[ _styles.sectionHeader, sectionHeaderWidth ]}>{period}</Text>
        </View>
      );
    }
  }

  /**
   * Renders a separator line between rows.
   *
   * @param {any} sectionID section id
   * @param {any} rowID     row id
   * @returns {JSX.Element|undefined} a separator for the list of settings
   */
  _renderSeparator(sectionID: any, rowID: any): JSX.Element | undefined {
    if (sectionID !== 'excluded_dates' && rowID % TIMES_PER_ROW !== TIMES_PER_ROW - 1) {
      return undefined;
    }

    const separatorStyle = sectionID === 'excluded_dates'
        ? { width: this.state.screenWidth }
        : {
          marginRight: Constants.Sizes.Margins.Expanded,
          width: Math.floor(this.state.screenWidth / 2) * 2 - Constants.Sizes.Margins.Expanded * 2,
        };

    return (
      <View
          key={`Separator,${sectionID},${rowID}`}
          style={[ _styles.separator, separatorStyle, { width: this.state.screenWidth }]} />
    );
  }

  /**
   * Returns a view to display a date or time relevant to a shuttle's schedule.
   *
   * @param {string} dateTime  relevant date or time
   * @param {any}    sectionID section id
   * @param {any}    rowID     row id
   * @returns {JSX.Element} a view containing the rendered date or time
   */
  _renderRow(dateTime: string, _: any, rowID: any): JSX.Element {
    if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(dateTime)) {
      return (
        <Text style={[ _styles.date, { width: this.state.screenWidth }]}>
          {moment(dateTime).format('dddd, MMMM Do YYYY')}
        </Text>
      );
    } else {
      const container = rowID % TIMES_PER_ROW === 0 ? _styles.evenTimeContainer : _styles.oddTimeContainer;
      const timeWidth = Math.floor((this.state.screenWidth - Constants.Sizes.Margins.Expanded * 2) / 2);

      return (
        <View style={[ _styles.timeContainer, container, { width: timeWidth }]}>
          <Text style={_styles.time}>{TextUtils.convertTimeFormat(this.props.timeFormat, dateTime)}</Text>
        </View>
      );
    }
  }

  /**
   * Renders a list of the times the shuttle departs.
   *
   * @returns {JSX.Element} the hierarchy of views to render
   */
  render(): JSX.Element {
    return (
      <View style={_styles.container}>
        <ListView
            contentContainerStyle={_styles.listView}
            dataSource={this.state.dataSource}
            renderHeader={this._renderHeader.bind(this)}
            renderRow={this._renderRow.bind(this)}
            renderSectionHeader={this._renderSectionHeader.bind(this)}
            renderSeparator={this._renderSeparator.bind(this)}
            stickySectionHeadersEnabled={false} />
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    backgroundColor: Constants.Colors.tertiaryBackground,
    flex: 1,
  },
  date: {
    color: Constants.Colors.primaryBlackText,
    fontSize: Constants.Sizes.Text.Body,
    margin: Constants.Sizes.Margins.Expanded,
  },
  evenTimeContainer: {
    marginLeft: Constants.Sizes.Margins.Expanded,
  },
  fullSeparator: {
    backgroundColor: Constants.Colors.secondaryBackground,
    height: StyleSheet.hairlineWidth,
    marginLeft: 0,
  },
  header: {
    marginLeft: Constants.Sizes.Margins.Expanded,
    marginRight: Constants.Sizes.Margins.Expanded,
    marginTop: Constants.Sizes.Margins.Expanded,
  },
  info: {
    color: Constants.Colors.primaryBlackText,
    fontSize: Constants.Sizes.Text.Body,
    marginBottom: Constants.Sizes.Margins.Expanded,
  },
  listView: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  oddTimeContainer: {
    marginRight: Constants.Sizes.Margins.Expanded,
  },
  routeText: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
    margin: Constants.Sizes.Margins.Expanded,
  },
  routeTextContainer: {
    backgroundColor: Constants.Colors.secondaryBackground,
  },
  sectionHeader: {
    color: Constants.Colors.primaryBlackText,
    fontSize: Constants.Sizes.Text.Subtitle,
    textAlign: 'center',
  },
  sectionHeaderContainer: {
    backgroundColor: Constants.Colors.tertiaryBackground,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Constants.Colors.secondaryBackground,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingBottom: Constants.Sizes.Margins.Expanded,
    paddingTop: Constants.Sizes.Margins.Expanded,
  },
  separator: {
    backgroundColor: Constants.Colors.secondaryBackground,
    height: StyleSheet.hairlineWidth,
    marginLeft: Constants.Sizes.Margins.Expanded,
  },
  time: {
    color: Constants.Colors.primaryBlackText,
    fontSize: Constants.Sizes.Text.Body,
    textAlign: 'center',
  },
  timeContainer: {
    borderColor: Constants.Colors.secondaryBackground,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    paddingBottom: Constants.Sizes.Margins.Regular,
    paddingTop: Constants.Sizes.Margins.Regular,
  },
  warning: {
    color: Constants.Colors.primaryBackground,
    fontSize: Constants.Sizes.Text.Subtitle,
  },
});
