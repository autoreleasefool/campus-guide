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

// Imports
const CommonTabs = require('./CommonTabs');
const Constants = require('../Constants');
const Ionicons = require('react-native-vector-icons/Ionicons');
const NavBar = require('./NavBar');

// Icons for tab items
const tabIcons: TabItems = {
  find: 'ios-navigate',
  schedule: 'ios-calendar-outline',
  discover: 'ios-compass',
  settings: 'ios-settings',
};

// Determining the size of the current tab indicator based on the screen size
const {width} = Dimensions.get('window');
const indicatorWidth: number = Math.ceil(width / Constants.Tabs.length);
const tabIconSize: number = 30;

class TabsView extends CommonTabs {

  /**
   * Renders the app tabs and icons, an indicator to show the current tab, and a navigator with the tab contents.
   *
   * @returns {ReactElement} the hierarchy of views to render.
   */
  render(): ReactElement {
    let indicatorLeft: number = 0;

    const tabs: Array<ReactElement> = [];
    for (let i = 0; i < Constants.Tabs.length; i++) {
      let tabColor: string = Constants.Colors.charcoalGrey;
      if (this.state.currentTab === this.tabScreens[Constants.Tabs[i]]) {
        tabColor = Constants.Colors.garnet;
        indicatorLeft = indicatorWidth * i;
      }

      tabs.push(
        <TouchableOpacity
            key={Constants.Tabs[i]}
            style={_styles.tab}
            onPress={this._changeTabs.bind(this, this.tabScreens[Constants.Tabs[i]])}>
          <Ionicons
              color={tabColor}
              name={tabIcons[Constants.Tabs[i]]}
              size={tabIconSize} />
        </TouchableOpacity>
      );
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
          {tabs.map(tab => (
            tab
          ))}
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
