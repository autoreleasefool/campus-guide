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
 * @file Main.js
 * @module MainScreen
 * @description Main navigational point of the application.
 * @flow
 *
 */
'use strict';

// React Native imports
import React from 'react';
import {
  Alert,
  StyleSheet,
  View,
} from 'react-native';

// Imports
const Constants = require('../Constants');
const Preferences = require('../util/Preferences');
const TabsView = require('../components/Tabs');

class MainScreen extends React.Component {

  /**
   * Pass props to parent and declare initial state.
   *
   * @param {{}} props properties passed from container to this component.
   */
  constructor(props: {}) {
    super(props);
  };

  /**
   * Displays a pop up when the application opens for the first time after the
   * user selects their preferred language.
   */
  componentDidMount(): void {
    // Get current language for translations
    let Translations: Object;
    if (Preferences.getSelectedLanguage() === 'fr') {
      Translations = require('../../assets/static/js/Translations.fr.js');
    } else {
      Translations = require('../../assets/static/js/Translations.en.js');
    }

    if (Preferences.isFirstTimeOpened()) {
      Alert.alert(
        Translations['only_once_title'],
        Translations['only_once_message'],
      );
    }
  };

  /**
   * Renders a tab bar to switch between the app's tabs, and a search bar.
   *
   * @return {ReactElement} the hierarchy of views to render.
   */
  render(): ReactElement {
    return (
      <View style={_styles.container}>
        <TabsView />
      </View>
    );
  };
};

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.Colors.garnet,
  },
});

// Expose component to app
module.exports = MainScreen;
