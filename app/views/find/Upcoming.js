/*
 * View to display the user's upcoming classes and events for the day
 */
'use strict';

// React imports
var React = require('react-native');
var {
  Text,
  TouchableOpacity,
} = React;

// Imports
var Constants = require('../../Constants');
var Preferences = require('../../util/Preferences');
var Styles = require('../../Styles');

// Root view
var Upcoming = React.createClass({
  propTypes: {
    onEdit: React.PropTypes.func.isRequired,
  },

  /*
   * Returns the initial state of the view.
   */
  getInitialState() {
    return {
      loaded: false,
    };
  },

  /*
   * Renders a list of the user's upcoming classes, or a view which links to the Schedule tab so the user
   * can update their schedule.
   */
  render() {
    // Translations
    let Translations = null;
    if (Preferences.getSelectedLanguage() === 'en') {
      Translations = require('../../util/Translations.en.js');
    } else {
      Translations = require('../../util/Translations.fr.js');
    }

    if (!this.state.loaded) {
      return (
        <TouchableOpacity activeOpacity={1} onPress={this.props.onEdit} style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <Text style={[Styles.mediumText, {color: 'white', textAlign: 'center'}]}>
            {Translations['no_courses_added']}
          </Text>
        </TouchableOpacity>
      );
    }
  },
});

module.exports = Upcoming;
