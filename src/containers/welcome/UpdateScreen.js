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
 * @created 2016-10-09
 * @file UpdateScreen.common.js
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
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Redux imports
import {connect} from 'react-redux';
import {
  updateConfiguration,
  updateProgress,
} from 'actions';

// Types
import type {
  Language,
  Update,
} from 'types';

// Imports
import emptyFunction from 'empty/function';
import * as Configuration from 'Configuration';
import * as Constants from 'Constants';
import * as CoreTranslations from '../../../assets/json/CoreTranslations.json';
import * as TranslationUtils from 'TranslationUtils';

// Amount of time to wait before checking for connection, to ensure connection event listener is registered
const CONNECTION_CHECK_TIMEOUT = 250;

const ProgressBar = (Platform.OS === 'android')
    ? require('ProgressBarAndroid')
    : require('ProgressViewIOS');

class UpdateScreen extends React.Component {

  /**
   * Properties this component expects to be provided by its parent.
   */
  props: Update & {
    updateConfiguration: (university: Object) => void,  // Updates the app configuration
    updateFailed: () => void,                           // Hides the progress bar to show a retry button
    language: Language,                                 // The current language, selected by the user
    navigator: ReactClass < any >,                      // Parent navigator
    onDownloadComplete: (filesDownloaded: Array < string >, totalProgress: number, fileSize: number) => void,
                                                        // Updates state when a download is finished
    onDownloadProgress: (bytesWritten: number) => void, // Updates state when a download reports intermediate progress
    onDownloadStart: (fileName: string) => void,        // Updates state when a download begins
    onUpdateStart: (totalFiles: number, totalSize: number) => void,
                                                        // Updates state when the app update begins
  };

  /**
   * Constructor.
   *
   * @param {props} props component props
   */
  constructor(props) {
    super(props);

    // Explicitly binding 'this' to all methods that need it
    (this:any)._beginUpdate = this._beginUpdate.bind(this);
    (this:any)._checkConnection = this._checkConnection.bind(this);
    (this:any)._notifyConnectionFailed = this._notifyConnectionFailed.bind(this);
    (this:any)._returnToMain = this._returnToMain.bind(this);
  }

