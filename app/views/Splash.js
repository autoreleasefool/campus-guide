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
 * Splash.js
 *
 * @description
 * Initial entry view for the application. Allows the user to select their
 * preferred language on first run.
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
  AsyncStorage,
  Component,
  Dimensions,
  Navigator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} = React;

// Imports
const Configuration = require('../util/Configuration');
const Constants = require('../Constants');
const Preferences = require('../util/Preferences');
const StatusBar = require('../util/StatusBar');
const Styles = require('../Styles');

// Require both language translations to display items in both languages
const TranslationsEn = require('../../assets/static/js/Translations.en.js');
const TranslationsFr = require('../../assets/static/js/Translations.fr.js');

// Languages which can be selected by the user.
const validLanguages = ['en', 'fr'];

class SplashScreen extends Component {

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
   * @param props properties passed from container to this component.
   */
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
    };

    // Explicitly binding 'this' to all methods that need it
    this._selectLanguage = this._selectLanguage.bind(this);
  };

  /**
   * Sets the language of the app and opens the main screen.
   *
   * @param language  one of 'en' or 'fr', to specify the language
   *                  chosen by the user.
   */
  _selectLanguage(language) {
    if (validLanguages.indexOf(language) < 0) {
      console.log('Invalid language:', language);
      return;
    }

    Preferences.setSelectedLanguage(language);
    this.props.navigator.push({id: Constants.Views.Main});
  };

  /**
   * Calls the startup functions of the application.
   */
  componentDidMount() {
    const self = this;

    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    StatusBar.setLightStatusBarIOS(true);
    Configuration.loadConfiguration().done(function() {
      Preferences.loadInitialPreferences().done(function() {
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
      });
    });
  };

  /**
   * Displays two buttons to allow the user to select French or English.
   *
   * @return the hierarchy of views to render.
   */
  render() {
    // Get the width and height of the screen
    const {height, width} = Dimensions.get('window');
    const onlyOnceTextWidth = Math.min(width, 400);
    const onlyOnceTextLeft = (width - onlyOnceTextWidth) / 2;

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
            onPress={() => this._selectLanguage('en')}
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
            onPress={() => this._selectLanguage('fr')}
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
