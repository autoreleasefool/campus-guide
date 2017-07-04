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
 * @created 2017-01-30
 * @file Course.ts
 * @description Menu to add or edit a course.
 */
'use strict';

// React imports
import React from 'react';
import {
  Alert,
  Modal,
  Picker,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Navigator } from 'react-native-deprecated-custom-components';

// Redux imports
import { connect } from 'react-redux';

// Imports
import Header from '../../../components/Header';
import LectureModal from './Lecture';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ModalHeader from '../../../components/ModalHeader';
import * as Arrays from '../../../util/Arrays';
import * as Constants from '../../../constants';
import * as TextUtils from '../../../util/TextUtils';
import * as Translations from '../../../util/Translations';

// Types
import { Language } from '../../../util/Translations';
import { Route, TimeFormat } from '../../../../typings/global';
import { Course, Lecture, LectureFormat, Semester } from '../../../../typings/university';

interface Props {
  addingCourse: boolean;            // True when adding a new course, false when editing
  courseToEdit: Course | undefined; // The course being edited
  currentSemester: number;          // The current semester, selected by the user
  language: Language;               // The current language, selected by the user
  lectureFormats: LectureFormat[];  // Array of available lecture types
  schedule: any;                    // The user's current schedule
  semesters: Semester[];            // Semesters available at the university
  timeFormat: TimeFormat;           // The user's preferred time format
  onClose(): void;                  // Callback for when the modal is closed
  onSaveCourse(
      semesterExists: boolean,      // True if the semester exists, false if it needs to be added
      semesterId: string,           // ID of the semester to add the course to
      course: Course                // The course to save
  ): void;                          // Callback to save a course
}

interface State {
  addingLecture: boolean;             // True to use the lecture modal to add a lecture, false to edit
  code: string;                       // Value for course code
  editingLectures: boolean;           // True to show buttons to edit or remove lectures
  lectureModalVisible: boolean;       // True to show the modal to add or edit a lecture
  lectures: Lecture[];                // The lectures in the course
  lectureToEdit: Lecture | undefined; // The lecture being edited
  rightActionEnabled: boolean;        // Indicates if the right modal action should be enabled
  semester: number;                   // Value for course semester
}

// Navigation values
const MENU = 0;
const PICKER = 1;

class CourseModal extends React.PureComponent<Props, State> {

  /**
   * Constructor.
   *
   * @param {props} props component props
   */
  constructor(props: Props) {
    super(props);

    const code = props.courseToEdit ? props.courseToEdit.code : '';
    const lectures = (props.courseToEdit ? props.courseToEdit.lectures : []) as Lecture[];

    this.state = {
      addingLecture: true,
      code,
      editingLectures: false,
      lectureModalVisible: false,
      lectureToEdit: undefined,
      lectures,
      rightActionEnabled:
          this._isCourseCodeValid(props.schedule[props.semesters[props.currentSemester].id], code, lectures),
      semester: props.currentSemester,
    };
  }

  /**
   * Adds a lecture to the course, or overrides an existing lecture.
   *
   * @param {Lecture} lecture the lecture to add
   */
  _addLecture(lecture: Lecture): void {
    const semesterId = this.props.semesters[this.state.semester].id;
    const semester = this.props.schedule[semesterId];
    const lectures = this.state.lectures.slice();
    lectures.push(lecture);
    Arrays.sortObjectArrayByKeyValues(lectures, 'day', 'startTime');
    this.setState({
      lectures,
      rightActionEnabled: this._isCourseCodeValid(semester, this.state.code, lectures),
    });
  }

  /**
   * Closes this menu and, if editing, re-saves the provided lecture.
   *
   * @param {boolean} save true to save the course, false to discard
   */
  _close(save: boolean): void {
    if (save && !this.props.addingCourse && this.props.courseToEdit != undefined) {
      this._saveCourse(this.props.currentSemester, this.props.courseToEdit);
    } else {
      this.props.onClose();
    }
  }

  /**
   * Closes the lecture modal.
   */
  _closeLectureModal(): void {
    this.setState({ lectureModalVisible: false });
  }

  /**
   * Defines the transition between views.
   *
   * @returns {any} a configuration for scene transitions in the navigator
   */
  _configureScene(): any {
    return {
      ...Navigator.SceneConfigs.PushFromRight,
      gestures: false,
    };
  }

  /**
   * Removes a lecture from the course.
   *
   * @param {Lecture} lecture the lecture to remove
   */
  _deleteLecture(lecture: Lecture): void {
    const lectures = this.state.lectures.slice();
    const lecturesLength = lectures.length;
    for (let i = 0; i < lecturesLength; i++) {
      if (lectures[i].day === lecture.day && lectures[i].startTime === lecture.startTime) {
        lectures.splice(i, 1);
        break;
      }
    }
    this.setState({ lectures });
  }

