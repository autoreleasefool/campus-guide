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
 * @file Update.tsx
 * @description Provides progress for app updates
 */
'use strict';

/// <reference types="react-native-linear-gradient" />

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
import * as actions from '../../actions';

// Imports
import emptyFunction from 'empty/function';
import LinearGradient from 'react-native-linear-gradient';
import * as Configuration from '../../util/Configuration';
import * as Constants from '../../constants';
import * as Translations from '../../util/Translations';
const CoreTranslations = require('../../../assets/json/CoreTranslations');

// Types
import { Language } from '../../util/Translations';
import { TransitInfo } from '../../../typings/transit';

interface Props extends Configuration.ProgressUpdate {
  language: Language;                             // The current language, selected by the user
  navigator: any;                                 // Parent navigator
  onDownloadComplete(filesDownloaded: string[], totalProgress: number, fileSize: number): void;
                                                  // Updates state when a download is finished
  onDownloadProgress(bytesWritten: number): void; // Updates state when a download reports intermediate progress
  onDownloadStart(fileName: string): void;        // Updates state when a download begins
  onUpdateStart(totalFiles: number, totalSize: number): void;
                                                  // Updates state when the app update begins
  setTransit(transitInfo: TransitInfo): void;     // Updates the transit info object in the config
  setUniversity(university: object): void;        // Updates the university object in the config
  updateFailed(): void;                           // Hides the progress bar to show a retry button
}

interface State {}

// Height of te screen
const screenHeight = Dimensions.get('window').height;

// Amount of time to wait before checking for connection, to ensure connection event listener is registered
const CONNECTION_CHECK_TIMEOUT = 250;

// Progress bar API to use depending on OS
const ProgressBar = (Platform.OS === 'android')
    ? require('ProgressBarAndroid')
    : require('ProgressViewIOS');

class UpdateScreen extends React.PureComponent<Props, State> {

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
  async _beginUpdate(): Promise<void> {
    const callbacks = {
      onDownloadComplete: (download: object): void => this._onDownloadComplete(download),
      onDownloadProgress: (progress: object): void => this._onDownloadProgress(progress),
      onDownloadStart: (download: object): void => this._onDownloadStart(download),
      onUpdateStart: (totalSize: number, totalFiles: number): void => this._onUpdateStart(totalSize, totalFiles),
    };

    let available = false;
    try {
      available = await Configuration.isConfigUpdateAvailable();
    } catch (err) {
      console.log('Failed configuration update check.', err);
      this._notifyServerFailed();

      return;
    }

    if (available) {
      try {
        await Configuration.updateConfig(callbacks);
      } catch (err) {
        console.error('Failed to update configuration.', err);
      }
    }

    this._returnToMain();
  }

  /**
   * Checks for an Internet connection and, if one is available, starts the update.
   */
  _checkConnection(): void {
    setTimeout(async() => {
      try {
        const isConnected = await NetInfo.isConnected.fetch();
        if (isConnected || __DEV__) {
          this._beginUpdate();
        } else {
          this._notifyConnectionFailed(undefined);
        }
      } catch (err) {
        this._notifyConnectionFailed(err);
      }
    }, CONNECTION_CHECK_TIMEOUT);
  }

