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
import {connect} from 'react-redux';
import {
  updateConfiguration,
} from 'actions';

// Types
import type {
  ConfigurationOptions,
  Language,
  Semester,
  TimeFormat,
} from 'types';

// Type definition for component props.
type Props = {
  currentSemester: number,                                // The current semester, selected by the user
  language: Language,                                     // The current language, selected by the user
  semesters: Array < Semester >,                          // Semesters available at the university
  timeFormat: TimeFormat,                                 // The user's preferred time format
  updateConfiguration: (o: ConfigurationOptions) => void, // Update the global configuration state
};

// Type definition for component state.
type State = {
  courseModalTitle: string,     // Title of the course modal
  courseModalVisible: boolean,  // True to show the modal to add or edit a course
  lectureModalTitle: string,     // Title of the lecture modal
  lectureModalVisible: boolean, // True to show the modal to add or edit a lecture
  showSemesters: boolean,       // True to show drop down to swap semesters
};

// Imports
import ActionButton from 'react-native-action-button';
import Header from 'Header';
import ModalHeader from 'ModalHeader';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import * as Constants from 'Constants';
import * as TranslationUtils from 'TranslationUtils';
import {getPlatformIcon} from 'DisplayUtils';

// Tabs
import Weekly from './WeeklyView';
import ByCourse from './ByCourseView';

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

