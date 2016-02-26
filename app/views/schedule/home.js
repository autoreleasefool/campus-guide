'use strict';

// Imports
var React = require('react-native');
var {
  StyleSheet,
  View
} = React;

var Constants = require('../../constants');
var Preferences = require('../../util/preferences');
var styles = require('../../styles');
var Translations = require('../../util/translations');

// Root view
var ScheduleHome = React.createClass({
  propTypes: {
    requestTabChange: React.PropTypes.func.isRequired,
  },

  getInitialState() {
    return {
      dataSource: null,
    };
  },

  componentDidMount() {

  },

  render() {
    return (
      <View style={_styles.container}>
      </View>
    );
  },
});

var _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.Colors.charcoalGrey,
  },
});

module.exports = ScheduleHome;
