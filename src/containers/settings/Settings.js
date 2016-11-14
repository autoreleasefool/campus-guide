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
 * @created 2016-11-6
 * @file Settings.js
 * @description View to allow the user to see and update their settings and preferences.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  ListView,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Redux imports
import {connect} from 'react-redux';
import {
  updateConfiguration,
} from 'actions';

// Type imports
import type {
  ConfigurationOptions,
  Language,
  Semester,
  TimeFormat,
} from 'types';

// Type definition for component props.
type Props = {
  alwaysSearchAll: boolean,                               // If the user prefers to always search the entire app
  currentSemester: number,                                // The current semester, selected by the user
  language: Language,                                     // The current language, selected by the user
  prefersWheelchair: boolean,                             // Whether the user prefers wheelchair accessible routes
  semesters: Array < Semester >,                          // Semesters available at the university
  timeFormat: TimeFormat,                                 // The user's preferred time format
  updateConfiguration: (o: ConfigurationOptions) => void, // Update the global configuration state
};

// Type definition for component state.
type State = {
  dataSource: ListView.DataSource,  // List of settings to display
};

// Imports
import Header from 'Header';
import * as Configuration from 'Configuration';
import * as Constants from 'Constants';
import {loadTranslations, unloadTranslations, getTranslations, getTranslatedName} from 'TranslationUtils';

// Default opacity for tap when setting is not a boolean
const DEFAULT_OPACITY: number = 0.4;

class Settings extends React.Component {

  /**
   * Properties this component expects to be provided by its parent.
   */
  props: Props;

  /**
   * Current state of the component.
   */
  state: State;

  /**
   * Constructor.
   *
   * @param {props} props component props
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      dataSource: new ListView.DataSource({
        rowHasChanged: (r1: any) => this._keyChanged === r1.key || this._keyChanged === 'pref_lang',
        sectionHeaderHasChanged: (s1: any, s2: any) => s1 !== s2 || this._keyChanged === 'pref_lang',
      }),
    };
  }

  /**
   * Loads the settings once the view has been mounted.
   */
  componentDidMount(): void {
    Configuration.init()
        .then(() => loadTranslations('en'))
        .then(() => loadTranslations('fr'))
        .then(() => Configuration.getConfig('/settings.json'))
        .then((configSettings: Object) => {
          this._settings = configSettings;
          for (const section in this._settings) {
            if (this._settings.hasOwnProperty(section)) {
              for (const row in this._settings[section]) {
                if (this._settings[section].hasOwnProperty(row)) {
                  this._settingsCache[this._settings[section][row].key] =
                      this._getSetting(this._settings[section][row].key);
                }
              }
            }
          }

          this.setState({
            dataSource: this.state.dataSource.cloneWithRowsAndSections(this._settings),
          });
        })
        .catch((err: any) => console.error('Configuration could not be initialized for settings.', err));
  }

  /**
   * Updates the settings.
   */
  componentWillReceiveProps(): void {
    this.setState({
      dataSource: this.state.dataSource.cloneWithRowsAndSections(this._settings),
    });
  }

  /**
   * Unloads the unused language.
   */
  componentWillUnmount(): void {
    unloadTranslations(this.props.language === 'en' ? 'fr' : 'en');
  }

  /** Set of settings to display. */
  _settings: Object;

  /** Cache of settings values to retrieve and update them quickly. */
  _settingsCache: Object = {};

  /** Identifies the most recently changed setting, so it can be re-rendered. */
  _keyChanged: ?string = null;

  /**
   * Returns true if a setting's current value does not match its cached value, and updates the cached value if so.
   *
   * @param {string} key identifier for the setting to check
   * @returns {boolean} true if the value in the cache was updated.
   */
  _checkChangedSetting(key: string): boolean {
    const settingValue = this._getSetting(key);
    const changed = this._settingsCache[key] !== settingValue;

    if (changed) {
      this._settingsCache[key] = settingValue;
    }

    return changed;
  }

  /**
   * Returns the value of a setting based on the provided key. The returned value may be a string, boolean, integer,
   * or object, and should correspond to the type of the setting.
   *
   * @param {string} key the setting value to return.
   * @returns {any} the value of the setting corresponding to {key}, or null.
   */
  _getSetting(key: string): any {
    switch (key) {
      case 'pref_lang':
        return (this.props.language === 'en')
          ? 'English'
          : 'Français';
      case 'pref_wheel':
        return this.props.prefersWheelchair;
      case 'pref_semester':
        return getTranslatedName(this.props.language, this.props.semesters[this.props.currentSemester]);
      case 'pref_search_all_always':
        return this.props.alwaysSearchAll;
      case 'pref_time_format':
        return this.props.timeFormat;
      default:
        return null;
    }
  }