  /**
   * Prompts the user to delete the current course, and deletes it if they respond positively.
   */
  _handleDeleteCourse(): void {
    const courseCode = this.state.code.length > 0
        ? this.state.code
        : Translations.get(this.props.language, 'course').toLowerCase();

    Alert.alert(
      `${Translations.get(this.props.language, 'delete')} ${courseCode}?`,
      Translations.get(this.props.language, 'cannot_be_undone_confirmation'),
      [
        { text: Translations.get(this.props.language, 'cancel'), style: 'cancel' },
        { text: Translations.get(this.props.language, 'delete'), onPress: (): void => this._close(false) },
      ],
      { cancelable: false }
    );
  }

  /**
   * Prompts the user to delete a lecture, and deletes it if they respond positively.
   *
   * @param {Lecture} lecture details of the lecture to delete
   */
  _handleDeleteLecture(lecture: Lecture): void {
    Alert.alert(
      `${Translations.get(this.props.language, 'delete')} ${this.props.lectureFormats[lecture.format].code}?`,
      Translations.get(this.props.language, 'cannot_be_undone_confirmation'),
      [
        { text: Translations.get(this.props.language, 'cancel'), style: 'cancel' },
        { text: Translations.get(this.props.language, 'delete'), onPress: (): void => this._deleteLecture(lecture) },
      ],
      { cancelable: false }
    );
  }

  /**
   * Opens the lecture modal to allow the user to edit a lecture.
   *
   * @param {Lecture} lecture the lecture to edit
   */
  _handleEditLecture(lecture: Lecture): void {
    this._deleteLecture(lecture);
    this._showLectureModal(false, lecture);
  }

  /**
   * Checks if a course code is valid and unique in a semester.
   *
   * @param {Semester}                         semester   the semester to check
   * @param {string|undefined}                 courseCode the code given to the course
   * @param {ReadonlyArray<Lecture>|undefined} lectures   the lectures added to the course so far
   * @returns {boolean} true if the course code is valid in the semester, false otherwise
   */
  _isCourseCodeValid(
      semester: Semester,
      courseCode: string | undefined,
      lectures: ReadonlyArray<Lecture> | undefined): boolean {
    if (courseCode == undefined || courseCode.length === 0 || lectures == undefined || lectures.length === 0) {
      return false;
    }

    return semester == undefined || semester.courses == undefined
        ? true
        : Arrays.binarySearchObjectArrayByKeyValue(semester.courses, 'code', courseCode) < 0;
  }

  /**
   * Saves the course being edited or created.
   *
   * @param {number} semesterIndex index of the semester to add the course to
   * @param {Course} course        the course to save
   */
  _saveCourse(semesterIndex: number, course: Course): void {
    const semesterId = this.props.semesters[semesterIndex].id;
    const semester = this.props.schedule[semesterId];
    if (!this._isCourseCodeValid(semester, course.code, course.lectures)) {
      return;
    }

    this.props.onSaveCourse(semester != undefined, semesterId, course);
    this.props.onClose();
  }

  /**
   * Opens the lecture modal to add or edit a lecture.
   *
   * @param {boolean}  addingLecture true to use the modal to add a lecture, false to edit
   * @param {Lecture|undefined} lectureToEdit a lecture to edit, or undefined
   */
  _showLectureModal(addingLecture: boolean, lectureToEdit?: Lecture): void {
    this.setState({
      addingLecture,
      lectureModalVisible: true,
      lectureToEdit,
    });
  }

  /**
   * Shows the picker to pick a semester.
   */
  _showSemesterPicker(): void {
    if (Platform.OS === 'android') {
      // FIXME: setup android picker
      throw new Error('No android picker setup');
    } else {
      (this.refs.Navigator as any).push({ id: PICKER });
    }
  }

  /**
   * Shows or hides options next to each lecture to edit or remove.
   */
  _toggleLectureEditOptions(): void {
    this.setState({ editingLectures: !this.state.editingLectures });
  }

