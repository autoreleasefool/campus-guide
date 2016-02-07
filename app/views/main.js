'use strict';

// react-native imports
var React = require('react-native');

var {
  Alert,
  Navigator,
  StyleSheet,
  View,
} = React;

// Other imports
var buildStyleInterpolator = require('buildStyleInterpolator');
var Constants = require('../constants');
var I18n = require('react-native-i18n');
var Preferences = require('../util/preferences');
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

  componentDidMount() {
    // TODO: consider unlocking orientation (probably won't)
    // Orientation.unlockAllOrientations();
    //Orientation.addOrientationListener(this._orientationDidChange);

    if (Preferences.isFirstTimeOpened()) {
      Alert.alert(
        I18n.t('only_once_title', {locale: Preferences.getSelectedLanguage()}),
        I18n.t('only_once_message', {locale: Preferences.getSelectedLanguage()}),
      );
    }
  },

  componentWillUnmount() {
    // TODO: consider unlocking orientation (probably won't)
    //Orientation.removeOrientationListener(this._orientationDidChange);
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
