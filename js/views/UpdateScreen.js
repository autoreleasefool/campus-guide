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

// Type imports
import type {
  DownloadResult,
  DownloadBeginCallbackResult,
  DownloadProgressCallbackResult,
} from 'react-native-fs';

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
  }

  /**
   * Displays a pop up when the application opens for the first time after the user selects their preferred language.
   */
  componentDidMount(): void {
    const self: UpdateScreen = this;
    const callbacks = {
      onUpdateStart: this._onUpdateStart.bind(this),
      onDownloadStart: this._onDowloadStart.bind(this),
      onDownloadProgress: this._onDownloadProgress.bind(this),
      onDownloadComplete: this._onDownloadComplete.bind(this),
    };

    Configuration.isConfigUpdateAvailable()
        .then(available => {
          if (available) {
            Configuration.updateConfig(callbacks)
                .then(this._returnToMain)
                .catch(err => {
                  console.error('Failed to update configuration.', err);
                  self._returnToMain();
                });
          } else {
            self._returnToMain();
          }
        })
        .catch(err => {
          console.log('Failed configuration update check.', err);
        });
  }

  /** Size of the update, in bytes. */
  totalSize: number;

  /** Number of files in the update. */
  totalFiles: number;

  /** Total bytes written so far. */
  totalProgress: number;

  /**
   * Return to the main screen.
   */
  _returnToMain(): void {
    this.props.navigator.push({id: Constants.Views.Main});
  }

  /**
   * Handles event for when update starts.
   *
   * @param {number} totalSize  size of the update, in bytes
   * @param {number} totalFiles number of files to be updated
   */
  _onUpdateStart(totalSize: number, totalFiles: number): void {
    this.totalSize = totalSize;
    this.totalFiles = totalFiles;
    this.totalProgress = 0;
    console.log('ConfigUpdate: ---------------------');
    console.log(String.format('ConfigUpdate: Total size: {0} Total files: {1}', totalSize, totalFiles));
  }

  /**
   * Handles the results of a successful download.
   *
   * @param {DownloadResult} download results of the download
   */
  _onDownloadComplete(download: DownloadResult): void {
    this.totalProgress += download.bytesWritten;
    console.log('ConfigUpdate: File complete: ' + download.filename);
    console.log(String.format('ConfigUpdate: Progress: {0} ({1}/{2})', this.totalProgress / this.totalSize, this.totalProgress, this.totalSize));
  }

  /**
   * Provides details about each file being downloaded.
   *
   * @param {DownloadBeginCallbackResult} download details about the download
   */
  _onDowloadStart(download: DownloadBeginCallbackResult): void {

  }

  /**
   * Handles event for when progress update is received.
   *
   * @param {DownloadProgressCallbackResult} progress details about the progress of the download currently taking
   *                                                  place
   */
  _onDownloadProgress(progress: DownloadProgressCallbackResult): void {
    // console.log(String.format('ConfigUpdate: Progress: {0} ({1}/{2})', (this.totalProgress + progress.bytesWritten) / this.totalSize, (this.totalProgress + progress.bytesWritten), this.totalSize));
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
