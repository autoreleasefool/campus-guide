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
 * @created 2016-10-08
 * @file Main.tsx
 * @description Container for the main application.
 */
'use strict';

// React imports
import React from 'react';
import {
  Alert,
  AppState,
  AsyncStorage,
  InteractionManager,
  Platform,
  StyleSheet,
  View,
} from 'react-native';

// Redux imports
import * as actions from '../actions';
import { connect } from 'react-redux';

// Imports
import AppHeader from '../components/AppHeader';
import TabView from './TabView';
import * as Analytics from '../util/Analytics';
import * as Configuration from '../util/Configuration';
import * as Constants from '../constants';
import * as Database from '../util/Database';
import * as EmptyMain from './welcome/EmptyMain';
import * as Preferences from '../util/Preferences';
import * as Translations from '../util/Translations';

// Types
import { Store } from '../store/configureStore';
import { Language } from '../util/Translations';
import { TransitInfo } from '../../typings/transit';

interface Props {
  language: Language;                           // The current language, selected by the user
  navigator: any;                               // Parent navigator
  confirmUpdate(): void;                        // Indicate a user has confirmed an update
  setSchedule(schedule: object): void;          // Updates the user's schedule
  setTransit(transitInfo: TransitInfo): void;   // Updates the transit info object in the config
  setUniversity(university: object): void;      // Updates the university object in the config
  updatePreferences(preferences: any[]): void;  // Updates the user's preferences
}

interface State {
  appState: string; // The current active app state.
  loading: boolean; // Indicates if the app is loading the initial configuration.
}

// True to always show the splash screen in a __DEV__ environment
let alwaysShowSplash = false;

class Main extends React.PureComponent<Props, State> {

  /** Indicates if the first navigation event has been skipped yet. */
  _firstEventSkipped: boolean;

  /**
   * Constructor.
   *
   * @param {Props} props component props
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      appState: AppState.currentState,
      loading: true,
    };

    this._handleAppStateChange = this._handleAppStateChange.bind(this);
  }

  /**
   * Displays a pop up when the application opens for the first time.
   */
  componentDidMount(): void {
    (this.props.navigator as any).navigationContext.addListener('didfocus', this._handleNavigationEvent.bind(this));
    InteractionManager.runAfterInteractions(() => this._loadPreferences());
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  /**
   * Remove app state change listener.
   */
  componentWillUnmount(): void {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  /**
   * Handle app state changes. Update configuration when app comes to foreground.
   *
   * @param {string} nextAppState new app state
   */
  _handleAppStateChange = (nextAppState: string): void => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      this._checkConfiguration(false);
    }

    this.setState({ appState: nextAppState });
  }

  /**
   * Loads the downloaded base configuration and updates the redux store.
   *
   * @param {boolean} fallbackToUpdate if true, then force the user to update when the config
   *                                   has been found unavailable, otherwise re-check for config
   */
  async _checkConfiguration(fallbackToUpdate: boolean): Promise<void> {
    try {
      await Configuration.init();
      const university = await Configuration.getConfig('/university.json');
      this.props.setUniversity(university);

      await Translations.loadTranslations(Translations.getLanguage());
      const transitInfo: TransitInfo = await Configuration.getConfig('/transit.json');
      this.props.setTransit(transitInfo);

      this.setState({ loading: false });
      this._checkConfigurationUpdate();
    } catch (err) {
      Analytics.log(`Assuming configuration is not available: ${JSON.stringify(err)}`);

      // Load the base configuration when the full configuration is not available.
      await Configuration.setupDefaultConfiguration(Platform.OS);

      // Only force an update if the configuration is not available after the
      // default configuration is set up
      if (fallbackToUpdate) {
        this.props.navigator.push({ id: 'update' });
      } else {
        this._checkConfiguration(true);
      }
    }
  }

