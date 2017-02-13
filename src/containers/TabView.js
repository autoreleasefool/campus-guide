/**
 *
 * @license
 * Copyright (C) 2016-2017 Joseph Roque
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
 * @file TabView.js
 * @description Manages the application's tabs and the user's navigation.
 *
 * @flow
 */
'use strict';

/* eslint-disable react/prefer-stateless-function */
/* Better to keep this as a class for consistency. */

// React imports
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// Redux imports
import { connect } from 'react-redux';

// Types
import type { Tab } from 'types';

// Imports
import ScrollableTabView from 'react-native-scrollable-tab-view';
import TabBar from 'TabBar';
import * as Constants from 'Constants';

// Tabs
import Discover from './discover/Discover';
import Find from './find/Find';
import Schedule from './schedule/Schedule';
import Search from './search/Search';
import Settings from './settings/Settings';

class TabView extends React.Component {

  /**
   * Properties this component expects to be provided by its parent.
   */
  props: {
    tab: Tab, // The current tab
  };

  /**
   * Renders the app tabs and icons, an indicator to show the current tab, and a navigator with the tab contents.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement < any > {

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
          tabs.push(
            <View
                key={Constants.Tabs[i]}
                tabLabel={Constants.Tabs[i]}>
              <Text>{Constants.Tabs[i]}</Text>
            </View>
          );
          // throw new Error('Unimplemented tab type: ' + Constants.Tabs[i]);
      }
    }

    return (
      <View style={_styles.container}>
        <ScrollableTabView
            locked={true}
            page={Constants.Tabs.indexOf(this.props.tab)}
            renderTabBar={() => <TabBar />}
            scrollWithoutAnimation={true}
            tabBarPosition='bottom'>
          {tabs.map((tab: ReactElement < any >) => tab)}
        </ScrollableTabView>
      </View>
    );

  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.Colors.primaryBackground,
  },
});

const mapStateToProps = (store) => {
  return {
    tab: store.navigation.tab,
  };
};

export default connect(mapStateToProps)(TabView);
