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
  Navigator,
  Picker,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
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
  code: string,     // Value for course code
  semester: number, // Value for course semester
};

// Imports
import Header from 'Header';
import ModalHeader from 'ModalHeader';
import * as Constants from 'Constants';
import * as TranslationUtils from 'TranslationUtils';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

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
    super(props);
    this.state = {
      code: '',
      semester: props.currentSemester,
    };

    (this:any)._renderMenu = this._renderMenu.bind(this);
    (this:any)._renderPicker = this._renderPicker.bind(this);
    (this:any)._saveCourse = this._saveCourse.bind(this);
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
   * Saves the course being edited or created.
   */
  _saveCourse(): void {
    console.log(`Saving course ${this.state.code}, ${this.state.semester}`);
  }

  /**
   * Shows the picker to pick a semester.
   */
  _showSemesterPicker() {
    if (Platform.OS === 'android') {
      console.log('TODO: setup android picker');
      throw new Error('No android picker setup');
    } else {
      this.refs.Navigator.push({id: PICKER});
    }
  }

  /**
   * Renders the values defined so far for the new course and elements to change them.
   *
   * @param {Object} Translations translations in the current language of certain text
   * @returns {ReactElement<any>} the hierarchy of views to render
   */
  _renderMenu(Translations: Object): ReactElement < any > {
    const semesterName = TranslationUtils.getTranslatedName(this.props.language,
        this.props.semesters[this.state.semester]) || '';

    return (
      <KeyboardAwareScrollView>
        <TouchableOpacity onPress={this._showSemesterPicker.bind(this)}>
          <Header
              subtitle={semesterName}
              subtitleIcon={{class: 'material', name: 'chevron-right'}}
              title={Translations.semester} />
        </TouchableOpacity>
        <Header title={Translations.course_code} />
        <TextInput
            autoCapitalize={'characters'}
            returnKeyType={'done'}
            style={_styles.textInput}
            value={this.state.code}
            onChangeText={(code) => this.setState({code})} />
        <Header
            subtitleCallback={() => this.props.onAddLecture()}
            subtitleIcon={{class: 'material', name: 'add'}}
            title={Translations.sessions} />
      </KeyboardAwareScrollView>
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
              icon={{name: backArrowIcon, class: 'ionicon'}}
              title={Translations.semester} />
        </TouchableOpacity>
        <Picker
            itemStyle={_styles.pickerItem}
            prompt={Translations.semester}
            selectedValue={this.state.semester}
            style={_styles.pickerContainer}
            onValueChange={(semester) => this.setState({semester})}>
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
        <ModalHeader
            leftActionEnabled={true}
            leftActionText={Translations.cancel}
            rightActionEnabled={true}
            rightActionText={Translations[modalRightAction]}
            title={Translations[modalTitle]}
            onLeftAction={() => this.props.onClose()}
            onRightAction={this._saveCourse} />
        <Navigator
            configureScene={this._configureScene}
            initialRoute={{id: MENU}}
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
    margin: Constants.Sizes.Margins.Regular,
    paddingLeft: Constants.Sizes.Margins.Regular,
    fontSize: Constants.Sizes.Text.Body,
    color: Constants.Colors.primaryWhiteText,
    borderColor: Constants.Colors.primaryWhiteText,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: Constants.Colors.secondaryBackground,
  },
  pickerContainer: {
    flex: 1,
    backgroundColor: Constants.Colors.polarGrey,
  },
  pickerItem: {
    color: Constants.Colors.primaryBlackText,
    fontSize: Constants.Sizes.Text.Subtitle,
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

export default connect(select)(CourseModal);
