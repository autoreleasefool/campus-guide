'use strict';

// react-native imports
var React = require('react-native');

var {
  Navigator,
  StyleSheet,
  View,
} = React;

// Other imports
var buildStyleInterpolator = require('buildStyleInterpolator');
var Constants = require('../constants');
var Orientation = require('react-native-orientation');
var styles = require('../styles');
var TabBar = require('../components/tabs');

var MainScreen = React.createClass({

  _configureScene() {
    // Disable transitions between screens
    var NoTransition = {
      opacity: {
        from: 1,
        to: 1,
        min: 1,
        max: 1,
        type: 'linear',
        extrapolate: false,
        round: 100,
      },
    };

    return  ({
      ...Navigator.SceneConfigs.FadeAndroid,
      gestures: null,
      defaultTransitionVelocity: 100,
      animationInterpolators: {
        into: buildStyleInterpolator(NoTransition),
        out: buildStyleInterpolator(NoTransition),
      },
    });
  },

  _renderScene(route, navigator) {
    return (
      <View style={{flex: 1, backgroundColor: Constants.Colors.garnet}}>
        {route.id === Constants.Views.Find.Home
            ? <View style={{flex: 1, backgroundColor: Constants.Colors.charcoalGrey}}></View>
            : null}
        {route.id === Constants.Views.Buses.Home
            ? <View style={{flex: 1, backgroundColor: Constants.Colors.darkGrey}}></View>
            : null}
        {route.id === Constants.Views.Discover.Home
            ? <View style={{flex: 1, backgroundColor: Constants.Colors.polarGrey}}></View>
            : null}
        {route.id === Constants.Views.Settings.Home
            ? <View style={{flex: 1, backgroundColor: Constants.Colors.lightGrey}}></View>
            : null}
        <TabBar navigator={navigator} />
      </View>
    );
  },

  _orientationDidChange(orientation) {
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

  componentWillUnmount() {
    // Remove the orientation change listener
    Orientation.removeOrientationListener(this._orientationDidChange);
  },

  render() {
    return (
      <View style={_styles.container}>
        <Navigator
            configureScene={this._configureScene}
            initialRoute={{id: Constants.Views.Find.Home}}
            renderScene={this._renderScene} />
      </View>
    );
  },
});

var _styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

module.exports = MainScreen;
