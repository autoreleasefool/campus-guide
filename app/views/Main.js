/**
 *
 * @license
 * Copyright (C) 2016 Joseph Roque
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @file
 * Main.js
 *
 * @description
 * Main navigational point of the application. Provides the primary
 * Navigator instance.
 *
 * @author
 * Joseph Roque
 *
 * @external
 * @flow
 *
 */
'use strict';

// React Native imports
const React = require('react-native');
const {
  Alert,
  Component,
  Navigator,
  StyleSheet,
  TouchableOpacity,
  View,
} = React;

// Imports
const BuildStyleInterpolator = require('buildStyleInterpolator');
const Constants = require('../Constants');
const DetailsScreen = require('../components/DetailsScreen');
const NavBar = require('../components/NavBar');
const Preferences = require('../util/Preferences');
const ScreenUtils = require('../util/ScreenUtils');
const TabBar = require('../components/Tabs');

// Screen imports
const BusCampuses = require('./discover/BusCampuses');
const BusCampusStops = require('./discover/BusCampusStops');
const DiscoverHome = require('./discover/DiscoverHome');
const FindHome = require('./find/FindHome');
const LinkCategory = require('./discover/LinkCategory');
const LinksHome = require('./discover/LinksHome');
const ScheduleHome = require('./schedule/ScheduleHome');
const ScheduleEditor = require('./schedule/ScheduleEditor');
const SettingsHome = require('./settings/SettingsHome');
const ShuttleCampusInfo = require('./discover/ShuttleCampusInfo');
const ShuttleInfo = require('./discover/ShuttleInfo');

// Lists the views currently on the stack in the Navigator.
let screenStack: Array<number | string> = [Constants.Views.Default];

// Type definition for navigator routes
type Route = {
  id: number | string,
  data: any,
};

class MainScreen extends Component {

  /**
   * Pass props to parent and declare initial state.
   *
   * @param {{}} props properties passed from container to this component.
   */
  constructor(props: {}) {
    super(props);

    // Explicitly binding 'this' to all methods that need it
    (this:any)._navigateBack = this._navigateBack.bind(this);
    (this:any)._navigateForward = this._navigateForward.bind(this);
    (this:any)._onChangeTab = this._onChangeTab.bind(this);
    (this:any)._onSearch = this._onSearch.bind(this);
    (this:any)._renderScene = this._renderScene.bind(this);
  };

  /**
   * Sets the transition between two views in the navigator.
   *
   * @return {Object} a configuration for the transition between scenes.
   */
  _configureScene(): Object {
    return Navigator.SceneConfigs.PushFromRight;
  };

  /**
   * Returns the current screen being displayed, or 0 if there isn't one.
   *
   * @return {number | string} the screen at the top of {screenStack}, or 0.
   */
  _getCurrentScreen(): number | string {
    if (screenStack !== null && screenStack.length > 0) {
      return screenStack[screenStack.length - 1]
    } else {
      return 0;
    }
  }