class Schedule extends React.Component {

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
      courseModalTitle: '',
      courseModalVisible: false,
      lectureModalTitle: '',
      lectureModalVisible: false,
      showSemesters: false,
    };

    (this:any)._toggleSwitchSemester = this._toggleSwitchSemester.bind(this);
    (this:any)._addNewCourse = this._addNewCourse.bind(this);
    (this:any)._addNewLecture = this._addNewLecture.bind(this);
    (this:any)._editCourse = this._editCourse.bind(this);
    (this:any)._editLecture = this._editLecture.bind(this);
    (this:any)._saveCourse = this._saveCourse.bind(this);
    (this:any)._saveLecture = this._saveLecture.bind(this);
  }

  /**
   * Opens the course modal to add a new course.
   */
  _addNewCourse(): void {
    this.setState({
      courseModalTitle: 'add_course',
      courseModalVisible: true,
    });
  }

  /**
   * Opens the lecture modal to add a new lecture.
   */
  _addNewLecture(): void {

  }

  /**
   * Closes the specified modal.
   *
   * @param {boolean} courseOrLecture true to hide the course modal, false to hide the lecture modal
   */
  _closeModal(courseOrLecture: boolean): void {
    if (courseOrLecture) {
      this.setState({courseModalVisible: false});
    } else {
      this.setState({lectureModalVisible: false});
    }
  }


  /**
   * Opens the course modal with preset data about a course to edit it.
   */
  _editCourse(): void {
    this.setState({
      courseModalTitle: 'edit_course',
      courseModalVisible: true,
    });
  }

  /**
   * Opens the lecture modal with preset data about a lecture to edit it.
   */
  _editLecture(): void {

  }

  /**
   * Saves the course being edited or created.
   */
  _saveCourse(): void {

  }

  /**
   * Saves the lecture being edited or created.
   */
  _saveLecture(): void {

  }

  /**
   * Updates the current semester.
   *
   * @param {number} semester the semester to switch to
   */
  _switchSemester(semester: number): void {
    this.props.updateConfiguration({currentSemester: semester});
  }

  /**
   * Toggles the drop down to switch semesters.
   */
  _toggleSwitchSemester(): void {
    LayoutAnimation.easeInEaseOut();
    this.setState({showSemesters: !this.state.showSemesters});
  }

  /**
   * Renders the modal for adding or editing courses.
   *
   * @param {Object} Translations translations in the current language of certain text
   * @returns {ReactElement<any>} the elements to render
   */
  _renderCourseModal(Translations: Object): ReactElement < any > {
    return (
      <Modal
          animationType={'slide'}
          transparent={false}
          visible={this.state.courseModalVisible}
          onRequestClose={this._closeModal.bind(this, true)}>
        <View style={_styles.modalContainer}>
          <ModalHeader
              leftActionEnabled={true}
              leftActionText={Translations.cancel}
              rightActionEnabled={true}
              rightActionText={Translations.add}
              title={Translations[this.state.courseModalTitle]}
              onLeftAction={this._closeModal.bind(this, true)}
              onRightAction={this._saveCourse} />
        </View>
      </Modal>
    );
  }

  /**
   * Renders the modal for adding or editing courses.
   *
   * @param {Object} Translations translations in the current language of certain text
   * @returns {ReactElement<any>} the elements to render
   */
  _renderLectureModal(Translations: Object): ReactElement < any > {
    return (
      <Modal
          animationType={'slide'}
          transparent={false}
          visible={this.state.lectureModalVisible}
          onRequestClose={this._closeModal.bind(this, false)}>
        <View style={_styles.modalContainer} />
      </Modal>
    );
  }

  /**
   * Renders the current semester and a drop down to switch semesters.
   *
   * @param {Object} Translations translations in the current language of certain text
   * @returns {ReactElement<any>} the elements to render
   */
  _renderSemesters(Translations: Object): ReactElement < any > {
    const semesterName = TranslationUtils.getTranslatedName(
      this.props.language,
      this.props.semesters[this.props.currentSemester]
    ) || '';

    return (
      <View>
        <Header
            icon={getPlatformIcon(Platform.OS, semesterIcon)}
            subtitle={(this.state.showSemesters ? Translations.cancel : Translations.switch)}
            subtitleCallback={this._toggleSwitchSemester}
            title={semesterName} />
        {this.state.showSemesters
          ?
            <Picker
                itemStyle={_styles.semesterItem}
                selectedValue={this.props.currentSemester}
                onValueChange={(value) => this._switchSemester(value)}>
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
          : null}
      </View>
    );
  }

  /**
   * Renders the app tabs and icons, an indicator to show the current tab, and a navigator with the tab contents.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement < any > {
    // Get current language for translations
    const Translations: Object = TranslationUtils.getTranslations(this.props.language);

    return (
      <View style={_styles.container}>
        {this._renderCourseModal(Translations)}
        {this._renderLectureModal(Translations)}
        <ScrollableTabView
            style={{borderBottomWidth: 0}}
            tabBarActiveTextColor={Constants.Colors.primaryWhiteText}
            tabBarBackgroundColor={Constants.Colors.darkTransparentBackground}
            tabBarInactiveTextColor={Constants.Colors.secondaryWhiteText}
            tabBarPosition='top'
            tabBarUnderlineStyle={{backgroundColor: Constants.Colors.primaryWhiteText}}>
          <Weekly tabLabel={Translations.weekly}>
            {this._renderSemesters(Translations)}
          </Weekly>
          <ByCourse tabLabel={Translations.by_course}>
            {this._renderSemesters(Translations)}
          </ByCourse>
        </ScrollableTabView>
        <ActionButton
            buttonColor={Constants.Colors.primaryBackground}
            offsetX={Constants.Sizes.Margins.Expanded}
            offsetY={Constants.Sizes.Margins.Regular}
            onPress={this._addNewCourse} />
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
  modalContainer: {
    flex: 1,
    backgroundColor: Constants.Colors.secondaryBackground,
  },
  semesterItem: {
    color: Constants.Colors.primaryWhiteText,
  },
});

// Map state to props
const select = (store) => {
  return {
    currentSemester: store.config.currentSemester,
    language: store.config.language,
    semesters: store.config.semesters,
    timeFormat: store.config.preferredTimeFormat,
  };
};

// Map dispatch to props
const actions = (dispatch) => {
  return {
    updateConfiguration: (options: ConfigurationOptions) => dispatch(updateConfiguration(options)),
  };
};

export default connect(select, actions)(Schedule);
