/*
 * Main view of the application.
 */
'use strict';

// React imports
const React = require('react-native');
const {
  Alert,
  Component,
  Navigator,
  StyleSheet,
  View,
} = React;

const FindHome = require('./find/Home');
const BuildStyleInterpolator = require('buildStyleInterpolator');
const Constants = require('../Constants');
const Preferences = require('../util/Preferences');
const ScheduleHome = require('./schedule/Home');
const SearchBar = require('../components/SearchBar');
const SettingsHome = require('./settings/Home');
const StatusBar = require('../util/StatusBar');
const TabBar = require('../components/Tabs');

class MainScreen extends Component {

  /*
   * Pass props.
   */
  constructor(props) {
    super(props);

    // Explicitly binding 'this' to all methods that need it
    // TODO: remove if binding not needed
    // this._configureScene = this._configureScene.bind(this);
    this._onChangeTab = this._onChangeTab.bind(this);
    this._onSearch = this._onSearch.bind(this);
    this._renderScene = this._renderScene.bind(this);
  };

  /*
   * Sets the transition between two views in the navigator.
   */
  _configureScene() {
    // Disable transitions between screens
    let NoTransition = {
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
  };

  /*
   * Updates views accordingly to display a new tab.
   */
  _onChangeTab(tabId) {
    this.refs.MainNavigator.replace({id: tabId});
    this.refs.MainTabBar.setState({
      currentTab: tabId,
    });
  };

  /*
   * Displays the results of the user's search parameters.
   */
  _onSearch(search) {
    // TODO: search...
    console.log('TODO: search...');
    this._onChangeTab(Constants.Views.Find.Home);
  };

  /*
   * Renders a view according to the current route of the navigator.
   */
  _renderScene(route, navigator) {
    return (
      <View style={{flex: 1, backgroundColor: Constants.Colors.garnet}}>
        {route.id === Constants.Views.Find.Home
            ? <FindHome onEditSchedule={() => this._onChangeTab(Constants.Views.Schedule.Home)} />
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
  };

  /*
   * Displays a pop up when the application opens for the first time after the user selects their preferred language.
   */
  componentDidMount() {
    // Get current language for translations
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
  };

  /*
   * Renders a navigator to switch between the app's tabs, and a tab view.
   */
  render() {
    return (
      <View style={[_styles.container]}>
        <SearchBar ref="MainSearchBar" onSearch={this._onSearch} />
        <Navigator
            ref='MainNavigator'
            configureScene={this._configureScene}
            initialRoute={{id: Constants.Views.Default}}
            renderScene={this._renderScene} />
        <TabBar ref='MainTabBar' requestTabChange={this._onChangeTab} />
      </View>
    );
  };
};

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

// Expose component to app
module.exports = MainScreen;
