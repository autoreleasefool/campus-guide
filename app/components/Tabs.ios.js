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
 * @author Joseph Roque
 * @file Tabs.ios.js
 * @module TabsView
 * @description Tab bar to manage navigation between the root views in the application.
 * @flow
 *
 */
'use strict';

// React Native imports
import React from 'react';
import {
  Dimensions,
  Navigator,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

// Import type definition for tab icons.
import type {
  TabItems,
} from '../Types';

// Imports
const Constants = require('../Constants');
const Ionicons = require('react-native-vector-icons/Ionicons');
const NavBar = require('./NavBar');
const ScreenUtils = require('../util/ScreenUtils');

// Screen imports
const BusCampusInfo = require('../views/discover/BusCampusInfo');
const BusCampusStops = require('../views/discover/BusCampusStops');
const DetailsScreen = require('./DetailsScreen');
const DiscoverHome = require('../views/discover/DiscoverHome');
const FindHome = require('../views/find/FindHome');
const LinkCategory = require('../views/discover/LinkCategory');
const LinksHome = require('../views/discover/LinksHome');
const ScheduleHome = require('../views/schedule/ScheduleHome');
const ScheduleEditor = require('../views/schedule/ScheduleEditor');
const SettingsHome = require('../views/settings/SettingsHome');
const ShuttleCampusInfo = require('../views/discover/ShuttleCampusInfo');
const ShuttleInfo = require('../views/discover/ShuttleInfo');

// Icons for tab items
const tabIcons: TabItems = {
  find: 'navigate',
  schedule: 'ios-calendar-outline',
  discover: 'compass',
  settings: 'ios-gear',
};

// Determining the size of the current tab indicator based on the screen size
const {width} = Dimensions.get('window');
const indicatorWidth: number = Math.ceil(width / Object.keys(tabIcons).length);
const tabIconSize: number = 30;

// Defines the order in which the tabs should appear
const tabOrder: TabItems = {
  find: 0,
  schedule: 1,
  discover: 2,
  settings: 3,
};

// Lists the views currently on the stack in the Navigator.
let screenStack: Array<number | string> = [Constants.Views.Default];

// Type definition for component state.
type State = {
  currentTab: number,
};

// Type definition for navigator routes
type Route = {
  id: number | string,
  data: any,
};

class TabsView extends React.Component {
  state: State;

  /**
   * Pass props and declares initial state.
   *
   * @param {{}} props properties passed from container to this component.
   */
  constructor(props: {}) {
    super(props);
    this.state = {
      currentTab: Constants.Views.DefaultTab,
    };

    // Explicitly binding 'this' to all methods that need it
    (this:any).getCurrentTab = this.getCurrentTab.bind(this);
    (this:any)._navigateForward = this._navigateForward.bind(this);
  }

  /**
   * Retrieves the current tab.
   *
   * @returns {number} the current tab in the state.
   */
  getCurrentTab(): number {
    return this.state.currentTab;
  }

  /**
   * Switch to the selected tab, as determined by tabId.
   *
   * @param {number} tabId the tab to switch to.
   */
  _changeTabs(tabId: number): void {
    if (!ScreenUtils.isRootScreen(screenStack[screenStack.length - 1])) {
      this._showBackButton(false);
    }

    this.refs.Navigator.resetTo({id: tabId});
    this.setState({
      currentTab: tabId,
    });
    screenStack = [tabId];
  }

  /**
   * Sets the transition between two views in the navigator.
   *
   * @returns {Object} a configuration for the transition between scenes.
   */
  _configureScene(): Object {
    return Navigator.SceneConfigs.PushFromRight;
  }

  /**
   * Returns the current screen being displayed, or 0 if there isn't one.
   *
   * @returns {number | string} the screen at the top of {screenStack}, or 0.
   */
  _getCurrentScreen(): number | string {
    if (screenStack !== null && screenStack.length > 0) {
      return screenStack[screenStack.length - 1];
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
        this._showBackButton(false);
      }
    }
  }

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
      // TODO: change the search terms if screenId === Constants.Views.Find.Search
      return;
    }

    // Show a back button to return to the previous screen, if the screen
    // is not a home screen
    if (ScreenUtils.isRootScreen(this._getCurrentScreen())) {
      this._showBackButton(true);
    }

    this.refs.Navigator.push({id: screenId, data: data});
    screenStack.push(screenId);
  }

  /**
   * Displays the results of the user's search parameters.
   *
   * @param {string} searchTerms string of terms to search for.
   */
  _onSearch(searchTerms: string): void {
    // TODO: search...
    console.log('TODO: search...');
    this._navigateForward(Constants.Views.Find.Search, searchTerms);
  }

  /**
   * Forces the navbar to be re-rendered.
   */
  _refreshNavbar(): void {
    this.refs.NavBar.setState({refresh: !this.refs.NavBar.getRefresh()});
  }

  /**
   * Renders a view according to the current route of the navigator.
   *
   * @param {Route} route object with properties to identify the route to display.
   * @returns {ReactElement} the view to render, based on {route}.
   */
  _renderScene(route: Route): ReactElement {
    let scene = null;
    if (route.id === Constants.Views.Find.Home) {
      scene = (
        <FindHome
            onEditSchedule={this._changeTabs.bind(this, Constants.Views.Schedule.Home)}
            onShowBuilding={buildingCode => this._navigateForward(Constants.Views.Find.Building, buildingCode)} />
      );
    } else if (route.id === Constants.Views.Schedule.Home) {
      scene = (
        <ScheduleHome
            editSchedule={() => this._navigateForward(Constants.Views.Schedule.Editor)}
            requestTabChange={this._changeTabs.bind(this)} />
      );
    } else if (route.id === Constants.Views.Schedule.Editor) {
      scene = (
        <ScheduleEditor />
      );
    } else if (route.id === Constants.Views.Discover.Home) {
      scene = (
        <DiscoverHome onScreenSelected={this._navigateForward} />
      );
    } else if (route.id === Constants.Views.Discover.BusCampusInfo) {
      scene = (
        <BusCampusInfo
            showCampus={(name, color) =>
                this._navigateForward(Constants.Views.Discover.BusCampusStops, {name: name, color: color})} />
      );
    } else if (route.id === Constants.Views.Discover.BusCampusStops) {
      scene = (
        <BusCampusStops
            campusColor={route.data.color}
            campusName={route.data.name} />
      );
    } else if (route.id === Constants.Views.Discover.LinksHome) {
      scene = (
        <LinksHome
            showLinkCategory={category =>
                this._navigateForward(Constants.Views.Discover.LinkCategory + '-0',
                    {category: category, categoryImage: category.image, index: 0})} />
      );
    } else if (route.id === Constants.Views.Discover.ShuttleInfo) {
      scene = (
        <ShuttleInfo
            showCampus={(campusName, campusColor) =>
                this._navigateForward(Constants.Views.Discover.ShuttleCampusInfo,
                    {name: campusName, color: campusColor})}
            showDetails={(title, image, text, backgroundColor) =>
                this._navigateForward(Constants.Views.Discover.ShuttleDetails,
                    {title: title, image: image, text: text, backgroundColor: backgroundColor})} />
      );
    } else if (route.id === Constants.Views.Discover.ShuttleCampusInfo) {
      scene = (
        <ShuttleCampusInfo
            campusColor={route.data.color}
            campusName={route.data.name} />
      );
    } else if (route.id === Constants.Views.Settings.Home) {
      scene = (
        <SettingsHome
            refreshParent={this._refreshNavbar.bind(this)}
            requestTabChange={this._changeTabs.bind(this)} />
      );
    } else if (route.id === Constants.Views.Discover.ShuttleDetails) {
      scene = (
        <DetailsScreen
            backgroundColor={route.data.backgroundColor}
            image={route.data.image}
            text={route.data.text}
            title={route.data.title} />
      );
    } else if (typeof route.id === 'string' && route.id.indexOf(Constants.Views.Discover.LinkCategory + '-') === 0) {
      scene = (
        <LinkCategory
            category={route.data.category}
            categoryImage={route.data.categoryImage}
            showLinkCategory={category =>
                this._navigateForward(Constants.Views.Discover.LinkCategory + '-' + (route.data.index + 1),
                    {category: category, categoryImage: route.data.categoryImage, index: route.data.index + 1})} />
      );
    }

    return (
      <View style={{flex: 1, backgroundColor: Constants.Colors.garnet}}>
        {scene}
      </View>
    );
  }

  /**
   * Shows or hides the back button in the navbar.
   *
   * @param {boolean} show true to show back button, false to hide
   */
  _showBackButton(show: boolean): void {
    this.refs.NavBar.setState({
      showBackButton: show,
    });
  }

  /**
   * Renders the app tabs and icons, an indicator to show the current tab, and a navigator with the tab contents.
   *
   * @returns {ReactElement} the hierarchy of views to render.
   */
  render(): ReactElement {
    let findColor = Constants.Colors.charcoalGrey;
    let scheduleColor = Constants.Colors.charcoalGrey;
    let discoverColor = Constants.Colors.charcoalGrey;
    let settingsColor = Constants.Colors.charcoalGrey;
    let indicatorLeft = 0;

    // Set the color of the current tab to garnet
    switch (this.state.currentTab) {
      case Constants.Views.Find.Home:
        indicatorLeft = indicatorWidth * tabOrder.find;
        findColor = Constants.Colors.garnet;
        break;
      case Constants.Views.Schedule.Home:
        indicatorLeft = indicatorWidth * tabOrder.schedule;
        scheduleColor = Constants.Colors.garnet;
        break;
      case Constants.Views.Discover.Home:
        indicatorLeft = indicatorWidth * tabOrder.discover;
        discoverColor = Constants.Colors.garnet;
        break;
      case Constants.Views.Settings.Home:
        indicatorLeft = indicatorWidth * tabOrder.settings;
        settingsColor = Constants.Colors.garnet;
        break;
      default:
        console.log('Invalid tab:', this.state.currentTab);
        break;
    }

    return (
      <View style={_styles.container}>
        <NavBar
            ref='NavBar'
            onBack={this._navigateBack.bind(this)}
            onSearch={this._onSearch.bind(this)} />
        <Navigator
            configureScene={this._configureScene}
            initialRoute={{id: Constants.Views.Default}}
            ref='Navigator'
            renderScene={this._renderScene.bind(this)}
            style={_styles.navigator} />
        <View style={_styles.tabContainer}>
          <TouchableOpacity
              style={_styles.tab}
              onPress={this._changeTabs.bind(this, Constants.Views.Find.Home)}>
            <Ionicons
                color={findColor}
                name={tabIcons.find}
                size={tabIconSize} />
          </TouchableOpacity>
          <TouchableOpacity
              style={_styles.tab}
              onPress={this._changeTabs.bind(this, Constants.Views.Schedule.Home)}>
            <Ionicons
                color={scheduleColor}
                name={tabIcons.schedule}
                size={tabIconSize} />
          </TouchableOpacity>
          <TouchableOpacity
              style={_styles.tab}
              onPress={this._changeTabs.bind(this, Constants.Views.Discover.Home)}>
            <Ionicons
                color={discoverColor}
                name={tabIcons.discover}
                size={tabIconSize} />
          </TouchableOpacity>
          <TouchableOpacity
              style={_styles.tab}
              onPress={this._changeTabs.bind(this, Constants.Views.Settings.Home)}>
            <Ionicons
                color={settingsColor}
                name={tabIcons.settings}
                size={tabIconSize} />
          </TouchableOpacity>
          <View style={[_styles.indicator, {left: indicatorLeft}]} />
        </View>
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navigator: {
    flex: 1,
  },
  tabContainer: {
    height: 60,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Constants.Colors.rootElementBorder,
    backgroundColor: Constants.Colors.polarGrey,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    width: indicatorWidth,
    height: 5,
    backgroundColor: Constants.Colors.garnet,
  },
});

// Expose component to app
module.exports = TabsView;
