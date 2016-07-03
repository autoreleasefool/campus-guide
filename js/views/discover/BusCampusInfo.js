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
 * @file BusCampusInfo.js
 * @module BusCampusInfo
 * @description Displays the list of campuses with bus stop information.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  Alert,
  Clipboard,
  Image,
  Linking,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

// Type imports
import type {
  BusCampus,
  DefaultFunction,
} from '../../types';

// Type definition for component props.
type Props = {
  showCampus: DefaultFunction,
};

// Type definition for component state.
type State = {
  campuses: ?Array<BusCampus>,
};

// Imports
const Configuration = require('../../util/Configuration');
const Constants = require('../../Constants');
const ExternalUtils = require('../../util/ExternalUtils');
const LanguageUtils = require('../../util/LanguageUtils');
const Preferences = require('../../util/Preferences');
const SectionHeader = require('../../components/SectionHeader');

// Background colors for each campus
const campuscolors: Array<string> = [
  Constants.Colors.garnet,
  Constants.Colors.charcoalGrey,
  Constants.Colors.lightGrey,
  Constants.Colors.darkGrey,
];

class BusCampusInfo extends React.Component {

  /**
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    showCampus: React.PropTypes.func.isRequired,
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
    };
  }

  /**
   * If the campuses have not been loaded, then loads them.
   */
  componentDidMount(): void {
    if (this.state.campuses == null) {
      this._loadCampuses();
    }
  }

  /**
   * Opens the bus company website.
   *
   * @param {Object} Translations translations in the current language of certain text.
   */
  _goToBusWebsite(Translations: Object): void {
    ExternalUtils.openLink(
        LanguageUtils.getTranslatedLink(Preferences.getSelectedLanguage(), Configuration.getCityBusyInfo()),
        Translations,
        Linking,
        Alert,
        Clipboard);
  }

  /**
   * Loads a list of campus names and images representing them.
   */
  _loadCampuses(): void {
    const campuses: Array<BusCampus> = require('../../../assets/js/BusCampuses');
    this.setState({
      campuses: campuses,
    });
  }

  /**
   * Renders an image and title for each of the campuses which link to more detailed views.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement<any> {
    // Get current language for translations
    let Translations: Object;
    if (Preferences.getSelectedLanguage() === 'fr') {
      Translations = require('../../../assets/js/Translations.fr.js');
    } else {
      Translations = require('../../../assets/js/Translations.en.js');
    }

    const campusDisplayNames: Array<string> = [];
    const campusStopNames: Array<string> = [];
    const campusImages: Array<ReactElement<any>> = [];

    // If the campuses have been loaded, parse the data
    if (this.state.campuses == null) {
      return (
        <View style={_styles.container} />
      );
    } else {
      for (let i: number = 0; i < this.state.campuses.length; i++) {
        const campus: BusCampus = this.state.campuses[i];
        const displayName: string = LanguageUtils.getTranslatedName(Preferences.getSelectedLanguage(), campus) || '';
        const stopName: string = LanguageUtils.getEnglishName(campus) || '';

        campusDisplayNames.push(displayName);
        campusStopNames.push(stopName);
        campusImages.push(
          <Image
              resizeMode={'cover'}
              source={campus.image}
              style={_styles.campusImage} />
        );
      }
    }

    // Disabling no-magic-numbers rule for following JSX as the use of magic numbers is consistent and logical
    /* eslint-disable no-magic-numbers */

    return (
      <View style={_styles.container}>
        <TouchableOpacity
            style={_styles.campusContainer}
            onPress={() => this.props.showCampus(campusStopNames[0], campuscolors[0])}>
          <View style={{flex: 1, backgroundColor: campuscolors[0]}}>
            <SectionHeader sectionName={campusDisplayNames[0]} />
            {campusImages[0]}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
            style={_styles.campusContainer}
            onPress={() => this.props.showCampus(campusStopNames[1], campuscolors[1])}>
          <View style={{flex: 1, backgroundColor: campuscolors[1]}}>
            <SectionHeader sectionName={campusDisplayNames[1]} />
            {campusImages[1]}
          </View>
        </TouchableOpacity>
        <View style={_styles.campusContainer}>
          <TouchableOpacity
              style={_styles.campusContainer}
              onPress={() => this.props.showCampus(campusStopNames[2], campuscolors[2])}>
            <View style={{flex: 1, backgroundColor: campuscolors[2]}}>
              <SectionHeader sectionName={campusDisplayNames[2]} />
              {campusImages[2]}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
              style={_styles.campusContainer}
              onPress={() => this.props.showCampus(campusStopNames[3], campuscolors[3])}>
            <View style={{flex: 1, backgroundColor: campuscolors[3]}}>
              <SectionHeader sectionName={campusDisplayNames[3]} />
              {campusImages[3]}
            </View>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => this._goToBusWebsite(Translations || {})}>
          <SectionHeader
              backgroundOverride={Constants.Colors.garnet}
              sectionIcon={'md-open'}
              sectionIconClass={'ionicon'}
              sectionName={Translations.bus_company}
              subtitleIcon={'chevron-right'}
              subtitleIconClass={'material'} />
        </TouchableOpacity>
      </View>
    );

    /* eslint-enable no-magic-numbers */
  }
}

// Private styles for the component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
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

module.exports = BusCampusInfo;
