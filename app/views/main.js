'use strict';

var React = require('react-native');
var ScrollableTabView = require('react-native-scrollable-tab-view');
var styles = require('../styles');

var {
  View
} = React;

var MainScreen = React.createClass({

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
