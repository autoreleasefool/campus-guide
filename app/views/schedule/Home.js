/*
 * View for the root navigation for scheduling classes.
 */
'use strict';

// React imports
const React = require('react-native');
const {
  Component,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} = React;

const Constants = require('../../Constants');
const Ionicons = require('react-native-vector-icons/Ionicons');
const MaterialIcons = require('react-native-vector-icons/MaterialIcons');
const Preferences = require('../../util/Preferences');
const StatusBar = require('../../util/StatusBar');
const Styles = require('../../Styles');

class ScheduleHome extends Component {

  /*
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    requestTabChange: React.PropTypes.func.isRequired,
  };

  /*
   * Pass props and declares initial state.
   */
  constructor(props) {
    super(props);
    this.state = {
      dataSource: null,
    };

    // Explicitly binding 'this' to all methods that need it
    this._changeSchedule = this._changeSchedule.bind(this);
  };

  /*
   * Switches to the next available schedule and updates the views.
   */
  _changeSchedule() {
    // TODO: shuffle through the available schedules
    console.log('TODO: shuffle through the available schedules');
  };

  /*
   * Renders the root Schedule view.
   */
  render() {
    // Get current language for translations
    let Translations = null;
    if (Preferences.getSelectedLanguage() === 'en') {
      Translations = require('../../util/Translations.en.js');
    } else {
      Translations = require('../../util/Translations.fr.js');
    }

    // Use a different icon for the calendar depending on the platform
    let calendarIcon = null;
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
  };
};

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.Colors.charcoalGrey,
  },
  headerBackground: {
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
});

// Expose component to app
module.exports = ScheduleHome;
