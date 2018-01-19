/**
 *
 * @license
 * Copyright (C) 2017 Joseph Roque
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
 * @file Lecture.tsx
 * @description Menu to add or edit a lecture.
 */
'use strict';

// React imports
import React from 'react';
import {
  Alert,
  DatePickerIOS,
  Picker,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TimePickerAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import { Navigator } from 'react-native-deprecated-custom-components';

// Redux imports
import { connect } from 'react-redux';

// Imports
import ImageGrid from '../../../components/ImageGrid';
import Header from '../../../components/Header';
import ModalHeader from '../../../components/ModalHeader';
import moment from 'moment';
import RoomGrid from '../../../components/RoomGrid';
import * as Constants from '../../../constants';
import * as TextUtils from '../../../util/TextUtils';
import * as Translations from '../../../util/Translations';

// Types
import { Store } from '../../../store/configureStore';
import { Language } from '../../../util/Translations';
import { BasicIcon, TimeFormat } from '../../../../typings/global';
import { Building, Course, Destination, Lecture, LectureFormat, RoomTypeId } from '../../../../typings/university';

interface Props {
  addingLecture: boolean;                 // True when adding a new course, false when editing
  course: Course;                         // The course the lecture will be added to
  language: Language;                     // The current language, selected by the user
  lectureFormats: LectureFormat[];        // Array of available lecture types
  lectureToEdit: Lecture | undefined;     // Instance of a lecture to pre-populate in the modal
  timeFormat: TimeFormat;                 // The user's preferred time format
  onClose: VoidFunction;                  // Callback for when the modal is closed
  onSaveLecture(lecture: Lecture): void;  // Callback to save a lecture
}

interface State {
  anyEdits: boolean;                  // Indicate if there are any changes to save
  building: Building | undefined;     // The selected building to display rooms of
  day: number;                        // Day of the week the lecture takes place. 0 for monday.
  format: number;                     // Format type of the lecture
  starts: number;                     // Start time of the lecture, in minutes from midnight
  ends: number;                       // End time of the lecture, in minutes from midnight\
  location: Destination | undefined;  // Location where the class will take place
  rightActionEnabled: boolean;        // Indicates if the right modal action should be enabled
}

// Navigation values
const MENU = 0;
const REGULAR_PICKER = 1;
const TIME_PICKER = 2;
const BUILDING_PICKER = 3;
const ROOM_PICKER = 4;

// Values to select by picker
const PICKER_FORMAT = 0;
const PICKER_DAY = 1;
const PICKER_STARTS = 2;
const PICKER_ENDS = 3;
const PICKER_BUILDING = 4;
const PICKER_ROOM = 5;

// Default day of a new lecture
const DEFAULT_DAY = 0;              // Monday
// Default format of a new lecture
const DEFAULT_FORMAT = 0;           // LEC
// Default start time of a new lecture
const DEFAULT_START_TIME = 780;     // 1:00 pm
// Default end time of a new lecture
const DEFAULT_END_TIME = 870;       // 2:30 pm
// Default location of a new lecture
const DEFAULT_LOCATION = undefined; // undefined

// Minute intervals available for user to select
const MINUTE_INTERVAL = 5;

// Number of columns to display buildings in
const BUILDING_COLUMNS = 3;

const LECTURE_ROOM_TYPES: Set<RoomTypeId> = new Set();
LECTURE_ROOM_TYPES.add('class');
LECTURE_ROOM_TYPES.add('comp');
LECTURE_ROOM_TYPES.add('meet');
LECTURE_ROOM_TYPES.add('lab_res');
LECTURE_ROOM_TYPES.add('lab_teach');

class LectureModal extends React.PureComponent<Props, State> {

  /** List of buildings in the app. */
  _buildingList: Building[] = [];

  /**
   * Constructor.
   *
   * @param {props} props component props
   */
  constructor(props: Props) {
    super(props);

    const day = props.lectureToEdit ? props.lectureToEdit.day : DEFAULT_DAY;
    const starts = props.lectureToEdit ? props.lectureToEdit.startTime : DEFAULT_START_TIME;
    this.state = {
      anyEdits: false,
      building: undefined,
      day,
      ends: props.lectureToEdit ? props.lectureToEdit.endTime : DEFAULT_END_TIME,
      format: props.lectureToEdit ? props.lectureToEdit.format : DEFAULT_FORMAT,
      location: props.lectureToEdit ? props.lectureToEdit.location : DEFAULT_LOCATION,
      rightActionEnabled: this._isLectureStartUnique(props.course, day, starts),
      starts,
    };

    this._buildingList = require('../../../../assets/js/Buildings');
  }

  /**
   * Closes this menu and, if editing, re-saves the provided lecture.
   */
  _close(): void {
    const gracefulClose = (): void => {
      if (!this.props.addingLecture && this.props.lectureToEdit != undefined) {
        this._saveLecture(this.props.lectureToEdit);
      } else {
        this.props.onClose();
      }
    };

    if (this.state.anyEdits) {
      Alert.alert(
        Translations.get('quit_without_saving'),
        Translations.get('quit_without_saving_msg'),
        [
          { text: Translations.get('cancel'), style: 'cancel' },
          { text: Translations.get('quit'), onPress: gracefulClose },
        ]
      );
    } else {
      gracefulClose();
    }
  }

  /**
   * Defines the transition between views.
   *
   * @returns {any} a configuration for scene transitions in the navigator
   */
  _configureScene(): any {
    return {
      ...Navigator.SceneConfigs.PushFromRight,
    };
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
   *
   * @param {Lecture} lecture the lecture to save
   */
  _saveLecture(lecture: Lecture): void {
    if (!this._isLectureStartUnique(this.props.course, lecture.day, lecture.startTime)) {
      return;
    }

    this.props.onSaveLecture(lecture);
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
    this.setState({ day, rightActionEnabled });
  }

  /**
   * Sets the start or end time for the lecture
   *
   * @param {Date}    time        the time to set
   * @param {boolean} isStartTime true to set the start time, false to set end time
   */
  _setTime(time: Date, isStartTime: boolean): void {
    if (isStartTime) {
      const updatedStartTime = this._getMinutesFromMidnight(moment(time).format('HH:mm'));
      const updatedEndTime = updatedStartTime + (this.state.ends - this.state.starts);
      const rightActionEnabled = this._isLectureStartUnique(this.props.course, this.state.day, updatedStartTime);

      this.setState({
        ends: updatedEndTime,
        rightActionEnabled,
        starts: updatedStartTime,
      });
    } else {
      const updatedEndTime = this._getMinutesFromMidnight(moment(time).format('HH:mm'));
      if (updatedEndTime > this.state.starts) {
        this.setState({ ends: updatedEndTime });
      }
    }
  }

  /**
   * Shows the TimePicker on Android to pick a time.
   *
   * @param {number} picking the value to pick
   */
  async _showAndroidTimePicker(picking: number): Promise<void> {
    const initialTime = (picking === PICKER_STARTS) ? this.state.starts : this.state.ends;
    const hour = Math.floor(initialTime / Constants.Time.MINUTES_IN_HOUR);
    const minute = initialTime % Constants.Time.MINUTES_IN_HOUR;

    try {
      const timePicked = await TimePickerAndroid.open({
        hour,
        is24Hour: this.props.timeFormat === '24h',
        minute,
      });
      if (timePicked.action !== TimePickerAndroid.dismissedAction) {
        const time = new Date();
        time.setHours(timePicked.hour, timePicked.minute, 0, 0);
        this._setTime(time, picking === PICKER_STARTS);
      }
    } catch ({ code, message }) {
      console.warn('Cannot open time picker.', message);
    }
  }

  /**
   * Shows the picker to pick a value.
   *
   * @param {number} picking the value to pick
   */
  _showPicker(picking: number): void {
    switch (picking) {
      case PICKER_STARTS:
      case PICKER_ENDS:
      if (Platform.OS === 'android') {
        this._showAndroidTimePicker(picking);
      } else {
        (this.refs.Navigator as any).push({ id: TIME_PICKER, picking });
      }
      break;
      case PICKER_BUILDING:
      (this.refs.Navigator as any).push({ id: BUILDING_PICKER });
      break;
      case PICKER_ROOM:
      (this.refs.Navigator as any).push({ id: ROOM_PICKER });
      break;
      default:
      (this.refs.Navigator as any).push({ id: REGULAR_PICKER, picking });
    }

    this.setState({ anyEdits: true });
  }

  /**
   * Handles when a building is selected.
   *
   * @param {Building|undefined} building the building selected
   */
  _onBuildingSelect(building: Building | undefined): void {
    if (building == undefined) {
      this.setState({ location: undefined, building });
      (this.refs.Navigator as any).pop();
    } else {
      this.setState({ location: { shorthand: building.shorthand, room: undefined }, building });
      this._showPicker(PICKER_ROOM);
    }
  }

  /**
   * Handles when a room is selected.
   *
   * @param {string}           shorthand selected building shorthand
   * @param {string|undefined} room      selected room name or undefined
   */
  _onRoomSelect(shorthand: string, room: string | undefined): void {
    this.setState({ location: { shorthand, room } });
    (this.refs.Navigator as any).popToTop();
  }

  /**
   * Renders a view to select a building on campus.
   *
   * @returns {JSX.Element} an image grid to select a building
   */
  _renderBuildingPicker(): JSX.Element {
    const platformModifier = Platform.OS === 'android' ? 'md' : 'ios';
    const backArrowIcon = `${platformModifier}-arrow-back`;

    const locationTranslation = Translations.get('location');
    const buildingTranslation = Translations.get('building');

    return (
      <View style={_styles.container}>
        <TouchableOpacity onPress={(): void => (this.refs.Navigator as any).pop()}>
          <Header
              icon={{ name: backArrowIcon, class: 'ionicon' }}
              title={`${locationTranslation} - ${buildingTranslation}`} />
        </TouchableOpacity>
        <TouchableOpacity onPress={(): void => this._onBuildingSelect(undefined)}>
          <View style={_styles.removeBuildingTextContainer}>
            <Text style={_styles.removeBuildingText}>
              {Translations.get('none')}
            </Text>
          </View>
        </TouchableOpacity>
        <ImageGrid
            columns={BUILDING_COLUMNS}
            disableImages={true}
            filter={''}
            images={this._buildingList}
            language={this.props.language}
            onSelect={this._onBuildingSelect.bind(this)} />
      </View>
    );
  }

  /**
   * Renders a view to select a room in the building.
   *
   * @returns {JSX.Element} a room grid to select a room
   */
  _renderRoomPicker(): JSX.Element {
    const platformModifier = Platform.OS === 'android' ? 'md' : 'ios';
    const backArrowIcon = `${platformModifier}-arrow-back`;

    const locationTranslation = Translations.get('location');
    const roomTranslation = Translations.get('room');

    const building = this.state.building;
    let roomGrid: JSX.Element;
    if (building != undefined) {
      roomGrid = (
        <View style={_styles.container}>
          <RoomGrid
            backgroundColor={Constants.Colors.secondaryBackground}
            filter={''}
            language={this.props.language}
            rooms={building.rooms}
            roomTypeFilter={LECTURE_ROOM_TYPES}
            shorthand={building.shorthand}
            onSelect={this._onRoomSelect.bind(this)} />
        </View>
      );
    }

    return (
      <View style={_styles.container}>
        <TouchableOpacity onPress={(): void => (this.refs.Navigator as any).pop()}>
          <Header
              icon={{ name: backArrowIcon, class: 'ionicon' }}
              title={`${locationTranslation} - ${roomTranslation}`} />
        </TouchableOpacity>
        {roomGrid}
      </View>
    );
  }

  /**
   * Renders a menu to display the values selected so far, and touchable elements to change these values.
   *
   * @returns {JSX.Element} a set of headers depicting the item and value
   */
  _renderMenu(): JSX.Element {
    const pickIcon: BasicIcon = {
      class: 'material',
      name: 'chevron-right',
    };

    const format = this.props.lectureFormats[this.state.format].code;
    const day = Constants.Days[Translations.getLanguage()][this.state.day];
    const startTime = TextUtils.getFormattedTimeSinceMidnight(this.state.starts, this.props.timeFormat);
    const endTime = TextUtils.getFormattedTimeSinceMidnight(this.state.ends, this.props.timeFormat);
    const location = this.state.location ? TextUtils.destinationToString(this.state.location) : '';

    return (
      <ScrollView>
        <TouchableOpacity onPress={this._showPicker.bind(this, PICKER_FORMAT)}>
          <Header
              largeSubtitle={true}
              subtitle={format}
              subtitleIcon={pickIcon}
              title={Translations.get('format')} />
        </TouchableOpacity>
        <View style={_styles.menuItemSeparator} />
        <TouchableOpacity onPress={this._showPicker.bind(this, PICKER_DAY)}>
          <Header
              largeSubtitle={true}
              subtitle={day}
              subtitleIcon={pickIcon}
              title={Translations.get('day')} />
        </TouchableOpacity>
        <View style={_styles.menuItemSeparator} />
        <TouchableOpacity onPress={this._showPicker.bind(this, PICKER_STARTS)}>
          <Header
              largeSubtitle={true}
              subtitle={startTime}
              subtitleIcon={pickIcon}
              title={Translations.get('starts')} />
        </TouchableOpacity>
        <View style={_styles.menuItemSeparator} />
        <TouchableOpacity onPress={this._showPicker.bind(this, PICKER_ENDS)}>
          <Header
              largeSubtitle={true}
              subtitle={endTime}
              subtitleIcon={pickIcon}
              title={Translations.get('ends')} />
        </TouchableOpacity>
        <View style={_styles.menuItemSeparator} />
        <TouchableOpacity onPress={this._showPicker.bind(this, PICKER_BUILDING)}>
          <Header
              largeSubtitle={true}
              subtitle={location}
              subtitleIcon={pickIcon}
              title={Translations.get('location')} />
        </TouchableOpacity>
      </ScrollView>
    );
  }

  /**
   * Renders a picker with a set of values for the user to choose from.
   *
   * @param {number} picking      the value being picked
   * @returns {JSX.Element} the picker with the options to select between
   */
  _renderRegularPicker(picking: number): JSX.Element {
    const platformModifier = Platform.OS === 'android' ? 'md' : 'ios';
    const backArrowIcon = `${platformModifier}-arrow-back`;

    let title = '';
    let options: any[] = [];
    let selectedValue: any = 0;
    let getName: (arg: any) => string;
    let setValue: (arg: any) => void;

    switch (picking) {
      case PICKER_FORMAT:
        title = 'format';
        options = this.props.lectureFormats;
        selectedValue = this.state.format;
        getName = (format: number): string => {
          const name = Translations.getName(this.props.lectureFormats[format]) || '';

          return `(${this.props.lectureFormats[format].code}) ${name}`;
        };
        setValue = (value: number): void => this.setState({ format: value });
        break;
      case PICKER_DAY:
        title = 'day';
        options = Constants.Days[Translations.getLanguage()];
        selectedValue = this.state.day;
        getName = (day: number): string => Constants.Days[Translations.getLanguage()][day];
        setValue = (value: number): void => this._setDay(value);
        break;
      default:
        throw new Error(`Cannot use regular picker for ${picking}`);
    }

    return (
      <View style={_styles.container}>
        <TouchableOpacity onPress={(): void => (this.refs.Navigator as any).pop()}>
          <Header
              icon={{ name: backArrowIcon, class: 'ionicon' }}
              title={Translations.get(title)} />
        </TouchableOpacity>
        <Picker
            itemStyle={_styles.pickerItem}
            mode={'dialog'}
            prompt={Translations.get(title)}
            selectedValue={selectedValue}
            style={_styles.pickerContainer}
            onValueChange={setValue}>
          {options.map((_: any, index: number) => {
            return (
              <Picker.Item
                  key={getName ? getName(index) : ''}
                  label={getName ? getName(index) : ''}
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
   * @param {number} picking      the value being picked
   * @returns {JSX.Element} the time picker with the options to select between
   */
  _renderTimePicker(picking: number): JSX.Element {
    let title;
    let time;

    let setValue: (arg: any) => void;
    switch (picking) {
      case PICKER_STARTS:
        title = 'starts';
        time = moment(TextUtils.getFormattedTimeSinceMidnight(this.state.starts, '24h'), 'HH:mm').toDate();
        setValue = (value: Date): void => this._setTime(value, true);
        break;
      case PICKER_ENDS:
        title = 'ends';
        time = moment(TextUtils.getFormattedTimeSinceMidnight(this.state.ends, '24h'), 'HH:mm').toDate();
        setValue = (value: Date): void => this._setTime(value, false);
        break;
      default:
        throw new Error(`Cannot pick time for ${picking}`);
    }

    return (
      <View style={_styles.container}>
        <TouchableOpacity onPress={(): void => (this.refs.Navigator as any).pop()}>
          <Header
              icon={{ name: 'ios-arrow-back', class: 'ionicon' }}
              title={Translations.get(title)} />
        </TouchableOpacity>
        <DatePickerIOS
            date={time}
            minuteInterval={MINUTE_INTERVAL}
            mode={'time'}
            style={_styles.pickerContainer}
            onDateChange={setValue} />
      </View>
    );
  }

  /**
   * Renders the current scene based on the navigation route.
   *
   * @param {{id: number; picking?: number}} route the route to render
   * @returns {JSX.Element} the rendering of the scene
   */
  _renderScene(route: {id: number; picking?: number}): JSX.Element {
    switch (route.id) {
      case MENU:
        return this._renderMenu();
      case REGULAR_PICKER:
        return this._renderRegularPicker(route.picking || PICKER_FORMAT);
      case TIME_PICKER:
        return this._renderTimePicker(route.picking || PICKER_STARTS);
      case BUILDING_PICKER:
        return this._renderBuildingPicker();
      case ROOM_PICKER:
        return this._renderRoomPicker();
      default:
        throw new Error(`Attempting to render invalid Lecture scene: ${route}`);
    }
  }

  /**
   * Renders the app tabs and icons, an indicator to show the current tab, and a navigator with the tab contents.
   *
   * @returns {JSX.Element} the hierarchy of views to render
   */
  render(): JSX.Element {
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
            leftActionText={Translations.get('cancel')}
            rightActionEnabled={this.state.rightActionEnabled}
            rightActionText={Translations.get(modalRightAction)}
            title={Translations.get(modalTitle)}
            onLeftAction={this._close.bind(this)}
            onRightAction={(): void => this._saveLecture({
              day: this.state.day,
              endTime: this.state.ends,
              format: this.state.format,
              location: this.state.location,
              startTime: this.state.starts,
            })} />
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
    backgroundColor: Constants.Colors.secondaryBackground,
    flex: 1,
  },
  menuItemSeparator: {
    backgroundColor: Constants.Colors.secondaryWhiteText,
    height: StyleSheet.hairlineWidth,
  },
  pickerContainer: {
    backgroundColor: Constants.Colors.tertiaryBackground,
  },
  pickerItem: {
    color: Constants.Colors.primaryBlackText,
  },
  removeBuildingText: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
    margin: Constants.Sizes.Margins.Expanded,
    textAlign: 'center',
  },
  removeBuildingTextContainer: {
    backgroundColor: Constants.Colors.darkMoreTransparentBackground,
    margin: 1,
  },
});

const mapStateToProps = (store: Store): any => {
  return {
    language: store.config.options.language,
    timeFormat: store.config.options.preferredTimeFormat,
  };
};

export default connect(mapStateToProps)(LectureModal) as any;
