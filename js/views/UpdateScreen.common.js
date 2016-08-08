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
 * @file UpdateScreen.common.js
 * @providesModule UpdateScreenCommon
 * @description Provides progress for app updates
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  Alert,
  NetInfo,
  View,
} from 'react-native';

// Type definition for component props.
type Props = {
  navigator: ReactElement < any >,
};

// Type definition for component state.
type State = {
  currentDownload: ?String,
  filesDownloaded: Array < String >,
  intermediateProgress: number,
  totalFiles: number,
  totalProgress: number,
  totalSize: number,
};

// Imports
const Configuration = require('Configuration');
const Constants = require('Constants');
const emptyFunction = require('empty/function');
const Preferences = require('Preferences');

// Amount of time to wait before checking for connection, to ensure connection event listener is registered
const CONNECTION_CHECK_TIMEOUT = 250;

class UpdateScreenCommon extends React.Component {

  /**
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    navigator: React.PropTypes.any.isRequired,
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
      currentDownload: null,
      filesDownloaded: [],
      intermediateProgress: 0,
      totalFiles: 0,
      totalProgress: 0,
      totalSize: 0,
    };

    // Explicitly binding 'this' to all methods that need it
    (this:any)._beginUpdate = this._beginUpdate.bind(this);
    (this:any)._checkConnection = this._checkConnection.bind(this);
    (this:any)._notifyConnectionFailed = this._notifyConnectionFailed.bind(this);
    (this:any)._returnToMain = this._returnToMain.bind(this);
  }

  /**
   * Displays a pop up when the application opens for the first time after the user selects their preferred language.
   */
  componentDidMount(): void {
    // Must set event listener for NetInfo.isConnected.fetch to work
    // https://github.com/facebook/react-native/issues/8469
    NetInfo.isConnected.addEventListener('change', emptyFunction);
    this._checkConnection();
  }

  /**
   * Removes the connection listener for NetInfo.
   */
  componentWillUnmount(): void {
    NetInfo.isConnected.removeEventListener('change', emptyFunction);
  }

  /**
   * Checks to see if a new configuration update is available and, if so, begins downloading.
   */
  _beginUpdate(): void {
    const self: UpdateScreenCommon = this;
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

  /**
   * Checks for an Internet connection and, if one is available, starts the update.
   */
  _checkConnection(): void {
    const self: UpdateScreenCommon = this;
    setTimeout(() => {
      NetInfo.isConnected.fetch()
          .then(isConnected => {
            console.log('here: ' + isConnected);
            if (isConnected) {
              self._beginUpdate();
            } else {
              self._notifyConnectionFailed();
            }
          })
          .catch(self._notifyConnectionFailed);
    }, CONNECTION_CHECK_TIMEOUT);
  }

  /**
   * Returns the total percent of the progress completed.
   *
   * @returns {number} a value from 0 to 1
   */
  _getProgress(): number {
    return (this.state.totalProgress + this.state.intermediateProgress) / this.state.totalSize;
  }

  _notifyConnectionFailed(): void {
    console.log('failed');
    // Get current language for translations
    let Translations: Object;
    if (Preferences.getSelectedLanguage() === 'fr') {
      Translations = require('../../assets/js/Translations.fr.js');
    } else {
      Translations = require('../../assets/js/Translations.en.js');
    }

    Configuration.init()
        .then(available => {
          if (available) {
            Alert.alert(
              Translations.no_internet,
              Translations.no_internet_config_available,
              [
                {text: Translations.ok, onPress: () => this.props.navigator.resetTo({id: Constants.Views.Main})},
              ],
            );
          } else {
            Alert.alert(
              Translations.no_internet,
              Translations.no_internet_config_unavailable,
              [
                {text: Translations.retry, onPress: this._checkConnection},
              ],
            );
          }
        })
        .catch(() => {
          Alert.alert(
            Translations.no_internet,
            Translations.no_internet_config_unavailable,
            [
              {text: Translations.retry, onPress: this._checkConnection},
            ],
          );
        });
  }

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
    this.setState({
      totalFiles: totalFiles,
      totalProgress: 0,
      totalSize: totalSize,
    });
  }

  /**
   * Handles the results of a successful download.
   *
   * @param {Object} download results of the download
   */
  _onDownloadComplete(download: Object): void {
    const filesDownloaded: Array < String > = this.state.filesDownloaded.slice(0);
    filesDownloaded.push(download.filename);

    this.setState({
      currentDownload: null,
      filesDownloaded: filesDownloaded,
      intermediateProgress: 0,
      totalProgress: this.state.totalProgress + download.bytesWritten,
    });
  }

  /**
   * Provides details about each file being downloaded.
   *
   * @param {Object} download details about the download
   */
  _onDowloadStart(download: Object): void {
    this.setState({
      currentDownload: download.filename,
    });
  }

  /**
   * Handles event for when progress update is received.
   *
   * @param {Object} progress details about the progress of the download currently taking
   *                                                  place
   */
  _onDownloadProgress(progress: Object): void {
    this.setState({
      intermediateProgress: progress.bytesWritten,
    });
  }

  /**
   * Renders a progress bar to indicate app updating
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement< any > {
    return <View />;
  }
}

module.exports = UpdateScreenCommon;
