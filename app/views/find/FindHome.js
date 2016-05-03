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
const React = require('react-native');
const {
  Component,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} = React;

// Import type definitions
import type {
  Building,
} from '../../Types';

// Imports
const BuildingGrid = require('./components/BuildingGrid');
const Constants = require('../../Constants');
const Preferences = require('../../util/Preferences');
const SectionHeader = require('../../components/SectionHeader');
const Styles = require('../../Styles');
const Upcoming = require('./components/Upcoming');

// Getting dimensions of the device
const {height, width} = Dimensions.get('window');

// Type definition for component props.
type Props = {
  onEditSchedule: () => any,
};

class FindHome extends Component {

  /**
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    onEditSchedule: React.PropTypes.func.isRequired,
  };

  /**
   * Pass props to the parent component and bind methods.
   *
   * @param {Props} props properties passed from container to this component.
   */
  constructor(props: Props) {
    super(props);

    // Explicitly binding 'this' to all methods that need it
    (this:any)._editSchedule = this._editSchedule.bind(this);
    (this:any)._search = this._search.bind(this);
    (this:any)._showBuilding = this._showBuilding.bind(this);
  };

  /**
   * Opens the app scheduling screen so the user can update their schedule.
   */
  _editSchedule(): void {
    this.props.onEditSchedule();
  };

  /**
   * Searches through the buildings, professors, and classes
   *
   * @param {string} text text of the user's search.
   */
  _search(text: string) {
    // TODO: search for a building, class, or professor
    console.log('TODO: search for a building, class, or professor');
  };

  /**
   * Loads a view to display details about a building.
   *
   * @param {Building} object describing the building.
   */
  _showBuilding(building: Building): void {
    // TODO: display details about a building
    console.log('TODO: display details about a building');
  };

  /**
   * Renders the user's upcoming classes for the day and a list of buildings
   * on campus.
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

    return (
      <View style={_styles.container}>
        <SectionHeader
            sectionName={Translations['upcoming_classes']}
            sectionIcon={calendarIcon[1]}
            sectionIconClass={calendarIcon[0]}
            subtitleOnClick={this._editSchedule}
            subtitleName={Translations['edit']} />
        <View style={[_styles.content, {flex: 1}]}>
          <Upcoming onEdit={this._editSchedule} />
        </View>

        <SectionHeader
            sectionName={Translations['building_directory']}
            sectionIcon={'store'}
            sectionIconClass={'material'} />
        <View style={[_styles.content, {flex: 2}]}>
          <BuildingGrid showBuilding={this._showBuilding} />
        </View>
      </View>
    );
  };
};

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
