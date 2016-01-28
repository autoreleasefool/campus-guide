'use strict';

var React = require('react-native');
var SplashPage = require('./views/splash');

var {
  Navigator
} = React;

var CustomSceneConfig = Object.assign({}, Navigator.SceneConfigs.FloatFromRight, {
  // A very tighly wound spring will make this transition fast
  springTension: 100,
  springFriction: 1
});

var CampusGuide = React.createClass({
  _renderScene(route, navigator) {
    if (route.id === 1) {
      return <SplashPage navigator={navigator} />
    }
  },

  _configureScene(route) {
    return CustomSceneConfig;
  },

  render() {
    return (
      <Navigator
        initialRoute={{ id: 1 }}
        renderScene={ this._renderScene }
        configureScene={ this._configureScene } />
    );
  }
});

module.exports = CampusGuide;
