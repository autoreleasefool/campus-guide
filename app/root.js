'use strict';

var Constants = require('./constants');
var React = require('react-native');
var SplashScreen = require('./views/splash');
var styles = require('./styles');
//var HomeScreen = require('./views/home');

var {
  Navigator,
} = React;

var CampusGuide = React.createClass({

  _renderScene(route, navigator) {
    if (route.id === Constants.Views.SPLASH) {
      return <SplashScreen navigator={navigator} />
    } else if (route.id === Constants.Views.MAIN_MENU) {
      //return <HomeScreen navigator={navigator} />
    }
  },

  _configureScene(route) {
    return Navigator.SceneConfigs.FloatFromRight;
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