  /**
   * Updates the setting for the row pressed.
   *
   * @param {Object} setting setting that was pressed
   */
  _onPressRow(setting: Object): void {
    if (setting.type === 'boolean') {
      // Ignore boolean settings, they can only be manipulated by switch
      return;
    }

    if (setting.key === 'pref_lang') {
      this.props.updateConfiguration({language: this.props.language === 'en' ? 'fr' : 'en'});
    } else if (setting.key === 'pref_wheel') {
      this.props.updateConfiguration({prefersWheelchair: !this.props.prefersWheelchair});
    } else if (setting.key === 'pref_semester') {
      let nextSemester = this.props.currentSemester + 1;
      if (nextSemester >= this.props.semesters.length) {
        nextSemester = 0;
      }
      this.props.updateConfiguration({currentSemester: nextSemester});
    } else if (setting.key === 'pref_search_all_always') {
      this.props.updateConfiguration({alwaysSearchAll: !this.props.alwaysSearchAll});
    } else if (setting.key === 'pref_time_format') {
      this.props.updateConfiguration({preferredTimeFormat: this.props.timeFormat === '12h' ? '24h' : '12h'});
    }

    this._keyChanged = key;
  }

  /**
   * Displays a single row, representing a setting which can be changed.
   *
   * @param {Object} setting defines the setting contents to render
   * @returns {ReactElement<any>} views to render the setting in the list
   */
  _renderRow(setting: Object): ReactElement < any > {
    let content = null;
    if (setting.type === 'multi' || setting.type === 'text') {
      content = (
        <View style={_styles.settingContent}>
          <Text style={_styles.settingValue}>{this._getSetting(setting.key)}</Text>
        </View>
      );
    } else if (setting.type === 'boolean') {
      content = (
        <View style={_styles.settingContent}>
          <Switch
              value={this._getSetting(setting.key)}
              onValueChange={() => this._onPressRow(setting)} />
        </View>
      );
    }

    return (
      <View style={_styles.settingContainer}>
        <TouchableOpacity
            activeOpacity={setting.type === 'boolean' ? 1 : DEFAULT_OPACITY}
            onPress={this._onPressRow.bind(this, setting)}>
          <View style={_styles.setting}>
            <Text style={_styles.settingText}>{getTranslatedName(this.props.language, setting)}</Text>
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
   * @param {string} sectionName index of the section
   * @returns {ReactElement<any>} a {SectionHeader} with the name of the section
   */
  _renderSectionHeader(sectionData: Object, sectionName: string): ReactElement < any > {
    const colonIndex: number = sectionName.indexOf(':');
    let sectionNameTranslated = sectionName;
    if (colonIndex > -1) {
      if (this.props.language === 'en') {
        sectionNameTranslated = sectionName.substring(0, colonIndex);
      } else {
        sectionNameTranslated = sectionName.substring(colonIndex + 1);
      }
    }

    return (
      <Header
          backgroundColor={Constants.Colors.lightGrey}
          title={sectionNameTranslated} />
    );
  }

  /**
   * Renders a separator line between rows.
   *
   * @param {any} sectionID section id
   * @param {any} rowID     row id
   * @returns {ReactElement<any>} a separator for the list of settings
   */
  _renderSeparator(sectionID: any, rowID: any): ReactElement < any > {
    return (
      <View
          key={`${sectionID},${rowID}`}
          style={_styles.separator} />
    );
  }

  /**
   * Displays a list of settings.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render
   */
  render(): ReactElement < any > {
    const Translations: Object = TranslationUtils.getTranslations(this.props.language);

    return (
      <View style={_styles.container}>
        <View style={_styles.headerContainer}>
          <Header
              icon={{name: Platform.OS === 'ios' ? 'ios-settings' : 'settings', class: 'ionicon'}}
              title={Translations.settings} />
        </View>
        <ListView
            dataSource={this.state.dataSource}
            renderRow={this._renderRow.bind(this)}
            renderSectionHeader={this._renderSectionHeader.bind(this)}
            renderSeparator={this._renderSeparator.bind(this)} />
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.Colors.polarGrey,
  },
  headerContainer: {
    backgroundColor: Constants.Colors.primaryBackground,
  },
  settingContainer: {
    backgroundColor: Constants.Colors.secondaryBackground,
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
    height: 50,
    justifyContent: 'center',
  },
  settingText: {
    marginLeft: Constants.Sizes.Margins.Expanded,
    color: Constants.Colors.primaryBlackText,
    fontSize: Constants.Sizes.Text.Body,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Constants.Colors.darkTransparentBackground,
    marginLeft: Constants.Sizes.Margins.Expanded,
    marginRight: Constants.Sizes.Margins.Expanded,
  },
  settingValue: {
    color: Constants.Colors.primaryBlackText,
    fontSize: Constants.Sizes.Text.Body,
  },
});

// Map state to props
const select = (store) => {
  return {
    alwaysSearchAll: store.config.alwaysSearchAll,
    currentSemester: store.config.currentSemester,
    language: store.config.language,
    prefersWheelchair: store.config.prefersWheelchair,
    semesters: store.config.semesters,
    timeFormat: store.config.preferredTimeFormat,
  };
};

// Map dispatch to props
const actions = (dispatch) => {
  return {
    updateConfiguration: (options: ConfigurationOptions) => dispatch(updateConfiguration(options)),
  };
};

export default connect(select, actions)(Settings);
