/*************************************************************************
 *
 * @license
 *
 * Copyright 2016 Joseph Roque
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
 *************************************************************************
 *
 * @file
 * ScheduleHome.js
 *
 * @description
 * View for enabling the user to create a schedule of their classes
 * and see the schedule in an organized manner.
 *
 * @author
 * Joseph Roque
 *
 *************************************************************************
 *
 * @external
 * @flow
 *
 ************************************************************************/
'use strict';

// React Native imports
const React = require('react-native');
const {
  Component,
  Dimensions,
  Platform,
  LayoutAnimation,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} = React;

// Imports
const Configuration = require('../../util/Configuration');
const Constants = require('../../Constants');
const Icon = require('react-native-vector-icons/MaterialIcons');
const LanguageUtils = require('../../util/LanguageUtils');
const Preferences = require('../../util/Preferences');
const SectionHeader = require('../../components/SectionHeader');
const StatusBar = require('../../util/StatusBar');
const Styles = require('../../Styles');

// Get dimensions of the device
const {height, width} = Dimensions.get('window');
const screenWidth = width;

class ScheduleHome extends Component {

  /**
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    requestTabChange: React.PropTypes.func.isRequired,
    editSchedule: React.PropTypes.func.isRequired,
  };

  /**
   * Pass props and declares initial state.
   *
   * @param props properties passed from container to this component.
   */
  constructor(props) {
    super(props);
    this.state = {
      dataSource: null,
      showEditButtons: false,
    };
  };

  /**
   * Switches to the next available schedule and updates the views.
   */
  _changeSemester() {
    Preferences.setToNextSemester();
    let header = this.refs.ScheduleHeader;
    header.updateSubtitle(
        LanguageUtils.getTranslatedName(Preferences.getSelectedLanguage(), Preferences.getCurrentSemesterInfo()),
        header.getSubtitleIcon(),
        header.getSubtitleIconClass());
  };

  /**
   * Toggles the visibility of buttons for editing the schedule with animation.
   */
  _toggleEditScheduleButtons() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    this.setState({
      showEditButtons: !this.state.showEditButtons,
    });
  };

  /**
   * Opens a prompt for a user to add a new course.
   */
  _addCourse() {
    // TODO: add a new course
    console.log('TODO: Add a new course');
  };

  /**
   * Opens a prompt for a user to remove a course.
   */
  _removeCourse() {
    // TODO: remove an old course
    console.log('TODO: remove an old course');
  };

  /**
   * Renders the root Schedule view.
   *
   * @return the hierarchy of views to render.
   */
  render() {
    // Get current language for translations
    let Translations = null;
    if (Preferences.getSelectedLanguage() === 'fr') {
      Translations = require('../../../assets/static/js/Translations.fr.js');
    } else {
      Translations = require('../../../assets/static/js/Translations.en.js');
    }

    // Use a different icon for the calendar depending on the platform
    let calendarIcon = null;
    if (Platform.OS === 'ios') {
      calendarIcon = ['ionicon', 'ios-calendar-outline'];
    } else {
      calendarIcon = ['material', 'event'];
    }

    let buttons = null;
    if (this.state.showEditButtons) {
      buttons = (
        <View style={_styles.editButtonContainer}>
          <TouchableOpacity onPress={this._addCourse.bind(this)}>
            <View style={[_styles.editButton, {margin: 10}]}>
              <Icon name={'add'} size={24} color={'white'} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={this._removeCourse.bind(this)}>
            <View style={[_styles.editButton, {marginTop: 10, marginBottom: 10}]}>
              <Icon name={'remove'} size={24} color={'white'} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={this._toggleEditScheduleButtons.bind(this)}>
            <View style={[_styles.editButton, {margin: 10}]}>
              <Icon name={'close'} size={24} color={'white'} />
            </View>
          </TouchableOpacity>
        </View>
      );
    } else {
      buttons = (
        <TouchableOpacity onPress={this._toggleEditScheduleButtons.bind(this)}>
          <View style={_styles.editScheduleButton}>
            <Text style={[Styles.mediumText, {color: 'white'}]}>
              {Translations['edit_schedule']}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <View style={_styles.container}>
        <SectionHeader
            ref='ScheduleHeader'
            sectionName={Translations['schedule']}
            sectionIcon={calendarIcon[1]}
            sectionIconClass={calendarIcon[0]}
            subtitleOnClick={this._changeSemester.bind(this)}
            subtitleName={LanguageUtils.getTranslatedName(Preferences.getSelectedLanguage(), Preferences.getCurrentSemesterInfo())}
            subtitleIcon={'arrow-swap'}
            subtitleIconClass={'ionicon'} />
        {/* TODO: replace with scroll view for schedule */}
        <View style={{flex: 1}} />
        {buttons}
      </View>
    );
  };
};

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
  }
});

// Expose component to app
module.exports = ScheduleHome;
