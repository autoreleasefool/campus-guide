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
 * BusCampuses.js
 *
 * @description
 * Displays the list of campuses with bus stop information.
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
  Image,
  Linking,
  StyleSheet,
  TouchableOpacity,
  View,
} = React;

// Imports
const Configuration = require('../../util/Configuration');
const Constants = require('../../Constants');
const ExternalUtils = require('../../util/ExternalUtils');
const LanguageUtils = require('../../util/LanguageUtils');
const Preferences = require('../../util/Preferences');
const SectionHeader = require('../../components/SectionHeader');

// Background colors for each campus
const campuscolors = [
  Constants.Colors.garnet,
  Constants.Colors.charcoalGrey,
  Constants.Colors.lightGrey,
  Constants.Colors.darkGrey
];

class BusCampuses extends Component {

  /**
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    showCampus: React.PropTypes.func.isRequired,
  };

  /**
   * Pass props and declares initial state.
   *
   * @param props properties passed from container to this component.
   */
  constructor(props) {
    super(props);

    this.state = {
      campuses: null,
    }
  };

  /**
   * Opens the bus company website.
   * @param Translations translations in the current language of certain text.
   */
  _goToBusWebsite(Translations) {
    ExternalUtils.openLink(Linking,
        LanguageUtils.getTranslatedLink(Preferences.getSelectedLanguage(), Configuration.getCityBusyInfo()),
        Translations);
  }

  /**
   * Loads a list of campus names and images representing them.
   */
  _loadCampuses() {
    let campuses = require('../../../assets/static/js/BusCampuses');
    this.setState({
      campuses: campuses,
    });
  };

  /**
   * If the campuses have not been loaded, then loads them.
   */
  componentDidMount() {
    if (this.state.campuses == null) {
      this._loadCampuses();
    }
  };

  /**
   * Renders an image and title for each of the campuses which link to more
   * detailed views.
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

    let campusDisplayNames = [null, null, null, null];
    let campusStopNames = [null, null, null, null];
    let campusImages = [null, null, null, null];

    // If the campuses have been loaded, parse the data
    if (this.state.campuses != null) {
      for (let campus in this.state.campuses) {
        campusDisplayNames[campus] = LanguageUtils.getTranslatedName(Preferences.getSelectedLanguage(), this.state.campuses[campus]);
        campusStopNames[campus] = LanguageUtils.getEnglishName(this.state.campuses[campus]);
        campusImages[campus] = (
          <Image
              style={_styles.campusImage}
              resizeMode={'cover'}
              source={this.state.campuses[campus].image} />
        );
      }
    } else {
      return (
        <View style={_styles.container} />
      );
    }

    return (
      <View style={_styles.container}>
        <TouchableOpacity
            onPress={() => this.props.showCampus(campusStopNames[0], campuscolors[0])}
            style={_styles.campusContainer}>
          <View style={{flex: 1, backgroundColor: campuscolors[0]}}>
            <SectionHeader sectionName={campusDisplayNames[0]} />
            {campusImages[0]}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
            onPress={() => this.props.showCampus(campusStopNames[1], campuscolors[1])}
            style={_styles.campusContainer}>
          <View style={{flex: 1, backgroundColor: campuscolors[1]}}>
            <SectionHeader sectionName={campusDisplayNames[1]} />
            {campusImages[1]}
          </View>
        </TouchableOpacity>
        <View style={_styles.campusContainer}>
          <TouchableOpacity
              onPress={() => this.props.showCampus(campusStopNames[2], campuscolors[2])}
              style={_styles.campusContainer}>
            <View style={{flex: 1, backgroundColor: campuscolors[2]}}>
              <SectionHeader sectionName={campusDisplayNames[2]} />
              {campusImages[2]}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
              onPress={() => this.props.showCampus(campusStopNames[3], campuscolors[3])}
              style={_styles.campusContainer}>
            <View style={{flex: 1, backgroundColor: campuscolors[3]}}>
              <SectionHeader sectionName={campusDisplayNames[3]} />
              {campusImages[3]}
            </View>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
            onPress={() => this._goToBusWebsite(Translations)}>
          <SectionHeader
              sectionName={Translations['bus_company']}
              sectionIcon={'android-open'}
              sectionIconClass={'ionicon'}
              subtitleIcon={'chevron-right'}
              subtitleIconClass={'material'}
              backgroundOverride={Constants.Colors.garnet} />
        </TouchableOpacity>
      </View>
    );
  };
};

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

// Expose component to app
module.exports = BusCampuses;
