/*
 * View for the root navigation for scheduling classes.
 */
'use strict';

// React imports
var React = require('react-native');
var {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} = React;

// Imports
var Constants = require('../../Constants');
var Preferences = require('../../util/Preferences');
var StatusBar = require('../../util/StatusBar');
var Styles = require('../../Styles');

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

  /*
   * Returns the initial state of the view.
   */
  getInitialState() {
    return {
      dataSource: null,
    };
  },

  /*
   * Renders the root Schedule view.
   */
  render() {
    let calendarIcon = null;

    // Translations
    let Translations = null;
    if (Preferences.getSelectedLanguage() === 'en') {
      Translations = require('../../util/Translations.en.js');
    } else {
      Translations = require('../../util/Translations.fr.js');
    }

    // Use a different icon for the calendar depending on the platform
    if (Platform.OS === 'ios') {
      calendarIcon =
        <Ionicons
            name={'ios-calendar-outline'}
            size={24}
            color={'white'}
            style={Styles.headerIcon} />;
    } else {
      calendarIcon =
        <MaterialIcons
            name={'event'}
            size={24}
            color={'white'}
            style={Styles.headerIcon} />;
    }

    return (
      <View style={_styles.container}>
        <View style={[Styles.header, _styles.headerBackground]}>
          {calendarIcon}
          <Text style={[Styles.largeText, {color: 'white', marginLeft: 20}]}>
            {Translations['schedule']}
          </Text>
          <TouchableOpacity
              onPress={this._changeSchedule}
              activeOpacity={0.4}
              style={{position: 'absolute', right: 0, flex: 1, flexDirection: 'row'}}>
            <Text style={[Styles.smallText, {color: 'white', marginTop: 17, marginBottom: 16, marginLeft: 20, marginRight: 20}]}>
              {Translations['winter'].toUpperCase()}
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

// View styles
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
