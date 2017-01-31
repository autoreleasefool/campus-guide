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
 * @created 2017-01-31
 * @file Lecture.js
 * @description Menu to add or edit a lecture.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  Picker,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

// Redux imports
import {connect} from 'react-redux';

// Types
import type {
  Language,
  LectureFormat,
  Semester,
  TimeFormat,
  VoidFunction,
} from 'types';

// Type definition for component props.
type Props = {
  addingLecture: boolean,                   // True when adding a new course, false when editing
  currentSemester: number,                  // The current semester, selected by the user
  language: Language,                       // The current language, selected by the user
  lectureFormats: Array < LectureFormat >,  // Array of available lecture types
  semesters: Array < Semester >,            // Semesters available at the university
  timeFormat: TimeFormat,                   // The user's preferred time format
  onClose: VoidFunction,                    // Callback for when the modal is closed
};

// Type definition for component state.
type State = {
  day: number,                              // Day of the week the lecture takes place. 0 for monday.
  format: number,                           // Format type of the lecture
  starts: number,                           // Start time of the lecture, in minutes from midnight
  ends: number,                             // End time of the lecture, in minutes from midnight
};

// Imports
import Header from 'Header';
import ModalHeader from 'ModalHeader';
import * as Constants from 'Constants';
import * as TranslationUtils from 'TranslationUtils';

class LectureModal extends React.Component {

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
      day: 0,
      format: 0,
      starts: 0,
      ends: 0,
    };

    (this:any)._saveLecture = this._saveLecture.bind(this);
  }

  /**
   * Saves the lecture being edited or created.
   */
  _saveLecture(): void {

  }

  /**
   * Renders the app tabs and icons, an indicator to show the current tab, and a navigator with the tab contents.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement < any > {
    // Get current language for translations
    const Translations: Object = TranslationUtils.getTranslations(this.props.language);

    let modalTitle = 'add_lecture';
    let modalRightAction = 'add';
    if (!this.props.addingLecture) {
      modalTitle = 'edit_lecture';
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
            onRightAction={this._saveLecture} />
        <ScrollView>
          <Header title={Translations.format} />
          <Picker
              itemStyle={_styles.pickerItem}
              selectedValue={this.state.format}
              onValueChange={(value) => this.setState({format: value})}>
            {this.props.lectureFormats.map((format, index) => {
              const name = TranslationUtils.getTranslatedName(this.props.language, format) || '';
              const formattedName = `(${format.code}) ${name}`;
              return (
                <Picker.Item
                    key={format.code}
                    label={formattedName}
                    value={index} />
              );
            })}
          </Picker>
          <Header title={Translations.day} />
          <Header title={Translations.starts} />
          <Header title={Translations.ends} />
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
  pickerItem: {
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

export default connect(select, actions)(LectureModal);
