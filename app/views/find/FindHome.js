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
 * @file FindHome.js
 * @module FindHome
 * @description View for the root navigation for finding a room on campus.
 * @flow
 *
 */
'use strict';

// React Native imports
import React from 'react';
import {
  Platform,
  StyleSheet,
  View,
} from 'react-native';

// Import type definitions
import type {
  Building,
  DefaultFunction,
} from '../../Types';

// Imports
const BuildingGrid = require('./components/BuildingGrid');
const Constants = require('../../Constants');
const Preferences = require('../../util/Preferences');
const SectionHeader = require('../../components/SectionHeader');
const Upcoming = require('./components/Upcoming');

// Type definition for component props.
type Props = {
  onEditSchedule: DefaultFunction,
  onShowBuilding: DefaultFunction,
};

class FindHome extends React.Component {

  /**
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    onEditSchedule: React.PropTypes.func.isRequired,
    onShowBuilding: React.PropTypes.func.isRequired,
  };

  /**
   * Opens the app scheduling screen so the user can update their schedule.
   */
  _editSchedule(): void {
    this.props.onEditSchedule();
  }

  /**
   * Loads a view to display details about a building.
   *
   * @param {Building} building object describing the building.
   */
  _showBuilding(building: Building): void {
    this.props.onShowBuilding(building);
  }

  /**
   * Renders the user's upcoming classes for the day and a list of buildings
   * on campus.
   *
   * @returns {ReactElement} the hierarchy of views to render.
   */
  render(): ReactElement {
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

    let upcomingClasses: ?ReactElement = null;
    if (Constants.Tabs.indexOf('schedule') >= 0) {
      upcomingClasses = (
        <View>
          <SectionHeader
              sectionIcon={calendarIcon[1]}
              sectionIconClass={calendarIcon[0]}
              sectionName={Translations.upcoming_classes}
              subtitleName={Translations.edit}
              subtitleOnClick={this._editSchedule.bind(this)} />
          <View style={[_styles.content, {flex: 1}]}>
            <Upcoming onEdit={this._editSchedule.bind(this)} />
          </View>
        </View>
      );
    }

    return (
      <View style={_styles.container}>
        {upcomingClasses}
        <SectionHeader
            sectionIcon={'store'}
            sectionIconClass={'material'}
            sectionName={Translations.building_directory} />
        <View style={[_styles.content, {flex: 2}]}>
          <BuildingGrid showBuilding={this._showBuilding.bind(this)} />
        </View>
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.Colors.garnet,
  },
  content: {
    margin: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
});

// Expose component to app
module.exports = FindHome;
