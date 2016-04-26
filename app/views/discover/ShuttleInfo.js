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
 * @external
 * @flow
 *
 */
'use strict';

// React Native imports
const React = require('react-native');
const {
  Component,
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} = React;

// Import type definitions
import type {
  BusCampus,
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
  Constants.Colors.darkGrey
];

// Type definition for component props.
type Props = {
  showCampus: () => any,
  showDetails: () => any,
};

// Type definition for component state.
type State = {
  campuses: ?Array<BusCampus>,
  details: ?Array<ShuttleDetails>,
};

class ShuttleInfo extends Component {
  state: State;

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
  };

  /**
   * Loads a list of campus names and images representing them, as well as
   * details the user can view.
   */
  _loadCampusesAndDetails(): void {
    let campuses: Array<BusCampus> = require('../../../assets/static/js/ShuttleCampuses');
    let details: Array<ShuttleDetails> = require('../../../assets/static/js/ShuttleDetails');
    this.setState({
      campuses: campuses,
      details: details,
    });
  };

  /**
   * Loads the campuses if they haven't been retrieved yet.
   */
  componentDidMount(): void {
    if (this.state.campuses == null) {
      this._loadCampusesAndDetails();
    }
  };

  /**
   * Renders views for each of the campuses which leads to screens with more
   * detailed information on them, as well as some other links the user
   * may find useful.
   *
   * @return {ReactElement} the hierarchy of views to render.
   */
  render(): ReactElement {
    // Get current language
    let language: LanguageString = Preferences.getSelectedLanguage();
    let platform: PlatformString = Platform.OS;

    // Get current language for translations
    let Translations: Object;
    if (language === 'fr') {
      Translations = require('../../../assets/static/js/Translations.fr.js');
    } else {
      Translations = require('../../../assets/static/js/Translations.en.js');
    }

    let campusDisplayNames: Array<string> = [];
    let campusStopNames: Array<string> = [];
    let campusImages: Array<ReactElement> = [];

    // If the campuses have been loaded, parse the data
    if (this.state.campuses != null && this.state.details != null) {
      for (let i = 0; i < this.state.campuses.length; i++) {
        let campus = this.state.campuses[i];
        let displayName: string = LanguageUtils.getTranslatedName(language, campus) || '';
        let stopName = LanguageUtils.getEnglishName(campus) || '';

        campusDisplayNames.push(displayName);
        campusStopNames.push(stopName);
        campusImages.push(
          <Image
              style={_styles.campusImage}
              resizeMode={'cover'}
              source={campus.image} />
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
              onPress={() => this.props.showCampus(campusStopNames[0], campusColors[0])}
              style={_styles.campusContainer}>
            <View style={{flex: 1, backgroundColor: campusColors[0]}}>
              <SectionHeader sectionName={campusDisplayNames[0]} />
              {campusImages[0]}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
              onPress={() => this.props.showCampus(campusStopNames[1], campusColors[1])}
              style={_styles.campusContainer}>
            <View style={{flex: 1, backgroundColor: campusColors[1]}}>
              <SectionHeader sectionName={campusDisplayNames[1]} />
              {campusImages[1]}
            </View>
          </TouchableOpacity>
        </View>
        <View style={_styles.campusContainer}>
          <TouchableOpacity
              onPress={() => this.props.showCampus(campusStopNames[2], campusColors[2])}
              style={_styles.campusContainer}>
            <View style={{flex: 1, backgroundColor: campusColors[2]}}>
              <SectionHeader sectionName={campusDisplayNames[2]} />
              {campusImages[2]}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
              onPress={() => this.props.showCampus(campusStopNames[3], campusColors[3])}
              style={_styles.campusContainer}>
            <View style={{flex: 1, backgroundColor: campusColors[3]}}>
              <SectionHeader sectionName={campusDisplayNames[3]} />
              {campusImages[3]}
            </View>
          </TouchableOpacity>
        </View>
        {this.state.details.map((detail, index) => {
          let icon: DefaultIcon = DisplayUtils.getPlatformIcon(platform, detail)
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
                  sectionName={LanguageUtils.getTranslatedName(language, detail)}
                  sectionIcon={icon.name}
                  sectionIconClass={icon.class}
                  subtitleIcon={'chevron-right'}
                  subtitleIconClass={'material'} />
            </TouchableOpacity>
          );
        })}
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
