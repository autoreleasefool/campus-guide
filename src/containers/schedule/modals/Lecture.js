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
  DatePickerIOS,
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
  Course,
  Language,
  Lecture,
  LectureFormat,
  TimeFormat,
  VoidFunction,
} from 'types';

// Type definition for component props.
type Props = {
  addingLecture: boolean,                     // True when adding a new course, false when editing
  course: Course,                             // The course the lecture will be added to
  language: Language,                         // The current language, selected by the user
  lectureFormats: Array < LectureFormat >,    // Array of available lecture types
  timeFormat: TimeFormat,                     // The user's preferred time format
  onClose: VoidFunction,                      // Callback for when the modal is closed
  onSaveLecture: (lecture: Lecture) => void,  // Callback to save a lecture
};

// Type definition for component state.
type State = {
  day: number,                              // Day of the week the lecture takes place. 0 for monday.
  format: number,                           // Format type of the lecture
  starts: number,                           // Start time of the lecture, in minutes from midnight
  ends: number,                             // End time of the lecture, in minutes from midnight
  rightActionEnabled: boolean,              // Indicates if the right modal action should be enabled
};

// Imports
import Header from 'Header';
import ModalHeader from 'ModalHeader';
import moment from 'moment';
import * as Constants from 'Constants';
import * as CoreTranslations from '../../../../assets/json/CoreTranslations.json';
import * as TranslationUtils from 'TranslationUtils';
import {convertTimeFormat} from 'TextUtils';

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

