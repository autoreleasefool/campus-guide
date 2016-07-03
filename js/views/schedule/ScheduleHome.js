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
 * @file ScheduleHome.js
 * @module ScheduleHone
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
  Platform,
  LayoutAnimation,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Type imports
import type {
  DefaultFunction,
} from '../../types';

// Type definition for component props.
type Props = {
  editSchedule: DefaultFunction,
  requestTabChange: DefaultFunction,
};

// Type definition for component state.
type State = {
  showEditButtons: boolean,
};

// Imports
const Constants = require('../../Constants');
const DisplayUtils = require('../../util/DisplayUtils');
const MaterialIcons = require('react-native-vector-icons/MaterialIcons');
const LanguageUtils = require('../../util/LanguageUtils');
const Preferences = require('../../util/Preferences');
const SectionHeader = require('../../components/SectionHeader');

// Get dimensions of the device
const {width} = Dimensions.get('window');
const screenWidth: number = width;

class ScheduleHome extends React.Component {

  /**
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    editSchedule: React.PropTypes.func.isRequired,
    requestTabChange: React.PropTypes.func.isRequired,
  };

  /**
   * Define type for the component state.
   */
  state: State;

  /**
   * Pass props and declares initial state.
   *
   * @param {Props} props properties passed from container to this component.
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      showEditButtons: false,
    };
  }

  /**
   * Switches to the next available schedule and updates the views.
   */
  _changeSemester(): void {
    Preferences.setToNextSemester(AsyncStorage);
    const header: SectionHeader = this.refs.ScheduleHeader;
    header.updateSubtitle(
        LanguageUtils.getTranslatedName(Preferences.getSelectedLanguage(), Preferences.getCurrentSemesterInfo()),
        header.getSubtitleIcon(),
        header.getSubtitleIconClass());
  }

  /**
   * Toggles the visibility of buttons for editing the schedule with animation.
   */
  _toggleEditScheduleButtons(): void {
    LayoutAnimation.configureNext(DisplayUtils.getEaseInEaseOutLayoutAnimation(LayoutAnimation));
    this.setState({
      showEditButtons: !this.state.showEditButtons,
    });
  }

  /**
   * Opens a prompt for a user to add a new course.
   */
  _addCourse(): void {
    // TODO: add a new course
    console.log('TODO: Add a new course');
  }

  /**
   * Opens a prompt for a user to remove a course.
   */
  _removeCourse(): void {
    // TODO: remove an old course
    console.log('TODO: remove an old course');
  }

  /**
   * Renders the root Schedule view.
   *
   * @return {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement<any> {
    // Get current language for translations
    let Translations: Object;
    if (Preferences.getSelectedLanguage() === 'fr') {
      Translations = require('../../../assets/js/Translations.fr.js');
    } else {
      Translations = require('../../../assets/js/Translations.en.js');
    }

    // Use a different icon for the calendar depending on the platform
    let calendarIcon: Array<string>;
    if (Platform.OS === 'ios') {
      calendarIcon = ['ionicon', 'ios-calendar-outline'];
    } else {
      calendarIcon = ['material', 'event'];
    }

    let buttons: ?ReactElement<any> = null;
    if (this.state.showEditButtons) {
      buttons = (
        <View style={_styles.editButtonContainer}>
          <TouchableOpacity onPress={this._addCourse.bind(this)}>
            <View style={[_styles.editButton, {margin: 10}]}>
              <MaterialIcons
                  color={'white'}
                  name={'add'}
                  size={24} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={this._removeCourse.bind(this)}>
            <View style={[_styles.editButton, {marginTop: 10, marginBottom: 10}]}>
              <MaterialIcons
                  color={'white'}
                  name={'remove'}
                  size={24} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={this._toggleEditScheduleButtons.bind(this)}>
            <View style={[_styles.editButton, {margin: 10}]}>
              <MaterialIcons
                  color={'white'}
                  name={'close'}
                  size={24} />
            </View>
          </TouchableOpacity>
        </View>
      );
    } else {
      buttons = (
        <TouchableOpacity onPress={this._toggleEditScheduleButtons.bind(this)}>
          <View style={_styles.editScheduleButton}>
            <Text style={{color: 'white', fontSize: Constants.Text.Medium}}>
              {Translations.edit_schedule}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <View style={_styles.container}>
        <SectionHeader
            ref='ScheduleHeader'
            sectionIcon={calendarIcon[1]}
            sectionIconClass={calendarIcon[0]}
            sectionName={Translations.schedule}
            subtitleIcon={'ios-swap'}
            subtitleIconClass={'ionicon'}
            subtitleName={LanguageUtils.getTranslatedName(
              Preferences.getSelectedLanguage(),
              Preferences.getCurrentSemesterInfo())}
            subtitleOnClick={this._changeSemester.bind(this)} />
        {/** TODO: replace with scroll view for schedule */}
        <View style={{flex: 1}} />
        {buttons}
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.Colors.charcoalGrey,
  },
  editScheduleButton: {
    backgroundColor: Constants.Colors.garnet,
    height: 50,
    margin: 10,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
});

module.exports = ScheduleHome;
