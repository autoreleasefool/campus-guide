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
 * @file Tabs.js
 * @providesModule Tabs
 * @description Provides tab functionality common to both Android and iOS.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  BackAndroid,
  Platform,
  StyleSheet,
  View,
} from 'react-native';

// Type definition for component state.
type State = {
  currentTab: number;
}

// Imports
const Constants = require('Constants');
const dismissKeyboard = require('dismissKeyboard');
const NavBar = require('NavBar');
const Preferences = require('Preferences');
const ScrollableTabView = require('react-native-scrollable-tab-view');
const SearchManager = require('SearchManager');
const TabBar = require('TabBar');

// Screen imports
const Discover = require('Discover');
const Find = require('Find');
const Schedule = require('Schedule');
const SearchResults = require('SearchResults');
const SettingsHome = require('SettingsHome');

// Tab for searching the app
const TAB_SEARCH = Constants.Tabs.indexOf('search');

class TabsCommon extends React.Component {

  /**
   * Define type for the component state.
   */
  state: State;

  /**
   * Pass props and declares initial state.
   *
   * @param {{}} props properties passed from container to this component.
   */
  constructor(props: {}) {
    super(props);
    this.state = {
      currentTab: 0,
    };

    // Explicitly binding 'this' to all methods that need it
    (this:any)._dismissKeyboard = this._dismissKeyboard.bind(this);
    (this:any)._getCurrentTab = this._getCurrentTab.bind(this);
    (this:any)._navigateBack = this._navigateBack.bind(this);
    (this:any)._onSubnavigation = this._onSubnavigation.bind(this);
    (this:any)._searchAll = this._searchAll.bind(this);
  }

  /**
   * Registers a default search listener, attaches a listener to the Android back button.
   */
  componentDidMount(): void {
    SearchManager.setDefaultSearchListener({
      onSearch: this._searchAll,
    });

    if (Platform.OS === 'android') {
      BackAndroid.addEventListener('hardwareBackPress', this._navigateBack);
    }
  }

  /**
   * Removes the default search listener, removes the listener from the Android back button.
   */
  componentWillUnmount(): void {
    SearchManager.setDefaultSearchListener(null);

    if (Platform.OS === 'android') {
      BackAndroid.removeEventListener('hardwareBackPress', this._navigateBack);
    }
  }

  /** Tabs in the app. */
  _tabs: Array < ReactElement < any > > = [];

  /** When set to true, the next call to _onSearch will be ignored. */
  _ignoreNextSearch: boolean = false;

  /** Track the index of the tab visited before the search tab was opened. */
  _previousTab: number = -1;

  /**
   * Dismisses the keyboard.
   *
   * @returns {boolean} false
   */
  _dismissKeyboard(): boolean {
    dismissKeyboard();
    return false;
  }

  /**
   * Handle a request for back navigation.
   */
  _navigateBack(): void {
    if (this.state.currentTab === TAB_SEARCH) {
      if (this._previousTab === TAB_SEARCH) {
        return;
      } else {
        this.refs.TabView.goToPage(this._previousTab);
      }
    }

    const tab = this._tabs[this.state.currentTab];
    const showBack = tab.navigateBack && (tab:any).navigateBack();
    this._showBackButton(showBack === true);
  }

  /**
   * Retrieves the current tab.
   *
   * @returns {number} the current tab in the state.
   */
  _getCurrentTab(): number {
    return this.state.currentTab;
  }

  /**
   * Forces the navbar to be re-rendered.
   */
  _refreshNavbar(): void {
    this.refs.NavBar.setState({refresh: !this.refs.NavBar.getRefresh()});
  }

