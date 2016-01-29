'use strict';

var React = require('react-native');
var SplashPage = require('./views/splash');

var {
  Navigator,
} = React;

var CampusGuide = React.createClass({
  _renderScene(route, navigator) {
    if (route.id === 1) {
      return <SplashPage navigator={navigator} />
    }
  },

  _configureScene(route) {
    return Navigator.SceneConfigs.FloatFromRight;
  },

  render() {
    return (
      <Navigator
        initialRoute={{id: 1}}
        renderScene={this._renderScene}
        configureScene={this._configureScene} />
    );
  },
});

module.exports = CampusGuide;
