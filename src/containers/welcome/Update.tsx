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

// React imports
import React from 'react';
import {
  Alert,
  InteractionManager,
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
import * as Configuration from '../../util/Configuration';
import * as Constants from '../../constants';
import * as RNFS from 'react-native-fs';
import * as Translations from '../../util/Translations';
const CoreTranslations = require('../../../assets/json/CoreTranslations');

// Types
import { Language } from '../../util/Translations';
import { TransitInfo } from '../../../typings/transit';

interface Props extends Configuration.ProgressUpdate {
  language: Language;                             // The current language, selected by the user
  navigator: any;                                 // Parent navigator
  updateConfirmed: boolean;                       // Indicates if a user has accepted an update
  confirmUpdate(): void;                          // Indicate a user has confirmed an update
  onDownloadComplete(filesDownloaded: string[], totalProgress: number, fileSize: number): void;
                                                  // Updates state when a download is finished
  onDownloadProgress(bytesWritten: number): void; // Updates state when a download reports intermediate progress
  onDownloadStart(fileName: string): void;        // Updates state when a download begins
  onUpdateStart(totalFiles: number, totalSize: number): void;
                                                  // Updates state when the app update begins
  setConfiguration(university: any, transit: TransitInfo): void;
                                                  // Update the app config data
}

interface State {
  coreErrorMessage: string | undefined; // An error message, which appears in CoreTranslations
  coreErrorTitle: string | undefined;   // An error message title, from CoreTranslations
  showRetry: boolean;                   // True to show a retry button, false to hide
}

// Amount of time to wait before checking for connection, to ensure connection event listener is registered
const CONNECTION_CHECK_TIMEOUT = 250;

// Progress bar API to use depending on OS
const ProgressBar = (Platform.OS === 'android')
    ? require('ProgressBarAndroid')
    : require('ProgressViewIOS');

class UpdateScreen extends React.PureComponent<Props, State> {

  /**
   * Constructor.
   *
   * @param {props} props component props
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      coreErrorMessage: undefined,
      coreErrorTitle: undefined,
      showRetry: false,
    };
  }

  /**
   * Registers a listener for network connectivity.
   */
  componentDidMount(): void {
    // Must set event listener for NetInfo.isConnected.fetch to work
    // https://github.com/facebook/react-native/issues/8469
    NetInfo.addEventListener('connectionChange', this._emptyFunction);
    this._checkConnection();
  }

  /**
   * Removes the connection listener for NetInfo.
   */
  componentWillUnmount(): void {
    NetInfo.removeEventListener('connectionChange', this._emptyFunction);
  }

  /**
   * An empty function.
   */
  _emptyFunction(): void {
    if (__DEV__) {
      console.log('Function purposefully left empty.');
    }
  }

  /**
   * Checks to see if a new configuration update is available and, if so, begins downloading.
   */
  async _beginUpdate(availableUpdates: any): Promise<void> {
    const callbacks = {
      onDownloadComplete: (name: string, download: RNFS.DownloadResult): void =>
          this._onDownloadComplete(name, download),
      onDownloadProgress: (progress: RNFS.DownloadProgressCallbackResult): void =>
          this._onDownloadProgress(progress),
      onDownloadStart: (name: string, _: RNFS.DownloadBeginCallbackResult): void =>
          this._onDownloadStart(name),
      onUpdateStart: (totalSize: number, totalFiles: number): void =>
          this._onUpdateStart(totalSize, totalFiles),
    };

    try {
      await Configuration.updateConfig(availableUpdates, callbacks, Platform.OS);
    } catch (err) {
      if (__DEV__) {
        console.log('Failed configuration update check.', err);
      }
      this._notifyServerFailed();

      return;
    }

    this._returnToMain();
  }

  /**
   * Allow a user to confirm an update before it happens.
   */
  async _confirmUpdate(): Promise<void> {
    try {
      const available = await Configuration.getAvailableConfigUpdates(Platform.OS);

      if (!this.props.updateConfirmed) {
        if (available.files.length > 0) {
          let totalSize = 0;
          for (const file of available.files) {
            totalSize += file.zsize ? file.zsize : file.size;
          }

          const onCancel = (): Promise<void> => this._updateRejected();

          Alert.alert(
            Translations.get('update_available_title'),
            Configuration.constructUpdateMessage(Translations.get('update_available_msg'), totalSize),
            [
              {
                onPress: onCancel,
                style: 'cancel',
                text: Translations.get('cancel'),
              },
              {
                onPress: (): void => {
                  this.props.confirmUpdate();
                  this._beginUpdate(available);
                },
                text: Translations.get('update'),
              },
            ],
            { onDismiss: onCancel }
          );
        }

        return;
      }

      this._beginUpdate(available);
    } catch (err) {
      if (__DEV__) {
        console.log('Error confirming configuration update.', err);
      }
      this._notifyServerFailed();
    }
  }

  /**
   * Checks for an Internet connection and, if one is available, starts the update.
   */
  _checkConnection(): void {
    setTimeout(async() => {
      try {
        const connectionInfo = await (NetInfo as any).getConnectionInfo();
        if (connectionInfo.type !== 'none' && connectionInfo.type !== 'unknown' || __DEV__) {
          this._confirmUpdate();
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
    if (!this.state.showRetry && this.props.totalSize != undefined && this.props.totalSize > 0) {
      return (this.props.totalProgress + this.props.intermediateProgress) / this.props.totalSize;
    }

    return 0;
  }

  /**
   * Displays a prompt to user indicating the server could not be reached and their options.
   */
  async _notifyServerFailed(): Promise<void> {
    const language = Translations.getLanguage();

    try {
      await Configuration.init();
      await Configuration.getConfig('/university.json');

      this.setState({
        coreErrorMessage: 'server_unavailable_config_available',
        coreErrorTitle: 'server_unavailable',
      });

      const onCancel = (): void => this._popOrPushToMain();

      Alert.alert(
        CoreTranslations[language].server_unavailable,
        CoreTranslations[language].server_unavailable_config_available,
        [
          {
            onPress: onCancel,
            text: CoreTranslations[language].later,
          },
          {
            onPress: (): void => this._checkConnection(),
            text: CoreTranslations[language].retry,
          },
        ],
        { onDismiss: onCancel }
      );
      this._popOrPushToMain();
    } catch (err) {
      this.setState({
        coreErrorMessage: 'server_unavailable_config_unavailable',
        coreErrorTitle: 'server_unavailable',
      });

      const onCancel = (): void => this.setState({ showRetry: true });

      Alert.alert(
        CoreTranslations[language].server_unavailable,
        CoreTranslations[language].server_unavailable_config_unavailable,
        [
          {
            onPress: onCancel,
            style: 'cancel',
            text: CoreTranslations[language].cancel,
          },
          {
            onPress: (): void => this._checkConnection(),
            text: CoreTranslations[language].retry,
          },
        ],
        { onDismiss: onCancel }
      );
    }
  }

  /**
   * Displays a prompt to user indicating an internet connection could not be reached and their options.
   */
  async _notifyConnectionFailed(err?: any): Promise<void> {
    // FIXME: use error and act according to the actual issue
    if (err != undefined && __DEV__) {
      console.log(err);
    }

    const language = this.props.language;

    try {
      await Configuration.init();
      await Configuration.getConfig('/university.json');

      this.setState({
        coreErrorMessage: 'no_internet_config_available',
        coreErrorTitle: 'no_internet',
      });

      const onCancel = (): void => this._popOrPushToMain();

      Alert.alert(
        CoreTranslations[language].no_internet,
        CoreTranslations[language].no_internet_config_available,
        [
          {
            onPress: onCancel,
            text: CoreTranslations[language].later,
          },
          {
            onPress: (): void => this._checkConnection(),
            text: CoreTranslations[language].retry,
          },
        ],
        { onDismiss: onCancel }
      );
      this._popOrPushToMain();
    } catch (err) {
      this.setState({
        coreErrorMessage: 'no_internet_config_unavailable',
        coreErrorTitle: 'no_internet',
      });

      const onCancel = (): void => this.setState({ showRetry: true });

      Alert.alert(
        CoreTranslations[language].no_internet,
        CoreTranslations[language].no_internet_config_unavailable,
        [
          {
            onPress: onCancel,
            style: 'cancel',
            text: CoreTranslations[language].cancel,
          },
          {
            onPress: (): void => this._checkConnection(),
            text: CoreTranslations[language].retry,
          },
        ],
        { onDismiss: onCancel }
      );
    }
  }

  /**
   * Displays a prompt to user indicating they rejected a required update, or let the user continue with
   * their current configuration, if available.
   */
  async _updateRejected(): Promise<void> {
    const language = this.props.language;

    try {
      await Configuration.init();
      await Configuration.getConfig('/university.json');
      this._popOrPushToMain();
    } catch (err) {
      this.setState({
        coreErrorMessage: 'update_rejected_config_unavailable',
        coreErrorTitle: 'update_rejected',
      });

      const onCancel = (): void => this.setState({ showRetry: true });

      Alert.alert(
        CoreTranslations[language].update_rejected,
        CoreTranslations[language].update_rejected_config_unavailable,
        [
          {
            onPress: onCancel,
            style: 'cancel',
            text: CoreTranslations[language].cancel,
          },
          {
            onPress: (): void => this._checkConnection(),
            text: CoreTranslations[language].retry,
          },
        ],
        { onDismiss: onCancel }
      );
    }
  }

  /**
   * Return to the main screen.
   */
  async _returnToMain(): Promise<void> {
    try {
      await Translations.loadTranslations(Translations.getLanguage());
      this._popOrPushToMain();
    } catch (err) {
      console.error('Unable to initialize configuration for Update.', err);
    }
  }

  /**
   * Check if a 'main' route already exists on the navigator and pop to it if so.
   * Otherwise, push a new one.
   */
  _popOrPushToMain(): void {
    const routes = this.props.navigator.getCurrentRoutes();
    for (const route of routes) {
      if (route.id === 'main') {
        this.props.navigator.popToRoute(route);

        return;
      }
    }
    this.props.navigator.push({ id: 'main' });
  }

  /**
   * Retry the update.
   */
  _retryUpdate(): void {
    this.setState({ showRetry: false });
    InteractionManager.runAfterInteractions(() => this._checkConnection());
  }

  /**
   * Handles the results of a successful download.
   *
   * @param {string}              name     name of the downloaded file
   * @param {RNFS.DownloadResult} download results of the download
   */
  _onDownloadComplete(name: string, download: RNFS.DownloadResult): void {
    const totalProgress = this.props.totalProgress;
    if (this.props.filesDownloaded != undefined && totalProgress != undefined) {
      const filesDownloaded = this.props.filesDownloaded.slice(0);
      filesDownloaded.splice(0, 0, name);
      this.props.onDownloadComplete(filesDownloaded, totalProgress, download.bytesWritten);
    } else {
      console.error('Something\'s undefined, but it shouldn\'t be! Check filesDownloaded and totalProgress');
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
   * @param {string} name name of the file
   */
  _onDownloadStart(name: string): void {
    this.props.onDownloadStart(name);
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
   * Renders an error message for the user, and a retry button.
   *
   * @returns {JSX.Element} the hierarchy of views to render
   */
  _renderErrorScreen(): JSX.Element {
    const language = this.props.language;

    const errorTitle = CoreTranslations[language][this.state.coreErrorTitle];
    const errorMessage = CoreTranslations[language][this.state.coreErrorMessage];

    return (
      <View style={_styles.buttonContainer}>
        <Text style={_styles.errorTitle}>{errorTitle}</Text>
        <Text style={_styles.errorMessage}>{errorMessage}</Text>
        <TouchableOpacity onPress={(): void => this._retryUpdate()}>
          <View style={_styles.retryContainer}>
            <Text style={_styles.retryText}>{CoreTranslations[language].retry_update}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  /**
   * Renders a set of messages regarding update progress so far.
   *
   * @returns {JSX.Element} the hierarchy of views to render
   */
  _renderStatusMessages(): JSX.Element {
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
    const language = Translations.getLanguage();

    // Get background color for screen, and color for progress bar
    let backgroundColor = Constants.Colors.primaryBackground;
    let foregroundColor = Constants.Colors.secondaryBackground;
    if (language === 'fr') {
      backgroundColor = Constants.Colors.secondaryBackground;
      foregroundColor = Constants.Colors.primaryBackground;
    }

    const progress = (Platform.OS === 'android')
        ? (
          <ProgressBar
              color={foregroundColor}
              indeterminate={false}
              progress={this._getProgress()}
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
        <View style={_styles.container} />
        {progress}
        <View style={_styles.container}>
          {this.state.showRetry
              ? this._renderErrorScreen()
              : this._renderStatusMessages()}
        </View>
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  buttonContainer: {
    flex: 1,
    // justifyContent: 'center',
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
  errorMessage: {
    color: Constants.Colors.secondaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
    marginBottom: Constants.Sizes.Margins.Expanded,
    marginLeft: Constants.Sizes.Margins.Expanded,
    marginRight: Constants.Sizes.Margins.Expanded,
    marginTop: Constants.Sizes.Margins.Regular,
    textAlign: 'center',
  },
  errorTitle: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Subtitle,
    marginLeft: Constants.Sizes.Margins.Regular,
    marginRight: Constants.Sizes.Margins.Regular,
    marginTop: Constants.Sizes.Margins.Expanded,
    textAlign: 'center',
  },
  fileText: {
    color: Constants.Colors.lightGrey,
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
    flex: 1,
    margin: Constants.Sizes.Margins.Expanded,
  },
});

const mapStateToProps = (store: any): any => {
  return {
    filesDownloaded: store.config.update.filesDownloaded,
    intermediateProgress: store.config.update.intermediateProgress,
    language: store.config.options.language,
    showRetry: store.config.update.showRetry,
    totalProgress: store.config.update.totalProgress,
    totalSize: store.config.update.totalSize,
    updateConfirmed: store.config.updateConfirmed,
  };
};

const mapDispatchToProps = (dispatch: any): any => {
  return {
    confirmUpdate: (): void => dispatch(actions.confirmUpdate()),
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
        totalFiles,
        totalProgress: 0,
        totalSize,
      }));
    },
    setConfiguration: (university: any, transitInfo: TransitInfo): void => dispatch(actions.updateConfiguration({
      semesters: university.semesters,
      transitInfo: {
        link_en: Translations.getEnglishLink(transitInfo) || '',
        link_fr: Translations.getFrenchLink(transitInfo) || '',
        name_en: Translations.getEnglishName(transitInfo) || '',
        name_fr: Translations.getFrenchName(transitInfo) || '',
      },
      universityLocation: { latitude: university.latitude, longitude: university.longitude },
      universityName: {
        name_en: Translations.getEnglishName(university) || '',
        name_fr: Translations.getFrenchName(university) || '',
      },
    })),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UpdateScreen) as any;