  /**
   * Registers a listener for network connectivity.
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
    const self: UpdateScreen = this;
    const callbacks = {
      onUpdateStart: this._onUpdateStart.bind(this),
      onDownloadStart: this._onDowloadStart.bind(this),
      onDownloadProgress: this._onDownloadProgress.bind(this),
      onDownloadComplete: this._onDownloadComplete.bind(this),
    };

    Configuration.isConfigUpdateAvailable()
        .then((available: boolean) => {
          if (available) {
            Configuration.updateConfig(callbacks)
                .then(self._returnToMain)
                .catch((err: any) => {
                  console.error('Failed to update configuration.', err);
                  self._returnToMain();
                });
          } else {
            self._returnToMain();
          }
        })
        .catch((err: any) => {
          console.log('Failed configuration update check.', err);
          self._notifyServerFailed();
        });
  }

  /**
   * Checks for an Internet connection and, if one is available, starts the update.
   */
  _checkConnection(): void {
    const self: UpdateScreen = this;
    setTimeout(() => {
      NetInfo.isConnected.fetch()
          .then((isConnected: boolean) => {
            if (isConnected || __DEV__) {
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
    if (this.props.totalSize != null && this.props.totalSize > 0) {
      return (this.props.totalProgress + this.props.intermediateProgress) / this.props.totalSize;
    }

    return 0;
  }

  /**
   * Displays a prompt to user indicating the server could not be reached and their options.
   */
  _notifyServerFailed(): void {
    const language = this.props.language;

    Configuration.init()
        .then(() => {
          Alert.alert(
            CoreTranslations[language].server_unavailable,
            CoreTranslations[language].server_unavailable_config_available,
            [
              {
                text: CoreTranslations[language].retry,
                onPress: this._checkConnection,
              },
              {
                text: CoreTranslations[language].later,
                onPress: () => this.props.navigator.push({id: 'main'}),
              },
            ],
          );
        })
        .catch(() => {
          Alert.alert(
            CoreTranslations[language].server_unavailable,
            CoreTranslations[language].server_unavailable_config_unavailable,
            [
              {
                text: CoreTranslations[language].retry,
                onPress: this._checkConnection,
              },
              {
                text: CoreTranslations[language].cancel,
                onPress: this.props.updateFailed,
                style: 'cancel',
              },
            ],
          );
        });
  }

  /**
   * Displays a prompt to user indicating an internet connection could not be reached and their options.
   */
  _notifyConnectionFailed(): void {
    const language = this.props.language;

    Configuration.init()
        .then(() => {
          Alert.alert(
            CoreTranslations[language].no_internet,
            CoreTranslations[language].no_internet_config_available,
            [
              {
                text: CoreTranslations[language].retry,
                onPress: this._checkConnection,
              },
              {
                text: CoreTranslations[language].later,
                onPress: () => this.props.navigator.push({id: 'main'}),
              },
            ],
          );
        })
        .catch(() => {
          Alert.alert(
            CoreTranslations[language].no_internet,
            CoreTranslations[language].no_internet_config_unavailable,
            [
              {
                text: CoreTranslations[language].retry,
                onPress: this._checkConnection,
              },
              {
                text: CoreTranslations[language].cancel,
                onPress: this.props.updateFailed,
                style: 'cancel',
              },
            ],
          );
        });
  }

  /**
   * Return to the main screen.
   */
  _returnToMain(): void {
    const self: UpdateScreen = this;
    Configuration.getConfig('/university.json')
        .then((university: Object) => {
          self.props.updateConfiguration(university);
          return TranslationUtils.loadTranslations(this.props.language);
        })
        .then(() => self.props.navigator.push({id: 'main'}));
  }

  /**
   * Handles the results of a successful download.
   *
   * @param {Object} download results of the download
   */
  _onDownloadComplete(download: Object): void {
    const totalProgress = this.props.totalProgress;
    if (this.props.filesDownloaded != null && totalProgress != null) {
      const filesDownloaded: Array < string > = this.props.filesDownloaded.slice(0);
      filesDownloaded.push(download.filename);
      this.props.onDownloadComplete(filesDownloaded, totalProgress, download.bytesWritten);
    } else {
      console.error(
        (String:any).format(
          'Something\'s null, but it shouldn\'t be!\n\t{0}: {1},\n\t{2}: {3}',
          'this.props.filesDownloaded',
          this.props.filesDownloaded,
          'this.props.totalProgress',
          this.props.totalProgress,
        )
      );
    }
  }

  /**
   * Handles event for when progress update is received.
   *
   * @param {Object} progress details about the progress of the download currently taking
   *                                                  place
   */
  _onDownloadProgress(progress: Object): void {
    this.props.onDownloadProgress(progress.bytesWritten);
  }

  /**
   * Provides details about each file being downloaded.
   *
   * @param {Object} download details about the download
   */
  _onDowloadStart(download: Object): void {
    this.props.onDownloadStart(download.filename);
  }

  /**
   * Handles event for when update starts.
   *
   * @param {number} totalSize  size of the update, in bytes
   * @param {number} totalFiles number of files to be updated
   */
  _onUpdateStart(totalSize: number, totalFiles: number): void {
    this.props.onUpdateStart(totalFiles, totalSize);
  }

  /**
   * Renders a set of messages regarding update progress so far.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render
   */
  _renderStatusMessages(): ReactElement < any > {
    const language = this.props.language;
    const currentDownload: ?ReactElement < any > = (this.props.currentDownload == null)
      ? null
      : (
        <Text style={_styles.progressText}>
          {(String:any).format(CoreTranslations[language].file_is_updating, this.props.currentDownload)}
        </Text>
      );

    const filesDownloaded = (this.props.filesDownloaded == null)
      ? null
      : (
        <View>
          {this.props.filesDownloaded.map((filename, index) => (
            <Text
                key={index}
                style={_styles.progressText}>
              {(String:any).format(CoreTranslations[language].file_has_been_updated, filename)}
            </Text>
          ))}
        </View>
      );

    return (
      <View style={_styles.container}>
        <ScrollView contentContainerStyle={{alignItems: 'center'}}>
          {filesDownloaded}
          {currentDownload}
        </ScrollView>
      </View>
    );
  }

  /**
   * Renders a progress bar to indicate app updating
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement < any > {
    const language = this.props.language;

    // Get background color for screen, and color for progress bar
    let backgroundColor = Constants.Colors.primaryBackground;
    let foregroundColor = Constants.Colors.secondaryBackground;
    if (language === 'fr') {
      backgroundColor = Constants.Colors.secondaryBackground;
      foregroundColor = Constants.Colors.primaryBackground;
    }

    if (this.props.showRetry) {
      return (
        <View style={[_styles.buttonContainer, {backgroundColor: backgroundColor}]}>
          <TouchableOpacity onPress={this._checkConnection}>
            <View style={_styles.textContainer}>
              <Text style={_styles.text}>{CoreTranslations[language].retry_update}</Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    } else if (this.props.showUpdateProgress) {
      const progress = (Platform.OS === 'android')
          ? (
            <ProgressBar
                indeterminate={false}
                progress={this._getProgress()}
                progressTintColor={foregroundColor}
                style={_styles.progress}
                styleAttr='Horizontal' />
          )
          : (
            <ProgressBar
                progress={this._getProgress()}
                progressTintColor={foregroundColor}
                style={_styles.progress} />
          );

      return (
        <View style={[_styles.container, {backgroundColor: backgroundColor}]}>
          <View style={_styles.container}>
            <View style={_styles.container} />
            {progress}
            <Text style={_styles.downloading}>{CoreTranslations[language].downloading}</Text>
          </View>
          {this._renderStatusMessages()}
        </View>
      );
    } else {
      return (
        <View style={_styles.container} />
      );
    }
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
  },
  downloading: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
    marginTop: Constants.Sizes.Margins.Expanded,
    marginBottom: Constants.Sizes.Margins.Expanded,
    alignSelf: 'center',
  },
  text: {
    marginLeft: Constants.Sizes.Margins.Expanded,
    marginRight: Constants.Sizes.Margins.Expanded,
    marginTop: Constants.Sizes.Margins.Regular,
    marginBottom: Constants.Sizes.Margins.Regular,
    fontSize: Constants.Sizes.Text.Body,
    color: Constants.Colors.primaryWhiteText,
  },
  textContainer: {
    alignSelf: 'center',
    backgroundColor: Constants.Colors.darkTransparentBackground,
  },
  progress: {
    marginLeft: Constants.Sizes.Margins.Expanded,
    marginRight: Constants.Sizes.Margins.Expanded,
  },
  progressText: {
    alignSelf: 'center',
    color: Constants.Colors.secondaryWhiteText,
    fontSize: Constants.Sizes.Text.Caption,
  },
});

// Map state to props
const select = (store) => {
  return {
    filesDownloaded: store.update.filesDownloaded,
    intermediateProgress: store.update.intermediateProgress,
    language: store.config.language,
    showRetry: store.update.showRetry,
    showUpdateProgress: store.update.showUpdateProgress,
    totalProgress: store.update.totalProgress,
    totalSize: store.update.totalSize,
  };
};

// Map dispatch to props
const actions = (dispatch) => {
  return {
    updateConfiguration: (university: Object) => dispatch(updateConfiguration({semesters: university.semesters})),
    updateFailed: () => dispatch(updateProgress({showUpdateProgress: false, showRetry: true})),
    onDownloadComplete: (filesDownloaded: Array < string >, totalProgress: number, fileSize: number) => {
      dispatch(updateProgress({
        currentDownload: null,
        filesDownloaded: filesDownloaded,
        intermediateProgress: 0,
        totalProgress: totalProgress + fileSize,
      }));
    },
    onDownloadProgress: (bytesWritten: number) => dispatch(updateProgress({intermediateProgress: bytesWritten})),
    onDownloadStart: (fileName: string) => dispatch(updateProgress({currentDownload: fileName})),
    onUpdateStart: (totalFiles: number, totalSize: number) => {
      dispatch(updateProgress({
        showUpdateProgress: true,
        totalProgress: 0,
        totalFiles,
        totalSize,
      }));
    },
  };
};

export default connect(select, actions)(UpdateScreen);
