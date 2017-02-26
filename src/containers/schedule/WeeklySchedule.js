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
 * @file WeeklySchedule.js
 * @description Displays the user's schedule, organized by day
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
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
  Destination,
  Language,
  LectureFormat,
  Semester,
  TimeFormat,
} from 'types';

// Data to render a lecture
type LectureRow = {
  courseCode: string,     // Code of the course the lecture belongs to
  format: number,         // Lecture format
  location: ?Destination, // Location of the lecture
  startTime: number,      // Start time of the lecture
}

// Type definition for component props.
type Props = {
  children: any,                            // Components from the parent component
  currentSemester: number,                  // The current semester, selected by the user
  language: Language,                       // The current language, selected by the user
  lectureFormats: Array < LectureFormat >,  // Array of available lecture types
  schedule: Object,                         // The user's current schedule
  semesters: Array < Semester >,            // Semesters available at the university
  timeFormat: TimeFormat,                   // The user's preferred time format
};

// Imports
import Header from 'Header';
import * as ArrayUtils from 'ArrayUtils';
import * as Constants from 'Constants';
import * as TextUtils from 'TextUtils';
import * as TranslationUtils from 'TranslationUtils';

class WeeklySchedule extends React.Component {

  /**
   * Properties this component expects to be provided by its parent.
   */
  props: Props;

  /**
   * Gets the lectures in a day, sorted by time.
   *
   * @param {Array<Course>} courses set of courses to get lectures from
   * @param {number}        day     day of the week to get lectures for
   * @returns {Array<LectureRow>} the lectures occuring on {day}, sorted by start time
   */
  _getLectures(courses: Array < Course >, day: number): Array < LectureRow > {
    const lectures: Array < LectureRow > = [];

    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];
      for (let j = 0; j < course.lectures.length; j++) {
        const lecture = course.lectures[j];
        if (lecture.day === day) {
          lectures.push({
            courseCode: course.code,
            format: lecture.format,
            location: lecture.location,
            startTime: lecture.startTime,
          });
        }
      }
    }

    ArrayUtils.sortObjectArrayByKeyValues(lectures, 'startTime');
    return lectures;
  }

  /**
   * Renders a single day of lectures in the current semester.
   *
   * @param {Object} Translations translations in the current language of certain text
   * @param {string} day          the day of the week
   * @param {number} index        index of the day of the week, where 0 is Monday and 6 is Sunday
   * @returns {?ReactElement<any>} the hierarchy of views to render
   */
  _renderDay(Translations: Object, day: string, index: number): ?ReactElement < any > {
    const schedule = this.props.schedule[this.props.semesters[this.props.currentSemester].id];
    const courses = schedule ? schedule.courses : [];
    const lectures = this._getLectures(courses, index);

    if (lectures.length === 0) {
      return null;
    } else {
      return (
        <View key={day}>
          <Header title={day} />
          {lectures.map((lecture, lecIndex) => this._renderLecture(lecture, lecIndex === lectures.length - 1))}
        </View>
      );
    }
  }

  /**
   * Renders a single lecture in a course.
   *
   * @param {LectureRow} lecture the lecture as defined by the user
   * @param {boolean}    isLast  true if the lecture is the last in the course, false otherwise
   * @returns {ReactElement<any>} the hierarchy of views to render
   */
  _renderLecture(lecture: LectureRow, isLast: boolean): ReactElement < any > {
    return (
      <View key={`${lecture.courseCode} - ${lecture.startTime}`}>
        <View style={_styles.lectureContainer}>
          <Text style={[ _styles.lectureText, _styles.lectureTextLeft ]}>
            {TextUtils.getFormattedTimeSinceMidnight(lecture.startTime, this.props.timeFormat)}
          </Text>
          <Text style={[ _styles.lectureText, _styles.lectureTextInnerLeft ]}>
            {this.props.lectureFormats[lecture.format].code}
          </Text>
          <Text style={[ _styles.lectureText, _styles.lectureTextInnerRight ]}>
            {lecture.courseCode}
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
   * Renders a list of the user's lectures, organized by course.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render
   */
  render(): ReactElement < any > {
    if (this.props.lectureFormats == null || this.props.lectureFormats.length === 0) {
      return (
        <View style={_styles.container} />
      );
    }

    // Get current language for translations
    const Translations: Object = TranslationUtils.getTranslations(this.props.language);
    const days = Constants.Days[this.props.language];

    return (
      <View style={_styles.container}>
        {this.props.children}
        <ScrollView>
          {days.map((day, index) => this._renderDay(Translations, day, index))}
          <View style={_styles.padding} />
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
  padding: {
    height: 100,
  },
  lectureContainer: {
    flexDirection: 'row',
    marginLeft: Constants.Sizes.Margins.Expanded,
    marginRight: Constants.Sizes.Margins.Expanded,
  },
  lectureText: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
    paddingTop: Constants.Sizes.Margins.Expanded,
    paddingBottom: Constants.Sizes.Margins.Expanded,
  },
  lectureTextInnerLeft: {
    flex: 2,
    textAlign: 'left',
    paddingLeft: Constants.Sizes.Margins.Condensed,
    paddingRight: Constants.Sizes.Margins.Condensed,
  },
  lectureTextInnerRight: {
    flex: 3,
    textAlign: 'left',
    paddingLeft: Constants.Sizes.Margins.Condensed,
    paddingRight: Constants.Sizes.Margins.Condensed,
  },
  lectureTextLeft: {
    flex: 2,
    textAlign: 'left',
    paddingRight: Constants.Sizes.Margins.Condensed,
  },
  lectureTextRight: {
    flex: 3,
    textAlign: 'right',
    paddingLeft: Constants.Sizes.Margins.Condensed,
  },
  lectureSeparator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Constants.Sizes.Margins.Expanded,
    backgroundColor: Constants.Colors.lightTransparentBackground,
  },
});

const mapStateToProps = (store) => {
  return {
    currentSemester: store.config.options.currentSemester,
    language: store.config.options.language,
    schedule: store.schedule.semesters,
    semesters: store.config.options.semesters,
    timeFormat: store.config.options.preferredTimeFormat,
  };
};

export default connect(mapStateToProps)(WeeklySchedule);