  /**
   * Returns the total percent of the progress completed.
   *
   * @returns {number} a value from 0 to 1
   */
  _getProgress(): number {
    if (this.props.totalSize != undefined && this.props.totalSize > 0) {
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
                onPress: (): void => this._checkConnection(),
                text: CoreTranslations[language].retry,
              },
              {
                onPress: (): void => this.props.navigator.push({ id: 'main' }),
                text: CoreTranslations[language].later,
              },
            ]
          );
        })
        .catch(() => {
          Alert.alert(
            CoreTranslations[language].server_unavailable,
            CoreTranslations[language].server_unavailable_config_unavailable,
            [
              {
                onPress: (): void => this._checkConnection(),
                text: CoreTranslations[language].retry,
              },
              {
                onPress: (): void => this.props.updateFailed(),
                style: 'cancel',
                text: CoreTranslations[language].cancel,
              },
            ]
          );
        });
  }

  /**
   * Displays a prompt to user indicating an internet connection could not be reached and their options.
   */
  _notifyConnectionFailed(err?: any): void {
    // TODO: use error and act according to the actual issue
    if (err != undefined) {
      console.log(err);
    }

    const language = this.props.language;

    Configuration.init()
        .then(() => {
          Alert.alert(
            CoreTranslations[language].no_internet,
            CoreTranslations[language].no_internet_config_available,
            [
              {
                onPress: (): void => this._checkConnection(),
                text: CoreTranslations[language].retry,
              },
              {
                onPress: (): void => this.props.navigator.push({ id: 'main' }),
                text: CoreTranslations[language].later,
              },
            ]
          );
        })
        .catch(() => {
          Alert.alert(
            CoreTranslations[language].no_internet,
            CoreTranslations[language].no_internet_config_unavailable,
            [
              {
                onPress: (): void => this._checkConnection(),
                text: CoreTranslations[language].retry,
              },
              {
                onPress: (): void => this.props.updateFailed(),
                style: 'cancel',
                text: CoreTranslations[language].cancel,
              },
            ]
          );
        });
  }

  /**
   * Return to the main screen.
   */
  _returnToMain(): void {
    Configuration.init()
        .then(() => Configuration.getConfig('/university.json'))
        .then((university: object) => {
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
   * @param {any} download results of the download
   */
  _onDownloadComplete(download: any): void {
    const totalProgress = this.props.totalProgress;
    if (this.props.filesDownloaded != undefined && totalProgress != undefined) {
      const filesDownloaded = this.props.filesDownloaded.slice(0);
      filesDownloaded.splice(0, 0, download.filename);
      this.props.onDownloadComplete(filesDownloaded, totalProgress, download.bytesWritten);
    } else {
      console.error('Something\'s null, but it shouldn\'t be! Check filesDownloaded and totalProgress');
    }
  }

  /**
   * Handles event for when progress update is received.
   *
   * @param {any} progress details about the progress of the download currently taking place
   */
  _onDownloadProgress(progress: any): void {
    this.props.onDownloadProgress(progress.bytesWritten);
  }

  /**
   * Provides details about each file being downloaded.
   *
   * @param {any} download details about the download
   */
  _onDownloadStart(download: any): void {
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
   * @returns {JSX.Element|undefined} the hierarchy of views to render
   */
  _renderStatusMessages(): JSX.Element | undefined {
    const language = this.props.language;
    const filesDownloaded = (this.props.filesDownloaded == undefined)
      ? undefined
      : (
        <View>
          {this.props.filesDownloaded.map((filename: string, index: number) => (
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
   * @returns {JSX.Element} the hierarchy of views to render
   */
  render(): JSX.Element {
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
        <View style={[ _styles.buttonContainer, { backgroundColor }]}>
          <TouchableOpacity onPress={(): void => this._checkConnection()}>
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
        <View style={[ _styles.container, { backgroundColor }]}>
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
  downloadedText: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Caption,
  },
  downloadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  fileText: {
    color: Constants.Colors.lightGrey,
  },
  linearGradient: {
    left: 0,
    position: 'absolute',
    right: 0,

    /* tslint:disable no-magic-numbers object-literal-sort-keys */
    top: screenHeight / 4 * 3 - 30,
    bottom: screenHeight / 4 - 10,
    /* tslint:enable no-magic-numbers object-literal-sort-keys */
  },
  progress: {
    marginLeft: Constants.Sizes.Margins.Expanded,
    marginRight: Constants.Sizes.Margins.Expanded,
  },
  retryContainer: {
    alignSelf: 'center',
    backgroundColor: Constants.Colors.darkTransparentBackground,
  },
  retryText: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
    marginBottom: Constants.Sizes.Margins.Regular,
    marginLeft: Constants.Sizes.Margins.Expanded,
    marginRight: Constants.Sizes.Margins.Expanded,
    marginTop: Constants.Sizes.Margins.Regular,
  },
  scrollView: {
    alignItems: 'center',
    flex: 3,
    marginTop: Constants.Sizes.Margins.Regular,
  },
});

const mapStateToProps = (store: any): any => {
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

const mapDispatchToProps = (dispatch: any): any => {
  return {
    onDownloadComplete: (filesDownloaded: string[], totalProgress: number, fileSize: number): void => {
      dispatch(actions.updateProgress({
        currentDownload: undefined,
        filesDownloaded,
        intermediateProgress: 0,
        totalProgress: totalProgress + fileSize,
      }));
    },
    onDownloadProgress: (bytesWritten: number): void => {
      dispatch(actions.updateProgress({ intermediateProgress: bytesWritten }));
    },
    onDownloadStart: (fileName: string): void => dispatch(actions.updateProgress({ currentDownload: fileName })),
    onUpdateStart: (totalFiles: number, totalSize: number): void => {
      dispatch(actions.updateProgress({
        showUpdateProgress: true,
        totalFiles,
        totalProgress: 0,
        totalSize,
      }));
    },
    setTransit: (transitInfo: TransitInfo): void => dispatch(actions.updateConfiguration({
      transitInfo: {
        link_en: Translations.getEnglishLink(transitInfo) || '',
        link_fr: Translations.getFrenchLink(transitInfo) || '',
        name_en: Translations.getEnglishName(transitInfo) || '',
        name_fr: Translations.getFrenchName(transitInfo) || '',
      },
    })),
    setUniversity: (university: any): void => dispatch(actions.updateConfiguration({
      semesters: university.semesters,
      universityLocation: { latitude: university.latitude, longitude: university.longitude },
      universityName: {
        name_en: Translations.getEnglishName(university) || '',
        name_fr: Translations.getFrenchName(university) || '',
      },
    })),
    updateFailed: (): void => dispatch(actions.updateProgress({ showUpdateProgress: false, showRetry: true })),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UpdateScreen) as any;
