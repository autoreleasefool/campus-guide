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
 * @file Schedule.js
 * @description Navigator for managing views for defining a weekly schedule.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  LayoutAnimation,
  Modal,
  Picker,
  Platform,
  StyleSheet,
  View,
} from 'react-native';

// Redux imports
import { connect } from 'react-redux';
import * as actions from 'actions';

// Types
import type {
  Course,
  Language,
  LectureFormat,
  Semester,
  TimeFormat,
} from 'types';

// Type definition for component props.
type Props = {
  currentSemester: number,                        // The current semester, selected by the user
  language: Language,                             // The current language, selected by the user
  removeCourse: (s: string, c: Course) => void,   // Removes a course from the semester
  saveCourse: (s: string, c: Course) => void,     // Saves a course to the semester
  saveSemester: (s: Semester) => void,            // Saves a semester to the schedule
  scheduleByCourse: boolean,                      // Indicates default to view schedule by course or by week
  semesters: Array < Semester >,                  // Semesters available at the university
  timeFormat: TimeFormat,                         // The user's preferred time format
  switchSemester: (semester: number) => void,     // Switches the current semester
  viewScheduleByCourse: (view: boolean) => void,  // Updates whether the schedule is viewed by course or by week
};

// Type definition for component state.
type State = {
  addingCourse: boolean,                    // True to use the course modal to add a course, false to edit
  courseToEdit: ?Course,                    // Course selected by user to edit
  courseModalVisible: boolean,              // True to show the modal to add or edit a course
  initialPage: number,                      // Initial schedule view to show
  lectureFormats: Array < LectureFormat >,  // Array of available lecture types
  showSemesters: boolean,                   // True to show drop down to swap semesters
};

// Imports
import ActionButton from 'react-native-action-button';
import CourseModal from './modals/Course';
import Header from 'Header';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import * as ArrayUtils from 'ArrayUtils';
import * as Configuration from 'Configuration';
import * as Constants from 'Constants';
import * as DisplayUtils from 'DisplayUtils';
import * as Translations from 'Translations';

// Tabs
import WeeklySchedule from './WeeklySchedule';
import ByCourseSchedule from './ByCourseSchedule';

// Icon for representing the current semester
const semesterIcon = {
  android: {
    class: 'ionicons',
    name: 'md-calendar',
  },
  ios: {
    class: 'ionicons',
    name: 'ios-calendar-outline',
  },
};

class Schedule extends React.PureComponent {

  /**
   * Properties this component expects to be provided by its parent.
   */
  props: Props;

  /**
   * Current state of the component.
   */
  state: State;

  /**
   * Constructor.
   *
   * @param {props} props component props
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      addingCourse: true,
      courseToEdit: null,
      courseModalVisible: false,
      initialPage: props.scheduleByCourse ? 1 : 0,
      lectureFormats: [],
      showSemesters: false,
    };

    (this:any)._closeModal = this._closeModal.bind(this);
    (this:any)._onEditCourse = this._onEditCourse.bind(this);
    (this:any)._toggleSwitchSemester = this._toggleSwitchSemester.bind(this);
  }

  componentDidMount(): void {
    if (this.state.lectureFormats.length === 0) {
      Configuration.init()
          .then(() => Configuration.getConfig('/lecture_formats.json'))
          .then((lectureFormats) => this.setState({ lectureFormats }))
          .catch((err: any) => console.error('Configuration could not be initialized for lecture modal.', err));
    }
  }

  /**
   * Closes the course modal.
   */
  _closeModal(): void {
    this.setState({ courseModalVisible: false });
  }

  /**
   * Removes a course from a semester.
   *
   * @param {Course} course the course to remove
   */
  _deleteCourse(course: Course): void {
    this.props.removeCourse(this.props.semesters[this.props.currentSemester].id, course);
  }

  /**
   * Opens the course modal to add or edit a course.
   *
   * @param {boolean} addingCourse true to use the modal to add a course, false to edit
   * @param {?Course} courseToEdit the course to edit, or null when adding a new course
   */
  _showCourseModal(addingCourse: boolean, courseToEdit: ?Course): void {
    this.setState({
      courseModalVisible: true,
      addingCourse,
      courseToEdit,
    });
  }

  /**
   * Toggles the drop down to switch semesters.
   */
  _toggleSwitchSemester(): void {
    LayoutAnimation.easeInEaseOut();
    this.setState({ showSemesters: !this.state.showSemesters });
  }

  /**
   * Preps a course to be edited. Loads the values into the course modal.
   *
   * @param {Course} course the course to edit
   */
  _onEditCourse(course: Course): void {
    this._deleteCourse(course);
    this._showCourseModal(false, course);
  }

