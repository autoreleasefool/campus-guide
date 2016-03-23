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

const Configuration = require('../../util/Configuration');
const Constants = require('../../Constants');
const LanguageUtils = require('../../util/LanguageUtils');
const Preferences = require('../../util/Preferences');
const SectionHeader = require('../../components/SectionHeader');
const StatusBar = require('../../util/StatusBar');
const Styles = require('../../Styles');

class ScheduleHome extends Component {

  /*
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    requestTabChange: React.PropTypes.func.isRequired,
    editSchedule: React.PropTypes.func.isRequired,
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
    Preferences.setToNextSemester();
    let header = this.refs.ScheduleHeader;
    header.updateSubtitle(LanguageUtils.getTranslatedName(Preferences.getSelectedLanguage(), Preferences.getCurrentSemesterInfo()), header.getSubtitleIcon(), header.getSubtitleIconClass());
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
      calendarIcon = ['ionicon', 'ios-calendar-outline'];
    } else {
      calendarIcon = ['material', 'event'];
    }

    return (
      <View style={_styles.container}>
        <SectionHeader
            ref='ScheduleHeader'
            sectionName={Translations['schedule']}
            sectionIcon={calendarIcon[1]}
            sectionIconClass={calendarIcon[0]}
            subtitleOnClick={this._changeSchedule}
            subtitleName={LanguageUtils.getTranslatedName(Preferences.getSelectedLanguage(), Preferences.getCurrentSemesterInfo())}
            subtitleIcon={'arrow-swap'}
            subtitleIconClass={'ionicon'} />
        {/* TODO: replace with scroll view for schedule */}
        <View style={{flex: 1}} />
        <TouchableOpacity onPress={this.props.editSchedule}>
          <View style={_styles.editButton}>
            <Text style={[Styles.mediumText, {color: 'white'}]}>
              {Translations['edit_schedule']}
            </Text>
          </View>
        </TouchableOpacity>
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
  editButton: {
    backgroundColor: Constants.Colors.garnet,
    height: 50,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    color: 'white',
  },
});

// Expose component to app
module.exports = ScheduleHome;
