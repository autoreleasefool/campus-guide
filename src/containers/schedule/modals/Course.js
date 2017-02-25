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
 * @file Course.js
 * @description Menu to add or edit a course.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  Alert,
  Modal,
  Navigator,
  Picker,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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
  VoidFunction,
} from 'types';

// Type definition for component props.
type Props = {
  addingCourse: boolean,                    // True when adding a new course, false when editing
  courseToEdit: ?Course,                    // The course being edited
  currentSemester: number,                  // The current semester, selected by the user
  language: Language,                       // The current language, selected by the user
  lectureFormats: Array < LectureFormat >,  // Array of available lecture types
  schedule: Object,                         // The user's current schedule
  semesters: Array < Semester >,            // Semesters available at the university
  timeFormat: TimeFormat,                   // The user's preferred time format
  onClose: VoidFunction,                    // Callback for when the modal is closed
  onSaveCourse: (
      semesterExists: boolean,              // True if the semester exists, false if it needs to be added
      semesterId: string,                   // ID of the semester to add the course to
      course: Course                        // The course to save
  ) => void,                                // Callback to save a course
};

// Type definition for component state.
type State = {
  addingLecture: boolean,       // True to use the lecture modal to add a lecture, false to edit
  code: string,                 // Value for course code
  editingLectures: boolean,     // True to show buttons to edit or remove lectures
  lectureModalVisible: boolean, // True to show the modal to add or edit a lecture
  lectures: Array < Lecture >,  // The lectures in the course
  lectureToEdit: ?Lecture,      // The lecture being edited
  rightActionEnabled: boolean,  // Indicates if the right modal action should be enabled
  semester: number,             // Value for course semester
};

// Imports
import Header from 'Header';
import LectureModal from './Lecture';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ModalHeader from 'ModalHeader';
import * as ArrayUtils from 'ArrayUtils';
import * as Constants from 'Constants';
import * as TextUtils from 'TextUtils';
import * as TranslationUtils from 'TranslationUtils';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// Navigation values
const MENU = 0;
const PICKER = 1;

class CourseModal extends React.Component {

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
    const code = props.courseToEdit ? props.courseToEdit.code : '';
    const lectures = props.courseToEdit ? props.courseToEdit.lectures : [];

    super(props);
    this.state = {
      addingLecture: true,
      editingLectures: false,
      lectureModalVisible: false,
      lectureToEdit: null,
      semester: props.currentSemester,
      code,
      lectures,
      rightActionEnabled:
          this._isCourseCodeValid(props.schedule[props.semesters[props.currentSemester].id], code, lectures),
    };