  /**
   * Renders a view describing a lecture in the course.
   *
   * @param {Lecture} lecture the lecture to render
   * @param {boolean} isLast  true if the the lecture is the last in the section
   * @returns {JSX.Element} the lecture view hierarchy
   */
  _renderLecture(lecture: Lecture, isLast: boolean): JSX.Element {
    let roomOrOptions;
    if (this.state.editingLectures) {
      const platformModifier: string = Platform.OS === 'ios' ? 'ios' : 'md';
      const closeIcon = `${platformModifier}-close`;
      const editIcon = `${platformModifier}-create`;

      roomOrOptions = (
        <View style={_styles.lectureOptions}>
          <TouchableOpacity onPress={this._handleEditLecture.bind(this, lecture)}>
            <Ionicons
                color={Constants.Colors.secondaryWhiteText}
                name={editIcon}
                size={Constants.Sizes.Icons.Medium} />
          </TouchableOpacity>
          <TouchableOpacity onPress={this._handleDeleteLecture.bind(this, lecture)}>
            <Ionicons
                color={Constants.Colors.secondaryWhiteText}
                name={closeIcon}
                size={Constants.Sizes.Icons.Medium} />
          </TouchableOpacity>
        </View>
      );
    } else if (lecture.location) {
      roomOrOptions = (
        <Text style={[ _styles.lectureText, _styles.lectureTextRight ]}>
          {lecture.location ? TextUtils.destinationToString(lecture.location) : ''}
        </Text>
      );
    }

    return (
      <View key={`${lecture.day} - ${lecture.startTime}`}>
        <View style={_styles.lectureContainer}>
          <View style={{ flex: 3 }}>
            <Text style={[ _styles.lectureText, _styles.lectureTextLeft ]}>
              {Constants.Days[this.props.language][lecture.day]}
            </Text>
          </View>
          <View style={{ flex: 2 }}>
            <Text style={[ _styles.lectureText, _styles.lectureTextInner ]}>
              {TextUtils.getFormattedTimeSinceMidnight(lecture.startTime, this.props.timeFormat)}
            </Text>
          </View>
          <View style={{ flex: 2 }}>
            <Text style={[ _styles.lectureText, _styles.lectureTextInner ]}>
              {TextUtils.getFormattedTimeSinceMidnight(lecture.endTime, this.props.timeFormat)}
            </Text>
          </View>
          <View style={{ flex: 3 }}>
            {roomOrOptions}
          </View>
        </View>
        {isLast ? undefined : <View style={_styles.lectureSeparator} />}
      </View>
    );
  }

