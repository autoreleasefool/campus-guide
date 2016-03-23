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
  TouchableOpacity,
  View,
} = React;

const FindHome = require('./find/FindHome');
const BuildStyleInterpolator = require('buildStyleInterpolator');
const Constants = require('../Constants');
const NavBar = require('../components/NavBar');
const Preferences = require('../util/Preferences');
const ScheduleHome = require('./schedule/ScheduleHome');
const ScheduleEditor = require('./schedule/ScheduleEditor');
const ScreenUtils = require('../util/ScreenUtils');
const SettingsHome = require('./settings/SettingsHome');
const TabBar = require('../components/Tabs');

let screenStack = [Constants.Views.Default];

class MainScreen extends Component {

  /*
   * Pass props and declare initial state.
   */
  constructor(props) {
    super(props);

    // Explicitly binding 'this' to all methods that need it
    // TODO: remove if binding not needed
    // this._configureScene = this._configureScene.bind(this);
    this._navigateBack = this._navigateBack.bind(this);
    this._navigateForward = this._navigateForward.bind(this);
    this._onChangeTab = this._onChangeTab.bind(this);
    this._onSearch = this._onSearch.bind(this);
    this._renderScene = this._renderScene.bind(this);
  };

  /*
   * Sets the transition between two views in the navigator.
   */
  _configureScene() {
    return Navigator.SceneConfigs.PushFromRight;
  };

  /*
   * Returns the current screen being displayed, or 0 if there isn't one.
   */
  _getCurrentScreen() {
    if (screenStack !== null && screenStack.length > 0) {
      return screenStack[screenStack.length - 1]
    } else {
      return 0;
    }
  }

  /*
   * Returns to the previous page.
   */
  _navigateBack() {
    if (!ScreenUtils.isRootScreen(screenStack[screenStack.length - 1])) {
      this.refs.Navigator.pop();
      screenStack.pop();

      if (ScreenUtils.isRootScreen(screenStack[screenStack.length - 1])) {
        this.refs.NavBar.setState({
          showBackButton: false,
        });
      }
    }
  };

  /*
   * Opens a screen, unless the screen is already showing. Passes data to the new screen.
   */
  _navigateForward(screenId, data) {
    if (this._getCurrentScreen() === screenId) {
      // Don't push the screen if it's already showing.
      return;
    }

    if (ScreenUtils.isRootScreen(this._getCurrentScreen())) {
      this.refs.NavBar.setState({
        showBackButton: true,
      });
    }

    this.refs.Navigator.push({id: screenId, data: data});
    screenStack.push(screenId);
  };

  /*
   * Updates views accordingly to display a new tab.
   */
  _onChangeTab(tabId) {
    if (!ScreenUtils.isRootScreen(screenStack[screenStack.length - 1])) {
      this.refs.NavBar.setState({
        showBackButton: false,
      });
    }

    this.refs.Navigator.resetTo({id: tabId});
    this.refs.TabBar.setState({
      currentTab: tabId,
    })
    screenStack = [tabId];
  };

  /*
   * Displays the results of the user's search parameters.
   */
  _onSearch(searchTerms) {
    // TODO: search...
    console.log('TODO: search...');
    this._navigateForward(Constants.Views.Find.Search, searchTerms);
  };

  /*
   * Forces the navbar to be re-rendered.
   */
  _updateNavbar() {
    this.refs.NavBar.setState({refresh: !this.refs.NavBar.getRefresh()})
  }

  /*
   * Renders a view according to the current route of the navigator.
   */
  _renderScene(route, navigator) {
    let scene = null;
    if (route.id === Constants.Views.Find.Home) {
      scene = (
        <FindHome
            onEditSchedule={() => this._onChangeTab(Constants.Views.Schedule.Home)}
            onShowBuilding={(buildingCode) => this._navigateForward(Constants.Views.Find.Building, buildingCode)} />
      );
    } else if (route.id === Constants.Views.Schedule.Home) {
      scene = (
        <ScheduleHome
            requestTabChange={this._onChangeTab}
            editSchedule={() => this._navigateForward(Constants.Views.Schedule.Editor)} />
      );
    } else if (route.id === Constants.Views.Schedule.Editor) {
      scene = (
        <ScheduleEditor />
      );
    } else if (route.id === Constants.Views.Discover.Home) {
      scene = (
        <View style={{flex: 1, backgroundColor: Constants.Colors.lightGrey}} />
      );
    } else if (route.id === Constants.Views.Settings.Home) {
      scene = (
        <SettingsHome requestTabChange={this._onChangeTab} refreshParent={this._updateNavbar.bind(this)} />
      );
    }

    return (
      <View style={{flex: 1, backgroundColor: Constants.Colors.garnet}}>
        {scene}
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
      <View style={_styles.container}>
        <NavBar ref='NavBar' onSearch={this._onSearch} onBack={this._navigateBack} />
        <Navigator
            ref='Navigator'
            configureScene={this._configureScene}
            initialRoute={{id: Constants.Views.Default}}
            renderScene={this._renderScene} />
        <TabBar ref='TabBar' requestTabChange={this._onChangeTab} />
      </View>
    );
  };
};

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.Colors.garnet,
  },
});

// Expose component to app
module.exports = MainScreen;
