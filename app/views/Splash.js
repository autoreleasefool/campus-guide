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
 * @file Splash.js
 * @module SplashScreen
 * @description Initial entry view for the application. Allows the user to select their
 *              preferred language on first run.
 * @flow
 *
 */
'use strict';

// React Native imports
import React from 'react';
import {
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';

// Import type definitions.
import type {
  LanguageString,
} from '../Types';

// Imports
const Configuration = require('../util/Configuration');
const Constants = require('../Constants');
const Preferences = require('../util/Preferences');
const StatusBarUtils = require('../util/StatusBarUtils');
const Styles = require('../Styles');

// Require both language translations to display items in both languages
const TranslationsEn: Object = require('../../assets/static/js/Translations.en.js');
const TranslationsFr: Object = require('../../assets/static/js/Translations.fr.js');

// Type definition for component props.
type Props = {
  navigator: ReactClass,
};

// Type definition for component state.
type State = {
  isLoading: boolean,
};

class SplashScreen extends React.Component {
  state: State;

  /**
   * Properties which the parent component should make available to this
   * component.
   */
  static propTypes = {
    navigator: React.PropTypes.object.isRequired,
  };

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
  };

  /**
   * Sets the language of the app and opens the main screen.
   *
   * @param {LanguageString} language  one of 'en' or 'fr', to specify the language
   *                  chosen by the user.
   */
  _selectLanguage(language: LanguageString): void {
    Preferences.setSelectedLanguage(language);
    this.props.navigator.push({id: Constants.Views.Main});
  };

  /**
   * Calls the startup functions of the application.
   */
  componentDidMount(): void {
    const self: SplashScreen = this;

    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    StatusBarUtils.setLightStatusBarIOS(Platform, StatusBar, true);
    Configuration.loadConfiguration().then(function() {
      Preferences.loadInitialPreferences().then(function() {
        if (!Preferences.isLanguageSelected()) {
          self.setState({
            isLoading: false,
          });
        } else {
          // If a lanuage has been selected, remove this language select
          // screen, open the main screen
          self.props.navigator.replace({id: 2});
          // TODO: comment above and uncomment below to always show splash
          // screen
          // this.setState({
          //   isLoading: false
          // });
        }
      }).catch(err => console.error('Unable to load initial preferences in Splash', err));
    }).catch(err => console.error('Unable to load app configuration in Splash', err));
  };

  /**
   * Displays two buttons to allow the user to select French or English.
   *
   * @return {ReactElement} the hierarchy of views to render.
   */
  render(): ReactElement {
    // Get the width and height of the screen
    const {height, width} = Dimensions.get('window');
    const onlyOnceTextWidth: number = Math.min(width, 400);
    const onlyOnceTextLeft: number = (width - onlyOnceTextWidth) / 2;

    if (this.state.isLoading) {
      // While checking to see if a language has been selected,
      // display an empty view
      return (
        <View style={{flex: 1, backgroundColor: Constants.Colors.garnet}}></View>
      );
    }

    return (
      <View style = {_styles.container}>
        <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => this._selectLanguage.bind(this, 'en')}
            style={{flex: 1}}>
          <View style={{flex: 1, backgroundColor: Constants.Colors.garnet}}>
            <View style={_styles.languageContainer}>
              <Text style={[Styles.mediumText, {color: 'white'}]}>
                {TranslationsEn['continue_in']}
              </Text>
              <View style={{padding: 5}}>
                <Text style={[Styles.titleText, {color: 'white'}]}>
                  {TranslationsEn['language']}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => this._selectLanguage.bind(this, 'fr')}
            style={{flex: 1}}>
          <View style={{flex: 1, backgroundColor: Constants.Colors.charcoalGrey}}>
            <View style={_styles.languageContainer}>
              <Text style={[Styles.mediumText, {color: 'white'}]}>
                {TranslationsFr['continue_in']}
              </Text>
              <View style={{padding: 5}}>
                <Text style={[Styles.titleText, {color: 'white'}]}>
                  {TranslationsFr['language']}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };
};

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
});

// Expose component to app
module.exports = SplashScreen;
