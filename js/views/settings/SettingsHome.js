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
 * @file SettingsHome.js
 * @providesModule SettingsHome
 * @description View to allow the user to see and update their settings and preferences.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  AsyncStorage,
  ListView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Type definition for settings icons.
type SettingIcons = {
  checkEnabled: string,
  checkDisabled: string,
};

// Type definition for component props.
type Props = {
  refreshParent: () => any,
};

// Type definition for component state.
type State = {
  dataSource: ListView.DataSource,
  loaded: boolean,
};

// Imports
const Configuration = require('Configuration');
const Constants = require('Constants');
const TranslationUtils = require('TranslationUtils');
const Preferences = require('Preferences');
const SectionHeader = require('SectionHeader');

// Declaring icons depending on the platform
let Icon: ReactClass < any >;
let settingIcons: SettingIcons;
if (Platform.OS === 'ios') {
  Icon = require('react-native-vector-icons/Ionicons');
  settingIcons = {
    checkEnabled: 'md-checkbox',
    checkDisabled: 'md-square',
  };
} else {
  Icon = require('react-native-vector-icons/MaterialIcons');
  settingIcons = {
    checkEnabled: 'check-box-outline-blank',
    checkDisabled: 'check-box',
  };
}

// Create a cache of settings values to retrieve and update them quickly
let settings: Object;
const settingsCache: Object = {};
let keyOfLastSettingChanged: ?string = null;

class SettingsHome extends React.Component {

  /**
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    refreshParent: React.PropTypes.func,
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
      dataSource: new ListView.DataSource({
        rowHasChanged: r1 => this._checkChangedSetting(r1.key) || keyOfLastSettingChanged === 'pref_lang',
        sectionHeaderHasChanged: (s1, s2) => s1 !== s2 || keyOfLastSettingChanged === 'pref_lang',
      }),
      loaded: false,
    };

    // Explicitly binding 'this' to all methods that need it
    (this:any)._loadLanguages = this._loadLanguages.bind(this);
    (this:any)._loadSettings = this._loadSettings.bind(this);
    (this:any)._pressRow = this._pressRow.bind(this);
  }

  /**
   * Loads the settings once the view has been mounted.
   */
  componentDidMount(): void {
    Configuration.init()
        .then(this._loadLanguages)
        .catch(err => console.error('Configuration could not be initialized for settings.', err));
  }

  /**
   * Unloads the unused language.
   */
  componentWillUnmount(): void {
    TranslationUtils.unloadTranslations(Preferences.getSelectedLanguage() === 'en' ? 'fr' : 'en');
  }

  /**
   * Returns true if a setting's current value does not match its cached value, and updates the cached value if so.
   *
   * @param {string} key identifier for the setting to check
   * @returns {boolean} true if the value in the cache was updated.
   */
  _checkChangedSetting(key: string): boolean {
    const settingValue = Preferences.getSetting(key);
    const changed = settingsCache[key] !== settingValue;
    if (changed) {
      settingsCache[key] = settingValue;
    }

    return changed;
  }

  /**
   * Ensure both language translations are loaded so they are fast to switch between.
   */
  _loadLanguages(): void {
    TranslationUtils.loadTranslations('en')
        .then(() => TranslationUtils.loadTranslations('fr'))
        .then(this._loadSettings);
  }

  /**
   * Loads the current settings to setup the views and cache the settings to determine when a setting changes.
   */
  _loadSettings(): void {
    Configuration.getConfig('/settings.json')
        .then(configSettings => {
          settings = configSettings;
          for (const section in settings) {
            if (settings.hasOwnProperty(section)) {
              for (const row in settings[section]) {
                if (settings[section].hasOwnProperty(row)) {
                  settingsCache[settings[section][row].key] =
                      Preferences.getSetting(Preferences.getSetting(settings[section][row].key));
                }
              }
            }
          }

          if (!this.state.loaded) {
            this.setState({
              dataSource: this.state.dataSource.cloneWithRowsAndSections(settings),
              loaded: true,
            });
          }
        })
        .catch(err => console.error('Could not get /settings.json.', err));
  }

