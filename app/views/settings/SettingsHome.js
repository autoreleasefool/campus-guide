/*************************************************************************
 *
 * @license
 *
 * Copyright 2016 Joseph Roque
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
 *************************************************************************
 *
 * @file
 * SettingsHome.js
 *
 * @description
 * View to allow the user to see and update their settings and
 * preferences.
 *
 * @author
 * Joseph Roque
 *
 *************************************************************************
 *
 * @external
 * @flow
 *
 ************************************************************************/
'use strict';

// React Native imports
const React = require('react-native');
const {
  Component,
  ListView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} = React;

// Imports
const Constants = require('../../Constants');
const LanguageUtils = require('../../util/LanguageUtils');
const Preferences = require('../../util/Preferences');
const SectionHeader = require('../../components/SectionHeader');
const Styles = require('../../Styles');

// Declaring icons depending on the platform
let Icon;
let settingsIcons;
if (Platform.OS === 'ios') {
  Icon = require('react-native-vector-icons/Ionicons');
  settingsIcons = {
    'CheckEnabled': 'ios-circle-outline',
    'CheckDisabled': 'ios-checkmark',
  };
} else {
  Icon = require('react-native-vector-icons/MaterialIcons');
  settingsIcons = {
    'CheckEnabled': 'check-box-outline-blank',
    'CheckDisabled': 'check-box',
  };
}

// Require both language translations to switch between them easily
const TranslationsEn = require('../../../assets/static/js/Translations.en.js');
const TranslationsFr = require('../../../assets/static/js/Translations.fr.js');

// Create a cache of settings values to retrieve and update them quickly
let settings = require('../../../assets/static/json/settings.json');
let settingsCache = [];
let keyOfLastSettingChanged = null;

class SettingsHome extends Component {

  /**
   * Properties which the parent component should make available to this
   * component.
   */
  static propTypes = {
    requestTabChange: React.PropTypes.func.isRequired,
    refreshParent: React.PropTypes.func,
  };

  /**
   * Pass props and declares initial state.
   *
   * @param props properties passed from container to this component.
   */
  constructor(props) {
    super(props);
    this.state = {
      dataSource: new ListView.DataSource({
        rowHasChanged: (r1, r2) => this._checkChangedSetting(r1.key) || keyOfLastSettingChanged === 'pref_lang',
        sectionHeaderHasChanged: (s1, s2) => s1 !== s2 || keyOfLastSettingChanged === 'pref_lang',
      }),
      loaded: false,
    };

    // Explicitly binding 'this' to all methods that need it
    this._getSettings = this._getSettings.bind(this);
    this._pressRow = this._pressRow.bind(this);
    this._renderRow = this._renderRow.bind(this);
    this._renderSectionHeader = this._renderSectionHeader.bind(this);
  };

  /**
   * Returns true if a setting's current value does not match its cached value,
   * and updates the cached value if so.
   *
   * @param key identifier for the setting to check
   * @return true if the value in the cache was updated.
   */
  _checkChangedSetting(key) {
    let settingValue = Preferences.getSetting(key);
    let changed = settingsCache[key] !== settingValue;
    if (changed) {
      settingsCache[key] = settingValue;
    }

    return changed;
  };

  /*
   * Loads the current settings to setup the views and cache the settings to
   * determine when a setting changes.
   */
  _getSettings() {
    for (let section in settings) {
      for (let row in settings[section]) {
        settingsCache[settings[section][row]['key']] = Preferences.getSetting(Preferences.getSetting(settings[section][row]['key']));
      }
    }

    if (!this.state.loaded) {
      this.setState({
        dataSource: this.state.dataSource.cloneWithRowsAndSections(settings),
        loaded: true,
      });
    }
  };

  /**
   * Updates the setting for the row pressed.
   *
   * @param key identifier for the setting pressed.
   */
  _pressRow(key) {
    if (key === 'pref_lang') {
      Preferences.setSelectedLanguage(
        Preferences.getSelectedLanguage() === 'en'
            ? 'fr'
            : 'en'
      );

      if (this.props.refreshParent) {
        this.props.refreshParent();
      }
    } else if (key === 'pref_wheel') {
      Preferences.setWheelchairRoutePreferred(!Preferences.isWheelchairRoutePreferred());
    } else if (key === 'pref_semester') {
      Preferences.setToNextSemester();
    }

    keyOfLastSettingChanged = key;
    this.setState({
      dataSource: this.state.dataSource.cloneWithRowsAndSections(settings),
    });
  };

  /**
   * Displays a single row, representing a setting which can be changed.
   *
   * @param setting   defines the setting contents to render.
   * @param sectionId index of the section the setting is in.
   * @param rowId     index of the row the setting is in.
   * @return views to render the setting in the list.
   */
  _renderRow(setting, sectionId, rowId) {
    let content = null;
    if (setting.type === 'multi') {
      content =
          <View style={_styles.settingContent}>
            <Text style={[Styles.mediumText, {color: 'black'}]}>{Preferences.getSetting(setting.key)}</Text>
          </View>
    } else if (setting.type === 'boolean') {
      content =
          <View style={_styles.settingContent}>
            {
              Preferences.getSetting(setting.key)
                  ? <Icon name={settingsIcons['CheckEnabled']} color={Constants.Colors.charcoalGrey} size={20} />
                  : <Icon name={settingsIcons['CheckDisabled']} color={Constants.Colors.charcoalGrey} size={20} />
            }
          </View>
    }

    return (
      <View style={_styles.settingContainer}>
        <TouchableOpacity onPress={() => this._pressRow(setting.key)}>
          <View style={_styles.setting}>
            <Text style={[_styles.settingText, Styles.mediumText, {color: 'black'}]}>
              {LanguageUtils.getTranslatedName(Preferences.getSelectedLanguage(), setting)}
            </Text>
            {content}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  /**
   * Renders a heading for a section of settings.
   *
   * @param sectionData section contents
   * @param sectionId   index of the section.
   * @return a {SectionHeader} with the name of the section.
   */
  _renderSectionHeader(sectionData, sectionId) {
    let sectionName = sectionId;
    let colonIndex = sectionName.indexOf(':');
    if (colonIndex > -1) {
      if (Preferences.getSelectedLanguage() === 'en') {
        sectionName = sectionName.substring(0, colonIndex);
      } else {
        sectionName = sectionName.substring(colonIndex + 1);
      }
    }

    return (
      <SectionHeader
          sectionName={sectionName}
          backgroundOverride={Constants.Colors.lightGrey} />
    );
  };

  /**
   * Loads the settings once the view has been mounted.
   */
  componentDidMount() {
    this._getSettings();
  };

  /**
   * Displays a list of settings.
   *
   * @return the hierarchy of views to render.
   */
  render() {
    let CurrentTranslations = (Preferences.getSelectedLanguage() === 'en')
        ? TranslationsEn
        : TranslationsFr;

    if (!this.state.loaded) {
      // Return an empty view until the data has been loaded
      return (
        <View style={_styles.container} />
      );
    } else {
      return (
        <View style={_styles.container}>
          <Text style={[_styles.title, Styles.titleText, {color: 'black'}]}>
            {CurrentTranslations['settings']}
          </Text>
          <ListView
              dataSource={this.state.dataSource}
              renderRow={this._renderRow}
              renderSectionHeader={this._renderSectionHeader}
              style={_styles.listview} />
        </View>
      );
    }
  };
};

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

// Expose component to app
module.exports = SettingsHome;
