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
 * @created 2016-10-12
 * @file TabView.tsx
 * @description Manages the application's tabs and the user's navigation.
 */
'use strict';

// React imports
import React from 'react';
import { StyleSheet, View } from 'react-native';

// Redux imports
import { connect } from 'react-redux';
import * as actions from '../actions';

// Imports
import * as Constants from '../constants';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import TabBar from '../components/TabBar';

// Tabs
import Discover from './discover/Discover';
import Find from './find/Find';
import Schedule from './schedule/Schedule';
import Search from './search/SearchView';
import Settings from './settings/Settings';

// Types
import { Store } from '../store/configureStore';
import { Tab } from '../../typings/global';

interface Props {
  tab: Tab; // The current tab
  switchTab(tab: Tab): void;  // Switches the current tab
}

interface State {}

class TabView extends React.PureComponent<Props, State> {

  /**
   * Switch to a new tab.
   *
   * @param {Tab} tab new tab
   */
  _switchTab = (tab: Tab): void => {
    this.props.switchTab(tab);
  }

  /**
   * Renders the app tabs and icons, an indicator to show the current tab, and a navigator with the tab contents.
   *
   * @returns {JSX.Element} the hierarchy of views to render
   */
  render(): JSX.Element {
    const numberOfTabs: number = Constants.Tabs.length;
    const tabs = [];
    for (let i = 0; i < numberOfTabs; i++) {
      switch (Constants.Tabs[i]) {
        case 'find':
          tabs.push(
            <Find
                key='find'
                tabLabel='find' />
          );
          break;
        case 'discover':
          tabs.push(
            <Discover
                key='discover'
                tabLabel='discover' />
          );
          break;
        case 'search':
          tabs.push(
            <Search
                key='search'
                tabLabel='search' />
          );
          break;
        case 'settings':
          tabs.push(
            <Settings
                key='settings'
                tabLabel='settings' />
          );
          break;
        case 'schedule':
          tabs.push(
            <Schedule
                key='schedule'
                tabLabel='schedule' />
          );
          break;
        default:
          throw new Error(`Unimplemented tab type: ${Constants.Tabs[i]}`);
      }
    }

    return (
      <View style={_styles.container}>
        <ScrollableTabView
            locked={true}
            page={Constants.Tabs.indexOf(this.props.tab)}
            renderTabBar={(): JSX.Element =>
              <TabBar switchTab={this._switchTab} />
            }
            scrollWithoutAnimation={true}
            tabBarPosition='bottom'>
          {tabs.map((tab: JSX.Element) => tab)}
        </ScrollableTabView>
      </View>
    );

  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    backgroundColor: Constants.Colors.primaryBackground,
    flex: 1,
  },
});

const mapStateToProps = (store: Store): object => {
  return {
    tab: store.navigation.tab,
  };
};

const mapDispatchToProps = (dispatch: any): any => {
  return {
    switchTab: (tab: Tab): void => dispatch(actions.switchTab(tab)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TabView) as any;
