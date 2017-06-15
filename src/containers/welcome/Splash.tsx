/**
 *
 * @license
 * Copyright (C) 2016-2017 Joseph Roque
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
 * @created 2016-10-08
 * @file Splash.tsx
 * @description Initial entry view for the application. Allows the user to select their
 *              preferred language on first run.
 */
'use strict';

// React imports
import React from 'react';
import {
  AsyncStorage,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

// Redux imports
import { connect } from 'react-redux';
import * as actions from '../../actions';

// Imports
import * as Configuration from '../../util/Configuration';
import * as Constants from '../../constants';
import * as Database from '../../util/Database';
import * as Preferences from '../../util/Preferences';
import * as Translations from '../../util/Translations';
const CoreTranslations = require('../../../assets/json/CoreTranslations');

// Types
import { Language } from '../../util/Translations';
import { TransitInfo } from '../../../typings/transit';

interface Props {
  language: Language;                           // Language currently selected by user
  navigator: any;                               // Parent navigator
  onLanguageSelect(language: Language): void;   // Changes the user's selected language
  setSchedule(schedule: object): void;          // Updates the user's schedule
  setTransit(transitInfo: TransitInfo): void;   // Updates the transit info object in the config
  setUniversity(university: object): void;      // Updates the university object in the config
  updatePreferences(preferences: any[]): void;  // Updates the user's preferences
}

interface State {
  loading: boolean; // Indicates if the view is still loading
}

// Set to true to force splash screen
const alwaysShowSplash = false;

class Splash extends React.PureComponent<Props, State> {

  /**
   * Constructor.
   *
   * @param {Props} props component props
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  /**
   * Checks if a language has been selected, and moves to the next screen if so.
   */
  componentDidMount(): void {
    this._loadPreferences();
  }

  /**
   * Loads the downloaded base configuration and updates the redux store.
   */
  _checkConfiguration(): void {
    Configuration.init()
        .then(() => Configuration.getConfig('/university.json'))
        .then((university: object) => {
          this.props.setUniversity(university);

          return Translations.loadTranslations(this.props.language);
        })
        .then(() => Configuration.getConfig('/transit.json'))
        .then((transitInfo: TransitInfo) => {
          this.props.setTransit(transitInfo);
          (this.refs.Navigator as any).push({ id: 'main' });
        })
        .catch((err: any) => {
          console.log('Assuming configuration is not available.', err);
          (this.refs.Navigator as any).push({ id: 'update' });
        });
  }

  /**
   * Loads the user's saved preferences and updates the redux store.
   */
  _loadPreferences(): void {
    const SCHEDULE = 5; // Corresponds to index of Database.getSchedule() below

    Promise.all([
      Preferences.getSelectedLanguage(AsyncStorage),
      Preferences.getCurrentSemester(AsyncStorage),
      Preferences.getPrefersWheelchair(AsyncStorage),
      Preferences.getPreferredTimeFormat(AsyncStorage),
      Preferences.getPreferScheduleByCourse(AsyncStorage),
      Database.getSchedule(),
    ])
        .then((results: any[]) => {
          this.props.setSchedule(results[SCHEDULE] || {});
          this.props.updatePreferences(results);
          if (results[0] == undefined || (__DEV__ && alwaysShowSplash)) {
            // Language has not been selected
            this.setState({
              loading: false,
            });
          } else {
            // Language is selected, check configuration
            this._checkConfiguration();
          }
        })
        .catch((err: any) => console.error('Unable to load initial preferences', err));
  }

  /**
   * Handles the event when user selects a language.
   *
   * @param {Language} language the selected language
   */
  _onLanguageSelect(language: Language): void {
    this.props.onLanguageSelect(language);
    this._checkConfiguration();
  }

  /**
   * Displays two buttons to allow the user to select French or English.
   *
   * @returns {JSX.Element} the hierarchy of views to render
   */
  render(): JSX.Element {
    if (this.state.loading) {
      return (
        <View style={_styles.container} />
      );
    }

    return (
      <View style={_styles.container}>
        <TouchableWithoutFeedback
            style={{ flex: 1 }}
            onPress={this._onLanguageSelect.bind(this, 'en')}>
          <View style={_styles.englishContainer}>
            <View style={_styles.languageContainer}>
              <Text style={_styles.languageSubtitle}>
                {CoreTranslations.en.continue_in}
              </Text>
              <View style={_styles.languageTextContainer}>
                <Text style={_styles.languageTitle}>
                  {CoreTranslations.en.language}
                </Text>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback
            style={{ flex: 1 }}
            onPress={this._onLanguageSelect.bind(this, 'fr')}>
          <View style={_styles.frenchContainer}>
            <View style={_styles.languageContainer}>
              <Text style={_styles.languageSubtitle}>
                {CoreTranslations.fr.continue_in}
              </Text>
              <View style={_styles.languageTextContainer}>
                <Text style={_styles.languageTitle}>
                  {CoreTranslations.fr.language}
                </Text>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    backgroundColor: Constants.Colors.primaryBackground,
    flex: 1,
    flexDirection: 'column',
  },
  englishContainer: {
    backgroundColor: Constants.Colors.primaryBackground,
    flex: 1,
  },
  frenchContainer: {
    backgroundColor: Constants.Colors.secondaryBackground,
    flex: 1,
  },
  languageContainer: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  languageSubtitle: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Subtitle,
  },
  languageTextContainer: {
    padding: 5,
  },
  languageTitle: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Title,
  },
});

const mapStateToProps = (store: any): any => {
  return {
    language: store.config.options.language,
  };
};

const mapDispatchToProps = (dispatch: any): any => {
  return {
    onLanguageSelect:
        (language: Language): void => dispatch(actions.updateConfiguration({ language, firstTime: true })),
    setSchedule: (schedule: object): void => dispatch(actions.loadSchedule(schedule)),
    setTransit: (transitInfo: TransitInfo): void => dispatch(actions.updateConfiguration({
      transitInfo: {
        link_en: Translations.getEnglishLink(transitInfo) || '',
        link_fr: Translations.getFrenchLink(transitInfo) || '',
        name_en: Translations.getEnglishName(transitInfo) || '',
        name_fr: Translations.getFrenchName(transitInfo) || '',
      },
    })),
    setUniversity: (university: any): void => dispatch(actions.updateConfiguration({
      semesters: university.semesters,
      universityLocation: { latitude: university.latitude, longitude: university.longitude },
      universityName: {
        name_en: Translations.getEnglishName(university) || '',
        name_fr: Translations.getFrenchName(university) || '',
      },
    })),
    updatePreferences: (preferences: any[]): void => {

      /* tslint:disable no-magic-numbers */
      /* Order of these preferences determined by loadPreferences() order */

      dispatch(actions.updateConfiguration({
        currentSemester: preferences[1],
        language: preferences[0],
        preferredTimeFormat: preferences[3],
        prefersWheelchair: preferences[2],
        scheduleByCourse: preferences[4],
      }));

      /* eslint-enable no-magic-numbers */
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Splash) as any;
