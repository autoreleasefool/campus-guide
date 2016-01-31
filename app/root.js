'use strict';

var Constants = require('./constants');
var Drawer = require('react-native-drawer');
var React = require('react-native');
var SplashScreen = require('./views/splash');
var styles = require('./styles');
//var HomeScreen = require('./views/home');

var {
  Navigator,
  Text,
  Button,
  View,
} = React;

var CampusGuide = React.createClass({

  getInitialState(){
    return {
      disabled: false,
    }
  },

  doNothing() {

  },

  _renderScene(route, navigator) {
    if (route.id === Constants.Views.SPLASH) {
      this.state.disabled=true;
      return <SplashScreen navigator={navigator} />
    } else if (route.id === Constants.Views.MAIN_MENU) {
      this.state.disabled=false;
      //return <HomeScreen navigator={navigator} />
    }
  },

  _configureScene(route) {
    return Navigator.SceneConfigs.FloatFromRight;
  },

  render() {
    return (
      <Drawer
        ref="drawer"
        disabled={this.state.disabled}
        content={<View style={styles.controlPanel} />}>
        <Navigator
          initialRoute={{id: 1}}
          renderScene={this._renderScene}
          configureScene={this._configureScene} />
      </Drawer>
    );
  },
});

module.exports = CampusGuide;
