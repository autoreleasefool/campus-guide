/*
 * View to display the user's upcoming classes and events for the day.
 */
'use strict';

// React imports
const React = require('react-native');
const {
  Component,
  Text,
  TouchableOpacity,
} = React;

const Constants = require('../../../Constants');
const Preferences = require('../../../util/Preferences');
const Styles = require('../../../Styles');

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
    if (Preferences.getSelectedLanguage() === 'fr') {
      Translations = require('../../../../assets/static/js/Translations.fr.js');
    } else {
      Translations = require('../../../../assets/static/js/Translations.en.js');
    }

    if (!this.state.loaded) {
      return (
        <TouchableOpacity onPress={this.props.onEdit} style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
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
