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
 * @file UpdateScreen.js
 * @providesModule UpdateScreen
 * @description Provides progress for app updates
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

// Imports
const Constants = require('Constants');
const Preferences = require('Preferences');

class UpdateScreen extends React.Component {

  /**
   * Displays a pop up when the application opens for the first time after the user selects their preferred language.
   */
  componentDidMount(): void {
    // TODO: wait for configuration
  }

  /**
   * Renders a progress bar to indicate app updating
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement< any > {
    const backgroundColor = Preferences.getSelectedLanguage() === 'en'
        ? Constants.Colors.garnet
        : Constants.Colors.charcoalGrey;

    return (
      <View style={[_styles.container, {backgroundColor: backgroundColor}]} />
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

module.exports = UpdateScreen;
