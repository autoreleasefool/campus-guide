/**
 *
 * @license
 * Copyright (C) 2016 Joseph Roque
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
 * @file  Home.js
 * @description View for enabling the user to create a schedule of their classes and see the schedule in an organized
 *              manner.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  AsyncStorage,
  Dimensions,
  LayoutAnimation,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Redux imports
import {connect} from 'react-redux';
import {
  updateConfiguration,
} from 'actions';

// Type imports
import type {
  Course,
  Language,
  LectureFormat,
} from 'types';

// Imports
import Header from 'Header';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as ArrayUtils from 'ArrayUtils';
import * as Configuration from 'Configuration';
import * as Constants from 'Constants';
// import * as Database from 'Database';
import * as TranslationUtils from 'TranslationUtils';

// Get dimensions of the device
const screenWidth = Dimensions.get('window').width;

// Padding around separators
const SEPARATOR_PADDING: number = 40;

class ScheduleHome extends React.Component {

  /**
   * Properties this component expects to be provided by its parent.
   */
  props: {
    currentSemester: number,                            // The current semester, selected by the user
    language: Language,                                 // The current language, selected by the user
    switchSemester: (currentSemester: number) => void,  // Update the current semester
  }

  componentDidMount(): void {
    if (!this.state.loaded) {
      Configuration.init()
          .then(() => Configuration.getConfig('/lecture_formats.json'))
          .then((lectureFormats: Array < LectureFormat >) => {
            this._lectureFormats = ArrayUtils.sortObjectArrayByKeyValues(lectureFormats, 'code');
            // return Database.getCoursesForSemester(Preferences.getCurrentSemesterInfo().code);
          })
          // .then(courses => {
          //   self._courses = courses;
          //   self.setState({
          //     addClassModalVisible: visible,
          //   });
          // })
          .catch((err: any) => console.error('Configuration could not be initialized for schedule home.', err));
    }
  }

  /** List of courses the user has added. */
  _courses: Array < Course > = [];

  /** List of available lecture formats for course sections. */
  _lectureFormats: ?Array < LectureFormat > = null;

  _addLectureToCourse(): void {
    const course: Course = {
      name: this.refs.CourseName.value,
      lectures: this.state.newCourse == null ? [] : this.state.newCourse.lectures,
    };

    course.lectures.push({
      dayOfTheWeek: 0,
      duration: 1.5,
      formatCode: this.refs.LectureFormat.value,
      startingTime: this.refs.LectureStart.value,
    });

    // Clear the input fields
    this.refs.LectureDay.clear();
    this.refs.LectureStart.clear();
    this.refs.LectureEnd.clear();
    this.refs.LectureFormat.clear();

    // this.setState({
    //   newCourse: course,
    // });
  }

  /**
   * Switches to the next available schedule and updates the views.
   */
  _changeSemester(): void {
    this.props.switchSemester(this.state.currentSemester);
  }

  /**
   * Toggles the visibility of buttons for editing the schedule with animation.
   */
  _toggleEditScheduleButtons(): void {
    LayoutAnimation.easeInEaseOut();
    this.setState({
      showEditButtons: !this.state.showEditButtons,
    });
  }

  /**
   * Opens or closes a prompt for a user to add a new course.
   *
   * @param {boolean} visible if true, a modal animates to be true, false to hide
   */
  _setAddCourseVisible(visible: boolean): void {
    const self: ScheduleHome = this;
    if (this._lectureFormats == null) {

    } else {
      this.setState({
        addClassModalVisible: visible,
      });
    }
  }

  /**
   * Opens or closes a prompt for a user to remove a course.
   *
   * @param {boolean} visible if true, a modal animates to be true, false to hide
   */
  _setRemoveCourseVisible(visible: boolean): void {
    this.setState({
      removeClassModalVisible: visible,
    });
  }

  /**
   * Renders a set of buttons to either switch between modes to modify courses, or to add/remove courses
   * from the user's schedule
   *
   * @returns {ReactElement<any>} a hierarchy of views to render
   */
  _renderModifyScheduleButtons(): ReactElement < any > {
    // Get current language for translations
    const Translations: Object = TranslationUtils.getTranslations(Preferences.getSelectedLanguage());

    if (this.state.showEditButtons) {
      return (
        <View style={_styles.editButtonContainer}>
          <TouchableOpacity onPress={this._setAddCourseVisible.bind(this, true)}>
            <View style={_styles.editButton}>
              <MaterialIcons
                  color={'white'}
                  name={'add'}
                  size={Constants.Icons.Medium} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={this._setRemoveCourseVisible.bind(this, true)}>
            <View style={_styles.editButton}>
              <MaterialIcons
                  color={'white'}
                  name={'remove'}
                  size={Constants.Icons.Medium} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={this._toggleEditScheduleButtons.bind(this)}>
            <View style={_styles.editButton}>
              <MaterialIcons
                  color={'white'}
                  name={'close'}
                  size={Constants.Icons.Medium} />
            </View>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <TouchableOpacity onPress={this._toggleEditScheduleButtons.bind(this)}>
          <View style={_styles.editScheduleButton}>
            <Text style={{color: 'white', fontSize: Constants.Text.Medium}}>
              {Translations.edit_schedule}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
  }

  /**
   * Returns a view used as a modal to allow the user to add courses to their schedule.
   *
   * @returns {ReactElement<any>} a hierarchy of views to render
   */
  _renderAddClassModal(): ReactElement < any > {
    const language: Language = Preferences.getSelectedLanguage();
    const formats: ?Array < LectureFormat > = this._lectureFormats;
    const newCourse: ?Course = this.state.newCourse;

    // Get current language for translations
    const Translations: Object = TranslationUtils.getTranslations(language);

    let lecturesAdded: ?ReactElement < any > = null;
    if (newCourse != null && formats != null) {
      lecturesAdded = (
        <View>
          {newCourse.lectures.map(lecture => {
            const lectureIndex = ArrayUtils.searchObjectArrayByKeyValue(
              formats, 'code', lecture.formatCode);
            const lectureFormat = TranslationUtils.getTranslatedName(language, formats[lectureIndex]);
            const day = TranslationUtils.numberToDay(language, lecture.dayOfTheWeek);

            return (
              <View key={newCourse.name + '|' + lecture.startingTime}>
                <Text>{lectureFormat}</Text>
                <Text>{day}</Text>
              </View>
            );
          })}
        </View>
      );
    }

    return (
      <View style={_styles.container}>
        <ScrollView style={_styles.modalContainer}>

          <Text style={_styles.addClassLabel}>{Translations.class_name}</Text>
          <View style={_styles.addClassInputContainer}>
            <TextInput
                placeholder={'PSY 1101'}
                placeholderTextColor={Constants.Colors.secondaryWhiteText}
                ref='CourseName'
                style={_styles.addClassInput} />
          </View>

          <View style={_styles.modalSeparator} />

          <Text style={_styles.addClassLabel}>{Translations.day}</Text>
          <View style={_styles.addClassInputContainer}>
            <TextInput
                placeholder={'Monday'}
                placeholderTextColor={Constants.Colors.secondaryWhiteText}
                ref='LectureDay'
                style={_styles.addClassInput} />
          </View>
          <Text style={_styles.addClassLabel}>{Translations.starting_time}</Text>
          <View style={_styles.addClassInputContainer}>
            <TextInput
                placeholder={'16:00'}
                placeholderTextColor={Constants.Colors.secondaryWhiteText}
                ref='LectureStart'
                style={_styles.addClassInput} />
          </View>
          <Text style={_styles.addClassLabel}>{Translations.ending_time}</Text>
          <View style={_styles.addClassInputContainer}>
            <TextInput
                placeholder={'17:30'}
                placeholderTextColor={Constants.Colors.secondaryWhiteText}
                ref='LectureEnd'
                style={_styles.addClassInput} />
          </View>
          <Text style={_styles.addClassLabel}>{Translations.format}</Text>
          <View style={_styles.addClassInputContainer}>
            <TextInput
                placeholder={'LEC'}
                placeholderTextColor={Constants.Colors.secondaryWhiteText}
                ref='LectureFormat'
                style={_styles.addClassInput} />
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
            <TouchableOpacity
                style={[_styles.addClassButtonContainer, _styles.addLectureButton]}
                onPress={this._addLectureToCourse.bind(this)}>
              <Text style={_styles.addClassButton}>{Translations.add_lecture}</Text>
            </TouchableOpacity>
          </View>

          <View style={_styles.modalSeparator} />

          {lecturesAdded}

          <View style={_styles.modalSeparator} />

          <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
            <TouchableOpacity style={_styles.addClassButtonContainer}>
              <Text style={_styles.addClassButton}>{Translations.save_course}</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={_styles.addClassButtonContainer}
                onPress={this._setAddCourseVisible.bind(this, false)}>
              <Text style={_styles.addClassButton}>{Translations.cancel}</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>
    );
  }

  /**
   * Returns a view used as a modal to allow the user to remove courses from their schedule.
   *
   * @returns {ReactElement<any>} a hierarchy of views to render
   */
  _renderRemoveClassModal(): ReactElement < any > {
    return (
      <View style={_styles.container}>
        <Text>{'Remove course'}</Text>
      </View>
    );
  }

  /**
   * Renders the root Schedule view.
   *
   * @return {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement < any > {
    const language: Language = Preferences.getSelectedLanguage();

    // Get current language for translations
    const Translations: Object = TranslationUtils.getTranslations(language);

    // Get name of the semester in the preferred language
    const currentSemesterName = TranslationUtils.getTranslatedName(
        language, Preferences.getCurrentSemesterInfo());

    // Use a different icon for the calendar depending on the platform
    let calendarIcon: Array < string >;
    if (Platform.OS === 'ios') {
      calendarIcon = ['ionicon', 'ios-calendar-outline'];
    } else {
      calendarIcon = ['material', 'event'];
    }

    return (
      <View style={_styles.container}>

        <Modal
            animationType={'slide'}
            transparent={false}
            visible={this.state.addClassModalVisible}
            onRequestClose={() => this._setAddCourseVisible(false)}>
          {this._renderAddClassModal()}
        </Modal>

        <Modal
            animationType={'slide'}
            transparent={false}
            visible={this.state.removeClassModalVisible}
            onRequestClose={() => this._setRemoveCourseVisible(false)}>
          {this._renderRemoveClassModal()}
        </Modal>

        <SectionHeader
            ref='ScheduleHeader'
            sectionIcon={calendarIcon[1]}
            sectionIconClass={calendarIcon[0]}
            sectionName={Translations.schedule}
            subtitleIcon={'ios-swap'}
            subtitleIconClass={'ionicon'}
            subtitleName={currentSemesterName}
            subtitleOnClick={this._changeSemester.bind(this)} />
        {/** TODO: replace with scroll view for schedule */}
        <View style={{flex: 1}} />
        {this._renderModifyScheduleButtons()}
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  addClassButton: {
    margin: Constants.Margins.Regular,
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Text.Medium,
  },
  addClassButtonContainer: {
  },
  addClassInput: {
    marginLeft: Constants.Margins.Expanded,
    marginRight: Constants.Margins.Expanded,
    fontSize: Constants.Text.Medium,
    color: Constants.Colors.primaryWhiteText,
    height: 40,
  },
  addClassInputContainer: {
    backgroundColor: Constants.Colors.defaultComponentBackgroundColor,
  },
  addClassLabel: {
    margin: Constants.Margins.Regular,
    marginLeft: Constants.Margins.Expanded,
    fontSize: Constants.Text.Medium,
    color: Constants.Colors.primaryWhiteText,
  },
  addLectureButton: {
    marginTop: Constants.Margins.Regular,
    marginBottom: Constants.Margins.Regular,
  },
  container: {
    flex: 1,
    backgroundColor: Constants.Colors.charcoalGrey,
  },
  editScheduleButton: {
    backgroundColor: Constants.Colors.garnet,
    height: 50,
    margin: Constants.Margins.Regular,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonContainer: {
    flexDirection: 'row',
    height: 70,
    width: screenWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: Constants.Colors.garnet,
    height: 50,
    width: 50,
    margin: Constants.Margins.Regular,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    marginTop: StatusBarUtils.getStatusBarPadding(Platform),
  },
  modalSeparator: {
    marginLeft: SEPARATOR_PADDING,
    marginRight: SEPARATOR_PADDING,
    marginTop: Constants.Margins.Expanded,
    marginBottom: Constants.Margins.Expanded,
    width: width - SEPARATOR_PADDING * 2,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'white',
  },
});

// Map state to props
const select = (store) => {
  return {
    currentSemester: store.config.currentSemester,
    language: store.config.language,
  };
};

// Map dispatch to props
const actions = (dispatch) => {
  return {
    switchSemester: (currentSemester: number) => dispatch(updateConfiguration({currentSemester: currentSemester + 1})),
  };
};

export default connect(select, actions)(ScheduleHome);
