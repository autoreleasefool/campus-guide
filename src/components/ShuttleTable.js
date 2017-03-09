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
 * @file ShuttleTable.js
 * @providesModule ShuttleTable
 * @description Renders information about a shuttle schedule in a table
 *
 * @flow
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

// Types
import type { Language, ShuttleSchedule, TimeFormat } from 'types';

// Type definition for component props.
type Props = {
  direction: number,          // Which direction of the schedule
  language: Language,         // The user's currently selected language
  schedule: ShuttleSchedule,  // The schedule to render
  timeFormat: TimeFormat,     // The user's preferred time format
};

// Type definition for component state
type State = {
  dataSource: ListView.DataSource,  // List of times for the shuttle and days they occur
};

// Imports
import moment from 'moment';
import * as Constants from 'Constants';
import * as TextUtils from 'TextUtils';
import * as TranslationUtils from 'TranslationUtils';

const { width } = Dimensions.get('window');
const TIMES_PER_ROW = 2;

export default class ShuttleTable extends React.Component {

  /**
   * Properties this component expects to be provided by its parent.
   */
  props: Props;

  /**
   * Current state of the component.
   */
  state: State;

  constructor(props: Props) {
    super(props);

    let dataSource = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
    });

    const data = Object.assign({}, props.schedule.directions[props.direction].day_times);
    data.excluded_dates = props.schedule.excluded_dates;
    dataSource = dataSource.cloneWithRowsAndSections(data);
    this.state = { dataSource };
  }

  /**
   * Renders the header of the list, with important information about the shuttle.
   *
   * @returns {ReactElement<any>} a set of text views with information
   */
  _renderHeader(): ReactElement < any > {
    // Get current language for translations
    const Translations: Object = TranslationUtils.getTranslations(this.props.language);

    // Warning to notify users if current date is excluded from schedule
    let dateExcluded = null;
    const currentDate: string = moment().format('YYYY-MM-DD');
    if (this.props.schedule.excluded_dates.indexOf(currentDate) >= 0) {
      dateExcluded = (
        <Text style={_styles.info}>{Translations.shuttle_not_in_service}</Text>
      );
    }

    return (
      <View style={_styles.header}>
        {dateExcluded}
        <Text style={_styles.info}>{Translations.shuttle_travel_time}</Text>
        <Text style={_styles.info}>{Translations.shuttle_id_required}</Text>
      </View>
    );
  }

  /**
   * Returns a view to head and define a section.
   *
   * @param {Object} sectionData section data
   * @param {string} header      title of the header
   * @returns {ReactElement<any>} the header for a certain section
   */
  _renderSectionHeader(sectionData: Object, header: string): ReactElement < any > {
    // Get current language for translations
    const Translations: Object = TranslationUtils.getTranslations(this.props.language);

    if (header === 'excluded_dates') {
      return (
        <View style={_styles.sectionHeaderContainer}>
          <Text style={_styles.sectionHeader}>{Translations.excluded_dates}</Text>
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
   * @returns {?ReactElement<any>} a separator for the list of settings
   */
  _renderSeparator(sectionID: any, rowID: any): ?ReactElement < any > {
    if (sectionID !== 'excluded_dates' && rowID % TIMES_PER_ROW !== TIMES_PER_ROW - 1) {
      return null;
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
   * @returns {ReactElement<any>} a view containing the rendered date or time
   */
  _renderRow(dateTime: string, sectionID: any, rowID: any): ReactElement < any > {
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
   * @returns {ReactElement<any>} the hierarchy of views to render
   */
  render(): ReactElement < any > {
    return (
      <View style={_styles.container}>
        <ListView
            contentContainerStyle={_styles.listView}
            dataSource={this.state.dataSource}
            renderHeader={this._renderHeader.bind(this)}
            renderRow={this._renderRow.bind(this)}
            renderSectionHeader={this._renderSectionHeader.bind(this)}
            renderSeparator={this._renderSeparator}
            stickySectionHeadersEnabled={false} />
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.Colors.polarGrey,
  },
  header: {
    marginTop: Constants.Sizes.Margins.Expanded,
    marginLeft: Constants.Sizes.Margins.Expanded,
    marginRight: Constants.Sizes.Margins.Expanded,
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
  sectionHeaderContainer: {
    width: width,
    backgroundColor: Constants.Colors.polarGrey,
    paddingTop: Constants.Sizes.Margins.Expanded,
    paddingBottom: Constants.Sizes.Margins.Expanded,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: Constants.Colors.charcoalGrey,
  },
  sectionHeader: {
    width: width,
    fontSize: Constants.Sizes.Text.Subtitle,
    color: Constants.Colors.primaryBlackText,
    textAlign: 'center',
  },
  separator: {
    width: width,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Constants.Colors.charcoalGrey,
    marginLeft: Constants.Sizes.Margins.Expanded,
  },
  timeSeparator: {
    width: Math.floor(width / 2) * 2 - Constants.Sizes.Margins.Expanded * 2,
    marginRight: Constants.Sizes.Margins.Expanded,
  },
  date: {
    width: width,
    margin: Constants.Sizes.Margins.Expanded,
    color: Constants.Colors.primaryBlackText,
    fontSize: Constants.Sizes.Text.Body,
  },
  time: {
    textAlign: 'center',
    color: Constants.Colors.primaryBlackText,
    fontSize: Constants.Sizes.Text.Body,
  },
  evenTimeContainer: {
    marginLeft: Constants.Sizes.Margins.Expanded,
  },
  oddTimeContainer: {
    marginRight: Constants.Sizes.Margins.Expanded,
  },
  timeContainer: {
    width: Math.floor((width - Constants.Sizes.Margins.Expanded * 2) / 2),
    paddingTop: Constants.Sizes.Margins.Regular,
    paddingBottom: Constants.Sizes.Margins.Regular,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: Constants.Colors.charcoalGrey,
  },
});
