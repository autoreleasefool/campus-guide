'use strict';

// react-native imports
var React = require('react-native');

var {
  StyleSheet,
  View
} = React;

// Other imports
var Orientation = require('react-native-orientation');
var styles = require('../styles');

var MainScreen = React.createClass({

  _orientationDidChange: function(orientation) {
    // TODO: if this remains unused, then delete it and the add/remove OrientationListener lines
    if (orientation == 'LANDSCAPE') {
      // TODO: adjust for landscape layout if necessary
    } else {
      // TODO: adjust for portrait layout if necessary
    }
  },

  componentDidMount() {
    // Allow all orientations
    Orientation.unlockAllOrientations();
    // Add a listener for orientation changes
    Orientation.addOrientationListener(this._orientationDidChange);
  },

  componentWillUnmount: function() {
    // Remove the orientation change listener
    Orientation.removeOrientationListener(this._orientationDidChange);
  },

  render() {
    console.log('rendering main');
    return (
      <View style={[_styles.container, styles.polarGreyBackground]}></View>
    );
  }
});

var _styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

module.exports = MainScreen;
