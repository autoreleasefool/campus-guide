'use strict';

// react-native imports
var React = require('react-native');

var {
  ListView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} = React;

// Other imports
var Constants = require('../../constants');
var Preferences = require('../../util/preferences');
var styles = require('../../styles');
var Translations = require('../../util/translations');

var SettingsHome = React.createClass({

  _getSettings() {
    var settings = require('../../assets/json/settings.json');
    this.setState({
      dataSource: this.state.dataSource.cloneWithRowsAndSections(settings),
      loaded: true,
    });
  },

  _pressRow(rowId) {

  },

  _renderRow(setting, sectionId, rowId) {
    if (setting.type === 'multi') {
      var content =
          <View style={_styles.settingContent}>
            <Text style={styles.mediumText}>{Preferences.getSetting(setting.key)}</Text>
          </View>
    }

    return (
      <View style={_styles.settingContainer}>
        <TouchableOpacity onPress={() => this._pressRow(setting.key)}>
          <View style={_styles.setting}>
            <Text style={[_styles.settingText, styles.mediumText]}>{setting['name_' + Preferences.getSelectedLanguage()]}</Text>
            {content}
          </View>
        </TouchableOpacity>
      </View>
    );
  },

  _renderSectionHeader(sectionData, sectionId) {
    return (
      <View style={_styles.section}>
        <Text style={styles.largeText}>{sectionId}</Text>
      </View>
    );
  },

  componentWillMount() {
    if (!this.state.loaded) {
      this._getSettings();
    }
  },

  getInitialState() {
    return {
      dataSource: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
        sectionHeaderHasChanged: (s1, s2) => s1 !== s2
      }),
      loaded: false,
    }
  },

  render() {
    if (!this.state.loaded) {
      // Return an empty view until the data has been loaded
      return (
        <View style={_styles.container} />
      );
    } else {
      return (
        <View style={_styles.container}>
          <Text style={[_styles.title, styles.titleText]}>Settings</Text>
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

var _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.Colors.polarGrey,
  },
  title: {
    height: 50,
    paddingTop: 20,
    marginBottom: 5,
    textAlign: 'center',
  },
  section: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
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
