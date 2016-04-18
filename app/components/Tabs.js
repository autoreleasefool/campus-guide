/*************************************************************************
 *
 * @license
 *
 * Copyright 2016 Joseph Roque
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
 *************************************************************************
 *
 * @file
 * Tabs.js
 *
 * @description
 * Tab bar to manage navigation between the root views in the application.
 *
 * @author
 * Joseph Roque
 *
 *************************************************************************
 *
 * @external
 * @flow
 *
 ************************************************************************/
'use strict';

// React Native imports
const React = require('react-native');
const {
  Component,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} = React;

// Imports
const Constants = require('../Constants');

// Declaring icons depending on the platform
let Icon;
let tabIcons;
if (Platform.OS === 'ios') {
  Icon = require('react-native-vector-icons/Ionicons');
  tabIcons = {
    'Find': 'navigate',
    'Schedule': 'ios-calendar-outline',
    'Discover': 'compass',
    'Settings': 'ios-gear',
  };
} else {
  Icon = require('react-native-vector-icons/MaterialIcons');
  tabIcons = {
    'Find': 'directions',
    'Schedule': 'event',
    'Discover': 'near-me',
    'Settings': 'settings',
  };
}

// Determining the size of the current tab indicator based on the screen size
const {height, width} = Dimensions.get('window');
const indicatorWidth = Math.ceil(width / 4);
const indicatorHeight = 5;
const tabIconSize = 30;

class TabBar extends Component {

  /**
   * Properties which the parent component should make available to this
   * component.
   */
  static propTypes = {
    requestTabChange: React.PropTypes.func.isRequired,
  };

  /**
   * Pass props and declares initial state.
   *
   * @param props properties passed from container to this component.
   */
  constructor(props) {
    super(props);
    this.state = {
      currentTab: Constants.Views.Find.Home,
    };

    // Explicitly binding 'this' to all methods that need it
    this.getCurrentTab = this.getCurrentTab.bind(this);
    this._changeTabs = this._changeTabs.bind(this);
  };

  /**
   * Retrieves the current tab.
   *
   * @return the current tab in the state.
   */
  getCurrentTab() {
    return this.state.currentTab;
  };

  /**
   * Switch to the selected tab, as determined by tabId.
   *
   * @param tabId the tab to switch to.
   */
  _changeTabs(tabId) {
    // Switch to the selected tab
    this.props.requestTabChange(tabId);
  };

  /**
   * Renders the app tabs and icons, and an indicator to show the current tab.
   *
   * @return the hierarchy of views to render.
   */
  render() {
    let findColor = Constants.Colors.charcoalGrey;
    let scheduleColor = Constants.Colors.charcoalGrey;
    let discoverColor = Constants.Colors.charcoalGrey;
    let settingsColor = Constants.Colors.charcoalGrey;
    let indicatorLeft = 0;

    // Set the color of the current tab to garnet
    if (this.state.currentTab === Constants.Views.Find.Home) {
      indicatorLeft = 0;
      findColor = Constants.Colors.garnet;
    } else if (this.state.currentTab === Constants.Views.Schedule.Home) {
      indicatorLeft = indicatorWidth;
      scheduleColor = Constants.Colors.garnet;
    } else if (this.state.currentTab === Constants.Views.Discover.Home) {
      indicatorLeft = indicatorWidth * 2;
      discoverColor = Constants.Colors.garnet;
    } else if (this.state.currentTab === Constants.Views.Settings.Home) {
      indicatorLeft = indicatorWidth * 3;
      settingsColor = Constants.Colors.garnet;
    }

    return (
      <View style={_styles.container}>
        <TouchableOpacity onPress={() => {this._changeTabs(Constants.Views.Find.Home)}} style={_styles.tab}>
          <Icon name={tabIcons['Find']} size={tabIconSize} color={findColor} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {this._changeTabs(Constants.Views.Schedule.Home)}} style={_styles.tab}>
          <Icon name={tabIcons['Schedule']} size={tabIconSize} color={scheduleColor} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {this._changeTabs(Constants.Views.Discover.Home)}} style={_styles.tab}>
          <Icon name={tabIcons['Discover']} size={tabIconSize} color={discoverColor} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {this._changeTabs(Constants.Views.Settings.Home)}} style={_styles.tab}>
          <Icon name={tabIcons['Settings']} size={tabIconSize} color={settingsColor} />
        </TouchableOpacity>
        <View style={[_styles.indicator, {left: indicatorLeft}]} />
      </View>
    )
  };
};

// Private styles for component
const _styles = StyleSheet.create({
  container: {
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
    height: indicatorHeight,
    backgroundColor: Constants.Colors.garnet,
  }
});

// Expose component to app
module.exports = TabBar;
