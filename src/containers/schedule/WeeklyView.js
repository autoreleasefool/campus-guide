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
 * @created 2017-01-27
 * @file WeeklyView.js
 * @description Displays the user's schedule by week
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// Redux imports
import { connect } from 'react-redux';

// Types
import type {
  Course,
  Language,
  Lecture,
  LectureFormat,
  Semester,
  TimeFormat,
} from 'types';

// Type definition for component props.
type Props = {
  currentSemester: number,        // The current semester, selected by the user
  language: Language,             // The current language, selected by the user
  lectureFormats: Array < LectureFormat >,  // Array of available lecture types
  schedule: Object,               // The user's current schedule
  semesters: Array < Semester >,  // Semesters available at the university
  timeFormat: TimeFormat,         // The user's preferred time format
};

// Imports
import Header from 'Header';
import * as Constants from 'Constants';
import * as TextUtils from 'TextUtils';
import * as TranslationUtils from 'TranslationUtils';

// Screen dimensions
const screenWidth = Dimensions.get('window').width;
const LECTURE_TIME_WIDTH_PCT = 0.2;
const LECTURE_DAY_WIDTH_PCT = 0.3;
const LECTURE_ROOM_WIDTH_PCT = 0.3;

class WeeklyView extends React.Component {

  /**
   * Properties this component expects to be provided by its parent.
   */
  props: Props;

  /**
   * Renders a single course in the current semester.
   *
   * @param {Object} Translations translations in the current language of certain text
   * @param {Course} course       the course as defined by the user
   * @returns {ReactElement<any>} the hierarchy of views to render
   */
  _renderCourse(Translations: Object, course: Course): ReactElement < any > {
    return (
      <View key={course.code}>
        <Header
            subtitle={Translations.edit}
            subtitleCallback={() => this._handleEditCourse(course)}
            title={course.code} />
        {this.props.lectureFormats.map((format, index) => {
          const lectures = course.lectures.filter((lecture) => lecture.format === index);
          if (lectures.length > 0) {
            const formatName = TranslationUtils.getTranslatedName(this.props.language, format) || '';
            return (
              <View key={formatName}>
                <Text style={_styles.lectureFormat}>{formatName}</Text>
                {lectures.map((lecture, lecIndex) => this._renderLecture(lecture, lecIndex === lectures.length - 1))}
              </View>
            );
          } else {
            return null;
          }
        })}
      </View>
    );
  }

  /**
   * Renders a single lecture in a course.
   *
   * @param {Lecture} lecture the lecture as defined by the user
   * @param {boolean} isLast  true if the lecture is the last in the course, false otherwise
   * @returns {ReactElement<any>} the hierarchy of views to render
   */
  _renderLecture(lecture: Lecture, isLast: boolean): ReactElement < any > {
    return (
      <View key={`${lecture.day} - ${lecture.startTime}`}>
        <View style={_styles.lectureContainer}>
          <Text style={[ _styles.lectureText, _styles.lectureTextLeft ]}>
            {Constants.Days[this.props.language][lecture.day]}
          </Text>
          <Text style={[ _styles.lectureText, _styles.lectureTextInner ]}>
            {TextUtils.getFormattedTimeSinceMidnight(lecture.startTime, this.props.timeFormat)}
          </Text>
          <Text style={[ _styles.lectureText, _styles.lectureTextInner ]}>
            {TextUtils.getFormattedTimeSinceMidnight(lecture.endTime, this.props.timeFormat)}
          </Text>
          <Text style={[ _styles.lectureText, _styles.lectureTextRight ]}>
            {lecture.location ? TextUtils.destinationToString(lecture.location) : ''}
          </Text>
        </View>
        {isLast ? null : <View style={_styles.lectureSeparator} />}
      </View>
    );
  }

  /**
   * Renders a list of the user's courses, organized by days.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render
   */
  render(): ReactElement < any > {
    // Get current language for translations
    const Translations: Object = TranslationUtils.getTranslations(this.props.language);

    const schedule = this.props.schedule[this.props.semesters[this.props.currentSemester].id];
    return (
      <View style={_styles.container}>
        {this.props.children}
        <ScrollView>
          {schedule.courses.map((course) => this._renderCourse(Translations, course))}
        </ScrollView>
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.Colors.secondaryBackground,
  },
  lectureContainer: {
    flexDirection: 'row',
    marginLeft: Constants.Sizes.Margins.Regular,
    marginRight: Constants.Sizes.Margins.Regular,
  },
  lectureText: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
    paddingTop: Constants.Sizes.Margins.Expanded,
    paddingBottom: Constants.Sizes.Margins.Expanded,
  },
  lectureTextInner: {
    textAlign: 'left',
    width: (screenWidth - Constants.Sizes.Margins.Regular * 2) * LECTURE_TIME_WIDTH_PCT,
    paddingLeft: Constants.Sizes.Margins.Condensed,
    paddingRight: Constants.Sizes.Margins.Condensed,
  },
  lectureTextLeft: {
    textAlign: 'left',
    width: (screenWidth - Constants.Sizes.Margins.Regular * 2) * LECTURE_DAY_WIDTH_PCT,
    paddingLeft: Constants.Sizes.Margins.Regular,
    paddingRight: Constants.Sizes.Margins.Condensed,
  },
  lectureTextRight: {
    textAlign: 'right',
    width: (screenWidth - Constants.Sizes.Margins.Regular * 2) * LECTURE_ROOM_WIDTH_PCT,
    paddingLeft: Constants.Sizes.Margins.Condensed,
    paddingRight: Constants.Sizes.Margins.Regular,
  },
  lectureSeparator: {
    width: screenWidth - Constants.Sizes.Margins.Expanded * 2,
    height: StyleSheet.hairlineWidth,
    marginLeft: Constants.Sizes.Margins.Expanded * 2,
    backgroundColor: Constants.Colors.lightTransparentBackground,
  },
});

const mapStateToProps = (store) => {
  return {
    currentSemester: store.config.currentSemester,
    language: store.config.language,
    schedule: store.schedule.semesters,
    semesters: store.config.semesters,
    timeFormat: store.config.preferredTimeFormat,
  };
};

export default connect(mapStateToProps)(WeeklyView);
