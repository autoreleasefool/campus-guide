'use strict';

// Imports
var React = require('react-native');
var {
  Navigator,
  View,
} = React;

var Constants = require('./constants');
var Orientation = require('react-native-orientation');
var styles = require('./styles');

// Views
var MainScreen = require('./views/main');
var SplashScreen = require('./views/splash');

var CampusGuide = React.createClass({

  _renderScene(route, navigator) {
    if (route.id === Constants.Views.Splash) {
      return <SplashScreen navigator={navigator} />
    } else if (route.id === Constants.Views.Main) {
      return <MainScreen navigator={navigator} />
    }
  },

  _configureScene() {
    return ({
      ...Navigator.SceneConfigs.HorizontalSwipeJump,
      gestures: false,
    });
  },

  componentDidMount() {
    // Lock the application to portrait orientation
    Orientation.lockToPortrait();
  },

  render() {
    return (
      <Navigator
          configureScene={this._configureScene}
          initialRoute={{id: 1}}
          renderScene={this._renderScene} />
    );
  },
});

module.exports = CampusGuide;
