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
 * BusCampuses.js
 *
 * @description
 * Displays the list of campuses with bus stop information.
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
  Alert,
  Clipboard,
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

// Import type definition for bus campus.
import type {
  BusCampus,
} from '../../Types';

// Background colors for each campus
const campuscolors: Array<string> = [
  Constants.Colors.garnet,
  Constants.Colors.charcoalGrey,
  Constants.Colors.lightGrey,
  Constants.Colors.darkGrey,
];

// Type definition for component props.
type Props = {
  showCampus: () => any,
};

// Type definition for component state.
type State = {
  campuses: ?Array<BusCampus>,
};

class BusCampuses extends Component {
  state: State;

  /**
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    showCampus: React.PropTypes.func.isRequired,
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
    }
  };

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
    const campuses: Array<BusCampus> = require('../../../assets/static/js/BusCampuses');
    this.setState({
      campuses: campuses,
    });
  };

  /**
   * If the campuses have not been loaded, then loads them.
   */
  componentDidMount(): void {
    if (this.state.campuses == null) {
      this._loadCampuses();
    }
  };

  /**
   * Renders an image and title for each of the campuses which link to more
   * detailed views.
   *
   * @return {ReactElement} the hierarchy of views to render.
   */
  render(): ReactElement {
    // Get current language for translations
    let Translations: ?Object = null;
    if (Preferences.getSelectedLanguage() === 'fr') {
      Translations = require('../../../assets/static/js/Translations.fr.js');
    } else {
      Translations = require('../../../assets/static/js/Translations.en.js');
    }

    let campusDisplayNames: Array<string> = [];
    let campusStopNames: Array<string> = [];
    let campusImages: Array<ReactElement> = [];

    // If the campuses have been loaded, parse the data
    if (this.state.campuses != null) {
      for (let i: number = 0; i < this.state.campuses.length; i++) {
        let campus: BusCampus = this.state.campuses[i];
        let displayName: string = LanguageUtils.getTranslatedName(Preferences.getSelectedLanguage(), campus) || '';
        let stopName: string = LanguageUtils.getEnglishName(campus) || '';

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
            onPress={() => this._goToBusWebsite(Translations || {})}>
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