  /**
   * Check if there are any configuration updates available, and prompt the user to update.
   */
  async _checkConfigurationUpdate(): Promise<void> {
    const shouldCheckForUpdate = await Configuration.shouldCheckForUpdate(AsyncStorage);
    if (!shouldCheckForUpdate) {
      // Do not check for configuration updates more than once in an hour
      return;
    }

    try {
      const available = await Configuration.getAvailableConfigUpdates(Platform.OS, AsyncStorage);
      if (available.files.length > 0) {
        let totalSize = 0;
        for (const file of available.files) {
          totalSize += file.zsize ? file.zsize : file.size;
        }

        Alert.alert(
          Translations.get('update_available_title'),
          Configuration.constructUpdateMessage(
            Translations.get('update_available_msg'),
            totalSize,
            Translations.getDescription(available.whatsNew),
            Translations.get('default_update_msg')
          ),
          [
            { text: Translations.get('cancel'), style: 'cancel' },
            { text: Translations.get('update'), onPress: (): void => this._updateConfiguration(available) },
          ]
        );
      }
    } catch (err) {
      console.error('Error checking for configuration.', err);
    }
  }

  /**
   * Handles navigation events.
   */
  _handleNavigationEvent(): void {
    if (!this._firstEventSkipped) {
      this._firstEventSkipped = true;

      return;
    }

    const currentRoutes = (this.props.navigator as any).getCurrentRoutes();
    if (currentRoutes[currentRoutes.length - 1].id === 'main') {
      InteractionManager.runAfterInteractions(() => this._loadPreferences());
    }
  }

  /**
   * Loads the user's saved preferences and updates the redux store.
   */
  _loadPreferences(): void {
    const SCHEDULE = 6; // Corresponds to index of Database.getSchedule() below

    Promise.all([
      Preferences.getSelectedLanguage(AsyncStorage),
      Preferences.getCurrentSemester(AsyncStorage),
      Preferences.getPrefersWheelchair(AsyncStorage),
      Preferences.getPrefersShortestRoute(AsyncStorage),
      Preferences.getPreferredTimeFormat(AsyncStorage),
      Preferences.getPreferScheduleByCourse(AsyncStorage),
      Database.getSchedule(),
    ])
        .then((results: any[]) => {
          this.props.setSchedule(results[SCHEDULE] || {});
          this.props.updatePreferences(results);
          if (results[0] == undefined || (__DEV__ && alwaysShowSplash)) {
            // Language has not been selected
            alwaysShowSplash = false;
            this.props.navigator.push({ id: 'splash' });
          } else {
            // Language is selected, check configuration
            this._checkConfiguration(false);
          }
        })
        .catch((err: any) => console.error('Unable to load initial preferences', err));
  }

  /**
   * Opens the update screen to update the configuration.
   *
   * @param {Configuration.ConfigurationDetails} available available config file updates
   */
  _updateConfiguration(available: Configuration.ConfigurationDetails): void {
    this.props.confirmUpdate();
    this.props.navigator.push({ id: 'update', data: { available } });
  }

  /**
   * Renders the main view of the application.
   *
   * @returns {JSX.Element} the hierarchy of views to render
   */
  render(): JSX.Element {
    if (this.state.loading) {
      return (
        <View style={_styles.container}>
          {EmptyMain.renderEmptyMain()}
        </View>
      );
    }

    return (
      <View style={_styles.container}>
        <AppHeader />
        <TabView />
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    backgroundColor: Constants.Colors.primaryBackground,
    flex: 1,
  },
});

const mapStateToProps = (store: Store): object => {
  return {
    language: store.config.options.language,
  };
};

const mapDispatchToProps = (dispatch: any): object => {
  return {
    confirmUpdate: (): void => dispatch(actions.confirmUpdate()),
    setSchedule: (schedule: object): void => dispatch(actions.loadSchedule(schedule)),
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
    updatePreferences: (preferences: any[]): void => {

      /* tslint:disable no-magic-numbers */
      /* Order of these preferences determined by loadPreferences() order */

      dispatch(actions.updateConfiguration({
        currentSemester: preferences[1],
        language: preferences[0],
        preferredTimeFormat: preferences[4],
        prefersShortestRoute: preferences[3],
        prefersWheelchair: preferences[2],
        scheduleByCourse: preferences[5],
      }));

      /* tslint:enable no-magic-numbers */
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Main) as any;
