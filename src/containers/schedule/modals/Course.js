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
  Picker,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

// Redux imports
import {connect} from 'react-redux';

// Types
import type {
  Language,
  Semester,
  TimeFormat,
  VoidFunction,
} from 'types';

// Type definition for component props.
type Props = {
  addingCourse: boolean,          // True when adding a new course, false when editing
  currentSemester: number,        // The current semester, selected by the user
  language: Language,             // The current language, selected by the user
  semesters: Array < Semester >,  // Semesters available at the university
  timeFormat: TimeFormat,         // The user's preferred time format
  onAddLecture: VoidFunction,     // Callback for when the user requests to add a new lecture
  onEditLecture: any,             // TODO: get proper function signature
  onClose: VoidFunction,          // Callback for when the modal is closed
};

// Type definition for component state.
type State = {
  courseCode: string,     // Value for course code
  courseSemester: number, // Value for course semester
};

// Imports
import Header from 'Header';
import ModalHeader from 'ModalHeader';
import * as Constants from 'Constants';
import * as TranslationUtils from 'TranslationUtils';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

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
    super(props);
    this.state = {
      courseCode: '',
      courseSemester: props.currentSemester,
    };

    (this:any)._saveCourse = this._saveCourse.bind(this);
  }

  /**
   * Saves the course being edited or created.
   */
  _saveCourse(): void {

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
        <ModalHeader
            leftActionEnabled={true}
            leftActionText={Translations.cancel}
            rightActionEnabled={true}
            rightActionText={Translations[modalRightAction]}
            title={Translations[modalTitle]}
            onLeftAction={() => this.props.onClose()}
            onRightAction={this._saveCourse} />
        <KeyboardAwareScrollView>
          <Header title={Translations.semester} />
          <Picker
              itemStyle={_styles.semesterItem}
              selectedValue={this.state.courseSemester}
              onValueChange={(value) => this.setState({courseSemester: value})}>
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
          <Header title={Translations.course_code} />
          <TextInput
              autoCapitalize={'characters'}
              returnKeyType={'done'}
              style={_styles.textInput}
              value={this.state.courseCode}
              onChangeText={(value) => this.setState({courseCode: value})} />
          <Header
              subtitleCallback={() => this.props.onAddLecture()}
              subtitleIcon={{class: 'material', name: 'add'}}
              title={Translations.sessions} />
        </KeyboardAwareScrollView>
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
    margin: Constants.Sizes.Margins.Regular,
    paddingLeft: Constants.Sizes.Margins.Regular,
    fontSize: Constants.Sizes.Text.Body,
    color: Constants.Colors.primaryWhiteText,
    borderColor: Constants.Colors.primaryWhiteText,
    borderWidth: StyleSheet.hairlineWidth,
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
    schedule: store.schedule.semesters,
    semesters: store.config.semesters,
    timeFormat: store.config.preferredTimeFormat,
  };
};

// Map dispatch to props
const actions = (dispatch) => {
  return {};
};

export default connect(select, actions)(CourseModal);
