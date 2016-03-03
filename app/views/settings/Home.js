/*
 * View for the root navigation for updating settings.
 */
'use strict';

// React imports
var React = require('react-native');
var {
  ListView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} = React;

// Imports
var Constants = require('../../Constants');
var Preferences = require('../../util/Preferences');
var Styles = require('../../Styles');

// Icons
var Icon;
var settingsIcons;
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

// Translations
var TranslationsEn = require('../../util/Translations.en.js');
var TranslationsFr = require('../../util/Translations.fr.js');

var settings = require('../../../assets/static/json/settings.json');
var settingsCache = [];
var keyOfLastSettingChanged = null;

// Root view
var SettingsHome = React.createClass({
  propTypes: {
    requestTabChange: React.PropTypes.func.isRequired,
  },

  /*
   * Loads the current settings to setup the views and cache the settings to determine when a setting changes.
   */
  _getSettings() {
    for (var section in settings) {
      for (var row in settings[section]) {
        settingsCache[row.key] = Preferences.getSetting(row.key);
      }
    }

    this.setState({
      dataSource: this.state.dataSource.cloneWithRowsAndSections(settings),
      loaded: true,
    });
  },

  /*
   * Returns true if a setting's current value does not match its cached value, and updates the cached value if so.
   */
  _checkChangedSetting(key) {
    let settingValue = Preferences.getSetting(key);
    let changed = settingsCache[key] !== settingValue;
    if (changed) {
      settingsCache[key] = settingValue;
    }

    return changed;
  },

  /*
   * Updates the setting for the row pressed.
   */
  _pressRow(key) {
    if (key === 'pref_lang') {
      Preferences.setSelectedLanguage(
        Preferences.getSelectedLanguage() === 'en'
            ? 'fr'
            : 'en'
      );
    } else if (key === 'pref_wheel') {
      Preferences.setWheelchairRoutePreferred(!Preferences.isWheelchairRoutePreferred());
    }

    keyOfLastSettingChanged = key;
    this.setState({
      dataSource: this.state.dataSource.cloneWithRowsAndSections(settings),
    });
  },

  /*
   * Displays a single row, representing a setting which can be changed.
   */
  _renderRow(setting, sectionId, rowId) {
    if (setting.type === 'multi') {
      var content =
          <View style={_styles.settingContent}>
            <Text style={[Styles.mediumText, {color: 'black'}]}>{Preferences.getSetting(setting.key)}</Text>
          </View>
    } else if (setting.type === 'boolean') {
      var content =
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
              {setting['name_' + Preferences.getSelectedLanguage()]}
            </Text>
            {content}
          </View>
        </TouchableOpacity>
      </View>
    );
  },

  /*
   * Renders a heading for a section of settings.
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
      <View style={_styles.section}>
        <Text style={[Styles.largeText, {color: 'black'}]}>{sectionName}</Text>
      </View>
    );
  },

  /*
   * Returns the initial state of the view.
   */
  getInitialState() {
    return {
      dataSource: new ListView.DataSource({
        rowHasChanged: (r1, r2) => this._checkChangedSetting(r1.key) || keyOfLastSettingChanged === 'pref_lang',
        sectionHeaderHasChanged: (s1, s2) => s1 !== s2 || keyOfLastSettingChanged === 'pref_lang',
      }),
      loaded: false,
    }
  },

  /*
   * Loads the settings once the view has been mounted.
   */
  componentDidMount() {
    if (!this.state.loaded) {
      this._getSettings();
    }
  },

  /*
   * Displays a list of settings.
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
  },
});

// View styles
var _styles = StyleSheet.create({
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
  section: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    backgroundColor: Constants.Colors.lightGrey,
  },
  settingContainer: {
    backgroundColor: Constants.Colors.charcoalGrey,
  },
  setting: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: Constants.Colors.polarGrey,
  },
  settingContent: {
    position: 'absolute',
    right: 20,
  }
});

module.exports = SettingsHome;
