/**
 *
 * @license
 * Copyright (C) 2016-2017 Joseph Roque
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
 * @file Update.js
 * @description Provides progress for app updates
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  Alert,
  Dimensions,
  NetInfo,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Redux imports
import { connect } from 'react-redux';
import * as actions from 'actions';

// Types
import type { Language, TransitInfo, Update } from 'types';

// Imports
import emptyFunction from 'empty/function';
import LinearGradient from 'react-native-linear-gradient';
import * as Configuration from 'Configuration';
import * as Constants from 'Constants';
import * as CoreTranslations from '../../../assets/json/CoreTranslations.json';
import * as Translations from 'Translations';

// Height of te screen
const screenHeight = Dimensions.get('window').height;

// Amount of time to wait before checking for connection, to ensure connection event listener is registered
const CONNECTION_CHECK_TIMEOUT = 250;

// Progress bar API to use depending on OS
const ProgressBar = (Platform.OS === 'android')
    ? require('ProgressBarAndroid')
    : require('ProgressViewIOS');

class UpdateScreen extends React.PureComponent {

  /**
   * Properties this component expects to be provided by its parent.
   */
  props: Update & {
    language: Language,                                 // The current language, selected by the user
    navigator: ReactClass < any >,                      // Parent navigator
    onDownloadComplete: (filesDownloaded: Array < string >, totalProgress: number, fileSize: number) => void,
                                                        // Updates state when a download is finished
    onDownloadProgress: (bytesWritten: number) => void, // Updates state when a download reports intermediate progress
    onDownloadStart: (fileName: string) => void,        // Updates state when a download begins
    onUpdateStart: (totalFiles: number, totalSize: number) => void,
                                                        // Updates state when the app update begins
    setTransit: (transitInfo: TransitInfo) => void,     // Updates the transit info object in the config
    setUniversity: (university: Object) => void,        // Updates the university object in the config
    updateFailed: () => void,                           // Hides the progress bar to show a retry button
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
      onDownloadStart: this._onDownloadStart.bind(this),
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
                onPress: () => this.props.navigator.push({ id: 'main' }),
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
                onPress: () => this.props.navigator.push({ id: 'main' }),
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
    Configuration.init()
        .then(() => Configuration.getConfig('/university.json'))
        .then((university: Object) => {
          this.props.setUniversity(university);
          return Translations.loadTranslations(this.props.language);
        })
        .then(() => Configuration.getConfig('/transit.json'))
        .then((transitInfo: TransitInfo) => this.props.setTransit(transitInfo))
        .then(() => this.props.navigator.push({ id: 'main' }));
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
      filesDownloaded.splice(0, 0, download.filename);
      this.props.onDownloadComplete(filesDownloaded, totalProgress, download.bytesWritten);
    } else {
      console.error('Something\'s null, but it shouldn\'t be! Check filesDownloaded and totalProgress');
    }
  }

  /**
   * Handles event for when progress update is received.
   *
   * @param {Object} progress details about the progress of the download currently taking place
   */
  _onDownloadProgress(progress: Object): void {
    this.props.onDownloadProgress(progress.bytesWritten);
  }

  /**
   * Provides details about each file being downloaded.
   *
   * @param {Object} download details about the download
   */
  _onDownloadStart(download: Object): void {
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
    const filesDownloaded = (this.props.filesDownloaded == null)
      ? null
      : (
        <View>
          {this.props.filesDownloaded.map((filename, index) => (
            <View
                key={index}
                style={_styles.downloadingContainer}>
              <Text style={_styles.downloadedText}>
                {CoreTranslations[language].downloaded} <Text style={_styles.fileText}>{filename}</Text>
              </Text>
            </View>
          ))}
        </View>
      );

    return (
      <View style={_styles.container}>
        <ScrollView contentContainerStyle={_styles.scrollView}>
          {filesDownloaded}
        </ScrollView>
        <View style={_styles.container} />
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
    let gradient = [ Constants.Colors.invisibleGarnet, Constants.Colors.garnet ];
    if (language === 'fr') {
      backgroundColor = Constants.Colors.secondaryBackground;
      foregroundColor = Constants.Colors.primaryBackground;
      gradient = [ Constants.Colors.invisibleCharcoalGrey, Constants.Colors.charcoalGrey ];
    }

    if (this.props.showRetry) {
      return (
        <View style={[ _styles.buttonContainer, { backgroundColor: backgroundColor }]}>
          <TouchableOpacity onPress={this._checkConnection}>
            <View style={_styles.retryContainer}>
              <Text style={_styles.retryText}>{CoreTranslations[language].retry_update}</Text>
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
        <View style={[ _styles.container, { backgroundColor: backgroundColor }]}>
          <View style={_styles.container}>
            <View style={_styles.container} />
            {progress}
          </View>
          {this._renderStatusMessages()}
          <LinearGradient
              colors={gradient}
              style={_styles.linearGradient} />
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
  retryText: {
    marginLeft: Constants.Sizes.Margins.Expanded,
    marginRight: Constants.Sizes.Margins.Expanded,
    marginTop: Constants.Sizes.Margins.Regular,
    marginBottom: Constants.Sizes.Margins.Regular,
    fontSize: Constants.Sizes.Text.Body,
    color: Constants.Colors.primaryWhiteText,
  },
  retryContainer: {
    alignSelf: 'center',
    backgroundColor: Constants.Colors.darkTransparentBackground,
  },
  progress: {
    marginLeft: Constants.Sizes.Margins.Expanded,
    marginRight: Constants.Sizes.Margins.Expanded,
  },
  downloadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  downloadedText: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Caption,
  },
  fileText: {
    color: Constants.Colors.lightGrey,
  },
  scrollView: {
    alignItems: 'center',
    marginTop: Constants.Sizes.Margins.Regular,
    flex: 3,
  },
  linearGradient: {
    position: 'absolute',
    left: 0,
    right: 0,

    /* eslint-disable no-magic-numbers */
    top: screenHeight / 4 * 3 - 30,
    bottom: screenHeight / 4 - 10,
    /* eslint-enable no-magic-numbers */
  },
});

const mapStateToProps = (store) => {
  return {
    filesDownloaded: store.config.update.filesDownloaded,
    intermediateProgress: store.config.update.intermediateProgress,
    language: store.config.options.language,
    showRetry: store.config.update.showRetry,
    showUpdateProgress: store.config.update.showUpdateProgress,
    totalProgress: store.config.update.totalProgress,
    totalSize: store.config.update.totalSize,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setUniversity: (university: Object) => dispatch(actions.updateConfiguration({
      semesters: university.semesters,
      universityLocation: { latitude: university.lat, longitude: university.long },
      universityName: {
        name_en: Translations.getEnglishName(university) || '',
        name_fr: Translations.getFrenchName(university) || '',
      },
    })),
    setTransit: (transitInfo: TransitInfo) => dispatch(actions.updateConfiguration({
      transitInfo: {
        name_en: Translations.getEnglishName(transitInfo) || '',
        name_fr: Translations.getFrenchName(transitInfo) || '',
        link_en: Translations.getEnglishVariant('link', transitInfo) || '',
        link_fr: Translations.getFrenchVariant('link', transitInfo) || '',
      },
    })),
    updateFailed: () => dispatch(actions.updateProgress({ showUpdateProgress: false, showRetry: true })),
    onDownloadComplete: (filesDownloaded: Array < string >, totalProgress: number, fileSize: number) => {
      dispatch(actions.updateProgress({
        currentDownload: null,
        filesDownloaded: filesDownloaded,
        intermediateProgress: 0,
        totalProgress: totalProgress + fileSize,
      }));
    },
    onDownloadProgress: (bytesWritten: number) => {
      dispatch(actions.updateProgress({ intermediateProgress: bytesWritten }));
    },
    onDownloadStart: (fileName: string) => dispatch(actions.updateProgress({ currentDownload: fileName })),
    onUpdateStart: (totalFiles: number, totalSize: number) => {
      dispatch(actions.updateProgress({
        showUpdateProgress: true,
        totalProgress: 0,
        totalFiles,
        totalSize,
      }));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UpdateScreen);
