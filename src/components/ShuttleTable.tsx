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
  StyleSheet,
  Text,
  View,
} from 'react-native';

// Imports
import moment from 'moment';
import * as Constants from '../constants';
import * as TextUtils from '../util/TextUtils';
import * as Translations from '../util/Translations';

// Types
import { Language } from '../util/Translations';
import { TimeFormat } from '../../typings/global';
import { ShuttleSchedule } from '../../typings/transit';

interface Props {
  direction: number;          // Which direction of the schedule
  language: Language;         // The user's currently selected language
  schedule: ShuttleSchedule;  // The schedule to render
  tabLabel?: string;          // Tab label
  timeFormat: TimeFormat;     // The user's preferred time format
}

interface State {
  dataSource: any;  // List of times for the shuttle and days they occur
}

const screenWidth = Dimensions.get('window').width;
const TIMES_PER_ROW = 2;

export default class ShuttleTable extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);

    let dataSource = new ListView.DataSource({
      rowHasChanged: (r1: any, r2: any): boolean => r1 !== r2,
      sectionHeaderHasChanged: (s1: any, s2: any): boolean => s1 !== s2,
    });

    const data: any = { ...props.schedule.directions[props.direction].day_times };
    data.excluded_dates = props.schedule.excluded_dates;
    dataSource = dataSource.cloneWithRowsAndSections(data);
    this.state = { dataSource };
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
    // Warning to notify users if current date is excluded from schedule
    let dateExcluded: JSX.Element | undefined;
    const currentDate: string = moment().format('YYYY-MM-DD');
    if (this.props.schedule.excluded_dates.indexOf(currentDate) >= 0) {
      dateExcluded = (
        <Text style={_styles.info}>{Translations.get(this.props.language, 'shuttle_not_in_service')}</Text>
      );
    }

    return (
      <View style={_styles.header}>
        {dateExcluded}
        <Text style={_styles.info}>{Translations.get(this.props.language, 'shuttle_travel_time')}</Text>
        <Text style={_styles.info}>{Translations.get(this.props.language, 'shuttle_id_required')}</Text>
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
    if (header === 'excluded_dates') {
      return (
        <View style={_styles.sectionHeaderContainer}>
          <Text style={_styles.sectionHeader}>{Translations.get(this.props.language, 'excluded_dates')}</Text>
        </View>
      );
    } else {
      const firstDay = Constants.Days[this.props.language][parseInt(header.substr(0, 1))];
      const lastDay = Constants.Days[this.props.language][parseInt(header.substr(header.length - 1))];
      const period = firstDay === lastDay ? firstDay : `${firstDay} - ${lastDay}`;

      return (
        <View style={_styles.sectionHeaderContainer}>
          <Text style={_styles.sectionHeader}>{period}</Text>
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

    const separatorStyle = sectionID === 'excluded_dates' ? {} : _styles.timeSeparator;

    return (
      <View
          key={`Separator,${sectionID},${rowID}`}
          style={[ _styles.separator, separatorStyle ]} />
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
        <Text style={_styles.date}>{moment(dateTime).format('dddd, MMMM Do YYYY')}</Text>
      );
    } else {
      const container = rowID % TIMES_PER_ROW === 0 ? _styles.evenTimeContainer : _styles.oddTimeContainer;

      return (
        <View style={[ _styles.timeContainer, container ]}>
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
    width: screenWidth,
  },
  evenTimeContainer: {
    marginLeft: Constants.Sizes.Margins.Expanded,
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
  oddTimeContainer: {
    marginRight: Constants.Sizes.Margins.Expanded,
  },
  sectionHeader: {
    color: Constants.Colors.primaryBlackText,
    fontSize: Constants.Sizes.Text.Subtitle,
    textAlign: 'center',
    width: screenWidth,
  },
  sectionHeaderContainer: {
    backgroundColor: Constants.Colors.tertiaryBackground,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Constants.Colors.secondaryBackground,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingBottom: Constants.Sizes.Margins.Expanded,
    paddingTop: Constants.Sizes.Margins.Expanded,
    width: screenWidth,
  },
  separator: {
    backgroundColor: Constants.Colors.secondaryBackground,
    height: StyleSheet.hairlineWidth,
    marginLeft: Constants.Sizes.Margins.Expanded,
    width: screenWidth,
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
    width: Math.floor((screenWidth - Constants.Sizes.Margins.Expanded * 2) / 2),
  },
  timeSeparator: {
    marginRight: Constants.Sizes.Margins.Expanded,
    width: Math.floor(screenWidth / 2) * 2 - Constants.Sizes.Margins.Expanded * 2,
  },
});
