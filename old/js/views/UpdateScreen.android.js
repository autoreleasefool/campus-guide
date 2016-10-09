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
 * @file UpdateScreen.ios.js
 * @description Provides progress for app updates, on iOS devices.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// Imports
const Constants = require('Constants');
const CoreTranslations: Object = require('../../assets/json/CoreTranslations.json');
const Preferences = require('Preferences');
const ProgressBar = require('ProgressBarAndroid');
const UpdateScreenCommon = require('UpdateScreenCommon');

class UpdateScreen extends UpdateScreenCommon {

  /**
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    navigator: React.PropTypes.any.isRequired,
  };

  /**
   * Renders a set of messages regarding update progress so far.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render
   */
  _renderStatusMessages(): ReactElement < any > {
    const language = Preferences.getSelectedLanguage();

    const currentDownload: ?ReactElement < any > = (this.state.currentDownload == null)
        ? null
        :
      <Text style={_styles.progressText}>
        {(String:any).format(CoreTranslations[language].file_is_updating, this.state.currentDownload)}
      </Text>;

    return (
      <View style={_styles.container}>
        <ScrollView contentContainerStyle={{alignItems: 'center'}}>
          {this.state.filesDownloaded.map((filename, index) => (
            <Text
                key={index}
                style={_styles.progressText}>
              {(String:any).format(CoreTranslations[language].file_has_been_updated, filename)}
            </Text>
          ))}
          {currentDownload}
        </ScrollView>
      </View>
    );
  }

  /**
   * Renders a progress bar to indicate app updating
   *
   * @returns {ReactElement<any>} the hierarchy of views to render
   */
  render(): ReactElement < any > {
    if (!this.state.showUpdateProgress) {
      return super.render();
    }

    const language = Preferences.getSelectedLanguage();

    // Get background color for screen, and color for progress bar
    let backgroundColor = Constants.Colors.garnet;
    let foregroundColor = Constants.Colors.charcoalGrey;
    if (language === 'fr') {
      backgroundColor = Constants.Colors.charcoalGrey;
      foregroundColor = Constants.Colors.garnet;
    }

    return (
      <View style={[_styles.container, {backgroundColor: backgroundColor}]}>
        <View style={_styles.container}>
          <View style={_styles.container} />
          <ProgressBar
              indeterminate={false}
              progress={super._getProgress()}
              progressTintColor={foregroundColor}
              style={_styles.progress}
              styleAttr='Horizontal' />
          <Text style={_styles.downloading}>{CoreTranslations[language].downloading}</Text>
        </View>
        {this._renderStatusMessages()}
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  downloading: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Text.Medium,
    marginTop: Constants.Margins.Expanded,
    marginBottom: Constants.Margins.Expanded,
    alignSelf: 'center',
  },
  progress: {
    marginLeft: Constants.Margins.Expanded,
    marginRight: Constants.Margins.Expanded,
  },
  progressDetails: {
    color: Constants.Colors.secondaryWhiteText,
    fontSize: Constants.Text.Small,
    alignSelf: 'center',
    marginBottom: Constants.Margins.Expanded,
  },
  progressText: {
    color: Constants.Colors.secondaryWhiteText,
    fontSize: Constants.Text.Small,
  },
});

module.exports = UpdateScreen;