  /**
   * Searches all components of the app and displays the results.
   *
   * @param {?string} searchTerms string of terms to search for.
   */
  _searchAll(searchTerms: ?string): void {
    if (this._getCurrentTab() !== Constants.Views.Search
        && searchTerms != null && searchTerms.length > 0) {
      this._previousTab = this.refs.TabView.state.currentPage;
      this.refs.TabView.goToPage(TAB_SEARCH);
    }
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
   * Updates the search placeholder in the nav bar.
   *
   * @param {?string} placeholder the string to show in the placeholder. Null to use the default placeholder.
   */
  _updateSearchPlaceholder(placeholder: ?string): void {
    this.refs.NavBar.setState({
      searchPlaceholder: placeholder,
    });
  }

  /**
   * Handle a tab change.
   *
   * @param {Tab} tab details about the new tab
   */
  _onChangeTab(tab: {i: number, ref: ReactElement < any >}): void {
    // Setup back navigation in the new tab
    if (this._previousTab !== -1 && tab.i === TAB_SEARCH) {
      this._showBackButton(true);
    } else {
      this._previousTab = -1;
      // console.log(this._tabs[tab.i].showBackButton);
      // console.log(this._tabs[tab.i].showBackButton ? (this._tabs[tab.i]:any).showBackButton() : false);
      this._showBackButton(this._tabs[tab.i].showBackButton ? (this._tabs[tab.i]:any).showBackButton() : false);
      this._updateSearchPlaceholder(this._tabs[tab.i].getSearchPlaceholder
          ? (this._tabs[tab.i]:any).getSearchPlaceholder()
          : null);
    }

    // Update active search listeners
    const currentTabSearchTag = Constants.Tabs[this.state.currentTab];
    const nextTabSearchTag = Constants.Tabs[tab.i];
    SearchManager.pauseSearchListeners(currentTabSearchTag);
    SearchManager.resumeSearchListeners(nextTabSearchTag);

    // Clear the search bar
    this._ignoreNextSearch = true;
    this.refs.NavBar.clearSearch();

    // Enable search listeners
    SearchManager.resumeAllSearchListeners();

    // Update the current tab
    this.setState({
      currentTab: tab.i,
    });
  }

  /**
   * Passes search params onto search listeners, or the default search listener if there are no others.
   *
   * @param {?string} searchTerms string of terms to search for.
   */
  _onSearch(searchTerms: ?string): void {
    if (this._ignoreNextSearch) {
      this._ignoreNextSearch = false;
      return;
    }

    const searchTag = Constants.Tabs[this.state.currentTab];
    const numberOfSearchListeners = SearchManager.numberOfSearchListeners(searchTag);
    if (numberOfSearchListeners > 0 && !Preferences.getAlwaysSearchAll()) {
      // Get only the search listeners with the highest priority
      const searchListener = SearchManager.getHighestPrioritySearchListener(searchTag);
      if (searchListener != null) {
        searchListener.onSearch(searchTerms);
      }
    } else if (SearchManager.getDefaultSearchListener() != null) {
      // If there are no search listeners except for a default one, then send terms to the default
      const searchListener = SearchManager.getDefaultSearchListener();
      if (searchListener != null) {
        searchListener.onSearch(searchTerms);
      }
    }
  }

  /**
   * Handles navigation within a nested Navigator.
   *
   * @param {boolean} showBackButton true to show the back button, false otherwise
   * @param {?string} placeholder    placeholder string for search bar, or null to use default
   */
  _onSubnavigation(showBackButton: boolean, placeholder: ?string): void {
    this._showBackButton(showBackButton);
    this._updateSearchPlaceholder(placeholder);
  }

  /**
   * Renders the app tabs and icons, an indicator to show the current tab, and a navigator with the tab contents.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement < any > {

    /* eslint-disable no-magic-numbers */
    /* Hardcoded tab numbers */

    return (
      <View style={_styles.container}>
        <NavBar
            ref='NavBar'
            onBack={this._navigateBack}
            onSearch={this._onSearch.bind(this)} />
        <View
            style={_styles.container}
            onMoveShouldSetResponder={this._dismissKeyboard}
            onStartShouldSetResponder={this._dismissKeyboard}>
          <ScrollableTabView
              locked={true}
              ref='TabView'
              renderTabBar={() => <TabBar />}
              scrollWithoutAnimation={true}
              tabBarPosition='bottom'
              onChangeTab={this._onChangeTab.bind(this)}>
            <Find
                ref={ref => (this._tabs[0] = ref)}
                tabLabel='Find'
                onChangeScene={this._onSubnavigation} />
            <Schedule
                ref={ref => (this._tabs[1] = ref)}
                tabLabel='Schedule'
                onChangeScene={this._onSubnavigation} />
            <Discover
                ref={ref => (this._tabs[2] = ref)}
                tabLabel='Discover'
                onChangeScene={this._onSubnavigation} />
            <SearchResults
                initialSearch=''
                ref={ref => (this._tabs[3] = ref)}
                tabLabel='Search' />
            <SettingsHome
                ref={ref => (this._tabs[4] = ref)}
                refreshParent={this._refreshNavbar.bind(this)}
                tabLabel='Settings'
                onChangeScene={this._onSubnavigation} />
          </ScrollableTabView>
        </View>
      </View>
    );

    /* eslint-enable no-magic-numbers */

  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

module.exports = TabsCommon;
