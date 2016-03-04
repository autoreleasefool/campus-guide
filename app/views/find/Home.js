/*
 * View for the root navigation for finding a room on campus.
 */
'use strict';

// React imports
var React = require('react-native');
var {
  Component,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} = React;

// Imports
var Buildings = require('./BuildingGrid');
var Constants = require('../../Constants');
var Ionicons = require('react-native-vector-icons/Ionicons');
var MaterialIcons = require('react-native-vector-icons/MaterialIcons');
var Preferences = require('../../util/Preferences');
var Styles = require('../../Styles');
var Upcoming = require('./Upcoming');

var {height, width} = Dimensions.get('window');

class FindHome extends Component {

  /*
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    onEditSchedule: React.PropTypes.func.isRequired,
  };

  /*
   * Pass props.
   */
  constructor(props) {
    super(props);

    // Explicitly binding 'this' to all methods that need it
    this._editSchedule = this._editSchedule.bind(this);
    this._search = this._search.bind(this);
  };

  /*
   * Opens the app scheduling screen so the user can update their schedule.
   */
  _editSchedule() {
    this.props.onEditSchedule();
  };

  /*
   * Searches through the buildings, professors, and classes
   */
  _search(text) {
    // TODO: search for a building, class, or professor
    console.log('TODO: search for a building, class, or professor');
  };

  /*
   * Renders the user's upcoming classes for the day and a list of buildings on campus.
   */
  render() {
    let calendarIcon = null;

    // Get current language for translations
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
  };
};

// Private styles for component
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
  },
});

// Expose component to app
module.exports = FindHome;