    (this:any)._closeLectureModal = this._closeLectureModal.bind(this);
    (this:any)._renderMenu = this._renderMenu.bind(this);
    (this:any)._renderPicker = this._renderPicker.bind(this);
  }

  /**
   * Adds a lecture to the course, or overrides an existing lecture.
   *
   * @param {Lecture} lecture the lecture to add
   */
  _addLecture(lecture: Lecture): void {
    const lectures = this.state.lectures.slice();
    lectures.push(lecture);
    ArrayUtils.sortObjectArrayByKeyValues(lectures, 'day', 'startTime');
    this.setState({ lectures });
  }

  /**
   * Closes this menu and, if editing, re-saves the provided lecture.
   *
   * @param {boolean} save true to save the course, false to discard
   */
  _close(save: boolean): void {
    if (save && !this.props.addingCourse && this.props.courseToEdit != null) {
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
   * @returns {Object} a configuration for scene transitions in the navigator.
   */
  _configureScene(): Object {
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
    // Get current language for translations
    const Translations: Object = TranslationUtils.getTranslations(this.props.language);
    const courseCode = this.state.code.length > 0 ? this.state.code : Translations.course.toLowerCase();

    Alert.alert(
      `${Translations.delete} ${courseCode}?`,
      Translations.cannot_be_undone_confirmation,
      [
        { text: Translations.cancel, style: 'cancel' },
        { text: Translations.delete, onPress: () => this._close(false) },
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
    // Get current language for translations
    const Translations: Object = TranslationUtils.getTranslations(this.props.language);

    Alert.alert(
      `${Translations.delete} ${this.props.lectureFormats[lecture.format].code}?`,
      Translations.cannot_be_undone_confirmation,
      [
        { text: Translations.cancel, style: 'cancel' },
        { text: Translations.delete, onPress: () => this._deleteLecture(lecture) },
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
   * @param {Semester}       semester   the semester to check
   * @param {string}         courseCode the code given to the course
   * @param {Array<Lecture>} lectures   the lectures added to the course so far
   * @returns {boolean} true if the course code is valid in the semester, false otherwise
   */
  _isCourseCodeValid(semester: Semester, courseCode: string, lectures: Array < Lecture >): boolean {
    if (courseCode == null || courseCode.length === 0 || lectures == null || lectures.length === 0) {
      return false;
    }

    return semester == null || semester.courses == null
        ? true
        : ArrayUtils.binarySearchObjectArrayByKeyValue(semester.courses, 'code', courseCode) < 0;
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

    this.props.onSaveCourse(semester != null, semesterId, course);
    this.props.onClose();
  }

  /**
   * Opens the lecture modal to add or edit a lecture.
   *
   * @param {boolean}  addingLecture true to use the modal to add a lecture, false to edit
   * @param {?Lecture} lectureToEdit a lecture to edit, or null
   */
  _showLectureModal(addingLecture: boolean, lectureToEdit: ?Lecture): void {
    this.setState({
      lectureModalVisible: true,
      lectureToEdit,
      addingLecture,
    });
  }

  /**
   * Shows the picker to pick a semester.
   */
  _showSemesterPicker() {
    if (Platform.OS === 'android') {
      console.log('TODO: setup android picker');
      throw new Error('No android picker setup');
    } else {
      this.refs.Navigator.push({ id: PICKER });
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
   * @returns {ReactElement<any>} the lecture view hierarchy
   */
  _renderLecture(lecture: Lecture, isLast: boolean): ReactElement < any > {
    let roomOrOptions = null;
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
        {isLast ? null : <View style={_styles.lectureSeparator} />}
      </View>
    );
  }

  /**
   * Renders the values defined so far for the new course and elements to change them.
   *
   * @param {Object} Translations translations in the current language of certain text
   * @returns {ReactElement<any>} the hierarchy of views to render
   */
  _renderMenu(Translations: Object): ReactElement < any > {
    const semesterId = this.props.semesters[this.state.semester].id;
    const semester = this.props.schedule[semesterId];
    const semesterName = TranslationUtils.getTranslatedName(this.props.language, semester) || '';

    return (
      <View style={{ flex: 1 }}>
        <KeyboardAwareScrollView>
          <TouchableOpacity onPress={this._showSemesterPicker.bind(this)}>
            <Header
                largeSubtitle={true}
                subtitle={semesterName}
                subtitleIcon={{ class: 'material', name: 'chevron-right' }}
                title={Translations.semester} />
          </TouchableOpacity>
          <View style={_styles.menuItemSeparator} />
          <Header title={Translations.course_code} />
          <TextInput
              autoCapitalize={'characters'}
              returnKeyType={'done'}
              style={_styles.textInput}
              value={this.state.code}
              onChangeText={(code) => this.setState({
                code,
                rightActionEnabled: this._isCourseCodeValid(semester, code, this.state.lectures) })} />
          <Header
              subtitle={this.state.editingLectures ? Translations.cancel : Translations.edit}
              subtitleCallback={this._toggleLectureEditOptions.bind(this)}
              title={Translations.sessions} />
          {this.props.lectureFormats.map((format, index) => {
            const lectures = this.state.lectures.filter((lecture) => lecture.format === index);
            if (lectures.length > 0) {
              const formatName = TranslationUtils.getTranslatedName(this.props.language, format) || '';
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
          <TouchableOpacity onPress={this._showLectureModal.bind(this, true, null)}>
            <View style={_styles.button}>
              <Text style={_styles.buttonText}>{Translations.add_lecture}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={this._handleDeleteCourse.bind(this)}>
            <View style={_styles.button}>
              <Text style={_styles.buttonText}>{Translations.delete_course}</Text>
            </View>
          </TouchableOpacity>
        </KeyboardAwareScrollView>
      </View>
    );
  }

  /**
   * Renders a picker with a set of semesters for the user to choose from.
   *
   * @param {Object} Translations translations in the current language of certain text
   * @returns {ReactElement<any>} the picker with the options to select between
   */
  _renderPicker(Translations: Object): ReactElement < any > {
    const platformModifier: string = Platform.OS === 'ios' ? 'ios' : 'md';
    const backArrowIcon: string = `${platformModifier}-arrow-back`;

    return (
      <View style={_styles.container}>
        <TouchableOpacity onPress={() => this.refs.Navigator.pop()}>
          <Header
              icon={{ name: backArrowIcon, class: 'ionicon' }}
              title={Translations.semester} />
        </TouchableOpacity>
        <Picker
            itemStyle={_styles.pickerItem}
            prompt={Translations.semester}
            selectedValue={this.state.semester}
            style={_styles.pickerContainer}
            onValueChange={(semester) => this.setState({ semester })}>
          {this.props.semesters.map((semester, index) => {
            const name = TranslationUtils.getTranslatedName(this.props.language, semester);
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
   * @param {Object} route the route to render
   * @returns {ReactElement<any>} the rendering of the scene
   */
  _renderScene(route: {id: number}): ReactElement < any > {
    // Get current language for translations
    const Translations: Object = TranslationUtils.getTranslations(this.props.language);

    switch (route.id) {
      case MENU:
        return this._renderMenu(Translations);
      case PICKER:
        return this._renderPicker(Translations);
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
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement < any > {
    // Get current language for translations
    const Translations: Object = TranslationUtils.getTranslations(this.props.language);

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
            onRequestClose={this._closeLectureModal}>
          <LectureModal
              addingLecture={this.state.addingLecture}
              course={{ code: this.state.code, lectures: this.state.lectures }}
              lectureFormats={this.props.lectureFormats}
              lectureToEdit={this.state.lectureToEdit}
              onClose={this._closeLectureModal}
              onSaveLecture={this._addLecture.bind(this)} />
        </Modal>
        <ModalHeader
            leftActionEnabled={true}
            leftActionText={Translations.cancel}
            rightActionEnabled={this.state.rightActionEnabled}
            rightActionText={Translations[modalRightAction]}
            title={Translations[modalTitle]}
            onLeftAction={() => this._close(true)}
            onRightAction={() =>
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
  container: {
    flex: 1,
    backgroundColor: Constants.Colors.secondaryBackground,
  },
  textInput: {
    height: 30,
    margin: Constants.Sizes.Margins.Expanded,
    paddingLeft: Constants.Sizes.Margins.Regular,
    fontSize: Constants.Sizes.Text.Body,
    color: Constants.Colors.primaryWhiteText,
    borderColor: Constants.Colors.primaryWhiteText,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: Constants.Colors.secondaryBackground,
  },
  lectureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    textAlign: 'left',
    paddingLeft: Constants.Sizes.Margins.Condensed,
    paddingRight: Constants.Sizes.Margins.Condensed,
  },
  lectureTextLeft: {
    textAlign: 'left',
    paddingRight: Constants.Sizes.Margins.Condensed,
  },
  lectureTextRight: {
    textAlign: 'right',
    paddingLeft: Constants.Sizes.Margins.Condensed,
  },
  lectureOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingLeft: Constants.Sizes.Margins.Condensed,
  },
  lectureSeparator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Constants.Sizes.Margins.Expanded,
    backgroundColor: Constants.Colors.lightTransparentBackground,
  },
  pickerContainer: {
    flex: 1,
    backgroundColor: Constants.Colors.polarGrey,
  },
  pickerItem: {
    color: Constants.Colors.primaryBlackText,
    fontSize: Constants.Sizes.Text.Subtitle,
  },
  menuItemSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Constants.Colors.secondaryWhiteText,
  },
  button: {
    marginBottom: Constants.Sizes.Margins.Expanded,
    backgroundColor: Constants.Colors.darkMoreTransparentBackground,
    borderColor: Constants.Colors.secondaryWhiteText,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  buttonText: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Title,
    textAlign: 'center',
    paddingTop: Constants.Sizes.Margins.Expanded,
    paddingBottom: Constants.Sizes.Margins.Expanded,
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

export default connect(mapStateToProps)(CourseModal);
