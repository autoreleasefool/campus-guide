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
 * @file Tabs.android.js
 * @module TabsView
 * @description Tab bar to manage navigation between the root views in the application.
 * @flow
 *
 */
'use strict';

// React Native imports
import React from 'react';
import {
  BackAndroid,
  DrawerLayoutAndroid,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Imports
const CommonTabs = require('./CommonTabs');
const Constants = require('../Constants');
const Ionicons = require('react-native-vector-icons/Ionicons');
const NavBar = require('./NavBar');

// Icons for items in navigation drawer
const drawerIcons: TabItems = {
  find: 'directions',
  schedule: 'event',
  discover: 'near-me',
  settings: 'settings',
};

// Determining the size of the current tab indicator based on the screen size
const tabIconSize: number = 30;

// Represents a closed navigation drawer.
const DRAWER_CLOSED: number = 0;
// Represents an open navigation drawer.
const DRAWER_OPEN: number = 1;
// Indicates the current state of the navigation drawer: 0 is closed, 1 is open.
let drawerState: number = DRAWER_CLOSED;

class TabsView extends CommonTabs {

  /**
   * Attaches a listener to the Android back button.
   */
  componentDidMount(): void {
    BackAndroid.addEventListener('hardwareBackPress', this._navigateBack.bind(this));
  }

  /**
   * Removes the listener from the Android back button.
   */
  componentWillUnmount(): void {
    BackAndroid.removeEventListener('hardwareBackPress', this._navigateBack.bind(this));
  }

  /**
   * Toggles the navigation drawer open or closed.
   */
  _toggleDrawer(): void {
    if (drawerState === DRAWER_OPEN) {
      this.refs.Drawer.openDrawer();
    } else {
      this.refs.Drawer.closeDrawer();
    }
  }

  /**
   * Called when the navigation drawer opens or closes.
   *
   * @param {boolean} drawerOpen true to open the drawer, false to close.
   */
  _onDrawerToggle(drawerOpen: boolean): void {
    if (drawerOpen) {
      drawerState = DRAWER_OPEN;
    } else {
      drawerState = DRAWER_CLOSED;
    }
  }

  /**
   * Renders the content in the navigation drawer.
   *
   * @returns {ReactElement} a list of navigation items for the drawer.
   */
  _renderNavigationView(): ReactElement {
    // Get current language for translations
    let Translations: Object;
    if (Preferences.getSelectedLanguage() === 'fr') {
      Translations = require('../../assets/static/js/Translations.fr.js');
    } else {
      Translations = require('../../assets/static/js/Translations.en.js');
    }

    const tabs: Array<ReactElement> = [];
    for (let i = 0; i < Constants.Tabs.length; i++) {
      let tabColor: string = Constants.Colors.charcoalGrey;
      if (this.state.currentTab === tabScreens[Constants.Tabs[i]]) {
        tabColor = Constants.Colors.garnet;
      }

      tabs.push(
        <TouchableOpacity
            key={Constants.Tabs[i]}
            style={_styles.tab}
            onPress={this._changeTabs.bind(this, tabScreens[Constants.Tabs[i]])}>
          <Ionicons
              color={tabColor}
              name={drawerIcons[Constants.Tabs[i]]}
              size={tabIconSize} />
          <Text style={{color: tabColor}}>{Translations[Constants.Tabs[i]]}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={_styles.navigationDrawer}>
        {tabs.map(tab => (
          tab
        ))}
      </View>
    );
  }

  /**
   * Renders the app tabs and icons, an indicator to show the current tab, and a navigator with the tab contents.
   *
   * @returns {ReactElement} the hierarchy of views to render.
   */
  render(): ReactElement {
    return (
      <DrawerLayoutAndroid
          drawerPosition={DrawerLayoutAndroid.positions.Left}
          drawerWidth={300}
          ref='Drawer'
          renderNavigationView={this._renderNavigationView.bind(this)}
          onDrawerClose={this._onDrawerToggle.bind(this, false)}
          onDrawerOpen={this._onDrawerToggle.bind(this, true)}>
        <NavBar
            ref='NavBar'
            onDrawerToggle={this._onDrawerToggle}
            onSearch={this._onSearch} />
        <Navigator
            configureScene={this._configureScene}
            initialRoute={{id: Constants.Views.Default}}
            ref='Navigator'
            renderScene={this._renderScene.bind(this)}
            style={_styles.navigator} />
      </DrawerLayoutAndroid>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  navigator: {
    flex: 1,
  },
  navigationDrawer: {
    flex: 1,
    flexDirection: 'column',
  },
});

// Expose component to app
module.exports = TabsView;
