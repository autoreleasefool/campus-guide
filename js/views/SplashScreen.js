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
 * @file SplashScreen.js
 * @providesModule SplashScreen
 * @description Initial entry view for the application. Allows the user to select their preferred language on first run.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  AsyncStorage,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Type imports
import type {
  Language,
} from 'types';

// Type definition for component props.
type Props = {
  navigator: ReactClass< any >,
};

// Type definition for component state.
type State = {
  isLoading: boolean,
};

// Imports
const Configuration = require('Configuration');
const Constants = require('Constants');
const Preferences = require('Preferences');
const StatusBarUtils = require('StatusBarUtils');

// Require both language translations to display items in both languages
const TranslationsEn: Object = require('../../assets/js/Translations.en.js');
const TranslationsFr: Object = require('../../assets/js/Translations.fr.js');

class SplashScreen extends React.Component {

  /**
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    navigator: React.PropTypes.object.isRequired,
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
      isLoading: true,
    };

    (this:any)._selectLanguage = this._selectLanguage.bind(this);
  }

  /**
   * Calls the startup functions of the application.
   */
  componentDidMount(): void {
    const self: SplashScreen = this;

    StatusBarUtils.setLightStatusBarIOS(Platform, StatusBar, true);
    Preferences.loadInitialPreferences(AsyncStorage)
        .then(function onPreferencesLoaded() {
          if (Preferences.isLanguageSelected()) {
            self._checkConfiguration();
            // TODO: comment above and uncomment below to always show splash
            // screen
            // this.setState({
            //   isLoading: false
            // });
          } else {
            self.setState({
              isLoading: false,
            });
          }
        })
        .catch(err => console.error('Unable to load initial preferences in Splash', err));
  }

  /**
   * Checks to make sure a configuration is available and opens the next screen.
   * If no configuration is available, opens the Update screen. Otherwise, opens the Main screen.
   */
  _checkConfiguration(): void {
    const self: SplashScreen = this;
    Configuration.isAvailable()
        .then(available => {
          if (available) {
            self.props.navigator.replace({id: Constants.Views.Main});
          } else {
            self.props.navigator.replace({id: Constants.Views.Update});
          }
        })
        .catch(error => {
          console.error('Unable to determine if configuration is available. Assuming it is not.', error);
          self.props.navigator.replace({id: Constants.Views.Updaate});
        });
  }

  /**
   * Sets the language of the app and opens the next screen.
   *
   * @param {Language} language  one of 'en' or 'fr', to specify the language chosen by the user.
   */
  _selectLanguage(language: Language): void {
    Preferences.setSelectedLanguage(AsyncStorage, language);
    this._checkConfiguration();
  }

  /**
   * Displays two buttons to allow the user to select French or English.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement<any> {
    if (this.state.isLoading) {
      // While checking to see if a language has been selected, display an empty view
      return (
        <View style={{flex: 1, backgroundColor: Constants.Colors.garnet}} />
      );
    }

    return (
      <View style={_styles.container}>
        <TouchableOpacity
            activeOpacity={0.6}
            style={{flex: 1}}
            onPress={() => this._selectLanguage('en')}>
          <View style={{flex: 1, backgroundColor: Constants.Colors.garnet}}>
            <View style={_styles.languageContainer}>
              <Text style={_styles.languageSubtitle}>
                {TranslationsEn.continue_in}
              </Text>
              <View style={{padding: 5}}>
                <Text style={{color: 'white', fontSize: Constants.Text.Title}}>
                  {TranslationsEn.language}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
            activeOpacity={0.6}
            style={{flex: 1}}
            onPress={() => this._selectLanguage('fr')}>
          <View style={{flex: 1, backgroundColor: Constants.Colors.charcoalGrey}}>
            <View style={_styles.languageContainer}>
              <Text style={_styles.languageSubtitle}>
                {TranslationsFr.continue_in}
              </Text>
              <View style={{padding: 5}}>
                <Text style={_styles.languageTitle}>
                  {TranslationsFr.language}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#000000',
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
    color: 'white',
    fontSize: Constants.Text.Title,
  },
  languageSubtitle: {
    color: 'white',
    fontSize: Constants.Text.Medium,
  },
});

module.exports = SplashScreen;
