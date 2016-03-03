/*
 * View for the root navigation for finding a room on campus.
 */
'use strict';

// React imports
var React = require('react-native');
var {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} = React;

// Imports
var Constants = require('../../Constants');
var Preferences = require('../../util/Preferences');
var Styles = require('../../Styles');
var {height, width} = Dimensions.get('window');

// View imports
var Buildings = require('./BuildingGrid');
var Upcoming = require('./Upcoming');

// Icons
var Ionicons = require('react-native-vector-icons/Ionicons');
var MaterialIcons = require('react-native-vector-icons/MaterialIcons');

var FindHome = React.createClass({
  propTypes: {
    requestTabChange: React.PropTypes.func.isRequired,
  },

  /*
   * Searches through the buildings, professors, and classes
   */
  _search(text) {
    // TODO: search for a building, class, or professor
    console.log('TODO: search for a building, class, or professor');
  },

  /*
   * Opens the app scheduling screen so the user can update their schedule.
   */
  _editSchedule() {
    this.props.requestTabChange(Constants.Views.Schedule.Home);
  },

  /*
   * Renders the root Find view.
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
            {Translations['upcoming_classes']}
          </Text>
          <TouchableOpacity
              onPress={this._editSchedule}
              activeOpacity={0.4}
              style={{position: 'absolute', right: 0}}>
            <Text style={[Styles.smallText, {color: 'white', marginTop: 17, marginBottom: 16, marginLeft: 20, marginRight: 20}]}>
              {Translations['edit']}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={[_styles.content, {flex: 1}]}>
          <Upcoming onEdit={this._editSchedule} />
        </View>

        <View style={[Styles.header, _styles.headerBackground]}>
          <MaterialIcons
              name={'store'}
              size={24}
              color={'white'}
              style={Styles.headerIcon} />
          <Text style={[Styles.largeText, {color: 'white', marginLeft: 20}]}>
            {Translations['building_directory']}
          </Text>
        </View>
        <View style={[_styles.content, {flex: 2}]}>
          <Buildings />
        </View>

      </View>
    );
  },
});

// View styles
var _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.Colors.garnet,
  },
  headerBackground: {
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  content: {
    margin: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  }
});

module.exports = FindHome;
