'use strict';

var React = require('react-native');
var ScrollableTabView = require('react-native-scrollable-tab-view');
var styles = require('../styles');

var {
  View
} = React;

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
    return (
      <ScrollableTabView
          tabBarPosition={'bottom'}>
        <View style={[styles.garnetBackground, {flex: 1}]} tabLabel="Find"></View>
        <View style={[styles.lightGreyBackground, {flex: 1}]} tabLabel="Buses"></View>
        <View style={[styles.polarGreyBackground, {flex: 1}]} tabLabel="Info"></View>
        <View style={[styles.charcoalGreyBackground, {flex: 1}]} tabLabel="Settings"></View>
      </ScrollableTabView>
    );
  }
});

module.exports = MainScreen;
