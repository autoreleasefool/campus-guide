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
 * @file Splash.js
 * @description Initial entry view for the application. Allows the user to select their preferred language on first run.
 *
 * @flow
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
import * as actions from 'actions';

// Types
import type { Language, TransitInfo } from 'types';

// Imports
import Promise from 'promise';
import * as Configuration from 'Configuration';
import * as Constants from 'Constants';
import * as CoreTranslations from '../../../assets/json/CoreTranslations.json';
import * as Database from 'Database';
import * as Preferences from 'Preferences';
import * as Translations from 'Translations';

// Set to true to force splash screen
const alwaysShowSplash = false;

class Splash extends React.PureComponent {

  /**
   * Properties this component expects to be provided by its parent.
   */
  props: {
    language: Language,                                       // Language currently selected by user
    navigator: ReactClass < any >,                            // Parent navigator
    onLanguageSelect: (language: Language) => void,           // Changes the user's selected language
    setSchedule: (schedule: Object) => void,                  // Updates the user's schedule
    setTransit: (transitInfo: TransitInfo) => void,           // Updates the transit info object in the config
    setUniversity: (university: Object) => void,              // Updates the university object in the config
    updatePreferences: (preferences: Array < any >) => void,  // Updates the user's preferences
  };

  /**
   * Current state of the component.
   */
  state: {
    loading: boolean, // Indicates if the view is still loading
  };

  /**
   * Constructor.
   *
   * @param {props} props component props
   */
  constructor(props) {
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
        .then((university: Object) => {
          this.props.setUniversity(university);
          return Translations.loadTranslations(this.props.language);
        })
        .then(() => Configuration.getConfig('/transit.json'))
        .then((transitInfo: TransitInfo) => {
          this.props.setTransit(transitInfo);
          this.refs.Navigator.push({ id: 'main' });
        })
        .catch((err: any) => {
          console.log('Assuming configuration is not available.', err);
          this.props.navigator.push({ id: 'update' });
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
        .then((results: Array < any >) => {
          this.props.setSchedule(results[SCHEDULE] || {});
          this.props.updatePreferences(results);
          if (results[0] == null || (__DEV__ && alwaysShowSplash)) {
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
   * @returns {ReactElement<any>} the hierarchy of views to render
   */
  render(): ReactElement < any > {
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
    flex: 1,
    flexDirection: 'column',
    backgroundColor: Constants.Colors.primaryBackground,
  },
  englishContainer: {
    flex: 1,
    backgroundColor: Constants.Colors.primaryBackground,
  },
  frenchContainer: {
    flex: 1,
    backgroundColor: Constants.Colors.secondaryBackground,
  },
  languageContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageTitle: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Title,
  },
  languageSubtitle: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Subtitle,
  },
  languageTextContainer: {
    padding: 5,
  },
});

const mapStateToProps = (store) => {
  return {
    language: store.config.options.language,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onLanguageSelect: (language: Language) => dispatch(actions.updateConfiguration({ language, firstTime: true })),
    setSchedule: (schedule: Object) => dispatch(actions.loadSchedule(schedule)),
    setUniversity: (university: Object) => dispatch(actions.updateConfiguration({
      semesters: university.semesters,
      universityLocation: { latitude: university.lat, longitude: university.long },
      universityName: {
        name_en: Translations.getEnglishName(university) || '',
        name_fr: Translations.getFrenchName(university) || '',
      },
    })),
    setTransit: (transitInfo: TransitInfo) => dispatch(actions.updateConfiguration({
      transitInfo: {
        name_en: Translations.getEnglishName(transitInfo) || '',
        name_fr: Translations.getFrenchName(transitInfo) || '',
        link_en: Translations.getEnglishVariant('link', transitInfo) || '',
        link_fr: Translations.getFrenchVariant('link', transitInfo) || '',
      },
    })),
    updatePreferences: (preferences: Array < any >) => {

      /* eslint-disable no-magic-numbers */
      /* Order of these preferences determined by loadPreferences() order */

      dispatch(actions.updateConfiguration({
        language: preferences[0],
        currentSemester: preferences[1],
        prefersWheelchair: preferences[2],
        preferredTimeFormat: preferences[3],
        scheduleByCourse: preferences[4],
      }));

      /* eslint-enable no-magic-numbers */
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Splash);
