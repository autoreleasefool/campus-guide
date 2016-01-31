'use strict';

var Constants = require('./constants');
var MainScreen = require('./views/main');
var React = require('react-native');
var SplashScreen = require('./views/splash');
var styles = require('./styles');

var {
  Navigator
} = React;

var CampusGuide = React.createClass({

  _renderScene(route, navigator) {
    if (route.id === Constants.Views.SPLASH) {
      return <SplashScreen navigator={navigator} />
    } else {
      return <MainScreen navigator={navigator} />
    }
  },

  render() {
    return (
      <Navigator
        configureScene={() => ({
          ...Navigator.SceneConfigs.HorizontalSwipeJump,
          gestures: false
        })}
        initialRoute={{id: 1}}
        renderScene={this._renderScene} />
    );
  }
});

module.exports = CampusGuide;
