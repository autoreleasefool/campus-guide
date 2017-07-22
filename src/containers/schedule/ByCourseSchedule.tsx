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
 * @file ByCourseSchedule.tsx
 * @description Displays the user's schedule, organized by course
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
import * as Constants from '../../constants';
import * as TextUtils from '../../util/TextUtils';
import * as Translations from '../../util/Translations';

// Types
import { Language } from '../../util/Translations';
import { TimeFormat } from '../../../typings/global';
import { Course, Lecture, LectureFormat, Semester } from '../../../typings/university';

interface Props {
  children: any;                      // Components from the parent component
  currentSemester: number;            // The current semester, selected by the user
  language: Language;                 // The current language, selected by the user
  lectureFormats: LectureFormat[];    // Array of available lecture types
  schedule: any;                      // The user's current schedule
  semesters: Semester[];              // Semesters available at the university
  timeFormat: TimeFormat;             // The user's preferred time format
  onEditCourse(course: Course): void; // Callback for when user requests to edit a course
}

interface State {}

class ByCourseSchedule extends React.PureComponent<Props, State> {

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
   * @param {Course} course the course as defined by the user
   * @returns {JSX.Element} the hierarchy of views to render
   */
  _renderCourse(course: Course): JSX.Element {
    return (
      <View key={course.code}>
        <Header
            subtitle={Translations.get(this.props.language, 'edit')}
            subtitleCallback={(): void => this._handleEditCourse(course)}
            title={course.code} />
        {this.props.lectureFormats.map((format: LectureFormat, index: number) => {
          const lectures = course.lectures.filter((lecture: Lecture) => lecture.format === index);
          if (lectures.length > 0) {
            const formatName = Translations.getName(this.props.language, format) || '';

            return (
              <View key={formatName}>
                <Header
                    backgroundColor={Constants.Colors.darkMoreTransparentBackground}
                    title={formatName} />
                {lectures.map((lecture: Lecture, lecIndex: number) =>
                    this._renderLecture(lecture, lecIndex === lectures.length - 1))}
              </View>
            );
          } else {
            return undefined;
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
   * @returns {JSX.Element} the hierarchy of views to render
   */
  _renderLecture(lecture: Lecture, isLast: boolean): JSX.Element {
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

    const schedule = this.props.schedule[this.props.semesters[this.props.currentSemester].id];
    const courses = schedule ? schedule.courses : [];

    return (
      <View style={_styles.container}>
        {this.props.children}
        <ScrollView>
          {courses.map((course: Course) => this._renderCourse(course))}
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
  lectureTextInner: {
    flex: 2,
    paddingLeft: Constants.Sizes.Margins.Condensed,
    paddingRight: Constants.Sizes.Margins.Condensed,
    textAlign: 'left',
  },
  lectureTextLeft: {
    flex: 3,
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

export default connect(mapStateToProps)(ByCourseSchedule) as any;
