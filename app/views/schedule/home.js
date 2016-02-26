'use strict';

// Imports
var React = require('react-native');
var {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} = React;

var Constants = require('../../constants');
var Preferences = require('../../util/preferences');
var StatusBar = require('../../util/statusbar');
var styles = require('../../styles');
var Translations = require('../../util/translations');

// Icons
var Ionicons = require('react-native-vector-icons/Ionicons');
var MaterialIcons = require('react-native-vector-icons/MaterialIcons');

// Root view
var ScheduleHome = React.createClass({
  propTypes: {
    requestTabChange: React.PropTypes.func.isRequired,
  },

  /*
   * Switches to the next available schedule and updates the views.
   */
  _changeSchedule() {
    // TODO: shuffle through the available schedules
    console.log('TODO: shuffle through the available schedules');
  },

  getInitialState() {
    return {
      dataSource: null,
    };
  },

  componentDidMount() {

  },

  render() {
    let calendarIcon = null;

    // Use a different icon for the calendar depending on the platform
    if (Platform.OS === 'ios') {
      calendarIcon =
        <Ionicons
            name={'ios-calendar-outline'}
            size={24}
            color={'white'}
            style={styles.headerIcon} />;
    } else {
      calendarIcon =
        <MaterialIcons
            name={'event'}
            size={24}
            color={'white'}
            style={styles.headerIcon} />;
    }

    return (
      <View style={_styles.container}>
        <View style={[styles.header, _styles.headerBackground]}>
          {calendarIcon}
          <Text style={[styles.largeText, {color: 'white', marginLeft: 20}]}>
            {Translations[Preferences.getSelectedLanguage()]['schedule']}
          </Text>
          <TouchableOpacity
              onPress={this._changeSchedule}
              activeOpacity={0.4}
              style={{position: 'absolute', right: 0, flex: 1, flexDirection: 'row'}}>
            <Text style={[styles.smallText, {color: 'white', marginTop: 17, marginBottom: 16, marginLeft: 20, marginRight: 20}]}>
              {Translations[Preferences.getSelectedLanguage()]['winter'].toUpperCase()}
            </Text>
            <Ionicons
                name={'arrow-swap'}
                size={18}
                color={'white'}
                style={{marginTop: 15, marginBottom: 15, marginRight: 20}} />
          </TouchableOpacity>
        </View>
      </View>
    );
  },
});

var _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.Colors.charcoalGrey,
    paddingTop: 20 + StatusBar.getStatusBarPadding(),
  },
  headerBackground: {
    backgroundColor: Constants.Colors.garnet,
  },
});

module.exports = ScheduleHome;
