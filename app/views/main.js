'use strict';

// Imports
var React = require('react-native');
var {
  Alert,
  Navigator,
  StyleSheet,
  View,
} = React;

var buildStyleInterpolator = require('buildStyleInterpolator');
var Constants = require('../constants');
var Preferences = require('../util/preferences');
var StatusBar = require('../util/statusbar');
var styles = require('../styles');
var Translations = require('../util/translations');

// View imports
var FindHome = require('./find/home');
var ScheduleHome = require('./schedule/home');
var SettingsHome = require('./settings/home');
var TabBar = require('../components/tabs');

// Root view
var MainScreen = React.createClass({

  /*
   * Updates views accordingly to display a new tab.
   */
  _onChangeTab(tabId) {
    this.refs.MainNavigator.replace({id: tabId});
    this.refs.MainTabBar.setState({currentTab: tabId})
  },

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
    if (route.id == Constants.Views.Find.Home || route.id == Constants.Views.Schedule.Home) {
      StatusBar.setLightStatusBarIOS(true);
    } else {
      StatusBar.setLightStatusBarIOS(false);
    }

    return (
      <View style={{flex: 1, backgroundColor: Constants.Colors.garnet}}>
        {route.id === Constants.Views.Find.Home
            ? <FindHome requestTabChange={this._onChangeTab} />
            : null}
        {route.id === Constants.Views.Schedule.Home
            ? <ScheduleHome requestTabChange={this._onChangeTab} />
            : null}
        {route.id === Constants.Views.Discover.Home
            ? <View style={{flex: 1, backgroundColor: Constants.Colors.lightGrey}}></View>
            : null}
        {route.id === Constants.Views.Settings.Home
            ? <SettingsHome requestTabChange={this._onChangeTab} />
            : null}
      </View>
    );
  },

  componentDidMount() {
    // TODO: consider unlocking orientation (probably won't)
    // Orientation.unlockAllOrientations();
    //Orientation.addOrientationListener(this._orientationDidChange);

    if (Preferences.isFirstTimeOpened()) {
      Alert.alert(
        Translations[Preferences.getSelectedLanguage()]['only_once_title'],
        Translations[Preferences.getSelectedLanguage()]['only_once_message'],
      );
    }
  },

  componentWillUnmount() {
    // TODO: consider unlocking orientation (probably won't)
    //Orientation.removeOrientationListener(this._orientationDidChange);
  },

  render() {
    // TODO: change initial route to Find.Home
    return (
      <View style={_styles.container}>
        <Navigator
            ref='MainNavigator'
            configureScene={this._configureScene}
            initialRoute={{id: Constants.Views.Find.Home}}
            renderScene={this._renderScene} />
        <TabBar ref='MainTabBar' requestTabChange={this._onChangeTab} />
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
