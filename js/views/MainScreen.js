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
 * @file MainScreen.js
 * @providesModule MainScreen
 * @description Main navigational point of the application.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  Alert,
  StyleSheet,
  View,
} from 'react-native';

// Imports
const Configuration = require('Configuration');
const Constants = require('Constants');
const Preferences = require('Preferences');
const TabsView = require('Tabs');

class MainScreen extends React.Component {

  /**
   * Displays a pop up when the application opens for the first time after the user selects their preferred language.
   */
  componentDidMount(): void {
    // Get current language for translations
    let Translations: Object;
    if (Preferences.getSelectedLanguage() === 'fr') {
      Translations = require('../../assets/js/Translations.fr.js');
    } else {
      Translations = require('../../assets/js/Translations.en.js');
    }

    if (Preferences.isFirstTimeOpened()) {
      Alert.alert(
        Translations.only_once_title,
        Translations.only_once_message,
      );
    }

    const self: MainScreen = this;
    Configuration.isConfigUpdateAvailable()
        .then(available => {
          if (available) {
            Alert.alert(
              Translations.update_available_title,
              Translations.update_available_msg,
              [
                {text: Translations.cancel, style: 'cancel'},
                {text: Translations.update, onPress: () => self.props.navigator.push({id: Constants.Views.Update})},
              ]
            );
          }
        })
        .catch(err => console.error('Error checking for configuration.', err));
  }

  /**
   * Renders a tab bar to switch between the app's tabs, and a search bar.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement<any> {
    return (
      <View style={_styles.container}>
        <TabsView />
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.Colors.garnet,
  },
});

module.exports = MainScreen;
