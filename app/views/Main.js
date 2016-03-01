/*
 * Main view of the application.
 */
'use strict';

// React imports
var React = require('react-native');
var {
  Alert,
  Navigator,
  StyleSheet,
  View,
} = React;

// Imports
var BuildStyleInterpolator = require('buildStyleInterpolator');
var Constants = require('../Constants');
var Preferences = require('../util/Preferences');
var StatusBar = require('../util/StatusBar');

// View imports
var FindHome = require('./find/Home');
var ScheduleHome = require('./schedule/Home');
var SettingsHome = require('./settings/Home');
var TabBar = require('../components/Tabs');

// Root view
var MainScreen = React.createClass({

  /*
   * Updates views accordingly to display a new tab.
   */
  _onChangeTab(tabId) {
    this.refs.MainNavigator.replace({id: tabId});
    this.refs.MainTabBar.setState({currentTab: tabId})
  },

  /*
   * Sets the transition between two views in the navigator.
   */
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
        into: BuildStyleInterpolator(NoTransition),
        out: BuildStyleInterpolator(NoTransition),
      },
    });
  },

  /*
   * Renders a view according to the current route of the navigator.
   */
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

  /*
   * Displays a pop up when the application opens for the first time after the user selects their preferred language.
   */
  componentDidMount() {
    // Translations
    let Translations = null;
    if (Preferences.getSelectedLanguage() === 'en') {
      Translations = require('../util/Translations.en.js');
    } else {
      Translations = require('../util/Translations.fr.js');
    }

    if (Preferences.isFirstTimeOpened()) {
      Alert.alert(
        Translations['only_once_title'],
        Translations['only_once_message'],
      );
    }
  },

  /*
   * Renders a navigator to switch between the app's tabs, and a tab view.
   */
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

// View styles
var _styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

module.exports = MainScreen;