  /**
   * Returns to the previous page.
   */
  _navigateBack(): void {
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

  /**
   * Opens a screen, unless the screen is already showing. Passes data to
   * the new screen.
   *
   * @param {number | string} screenId  id of the screen to display
   * @param {Object} data     optional parameters to pass to the renderScene method.
   */
  _navigateForward(screenId: number | string, data: any): void {
    if (this._getCurrentScreen() === screenId) {
      // Don't push the screen if it's already showing.
      return;
    }

    // Show a back button to return to the previous screen, if the screen
    // is not a home screen
    if (ScreenUtils.isRootScreen(this._getCurrentScreen())) {
      this.refs.NavBar.setState({
        showBackButton: true,
      });
    }

    this.refs.Navigator.push({id: screenId, data: data});
    screenStack.push(screenId);
  };

  /**
   * Updates views accordingly to display a new tab.
   *
   * @param {number} tabId id of the tab to display.
   */
  _onChangeTab(tabId: number): void {
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

  /**
   * Displays the results of the user's search parameters.
   *
   * @param {string} searchTerms string of terms to search for.
   */
  _onSearch(searchTerms: string): void {
    // TODO: search...
    console.log('TODO: search...');
    this._navigateForward(Constants.Views.Find.Search, searchTerms);
  };

  /**
   * Forces the navbar to be re-rendered.
   */
  _updateNavbar(): void {
    this.refs.NavBar.setState({refresh: !this.refs.NavBar.getRefresh()})
  }

  /**
   * Renders a view according to the current route of the navigator.
   *
   * @param {Route} route         object with properties to identify the route to display.
   * @param {ReactClas} navigator navigator object to pass to children.
   * @return {ReactElement} the view to render, based on {route}.
   */
  _renderScene(route: Route, navigator: ReactClass): ReactElement {
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
        <DiscoverHome onScreenSelected={this._navigateForward} />
      );
    } else if (route.id === Constants.Views.Discover.BusCampuses) {
      scene = (
        <BusCampuses
            showCampus={(campusName, campusColor) => this._navigateForward(Constants.Views.Discover.BusCampusStops, {name: campusName, color: campusColor})} />
      );
    } else if (route.id === Constants.Views.Discover.BusCampusStops) {
      scene = (
        <BusCampusStops campusName={route.data.name} campusColor={route.data.color} />
      );
    } else if (route.id === Constants.Views.Discover.LinksHome) {
      scene = (
        <LinksHome showLinkCategory={(category) => this._navigateForward(Constants.Views.Discover.LinkCategory + '-0', {category: category, categoryImage: category.image, index: 0})} />
      );
    } else if (route.id === Constants.Views.Discover.ShuttleInfo) {
      scene = (
        <ShuttleInfo
            showCampus={(campusName, campusColor) => this._navigateForward(Constants.Views.Discover.ShuttleCampusInfo, {name: campusName, color: campusColor})}
            showDetails={(title, image, text, backgroundColor) => this._navigateForward(Constants.Views.Discover.ShuttleDetails, {title: title, image: image, text: text, backgroundColor: backgroundColor})}/>
      );
    } else if (route.id === Constants.Views.Discover.ShuttleCampusInfo) {
      scene = (
        <ShuttleCampusInfo
            campusName={route.data.name}
            campusColor={route.data.color} />
      );
    } else if (route.id === Constants.Views.Settings.Home) {
      scene = (
        <SettingsHome requestTabChange={this._onChangeTab} refreshParent={this._updateNavbar.bind(this)} />
      );
    } else if (route.id === Constants.Views.Discover.ShuttleDetails) {
      scene = (
        <DetailsScreen
            title={route.data.title}
            image={route.data.image}
            text={route.data.text}
            backgroundColor={route.data.backgroundColor} />
      );
    } else if (typeof(route.id) === 'string' && route.id.indexOf(Constants.Views.Discover.LinkCategory + '-') === 0) {
      scene = (
        <LinkCategory
            category={route.data.category}
            categoryImage={route.data.categoryImage}
            showLinkCategory={(category) => this._navigateForward(Constants.Views.Discover.LinkCategory + '-' + (route.data.index + 1), {category: category, categoryImage: route.data.categoryImage, index: route.data.index + 1})} />
      );
    }

    return (
      <View style={{flex: 1, backgroundColor: Constants.Colors.garnet}}>
        {scene}
      </View>
    );
  };

  /**
   * Displays a pop up when the application opens for the first time after the
   * user selects their preferred language.
   */
  componentDidMount(): void {
    // Get current language for translations
    let Translations: Object;
    if (Preferences.getSelectedLanguage() === 'fr') {
      Translations = require('../../assets/static/js/Translations.fr.js');
    } else {
      Translations = require('../../assets/static/js/Translations.en.js');
    }

    if (Preferences.isFirstTimeOpened()) {
      Alert.alert(
        Translations['only_once_title'],
        Translations['only_once_message'],
      );
    }
  };

  /**
   * Renders a navigator to switch between the app's tabs, and a tab view.
   *
   * @return {ReactElement} the hierarchy of views to render.
   */
  render(): ReactElement {
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
