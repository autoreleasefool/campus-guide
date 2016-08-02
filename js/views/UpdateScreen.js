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
  Text,
  View,
} from 'react-native';

// Type definition for component props.
type Props = {
  navigator: ReactElement < any >,
};

// Imports
const Configuration = require('Configuration');
const Constants = require('Constants');
const Preferences = require('Preferences');

class UpdateScreen extends React.Component {

  /**
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    navigator: React.PropTypes.any.isRequired,
  };

  /**
   * Pass props and declares initial state.
   *
   * @param {Props} props properties passed from container to this component.
   */
  constructor(props: Props) {
    super(props);

    // Explicitly binding 'this' to all methods that need it
    (this:any)._returnToMain = this._returnToMain.bind(this);
    (this:any)._onUpdateBegin = this._onUpdateBegin.bind(this);
    (this:any)._onUpdateProgress = this._onUpdateProgress.bind(this);
  }

  /**
   * Displays a pop up when the application opens for the first time after the user selects their preferred language.
   */
  componentDidMount(): void {
    const self: UpdateScreen = this;
    Configuration.updateConfig(this._onUpdateBegin, this._onUpdateProgress)
        .then(this._returnToMain)
        .catch(err => {
          console.error('Failed to update configuration.', err);
          self._returnToMain();
        });
  }

  totalSize: number;

  /**
   * Return to the main screen.
   */
  _returnToMain(): void {
    this.props.navigator.push({id: Constants.Views.Main});
  }

  /**
   * Handles event for when update begins.
   *
   * @param {number} totalSize total size of the update to download
   */
  _onUpdateBegin(totalSize: number): void {
    this.totalSize = totalSize;
  }

  /**
   * Handles event for when progress update is received.
   *
   * @param {number} bytesWritten number of bytes downloaded so far
   * @param {number} totalSize total size of the update to download
   */
  _onUpdateProgress(bytesWritten: number, totalSize: number): void {
    console.log('Progress: ' + (bytesWritten / totalSize) + ' (' + bytesWritten + '/' + totalSize + ')');
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
      <View style={[_styles.container, {backgroundColor: backgroundColor}]}>
        <Text>{'Downloading'}</Text>
      </View>
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