// Default day of a new lecture
const DEFAULT_DAY = 0;          // Monday
// Default format of a new lecture
const DEFAULT_FORMAT = 0;       // LEC
// Default start time of a new lecture
const DEFAULT_START_TIME = 780; // 1:00 pm
// Default end time of a new lecture
const DEFAULT_END_TIME = 870;   // 2:30 pm

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
      day: DEFAULT_DAY,
      format: DEFAULT_FORMAT,
      starts: DEFAULT_START_TIME,
      ends: DEFAULT_END_TIME,
      rightActionEnabled: this._isLectureStartUnique(props.course, 0, DEFAULT_START_TIME),
    };

    (this:any)._isLectureStartUnique = this._isLectureStartUnique.bind(this);
    (this:any)._renderMenu = this._renderMenu.bind(this);
    (this:any)._renderRegularPicker = this._renderRegularPicker.bind(this);
    (this:any)._renderTimePicker = this._renderTimePicker.bind(this);
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
   * Converts a number of minutes since midnight to a string.
   *
   * @param {number}     minutesSinceMidnight minutes since midnight
   * @param {TimeFormat} formatOverride       specify a format to return instead of the user's preference
   * @returns {string} Returns a string of the format '1:00 pm' in 12 hour time or
   *                   '13:00' in 24 hour time.
   */
  _getFormattedTime(minutesSinceMidnight: number, formatOverride: ?TimeFormat): string {
    const hours = Math.floor(minutesSinceMidnight / Constants.Time.MINUTES_IN_HOUR);
    const minutes = minutesSinceMidnight - (hours * Constants.Time.MINUTES_IN_HOUR);
    const timeString = `${hours >= Constants.Time.HOURS_UNDER_PREFIXED ? '' : '0'}${hours}:`
        + `${minutes >= Constants.Time.MINUTES_UNDER_PREFIXED ? '' : '0'}${minutes}`;
    return convertTimeFormat(formatOverride || this.props.timeFormat, timeString);
  }

  /**
   * Converts a time in 24h format to a number of minutes since midnight.
   *
   * @param {string} formattedTime the time to convert
   * @returns {number} the minutes since midnight
   */
  _getMinutesFromMidnight(formattedTime: string): number {
    const MINUTES_POSITION = 3;

    const hours = parseInt(formattedTime.substr(0, 2));
    const minutes = parseInt(formattedTime.substr(MINUTES_POSITION));
    return hours * Constants.Time.MINUTES_IN_HOUR + minutes;
  }

  /**
   * Saves the lecture being edited or created.
   */
  _saveLecture(): void {
    const day = this.state.day;
    const format = this.state.format;
    const startTime = this.state.starts;
    const endTime = this.state.ends;

    if (!this._isLectureStartUnique(this.props.course, day, startTime)) {
      return;
    }

    this.props.onSaveLecture({day, format, startTime, endTime}); // TODO: add location
    this.props.onClose();
  }

  /**
   * Checks if the start time of a lecture is unique.
   *
   * @param {Course} course    the course to check
   * @param {number} day       the day the lecture takes place
   * @param {number} startTime the start time of the lecture in minutes since midnight
   * @returns {boolean} true if the lecture start time is unique on the day, false otherwise
   */
  _isLectureStartUnique(course: Course, day: number, startTime: number): boolean {
    const lecturesLength = course.lectures.length;
    for (let i = 0; i < lecturesLength; i++) {
      if (course.lectures[i].day === day
          && course.lectures[i].startTime === startTime) {
        return false;
      }
    }

    return true;
  }

  /**
   * Sets the day the lecture will occur.
   *
   * @param {number} day day of the week. 0 is monday
   */
  _setDay(day: number): void {
    const rightActionEnabled = this._isLectureStartUnique(this.props.course, day, this.state.starts);
    this.setState({day, rightActionEnabled});
  }

  /**
   * Sets the start or end time for the lecture
   *
   * @param {Date}    time        the time to set
   * @param {boolean} isStartTime true to set the start time, false to set ends time
   */
  _setTime(time: Date, isStartTime: boolean): void {
    if (isStartTime) {
      const updatedStartTime = this._getMinutesFromMidnight(moment(time).format('HH:mm'));
      const updatedEndTime = updatedStartTime + (this.state.ends - this.state.starts);
      const rightActionEnabled = this._isLectureStartUnique(this.props.course, this.state.day, updatedStartTime);

      this.setState({
        starts: updatedStartTime,
        ends: updatedEndTime,
        rightActionEnabled,
      });
    } else {
      const updatedEndTime = this._getMinutesFromMidnight(moment(time).format('HH:mm'));
      if (updatedEndTime > this.state.starts) {
        this.setState({ends: updatedEndTime});
      }
    }
  }

  /**
   * Shows the picker to pick a value.
   *
   * @param {number} picking the value to pick
   */
  _showPicker(picking: number) {
    if (picking === PICKER_STARTS || picking === PICKER_ENDS) {
      if (Platform.OS === 'android') {
        console.log('TODO: setup android picker');
        throw new Error('No android picker setup');
      } else {
        this.refs.Navigator.push({id: TIME_PICKER, picking});
      }
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

    const format = this.props.lectureFormats[this.state.format].code;
    const day = DAYS[this.props.language][this.state.day];
    const startTime = this._getFormattedTime(this.state.starts);
    const endTime = this._getFormattedTime(this.state.ends);

    return (
      <ScrollView>
        <TouchableOpacity onPress={this._showPicker.bind(this, PICKER_FORMAT)}>
          <Header
              largeSubtitle={true}
              subtitle={format}
              subtitleIcon={pickIcon}
              title={Translations.format} />
        </TouchableOpacity>
        <TouchableOpacity onPress={this._showPicker.bind(this, PICKER_DAY)}>
          <Header
              largeSubtitle={true}
              subtitle={day}
              subtitleIcon={pickIcon}
              title={Translations.day} />
        </TouchableOpacity>
        <TouchableOpacity onPress={this._showPicker.bind(this, PICKER_STARTS)}>
          <Header
              largeSubtitle={true}
              subtitle={startTime}
              subtitleIcon={pickIcon}
              title={Translations.starts} />
        </TouchableOpacity>
        <TouchableOpacity onPress={this._showPicker.bind(this, PICKER_ENDS)}>
          <Header
              largeSubtitle={true}
              subtitle={endTime}
              subtitleIcon={pickIcon}
              title={Translations.ends} />
        </TouchableOpacity>
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

    let title: string = '';
    let options: Array < any > = [];
    let selectedValue: any = 0;
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
        setValue = (value) => this._setDay(value);
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
            prompt={Translations[title]}
            selectedValue={selectedValue}
            style={_styles.pickerContainer}
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
    let title: string = '';
    let time = '13:00';
    let setValue = () => this.setState({});
    switch (picking) {
      case PICKER_STARTS:
        title = 'starts';
        time = moment(this._getFormattedTime(this.state.starts, '24h'), 'HH:mm').toDate();
        setValue = (value) => this._setTime(value, true);
        break;
      case PICKER_ENDS:
        title = 'ends';
        time = moment(this._getFormattedTime(this.state.ends, '24h'), 'HH:mm').toDate();
        setValue = (value) => this._setTime(value, false);
        break;
      default:
        // do nothing
        // TODO: return some error view
    }

    return (
      <View style={_styles.container}>
        <TouchableOpacity onPress={() => this.refs.Navigator.pop()}>
          <Header
              icon={{name: 'ios-arrow-back', class: 'ionicon'}}
              title={Translations[title]} />
        </TouchableOpacity>
        <DatePickerIOS
            date={time}
            minuteInterval={5}
            mode={'time'}
            style={_styles.pickerContainer}
            onDateChange={setValue} />
      </View>
    );
  }

  /**
   * Renders the current scene based on the navigation route.
   *
   * @param {Object} route the route to render
   * @returns {ReactElement<any>} the rendering of the scene
   */
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
            rightActionEnabled={this.state.rightActionEnabled}
            rightActionText={Translations[modalRightAction]}
            title={Translations[modalTitle]}
            onLeftAction={() => this.props.onClose()}
            onRightAction={this._saveLecture.bind(this)} />
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
    language: store.config.language,
    timeFormat: store.config.preferredTimeFormat,
  };
};

export default connect(select)(LectureModal);
