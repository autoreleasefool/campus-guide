'use strict';

// Imports
var React = require('react-native');
var {
  Text,
  TouchableOpacity,
} = React;

var Constants = require('../../constants');
var Preferences = require('../../util/preferences');
var styles = require('../../styles');
var Translations = require('../../util/translations');

// Root view
var Upcoming = React.createClass({
  propTypes: {
    onEdit: React.PropTypes.func.isRequired,
  },

  getInitialState() {
    return {
      loaded: false,
    };
  },

  render() {
    if (!this.state.loaded) {
      return (
        <TouchableOpacity activeOpacity={1} onPress={this.props.onEdit} style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <Text style={[styles.mediumText, {color: 'white', textAlign: 'center'}]}>
            {Translations[Preferences.getSelectedLanguage()]['no_courses_added']}
          </Text>
        </TouchableOpacity>
      );
    }
  },
});

module.exports = Upcoming;
