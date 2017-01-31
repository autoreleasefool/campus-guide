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
  Navigator,
  Picker,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
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
import * as CoreTranslations from '../../../../assets/json/CoreTranslations.json';
import * as TranslationUtils from 'TranslationUtils';

// Navigation values
const MENU = 0;
const REGULAR_PICKER = 1;
const TIME_PICKER = 2;

// Values to select by picker
const PICKER_FORMAT = 0;
const PICKER_DAY = 1;
const PICKER_STARTS = 2;
const PICKER_ENDS = 3;

// Day name translations for picker
const DAYS: {en: Array < string >, fr: Array < string >} = {
  en: [
    CoreTranslations.en.monday,
    CoreTranslations.en.tuesday,
    CoreTranslations.en.wednesday,
    CoreTranslations.en.thursday,
    CoreTranslations.en.friday,
    CoreTranslations.en.saturday,
    CoreTranslations.en.sunday,
  ],
  fr: [
    CoreTranslations.fr.monday,
    CoreTranslations.fr.tuesday,
    CoreTranslations.fr.wednesday,
    CoreTranslations.fr.thursday,
    CoreTranslations.fr.friday,
    CoreTranslations.fr.saturday,
    CoreTranslations.fr.sunday,
  ],
};

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
      starts: 780,
      ends: 870,
    };

    (this:any)._renderMenu = this._renderMenu.bind(this);
    (this:any)._renderRegularPicker = this._renderRegularPicker.bind(this);
    (this:any)._renderTimePicker = this._renderTimePicker.bind(this);
    (this:any)._saveLecture = this._saveLecture.bind(this);
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
   * Saves the lecture being edited or created.
   */
  _saveLecture(): void {
    console.log(`Saving lecture ${this.state.format}, ${this.state.day}, ${this.state.starts}, ${this.state.ends}`);
  }

  /**
   * Shows the picker to pick a value.
   *
   * @param {number} picking the value to pick
   */
  _showPicker(picking: number) {
    if (picking === PICKER_STARTS || picking === PICKER_ENDS) {
      this.refs.Navigator.push({id: TIME_PICKER, picking});
    } else {
      this.refs.Navigator.push({id: REGULAR_PICKER, picking});
    }
  }

  /**
   * Renders a menu to display the values selected so far, and touchable elements to change these values.
   *
   * @param {Object} Translations translations in the current language of certain text
   * @returns {ReactElement<any>} a set of headers depicting the item and value
   */
  _renderMenu(Translations: Object): ReactElement < any > {
    const pickIcon = {
      class: 'material',
      name: 'chevron-right',
    };

    const format: string = this.props.lectureFormats[this.state.format].code;
    const day: string = DAYS[this.props.language][this.state.day] || '';

    return (
      <ScrollView>
        <TouchableOpacity onPress={this._showPicker.bind(this, PICKER_FORMAT)}>
          <Header
              subtitle={format}
              subtitleIcon={pickIcon}
              title={Translations.format} />
        </TouchableOpacity>
        <TouchableOpacity onPress={this._showPicker.bind(this, PICKER_DAY)}>
          <Header
              subtitle={day}
              subtitleIcon={pickIcon}
              title={Translations.day} />
        </TouchableOpacity>
        <Header title={Translations.starts} />
        <Header title={Translations.ends} />
      </ScrollView>
    );
  }

  /**
   * Renders a picker with a set of values for the user to choose from.
   *
   * @param {Object} Translations translations in the current language of certain text
   * @param {number} picking      the value being picked
   * @returns {ReactElement<any>} the picker with the options to select between
   */
  _renderRegularPicker(Translations: Object, picking: number): ReactElement < any > {
    const platformModifier: string = Platform.OS === 'ios' ? 'ios' : 'md';
    const backArrowIcon: string = `${platformModifier}-arrow-back`;

    let title = '';
    let options = [];
    let selectedValue = 0;
    let getName = () => '';
    let setValue = () => this.setState({});
    switch (picking) {
      case PICKER_FORMAT:
        title = 'format';
        options = this.props.lectureFormats;
        selectedValue = this.state.format;
        getName = (format) => {
          const name = TranslationUtils.getTranslatedName(this.props.language, this.props.lectureFormats[format]) || '';
          return `(${this.props.lectureFormats[format].code}) ${name}`;
        };
        setValue = (value) => this.setState({format: value});
        break;
      case PICKER_DAY:
        title = 'day';
        options = DAYS[this.props.language];
        selectedValue = this.state.day;
        getName = (day) => DAYS[this.props.language][day];
        setValue = (value) => this.setState({day: value});
        break;
      default:
        // do nothing
        // TODO: return some error view
    }

    return (
      <View style={_styles.container}>
        <TouchableOpacity onPress={() => this.refs.Navigator.pop()}>
          <Header
              icon={{name: backArrowIcon, class: 'ionicon'}}
              title={Translations[title]} />
        </TouchableOpacity>
        <Picker
            itemStyle={_styles.pickerItem}
            selectedValue={selectedValue}
            onValueChange={setValue}>
          {options.map((option, index) => {
            return (
              <Picker.Item
                  key={getName(index)}
                  label={getName(index)}
                  value={index} />
            );
          })}
        </Picker>
      </View>
    );
  }

  /**
   * Renders a picker with a set of times for the user to choose from.
   *
   * @param {Object} Translations translations in the current language of certain text
   * @param {number} picking      the value being picked
   * @returns {ReactElement<any>} the time picker with the options to select between
   */
  _renderTimePicker(Translations: Object, picking: number): ReactElement < any > {
    console.log(`TODO: pick ${picking}`);
    return (
      <View />
    );
  }

  _renderScene(route: {id: number, picking?: number}): ReactElement < any > {
    // Get current language for translations
    const Translations: Object = TranslationUtils.getTranslations(this.props.language);

    switch (route.id) {
      case MENU:
        return this._renderMenu(Translations);
      case REGULAR_PICKER:
        return this._renderRegularPicker(Translations, route.picking || PICKER_FORMAT);
      case TIME_PICKER:
        return this._renderTimePicker(Translations, route.picking || PICKER_STARTS);
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
  pickerItem: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
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

export default connect(select)(LectureModal);
