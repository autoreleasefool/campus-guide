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
 * @file CommonTabs.js
 * @module CommonTabs
 * @description Provides tab functionality common to both Android and iOS.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  Navigator,
} from 'react-native';

// Type imports
import type {
  Route,
  TabItems,
} from '../types';

// Type definition for component state.
type State = {
  currentTab: number,
};

// Imports
const Constants = require('../Constants');
const dismissKeyboard = require('dismissKeyboard');
const Preferences = require('../util/Preferences');
const ScreenUtils = require('../util/ScreenUtils');
const SearchManager = require('../util/SearchManager');
const TabRouter = require('./TabRouter');

// Lists the views currently on the stack in the Navigator.
let screenStack: Array<number | string> = [Constants.Views.Default];

class CommonTabs extends React.Component {

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
      currentTab: Constants.Views.DefaultTab,
    };

    // Explicitly binding 'this' to all methods that need it
    (this:any).getCurrentTab = this.getCurrentTab.bind(this);
    (this:any)._navigateForward = this._navigateForward.bind(this);
    (this:any)._searchAll = this._searchAll.bind(this);
  }

  /**
   * Registers a default search listener.
   */
  componentDidMount(): void {
    SearchManager.setDefaultSearchListener({
      onSearch: this._searchAll,
    });
  }

  /**
   * Removes the default search listener.
   */
  componentWillUnmount(): void {
    SearchManager.setDefaultSearchListener(null);
  }

  /** Screen which a tab should open. Made as a member variable so subclasses can see it. */
  tabScreens: TabItems = {
    find: Constants.Views.Find.Home,
    schedule: Constants.Views.Schedule.Home,
    discover: Constants.Views.Discover.Home,
    settings: Constants.Views.Settings.Home,
  };

  /**
   * Switch to the selected tab, as determined by tabId.
   *
   * @param {number} tab the tab to switch to.
   */
  _changeTabs(tab: number): void {
    if (!ScreenUtils.isRootScreen(screenStack[screenStack.length - 1])) {
      // FIXME: shouldn't this always be called?
      this._showBackButton(false);
    }

    SearchManager.resumeAllSearchListeners();
    this.refs.NavBar.clearSearch();
    this.refs.Navigator.resetTo({id: tab});
    this.setState({
      currentTab: tab,
    });
    screenStack = [tab];
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
   * Dismisses the keyboard.
   *
   * @returns {boolean} false
   */
  _dismissKeyboard(): boolean {
    dismissKeyboard();
    return false;
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
   * Retrieves the current tab.
   *
   * @returns {number} the current tab in the state.
   */
  getCurrentTab(): number {
    return this.state.currentTab;
  }

  /**
   * Returns to the previous page.
   *
   * @returns {boolean} true if the app navigated backwards.
   */
  _navigateBack(): boolean {
    if (!ScreenUtils.isRootScreen(screenStack[screenStack.length - 1])) {
      this.refs.Navigator.pop();
      screenStack.pop();

      if (ScreenUtils.isRootScreen(screenStack[screenStack.length - 1])) {
        this._showBackButton(false);
      }

      return true;
    }

    return false;
  }

  /**
   * Opens a screen, unless the screen is already showing. Passes data to the new screen.
   *
   * @param {number | string} screenId id of the screen to display
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
    // TODO: search...
    console.log('TODO: search...');
    this._navigateForward(Constants.Views.Find.Search, searchTerms);
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
   * Passes search params onto search listeners, or the default search listener if there are no others.
   *
   * @param {?string} searchTerms string of terms to search for.
   */
  _onSearch(searchTerms: ?string): void {
    const numberOfSearchListeners = SearchManager.numberOfSearchListeners();
    if (numberOfSearchListeners > 0 && !Preferences.getAlwaysSearchAll()) {
      // Iterate over each search listener and pass the search terms to each one
      for (let i = 0; i < numberOfSearchListeners; i++) {
        const searchListener = SearchManager.getSearchListener(i);
        if (searchListener != null) {
          searchListener.onSearch(searchTerms);
        }
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
   * Renders a view according to the current route of the navigator.
   *
   * @param {Route} route object with properties to identify the route to display.
   * @returns {ReactElement<any>} the view to render, based on {route}.
   */
  _renderScene(route: Route): ReactElement<any> {
    return TabRouter.renderScene(route,
        this._changeTabs.bind(this),
        this._navigateForward,
        this._refreshNavbar.bind(this));
  }
}

module.exports = CommonTabs;
