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
 * ShuttleInfo.js
 *
 * @description
 * Displays info about shuttles provided by the university across the
 * various campuses.
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
  StyleSheet,
  TouchableOpacity,
  View,
} = React;

// Imports
const Constants = require('../../Constants');
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

class ShuttleInfo extends Component {

  /**
   * Properties which the parent component should make available to this
   * component.
   */
  static propTypes = {
    showCampus: React.PropTypes.func.isRequired,
    showDetails: React.PropTypes.func.isRequired,
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
      details: null,
    };

    // Explicitly binding 'this' to all methods that need it
    this._loadCampusesAndDetails = this._loadCampusesAndDetails.bind(this);
  };

  /**
   * Loads a list of campus names and images representing them, as well as
   * details the user can view.
   */
  _loadCampusesAndDetails() {
    let campuses = require('../../../assets/static/js/ShuttleCampuses');
    let details = require('../../../assets/static/js/ShuttleDetails');
    this.setState({
      campuses: campuses,
      details: details,
    });
  };

  /**
   * Loads the campuses if they haven't been retrieved yet.
   */
  componentDidMount() {
    if (this.state.campuses == null) {
      this._loadCampusesAndDetails();
    }
  };

  /**
   * Renders views for each of the campuses which leads to screens with more
   * detailed information on them, as well as some other links the user
   * may find useful.
   *
   * @return the hierarchy of views to render.
   */
  render() {
    // Get current language
    let language = Preferences.getSelectedLanguage();

    // Get current language for translations
    let Translations = null;
    if (language === 'fr') {
      Translations = require('../../../assets/static/js/Translations.fr.js');
    } else {
      Translations = require('../../../assets/static/js/Translations.en.js');
    }

    let campusDisplayNames = [null, null, null, null];
    let campusStopNames = [null, null, null, null];
    let campusImages = [null, null, null, null];

    // If the campuses have been loaded, parse the data
    if (this.state.campuses != null && this.state.details != null) {
      for (let campus in this.state.campuses) {
        campusDisplayNames[campus] = LanguageUtils.getTranslatedName(language, this.state.campuses[campus]);
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
        <View style={_styles.campusContainer}>
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
        </View>
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
        {this.state.details.map((detail, index) => (
          <TouchableOpacity
              key={index}
              onPress={() => this.props.showDetails(
                LanguageUtils.getTranslatedName(language, detail),
                detail.image,
                LanguageUtils.getTranslatedDetails(language, detail),
                Constants.Colors.darkGrey
              )}>
            <SectionHeader
                sectionName={LanguageUtils.getTranslatedName(language, detail)}
                sectionIcon={detail.icon}
                sectionIconClass={detail.iconClass}
                subtitleIcon={'chevron-right'}
                subtitleIconClass={'material'} />
          </TouchableOpacity>
        ))}
      </View>
    );
  }
};

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
