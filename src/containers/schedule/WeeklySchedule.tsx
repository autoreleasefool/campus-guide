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
 * @file WeeklySchedule.tsx
 * @description Displays the user's schedule, organized by day
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

// Imports
import Header from '../../components/Header';
import * as Arrays from '../../util/Arrays';
import * as Constants from '../../constants';
import * as TextUtils from '../../util/TextUtils';

import { Language, getLanguage } from '../../util/Translations';
import { TimeFormat } from '../../../typings/global';
import { Course, Destination, LectureFormat, Semester } from '../../../typings/university';

/** Data to render a lecture. */
interface LectureRow {
  courseCode: string;                 // Code of the course the lecture belongs to
  format: number;                     // Lecture format
  location: Destination | undefined;  // Location of the lecture
  startTime: number;                  // Start time of the lecture
}

interface Props {
  children: any;                    // Components from the parent component
  currentSemester: number;          // The current semester, selected by the user
  language: Language;               // The current language, selected by the user
  lectureFormats: LectureFormat[];  // Array of available lecture types
  schedule: any;                    // The user's current schedule
  semesters: Semester[];            // Semesters available at the university
  timeFormat: TimeFormat;           // The user's preferred time format
}

interface State {}

class WeeklySchedule extends React.PureComponent<Props, State> {

  /**
   * Gets the lectures in a day, sorted by time.
   *
   * @param {Course[]} courses set of courses to get lectures from
   * @param {number}   day     day of the week to get lectures for
   * @returns {Array<LectureRow>} the lectures occuring on {day}, sorted by start time
   */
  _getLectures(courses: Course[], day: number): LectureRow[] {
    const lectures: LectureRow[] = [];

    for (const course of courses) {
      for (const lecture of course.lectures) {
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

    return Arrays.sortObjectArrayByKeyValues(lectures, 'startTime');
  }

  /**
   * Renders a single day of lectures in the current semester.
   *
   * @param {string} day   the day of the week
   * @param {number} index index of the day of the week, where 0 is Monday and 6 is Sunday
   * @returns {JSX.Element|undefined} the hierarchy of views to render
   */
  _renderDay(day: string, index: number): JSX.Element | undefined {
    const schedule = this.props.schedule[this.props.semesters[this.props.currentSemester].id];
    const courses = schedule ? schedule.courses : [];
    const lectures = this._getLectures(courses, index);

    if (lectures.length === 0) {
      return undefined;
    } else {
      return (
        <View key={day}>
          <Header title={day} />
          {lectures.map(
            (lecture: LectureRow, lecIndex: number) => this._renderLecture(lecture, lecIndex === lectures.length - 1))}
        </View>
      );
    }
  }

  /**
   * Renders a single lecture in a course.
   *
   * @param {LectureRow} lecture the lecture as defined by the user
   * @param {boolean}    isLast  true if the lecture is the last in the course, false otherwise
   * @returns {JSX.Element} the hierarchy of views to render
   */
  _renderLecture(lecture: LectureRow, isLast: boolean): JSX.Element {
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
        {isLast ? undefined : <View style={_styles.lectureSeparator} />}
      </View>
    );
  }

  /**
   * Renders a list of the user's lectures, organized by course.
   *
   * @returns {JSX.Element} the hierarchy of views to render
   */
  render(): JSX.Element {
    if (this.props.lectureFormats == undefined || this.props.lectureFormats.length === 0) {
      return (
        <View style={_styles.container} />
      );
    }

    const days = Constants.Days[getLanguage()];

    return (
      <View style={_styles.container}>
        {this.props.children}
        <ScrollView>
          {days.map((day: string, index: number) => this._renderDay(day, index))}
          <View style={_styles.padding} />
        </ScrollView>
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    backgroundColor: Constants.Colors.secondaryBackground,
    flex: 1,
  },
  lectureContainer: {
    flexDirection: 'row',
    marginLeft: Constants.Sizes.Margins.Expanded,
    marginRight: Constants.Sizes.Margins.Expanded,
  },
  lectureSeparator: {
    backgroundColor: Constants.Colors.lightTransparentBackground,
    height: StyleSheet.hairlineWidth,
    marginLeft: Constants.Sizes.Margins.Expanded,
  },
  lectureText: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
    paddingBottom: Constants.Sizes.Margins.Expanded,
    paddingTop: Constants.Sizes.Margins.Expanded,
  },
  lectureTextInnerLeft: {
    flex: 2,
    paddingLeft: Constants.Sizes.Margins.Condensed,
    paddingRight: Constants.Sizes.Margins.Condensed,
    textAlign: 'left',
  },
  lectureTextInnerRight: {
    flex: 3,
    paddingLeft: Constants.Sizes.Margins.Condensed,
    paddingRight: Constants.Sizes.Margins.Condensed,
    textAlign: 'left',
  },
  lectureTextLeft: {
    flex: 2,
    paddingRight: Constants.Sizes.Margins.Condensed,
    textAlign: 'left',
  },
  lectureTextRight: {
    flex: 3,
    paddingLeft: Constants.Sizes.Margins.Condensed,
    textAlign: 'right',
  },
  padding: {
    height: 100,
  },
});

const mapStateToProps = (store: any): any => {
  return {
    currentSemester: store.config.options.currentSemester,
    language: store.config.options.language,
    schedule: store.schedule.semesters,
    semesters: store.config.options.semesters,
    timeFormat: store.config.options.preferredTimeFormat,
  };
};

export default connect(mapStateToProps)(WeeklySchedule) as any;