  /**
   * Updates the setting for the row pressed.
   *
   * @param {string} key identifier for the setting pressed.
   */
  _pressRow(key: string): void {
    if (key === 'pref_lang') {
      Preferences.setSelectedLanguage(
        AsyncStorage,
        Preferences.getSelectedLanguage() === 'en'
            ? 'fr'
            : 'en'
      );

      if (this.props.refreshParent) {
        this.props.refreshParent();
      }
    } else if (key === 'pref_wheel') {
      Preferences.setWheelchairRoutePreferred(AsyncStorage, !Preferences.isWheelchairRoutePreferred());
    } else if (key === 'pref_semester') {
      Preferences.setToNextSemester(AsyncStorage);
    } else if (key === 'pref_search_all_always') {
      Preferences.setAlwaysSearchAll(AsyncStorage, !Preferences.getAlwaysSearchAll());
    } else if (key === 'pref_time_format') {
      Preferences.setPreferredTimeFormat(AsyncStorage, Preferences.getPreferredTimeFormat() === '24' ? '12' : '24');
    }

    keyOfLastSettingChanged = key;
    this.setState({
      dataSource: this.state.dataSource.cloneWithRowsAndSections(settings),
    });
  }

  /**
   * Displays a single row, representing a setting which can be changed.
   *
   * @param {Object} setting defines the setting contents to render.
   * @returns {ReactElement<any>} views to render the setting in the list.
   */
  _renderRow(setting: Object): ReactElement < any > {
    let content = null;
    if (setting.type === 'multi') {
      content = (
        <View style={_styles.settingContent}>
          <Text style={{color: 'black', fontSize: Constants.Text.Medium}}>
            {Preferences.getSetting(setting.key)}
          </Text>
        </View>
      );
    } else if (setting.type === 'boolean') {
      content = (
        <View style={_styles.settingContent}>
          {
            Preferences.getSetting(setting.key)
                ? <Icon
                    color={Constants.Colors.charcoalGrey}
                    name={settingIcons.checkEnabled}
                    size={Constants.Icon.Medium} />
                : <Icon
                    color={Constants.Colors.charcoalGrey}
                    name={settingIcons.checkDisabled}
                    size={Constants.Icon.Medium} />
          }
        </View>
      );
    }

    return (
      <View style={_styles.settingContainer}>
        <TouchableOpacity onPress={() => this._pressRow(setting.key)}>
          <View style={_styles.setting}>
            <Text style={[_styles.settingText, {color: 'black', fontSize: Constants.Text.Medium}]}>
              {TranslationUtils.getTranslatedName(Preferences.getSelectedLanguage(), setting)}
            </Text>
            {content}
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  /**
   * Renders a heading for a section of settings.
   *
   * @param {Object} sectionData section contents
   * @param {string} sectionName index of the section.
   * @returns {ReactElement<any>} a {SectionHeader} with the name of the section.
   */
  _renderSectionHeader(sectionData: Object, sectionName: string): ReactElement < any > {
    const colonIndex: number = sectionName.indexOf(':');
    let sectionNameTranslated = sectionName;
    if (colonIndex > -1) {
      if (Preferences.getSelectedLanguage() === 'en') {
        sectionNameTranslated = sectionName.substring(0, colonIndex);
      } else {
        sectionNameTranslated = sectionName.substring(colonIndex + 1);
      }
    }

    return (
      <SectionHeader
          backgroundOverride={Constants.Colors.lightGrey}
          sectionName={sectionNameTranslated} />
    );
  }

  /**
   * Displays a list of settings.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement < any > {
    const Translations: Object = TranslationUtils.getTranslations(Preferences.getSelectedLanguage());

    if (this.state.loaded) {
      return (
        <View style={_styles.container}>
          <Text style={_styles.title}>
            {Translations.settings}
          </Text>
          <ListView
              dataSource={this.state.dataSource}
              renderRow={this._renderRow.bind(this)}
              renderSectionHeader={this._renderSectionHeader.bind(this)} />
        </View>
      );
    } else {
      // Return an empty view until the data has been loaded
      return (
        <View style={_styles.container} />
      );
    }
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.Colors.polarGrey,
  },
  title: {
    height: 30,
    marginTop: 10,
    marginBottom: 5,
    textAlign: 'center',
    fontSize: Constants.Text.Title,
    color: Constants.Colors.primaryBlackText,
  },
  settingContainer: {
    backgroundColor: Constants.Colors.charcoalGrey,
  },
  setting: {
    flexDirection: 'row',
    height: 50,
    alignItems: 'center',
    backgroundColor: Constants.Colors.polarGrey,
  },
  settingContent: {
    position: 'absolute',
    right: 20,
    top: 15,
  },
  settingText: {
    marginLeft: 20,
  },
});

module.exports = SettingsHome;
