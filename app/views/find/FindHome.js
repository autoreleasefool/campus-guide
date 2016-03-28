/*
 * View for the root navigation for finding a room on campus.
 */
'use strict';

// React imports
const React = require('react-native');
const {
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
const BuildingPage = require('./BuildingPage');
const BuildingGrid = require('./BuildingGrid');
const Constants = require('../../Constants');
const Preferences = require('../../util/Preferences');
const SectionHeader = require('../../components/SectionHeader');
const Styles = require('../../Styles');
const Upcoming = require('./Upcoming');

const {height, width} = Dimensions.get('window');

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
    this._showBuilding = this._showBuilding.bind(this);
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
   * Loads a view to display details about a building.
   */
  _showBuilding(building) {

  };

  /*
   * Renders the user's upcoming classes for the day and a list of buildings on campus.
   */
  render() {
    // Get current language for translations
    let Translations = null;
    if (Preferences.getSelectedLanguage() === 'fr') {
      Translations = require('../../../assets/static/js/Translations.fr.js');
    } else {
      Translations = require('../../../assets/static/js/Translations.en.js');
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
            sectionName={Translations['upcoming_classes']}
            sectionIcon={calendarIcon[1]}
            sectionIconClass={calendarIcon[0]}
            subtitleOnClick={this._editSchedule}
            subtitleName={Translations['edit']} />
        <View style={[_styles.content, {flex: 1}]}>
          <Upcoming onEdit={this._editSchedule} />
        </View>

        <SectionHeader
            sectionName={Translations['building_directory']}
            sectionIcon={'store'}
            sectionIconClass={'material'} />
        <View style={[_styles.content, {flex: 2}]}>
          <BuildingGrid showBuilding={this._showBuilding} />
        </View>

      </View>
    );
  };
};

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.Colors.garnet,
  },
  content: {
    margin: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
});

// Expose component to app
module.exports = FindHome;
