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
 * @file Schedule.tsx
 * @description Navigator for managing views for defining a weekly schedule.
 */
'use strict';

// React imports
import React from 'react';
import {
  InteractionManager,
  LayoutAnimation,
  Modal,
  Picker,
  Platform,
  StyleSheet,
  View,
} from 'react-native';

// Redux imports
import { connect } from 'react-redux';
import * as actions from '../../actions';

// Imports
import ActionButton from 'react-native-action-button';
import CourseModal from './modals/Course';
import Header from '../../components/Header';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import * as Arrays from '../../util/Arrays';
import * as Configuration from '../../util/Configuration';
import * as Constants from '../../constants';
import * as Display from '../../util/Display';
import * as Translations from '../../util/Translations';

// Tabs
import WeeklySchedule from './WeeklySchedule';
import ByCourseSchedule from './ByCourseSchedule';

// Types
import { Language } from '../../util/Translations';
import { TimeFormat } from '../../../typings/global';
import { Course, LectureFormat, Semester } from '../../../typings/university';

interface Props {
  currentSemester: number;                    // The current semester, selected by the user
  language: Language;                         // The current language, selected by the user
  scheduleByCourse: boolean;                  // Indicates default to view schedule by course or by week
  semesters: Semester[];                      // Semesters available at the university
  timeFormat: TimeFormat;                     // The user's preferred time format
  removeCourse(s: string, c: Course): void;   // Removes a course from the semester
  saveCourse(s: string, c: Course): void;     // Saves a course to the semester
  saveSemester(s: Semester): void;            // Saves a semester to the schedule
  switchSemester(semester: number): void;     // Switches the current semester
  viewScheduleByCourse(view: boolean): void;  // Updates whether the schedule is viewed by course or by week
}

interface State {
  addingCourse: boolean;            // True to use the course modal to add a course, false to edit
  courseToEdit: Course | undefined; // Course selected by user to edit
  courseModalVisible: boolean;      // True to show the modal to add or edit a course
  initialPage: number;              // Initial schedule view to show
  lectureFormats: LectureFormat[];  // Array of available lecture types
  showSemesters: boolean;           // True to show drop down to swap semesters
}

// Icon for representing the current semester
const semesterIcon = {
  android: {
    class: 'ionicon',
    name: 'md-calendar',
  },
  ios: {
    class: 'ionicon',
    name: 'ios-calendar-outline',
  },
};

class Schedule extends React.PureComponent<Props, State> {

