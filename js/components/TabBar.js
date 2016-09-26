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
 * @file TabBar.js
 * @providesModule TabBar
 * @description Renders the tab bar.
 *
 * @flow
 */
'use strict';

/* eslint-disable react/prefer-stateless-function */

// React imports
import React from 'react';
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

// Type imports
import type {
  TabItems,
} from 'types';

// Imports
const Constants = require('Constants');
const Ionicons = require('react-native-vector-icons/Ionicons');

// Icons for tab items
let tabIcons: TabItems;
if (Platform.OS === 'android') {
  tabIcons = {
    find: 'directions',
    schedule: 'event',
    discover: 'near-me',
    settings: 'settings',
  };
} else {
  tabIcons = {
    find: 'ios-navigate',
    schedule: 'ios-calendar-outline',
    discover: 'ios-compass',
    settings: 'ios-settings',
  };
}

// Size of the icons within the tabs
const tabIconSize: number = 30;

class TabBar extends React.Component {

  /**
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    activeTab: React.PropTypes.number,
    goToPage: React.PropTypes.func,
    tabs: React.PropTypes.array,
  };

  render(): ReactElement < any > {
    return (
      <View style={_styles.tabContainer}>
        {this.props.tabs.map((tab, i) => (
          <TouchableOpacity
              activeOpacity={1}
              key={Constants.Tabs[i]}
              style={_styles.tab}
              onPress={() => this.props.goToPage(i)}>
            <Ionicons
                color={this.props.activeTab === i ? Constants.Colors.garnet : Constants.Colors.charcoalGrey}
                name={tabIcons[Constants.Tabs[i]]}
                size={tabIconSize} />
          </TouchableOpacity>
        ))}
      </View>
    );
  }

}

// Private styles for component
const _styles = StyleSheet.create({
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
});

module.exports = TabBar;
