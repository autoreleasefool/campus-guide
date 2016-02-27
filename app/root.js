/*
 *
 */
'use strict';

// React imports
var React = require('react-native');
var {
  Navigator,
  View,
} = React;

// Imports
var Constants = require('./Constants');
var Orientation = require('react-native-orientation');

// Views
var MainScreen = require('./views/Main');
var SplashScreen = require('./views/Splash');

// Root view
var CampusGuide = React.createClass({

  /*
   * Renders a different view based on the current navigator route.
   */
  _renderScene(route, navigator) {
    if (route.id === Constants.Views.Splash) {
      return <SplashScreen navigator={navigator} />
    } else if (route.id === Constants.Views.Main) {
      return <MainScreen navigator={navigator} />
    }
  },

  /*
   * Defines the transition between views.
   */
  _configureScene() {
    return ({
      ...Navigator.SceneConfigs.HorizontalSwipeJump,
      gestures: false,
    });
  },

  /*
   * Locks the application to portrait orientation.
   */
  componentDidMount() {
    Orientation.lockToPortrait();
  },

  /*
   * Renders the root navigator of the app to switch between the splash screen and main screen.
   */
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