  /**
   * Renders the values defined so far for the new course and elements to change them.
   *
   * @returns {JSX.Element} the hierarchy of views to render
   */
  _renderMenu(): JSX.Element {
    const language = this.props.language;
    const semesterId = this.props.semesters[this.state.semester].id;
    const semester = this.props.schedule[semesterId];
    const semesterName = Translations.getName(language, semester) || '';

    return (
      <View style={{ flex: 1 }}>
        <ScrollView>
          <TouchableOpacity onPress={this._showSemesterPicker.bind(this)}>
            <Header
                largeSubtitle={true}
                subtitle={semesterName}
                subtitleIcon={{ class: 'material', name: 'chevron-right' }}
                title={Translations.get(language, 'semester')} />
          </TouchableOpacity>
          <View style={_styles.menuItemSeparator} />
          <Header title={Translations.get(language, 'course_code')} />
          <TextInput
              autoCapitalize={'characters'}
              returnKeyType={'done'}
              style={_styles.textInput}
              value={this.state.code}
              onChangeText={(code: string): void => this.setState({
                code,
                rightActionEnabled: this._isCourseCodeValid(semester, code, this.state.lectures) })} />
          <Header
              subtitle={this.state.editingLectures
                ? Translations.get(language, 'cancel')
                : Translations.get(language, 'edit')}
              subtitleCallback={this._toggleLectureEditOptions.bind(this)}
              title={Translations.get(language, 'sessions')} />
          {this.props.lectureFormats.map((format: LectureFormat, index: number) => {
            const lectures = this.state.lectures.filter((lecture: Lecture) => lecture.format === index);
            if (lectures.length > 0) {
              const formatName = Translations.getName(language, format) || '';

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
          <TouchableOpacity onPress={(): void => this._showLectureModal(true)}>
            <View style={_styles.button}>
              <Text style={_styles.buttonText}>{Translations.get(language, 'add_lecture')}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={this._handleDeleteCourse.bind(this)}>
            <View style={_styles.button}>
              <Text style={_styles.buttonText}>{Translations.get(language, 'delete_course')}</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  /**
   * Renders a picker with a set of semesters for the user to choose from.
   *
   * @returns {JSX.Element} the picker with the options to select between
   */
  _renderPicker(): JSX.Element {
    const platformModifier = Platform.OS === 'ios' ? 'ios' : 'md';
    const backArrowIcon = `${platformModifier}-arrow-back`;

    return (
      <View style={_styles.container}>
        <TouchableOpacity onPress={(): void => (this.refs.Navigator as any).pop()}>
          <Header
              icon={{ name: backArrowIcon, class: 'ionicon' }}
              title={Translations.get(this.props.language, 'semester')} />
        </TouchableOpacity>
        <Picker
            itemStyle={_styles.pickerItem}
            prompt={Translations.get(this.props.language, 'semester')}
            selectedValue={this.state.semester}
            style={_styles.pickerContainer}
            onValueChange={(semester: number): void => this.setState({ semester })}>
          {this.props.semesters.map((semester: Semester, index: number) => {
            const name = Translations.getName(this.props.language, semester);

            return (
              <Picker.Item
                  key={name}
                  label={name}
                  value={index} />
            );
          })}
        </Picker>
      </View>
    );
  }

  /**
   * Renders the current scene based on the navigation route.
   *
   * @param {Route} route the route to render
   * @returns {JSX.Element} the rendering of the scene
   */
  _renderScene(route: Route): JSX.Element {
    switch (route.id) {
      case MENU:
        return this._renderMenu();
      case PICKER:
        return this._renderPicker();
      default:
        // TODO: return some error view
        return (
          <View />
        );
    }
  }

  /**
   * Renders the app tabs and icons, an indicator to show the current tab, and a navigator with the tab contents.
   *
   * @returns {JSX.Element} the hierarchy of views to render
   */
  render(): JSX.Element {
    let modalTitle = 'add_course';
    let modalRightAction = 'add';
    if (!this.props.addingCourse) {
      modalTitle = 'edit_course';
      modalRightAction = 'save';
    }

    return (
      <View style={_styles.container}>
        <Modal
            animationType={'slide'}
            transparent={false}
            visible={this.state.lectureModalVisible}
            onRequestClose={(): void => this._closeLectureModal()}>
          <LectureModal
              addingLecture={this.state.addingLecture}
              course={{ code: this.state.code, lectures: this.state.lectures }}
              lectureFormats={this.props.lectureFormats}
              lectureToEdit={this.state.lectureToEdit}
              onClose={(): void => this._closeLectureModal()}
              onSaveLecture={this._addLecture.bind(this)} />
        </Modal>
        <ModalHeader
            leftActionEnabled={true}
            leftActionText={Translations.get(this.props.language, 'cancel')}
            rightActionEnabled={this.state.rightActionEnabled}
            rightActionText={Translations.get(this.props.language, modalRightAction)}
            title={Translations.get(this.props.language, modalTitle)}
            onLeftAction={(): void => this._close(true)}
            onRightAction={(): void =>
              this._saveCourse(this.state.semester, { code: this.state.code, lectures: this.state.lectures })} />
        <Navigator
            configureScene={this._configureScene}
            initialRoute={{ id: MENU }}
            ref='Navigator'
            renderScene={this._renderScene.bind(this)}
            style={_styles.container} />
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  button: {
    backgroundColor: Constants.Colors.darkMoreTransparentBackground,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: Constants.Colors.secondaryWhiteText,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginBottom: Constants.Sizes.Margins.Expanded,
  },
  buttonText: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Title,
    paddingBottom: Constants.Sizes.Margins.Expanded,
    paddingTop: Constants.Sizes.Margins.Expanded,
    textAlign: 'center',
  },
  container: {
    backgroundColor: Constants.Colors.secondaryBackground,
    flex: 1,
  },
  lectureContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: Constants.Sizes.Margins.Expanded,
    marginRight: Constants.Sizes.Margins.Expanded,
  },
  lectureOptions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingLeft: Constants.Sizes.Margins.Condensed,
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
    paddingLeft: Constants.Sizes.Margins.Condensed,
    paddingRight: Constants.Sizes.Margins.Condensed,
    textAlign: 'left',
  },
  lectureTextLeft: {
    paddingRight: Constants.Sizes.Margins.Condensed,
    textAlign: 'left',
  },
  lectureTextRight: {
    paddingLeft: Constants.Sizes.Margins.Condensed,
    textAlign: 'right',
  },
  menuItemSeparator: {
    backgroundColor: Constants.Colors.secondaryWhiteText,
    height: StyleSheet.hairlineWidth,
  },
  pickerContainer: {
    backgroundColor: Constants.Colors.tertiaryBackground,
    flex: 1,
  },
  pickerItem: {
    color: Constants.Colors.primaryBlackText,
    fontSize: Constants.Sizes.Text.Subtitle,
  },
  textInput: {
    backgroundColor: Constants.Colors.secondaryBackground,
    borderColor: Constants.Colors.primaryWhiteText,
    borderWidth: StyleSheet.hairlineWidth,
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
    height: 30,
    margin: Constants.Sizes.Margins.Expanded,
    paddingLeft: Constants.Sizes.Margins.Regular,
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

export default connect(mapStateToProps)(CourseModal) as any;