  /**
   * Saves a course to the provided semester.
   *
   * @param {boolean} semesterExists true if the semester exists, false otherwise
   * @param {number}  semesterId     the semester to add the course to
   * @param {Course}  course         the course being saved
   */
  _onSaveCourse(semesterExists: boolean, semesterId: string, course: Course): void {
    if (!semesterExists) {
      const semesterIndex = ArrayUtils.linearSearchObjectArrayByKeyValue(this.props.semesters, 'id', semesterId);
      this.props.saveSemester(this.props.semesters[semesterIndex]);
    }

    this.props.saveCourse(semesterId, course);
  }

  /**
   * Renders the current semester and a drop down to switch semesters.
   *
   * @returns {ReactElement<any>} the elements to render
   */
  _renderSemesters(): ReactElement < any > {
    const semesterName = Translations.getName(
      this.props.language,
      this.props.semesters[this.props.currentSemester]
    ) || '';

    return (
      <View>
        <Header
            icon={DisplayUtils.getPlatformIcon(Platform.OS, semesterIcon)}
            subtitle={(this.state.showSemesters
              ? Translations.get(this.props.language, 'done')
              : Translations.get(this.props.language, 'switch'))}
            subtitleCallback={this._toggleSwitchSemester}
            title={semesterName} />
        {this.state.showSemesters
          ?
            <Picker
                itemStyle={_styles.semesterItem}
                prompt={Translations.get(this.props.language, 'semester')}
                selectedValue={this.props.currentSemester}
                onValueChange={(value) => this.props.switchSemester(value)}>
              {this.props.semesters.map((semester, index) => {
                const name = Translations.getName(this.props.language, semester);
                return (
                  <Picker.Item
                      key={name}
                      label={name}
                      value={index} />
                );
              })}
            </Picker>
          : null}
        <View style={_styles.separator} />
      </View>
    );
  }

  /**
   * Renders the app tabs and icons, an indicator to show the current tab, and a navigator with the tab contents.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render
   */
  render(): ReactElement < any > {
    return (
      <View style={_styles.container}>
        <Modal
            animationType={'slide'}
            transparent={false}
            visible={this.state.courseModalVisible}
            onRequestClose={this._closeModal}>
          <CourseModal
              addingCourse={this.state.addingCourse}
              courseToEdit={this.state.courseToEdit}
              lectureFormats={this.state.lectureFormats}
              onClose={this._closeModal}
              onSaveCourse={this._onSaveCourse.bind(this)} />
        </Modal>
        <ScrollableTabView
            initialPage={this.state.initialPage}
            style={_styles.tabContainer}
            tabBarActiveTextColor={Constants.Colors.primaryWhiteText}
            tabBarBackgroundColor={Constants.Colors.primaryBackground}
            tabBarInactiveTextColor={Constants.Colors.secondaryWhiteText}
            tabBarPosition='top'
            tabBarUnderlineStyle={{ backgroundColor: Constants.Colors.primaryWhiteText }}
            onChangeTab={(newTab: { i: number }) => this.props.viewScheduleByCourse(newTab.i === 1)}>
          <WeeklySchedule
              lectureFormats={this.state.lectureFormats}
              tabLabel={Translations.get(this.props.language, 'weekly')}>
            {this._renderSemesters()}
          </WeeklySchedule>
          <ByCourseSchedule
              lectureFormats={this.state.lectureFormats}
              tabLabel={Translations.get(this.props.language, 'by_course')}
              onEditCourse={this._onEditCourse}>
            {this._renderSemesters()}
          </ByCourseSchedule>
        </ScrollableTabView>
        <ActionButton
            buttonColor={Constants.Colors.primaryBackground}
            offsetX={Constants.Sizes.Margins.Expanded}
            offsetY={Constants.Sizes.Margins.Regular}
            onPress={this._showCourseModal.bind(this, true)} />
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.Colors.primaryBackground,
  },
  semesterItem: {
    color: Constants.Colors.primaryWhiteText,
  },
  separator: {
    height: StyleSheet.hairlineWidth * 2,
    backgroundColor: Constants.Colors.secondaryWhiteText,
  },
  tabContainer: {
    flex: 1,
    backgroundColor: Constants.Colors.secondaryBackground,
    borderBottomWidth: 0,
  },
});

const mapStateToProps = (store) => {
  return {
    currentSemester: store.config.options.currentSemester,
    language: store.config.options.language,
    scheduleByCourse: store.config.options.scheduleByCourse,
    semesters: store.config.options.semesters,
    timeFormat: store.config.options.preferredTimeFormat,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    saveSemester: (semester: Semester) => dispatch(actions.addSemester(JSON.parse(JSON.stringify(semester)))),
    saveCourse: (semester: string, course: Course) => dispatch(actions.addCourse(semester, course)),
    switchSemester: (semester: number) => dispatch(actions.updateConfiguration({ currentSemester: semester })),
    removeCourse: (semester: string, course: Course) => dispatch(actions.removeCourse(semester, course.code)),
    viewScheduleByCourse: (view: boolean) => dispatch(actions.updateConfiguration({ scheduleByCourse: view })),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Schedule);