  /**
   * Constructor.
   *
   * @param {props} props component props
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      addingCourse: true,
      courseModalVisible: false,
      courseToEdit: undefined,
      initialPage: props.scheduleByCourse ? 1 : 0,
      lectureFormats: [],
      showSemesters: false,
    };
  }

  componentDidMount(): void {
    if (this.state.lectureFormats.length === 0) {
      InteractionManager.runAfterInteractions(() => this.loadConfiguration());
    }
  }

  /**
   * Asynchronously load relevant configuration files and cache the results.
   */
  async loadConfiguration(): Promise<void> {
    try {
      const lectureFormats = await Configuration.getConfig('/lecture_formats.json');
      this.setState({ lectureFormats });
    } catch (err) {
      console.error('Configuration could not be initialized for lecture modal.', err);
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
   * @param {boolean}          addingCourse true to use the modal to add a course, false to edit
   * @param {Course|undefined} courseToEdit the course to edit, or undefined when adding a new course
   */
  _showCourseModal(addingCourse: boolean, courseToEdit: Course | undefined): void {
    this.setState({
      addingCourse,
      courseModalVisible: true,
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
      const semesterIndex = Arrays.linearSearchObjectArrayByKeyValue(this.props.semesters, 'id', semesterId);
      this.props.saveSemester(this.props.semesters[semesterIndex]);
    }

    this.props.saveCourse(semesterId, course);
  }

  /**
   * Renders the current semester and a drop down to switch semesters.
   *
   * @returns {JSX.Element} the elements to render
   */
  _renderSemesters(): JSX.Element {
    const semesterName = Translations.getName(this.props.semesters[this.props.currentSemester]) || '';

    const picker = this.state.showSemesters
      ? (
        <Picker
            itemStyle={_styles.pickerItem}
            prompt={Translations.get('semester')}
            style={_styles.picker}
            selectedValue={this.props.currentSemester}
            onValueChange={(value: number): void => this.props.switchSemester(value)}>
          {this.props.semesters.map((semester: Semester, index: number) => {
            const name = Translations.getName(semester);

            return (
              <Picker.Item
                  key={name}
                  label={name}
                  value={index} />
            );
          })}
        </Picker>
      )
      : undefined;

    return (
      <View>
        <Header
            icon={Display.getPlatformIcon(Platform.OS, semesterIcon)}
            subtitle={(this.state.showSemesters
              ? Translations.get('done')
              : Translations.get('switch'))}
            subtitleCallback={(): void => this._toggleSwitchSemester()}
            title={semesterName} />
        {picker}
        <View style={_styles.separator} />
      </View>
    );
  }

  /**
   * Renders the app tabs and icons, an indicator to show the current tab, and a navigator with the tab contents.
   *
   * @returns {JSX.Element} the hierarchy of views to render
   */
  render(): JSX.Element {
    return (
      <View style={_styles.container}>
        <Modal
            animationType={'slide'}
            transparent={false}
            visible={this.state.courseModalVisible}
            onRequestClose={(): void => this._closeModal()}>
          <CourseModal
              addingCourse={this.state.addingCourse}
              courseToEdit={this.state.courseToEdit}
              lectureFormats={this.state.lectureFormats}
              onClose={(): void => this._closeModal()}
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
            onChangeTab={(newTab: { i: number }): void => this.props.viewScheduleByCourse(newTab.i === 1)}>
          <WeeklySchedule
              lectureFormats={this.state.lectureFormats}
              tabLabel={Translations.get('weekly')}>
            {this._renderSemesters()}
          </WeeklySchedule>
          <ByCourseSchedule
              lectureFormats={this.state.lectureFormats}
              tabLabel={Translations.get('by_course')}
              onEditCourse={(course: Course): void => this._onEditCourse(course)}>
            {this._renderSemesters()}
          </ByCourseSchedule>
        </ScrollableTabView>
        <ActionButton
            buttonColor={Constants.Colors.primaryBackground}
            offsetX={Constants.Sizes.Margins.Expanded}
            offsetY={Constants.Sizes.Margins.Expanded}
            onPress={this._showCourseModal.bind(this, true)} />
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    backgroundColor: Constants.Colors.primaryBackground,
    flex: 1,
  },
  picker: {
    backgroundColor: Constants.Colors.tertiaryBackground,
  },
  pickerItem: {
    color: Constants.Colors.primaryBlackText,
  },
  semesterItem: {
    color: Constants.Colors.primaryWhiteText,
  },
  separator: {
    backgroundColor: Constants.Colors.secondaryWhiteText,
    height: StyleSheet.hairlineWidth * 2,
  },
  tabContainer: {
    backgroundColor: Constants.Colors.secondaryBackground,
    borderBottomWidth: 0,
    flex: 1,
  },
});

const mapStateToProps = (store: any): any => {
  return {
    currentSemester: store.config.options.currentSemester,
    language: store.config.options.language,
    scheduleByCourse: store.config.options.scheduleByCourse,
    semesters: store.config.options.semesters,
    timeFormat: store.config.options.preferredTimeFormat,
  };
};

const mapDispatchToProps = (dispatch: any): any => {
  return {
    removeCourse: (semester: string, course: Course): void => dispatch(actions.removeCourse(semester, course.code)),
    saveCourse: (semester: string, course: Course): void => dispatch(actions.addCourse(semester, course)),
    saveSemester: (semester: Semester): void => dispatch(actions.addSemester(JSON.parse(JSON.stringify(semester)))),
    switchSemester: (semester: number): void => dispatch(actions.updateConfiguration({ currentSemester: semester })),
    viewScheduleByCourse: (view: boolean): void => dispatch(actions.updateConfiguration({ scheduleByCourse: view })),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Schedule) as any;
