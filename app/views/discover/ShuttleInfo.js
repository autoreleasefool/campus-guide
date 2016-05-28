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
 * @file ShuttleInfo.js
 * @module ShuttleInfo
 * @description Displays info about shuttles provided by the university across the
 *              various campuses.
 * @flow
 *
 */
'use strict';

// React Native imports
import React from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

// Import type definitions
import type {
  BusCampus,
  DefaultFunction,
  DefaultIcon,
  LanguageString,
  PlatformString,
  ShuttleDetails,
} from '../../Types';

// Imports
const Constants = require('../../Constants');
const DisplayUtils = require('../../util/DisplayUtils');
const LanguageUtils = require('../../util/LanguageUtils');
const Preferences = require('../../util/Preferences');
const SectionHeader = require('../../components/SectionHeader');

// Background colors for each campus
const campusColors: Array<string> = [
  Constants.Colors.garnet,
  Constants.Colors.charcoalGrey,
  Constants.Colors.lightGrey,
  Constants.Colors.darkGrey,
];

// Type definition for component props.
type Props = {
  showCampus: DefaultFunction,
  showDetails: DefaultFunction,
};

// Type definition for component state.
type State = {
  campuses: ?Array<BusCampus>,
  details: ?Array<ShuttleDetails>,
};

class ShuttleInfo extends React.Component {

  /**
   * Properties which the parent component should make available to this
   * component.
   */
  static propTypes = {
    showCampus: React.PropTypes.func.isRequired,
    showDetails: React.PropTypes.func.isRequired,
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
      campuses: null,
      details: null,
    };

    // Explicitly binding 'this' to all methods that need it
    (this:any)._loadCampusesAndDetails = this._loadCampusesAndDetails.bind(this);
  }

  /**
   * Loads the campuses if they haven't been retrieved yet.
   */
  componentDidMount(): void {
    if (this.state.campuses == null) {
      this._loadCampusesAndDetails();
    }
  }

  /**
   * Loads a list of campus names and images representing them, as well as
   * details the user can view.
   */
  _loadCampusesAndDetails(): void {
    const shuttleCampuses: Array<BusCampus> = require('../../../assets/static/js/ShuttleCampuses');
    const shuttleDetails: Array<ShuttleDetails> = require('../../../assets/static/js/ShuttleDetails');
    this.setState({
      campuses: shuttleCampuses,
      details: shuttleDetails,
    });
  }

  /**
   * Renders views for each of the campuses which leads to screens with more
   * detailed information on them, as well as some other links the user
   * may find useful.
   *
   * @returns {ReactElement} the hierarchy of views to render.
   */
  render(): ReactElement {
    // Get current language
    const language: LanguageString = Preferences.getSelectedLanguage();
    const platform: PlatformString = Platform.OS;

    const campusDisplayNames: Array<string> = [];
    const campusStopNames: Array<string> = [];
    const campusImages: Array<ReactElement> = [];

    // If the campuses have been loaded, parse the data
    if (this.state.campuses != null && this.state.details != null) {
      for (let i = 0; i < this.state.campuses.length; i++) {
        const campus = this.state.campuses[i];
        const displayName: string = LanguageUtils.getTranslatedName(language, campus) || '';
        const stopName = LanguageUtils.getEnglishName(campus) || '';

        campusDisplayNames.push(displayName);
        campusStopNames.push(stopName);
        campusImages.push(
          <Image
              resizeMode={'cover'}
              source={campus.image}
              style={_styles.campusImage} />
        );
      }
    } else {
      return (
        <View style={_styles.container} />
      );
    }

    // Disabling no-magic-numbers rule for following JSX as the use of magic numbers is consistent and logical
    /* eslint-disable no-magic-numbers */

    return (
      <View style={_styles.container}>
        <View style={_styles.campusContainer}>
          <TouchableOpacity
              style={_styles.campusContainer}
              onPress={() => this.props.showCampus(campusStopNames[0], campusColors[0])}>
            <View style={{flex: 1, backgroundColor: campusColors[0]}}>
              <SectionHeader sectionName={campusDisplayNames[0]} />
              {campusImages[0]}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
              style={_styles.campusContainer}
              onPress={() => this.props.showCampus(campusStopNames[1], campusColors[1])}>
            <View style={{flex: 1, backgroundColor: campusColors[1]}}>
              <SectionHeader sectionName={campusDisplayNames[1]} />
              {campusImages[1]}
            </View>
          </TouchableOpacity>
        </View>
        <View style={_styles.campusContainer}>
          <TouchableOpacity
              style={_styles.campusContainer}
              onPress={() => this.props.showCampus(campusStopNames[2], campusColors[2])}>
            <View style={{flex: 1, backgroundColor: campusColors[2]}}>
              <SectionHeader sectionName={campusDisplayNames[2]} />
              {campusImages[2]}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
              style={_styles.campusContainer}
              onPress={() => this.props.showCampus(campusStopNames[3], campusColors[3])}>
            <View style={{flex: 1, backgroundColor: campusColors[3]}}>
              <SectionHeader sectionName={campusDisplayNames[3]} />
              {campusImages[3]}
            </View>
          </TouchableOpacity>
        </View>
        {this.state.details.map((detail, index) => {
          const icon: DefaultIcon = DisplayUtils.getPlatformIcon(platform, detail)
              || {name: 'help-outline', class: 'material'};

          return (
            <TouchableOpacity
                key={index}
                onPress={() => this.props.showDetails(
                  LanguageUtils.getTranslatedName(language, detail),
                  detail.image,
                  LanguageUtils.getTranslatedDetails(language, detail),
                  Constants.Colors.darkGrey
                )}>
              <SectionHeader
                  sectionIcon={icon.name}
                  sectionIconClass={icon.class}
                  sectionName={LanguageUtils.getTranslatedName(language, detail)}
                  subtitleIcon={'chevron-right'}
                  subtitleIconClass={'material'} />
            </TouchableOpacity>
          );
        })}
      </View>
    );

    /* eslint-enable no-magic-numbers */
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: Constants.Colors.darkGrey,
  },
  campusContainer: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  campusImage: {
    flex: 1,
    width: null,
    height: null,
  },
});

// Expose component to app
module.exports = ShuttleInfo;
