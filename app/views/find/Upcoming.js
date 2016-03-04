/*
 * View to display the user's upcoming classes and events for the day.
 */
'use strict';

// React imports
var React = require('react-native');
var {
  Component,
  Text,
  TouchableOpacity,
} = React;

var Constants = require('../../Constants');
var Preferences = require('../../util/Preferences');
var Styles = require('../../Styles');

class Upcoming extends Component {

  /*
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    onEdit: React.PropTypes.func.isRequired,
  };

  /*
   * Pass props and declares initial state.
   */
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
    };
  };

  /*
   * Renders a list of the user's upcoming classes, or a view which links to the Schedule tab so the user
   * can update their schedule.
   */
  render() {
    // Get current language for translations
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
  };
};

// Expose component to app
module.exports = Upcoming;
