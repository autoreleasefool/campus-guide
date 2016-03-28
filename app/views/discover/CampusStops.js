/*
 * Displays a campus' location on a map, relative to a user's location, as well as a list of the stops
 * near the campus.
 */
'use strict';

// Imports
const React = require('react-native');
const {
  Component,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} = React;

const Constants = require('../../Constants');
const LanguageUtils = require('../../util/LanguageUtils');
const Preferences = require('../../util/Preferences');
const SectionHeader = require('../../components/SectionHeader');

class CampusStops extends Component {

  /*
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    campusName: React.PropTypes.string.isRequired,
  };

  /*
   * Pass props and declares initial state.
   */
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
    }
  };

  componentDidMount() {
    if (!this.state.loaded) {

    }
  }

  render() {
    // Get current language for translations
    let Translations = null;
    if (Preferences.getSelectedLanguage() === 'fr') {
      Translations = require('../../../assets/static/js/Translations.fr.js');
    } else {
      Translations = require('../../../assets/static/js/Translations.en.js');
    }

    return (
      <View style={_styles.container}/>
    );
  };
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

// Expose component to app
module.exports = CampusStops;
