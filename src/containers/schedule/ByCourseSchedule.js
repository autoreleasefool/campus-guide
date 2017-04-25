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
 * @file ByCourseSchedule.js
 * @description Displays the user's schedule, organized by course
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
  Language,
  Lecture,
  LectureFormat,
  Semester,
  TimeFormat,
} from 'types';

// Type definition for component props.
type Props = {
  children: any,                            // Components from the parent component
  currentSemester: number,                  // The current semester, selected by the user
  language: Language,                       // The current language, selected by the user
  lectureFormats: Array < LectureFormat >,  // Array of available lecture types
  schedule: Object,                         // The user's current schedule
  semesters: Array < Semester >,            // Semesters available at the university
  timeFormat: TimeFormat,                   // The user's preferred time format
  onEditCourse: (course: Course) => void,   // Callback for when user requests to edit a course
};

// Imports
import Header from 'Header';
import * as Constants from 'Constants';
import * as TextUtils from 'TextUtils';
import * as Translations from 'Translations';

class ByCourseSchedule extends React.Component {

  /**
   * Properties this component expects to be provided by its parent.
   */
  props: Props;

  /**
   * Requests a modal for the user to edit an existing course.
   *
   * @param {Course} course the course to edit
   */
  _handleEditCourse(course: Course): void {
    this.props.onEditCourse(course);
  }

  /**
   * Renders a single course in the current semester.
   *
   * @param {Course} course       the course as defined by the user
   * @returns {ReactElement<any>} the hierarchy of views to render
   */
  _renderCourse(course: Course): ReactElement < any > {
    return (
      <View key={course.code}>
        <Header
            subtitle={Translations.get(this.props.language, 'edit')}
            subtitleCallback={() => this._handleEditCourse(course)}
            title={course.code} />
        {this.props.lectureFormats.map((format, index) => {
          const lectures = course.lectures.filter((lecture) => lecture.format === index);
          if (lectures.length > 0) {
            const formatName = Translations.getName(this.props.language, format) || '';
            return (
              <View key={formatName}>
                <Header
                    backgroundColor={Constants.Colors.darkMoreTransparentBackground}
                    title={formatName} />
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

    const schedule = this.props.schedule[this.props.semesters[this.props.currentSemester].id];
    const courses = schedule ? schedule.courses : [];
    return (
      <View style={_styles.container}>
        {this.props.children}
        <ScrollView>
          {courses.map((course) => this._renderCourse(course))}
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
  lectureTextInner: {
    flex: 2,
    textAlign: 'left',
    paddingLeft: Constants.Sizes.Margins.Condensed,
    paddingRight: Constants.Sizes.Margins.Condensed,
  },
  lectureTextLeft: {
    flex: 3,
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

export default connect(mapStateToProps)(ByCourseSchedule);
