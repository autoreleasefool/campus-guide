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
 * @file TabBar.js
 * @providesModule TabBar
 * @description Renders the tab bar.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Redux imports
import { connect } from 'react-redux';
import * as actions from 'actions';

// Types
import type { Icon, Language, Tab, TabSet } from 'types';

// Imports
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as Constants from 'Constants';
import * as DisplayUtils from 'DisplayUtils';
import * as TranslationUtils from 'TranslationUtils';

// Icons for tab items
const tabIcons: TabSet = {
  discover: {
    icon: {
      android: {
        class: 'ionicons',
        icon: 'md-compass',
      },
      ios: {
        class: 'ionicons',
        name: 'ios-compass',
      },
    },
  },
  find: {
    icon: {
      class: 'material',
      name: 'near-me',
    },
  },
  schedule: {
    icon: {
      android: {
        class: 'ionicons',
        name: 'md-calendar',
      },
      ios: {
        class: 'ionicons',
        name: 'ios-calendar-outline',
      },
    },
  },
  search: {
    icon: {
      android: {
        class: 'ionicons',
        name: 'md-search',
      },
      ios: {
        class: 'ionicons',
        name: 'ios-search',
      },
    },
  },
  settings: {
    icon: {
      android: {
        class: 'ionicons',
        name: 'md-settings',
      },
      ios: {
        class: 'ionicons',
        name: 'ios-settings',
      },
    },
  },
};

class TabBar extends React.Component {

  /**
   * Properties this component expects to be provided by its parent.
   */
  props: {
    activeTab: number,              // Current active tab
    language: Language,             // The user's currently selected language
    switchTab: (tab: Tab) => void,  // Switches the current tab
    tabs: Array < any >,            // Array of tabs to render
  }

  /**
   * Switches the active tab.
   *
   * @param {number} tab the selected tab
   */
  _switchTab(tab: number): void {
    this.props.switchTab(Constants.Tabs[tab]);
  }

  /**
   * Renders an icon and name for each available tab in the bar.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render
   */
  render(): ReactElement < any > {
    // Get current language for translations
    const Translations: Object = TranslationUtils.getTranslations(this.props.language);

    return (
      <View style={_styles.tabContainer}>
        {this.props.tabs.map((tab, i) => {
          const icon: ?Icon = DisplayUtils.getPlatformIcon(Platform.OS, tabIcons[Constants.Tabs[i]]);
          const color = this.props.activeTab === i
              ? Constants.Colors.primaryBackground
              : Constants.Colors.secondaryBackground;
          let iconView: ?ReactElement < any >;

          if (icon == null) {
            iconView = null;
          } else {
            iconView = (icon.class === 'ionicons')
                ? (
                  <Ionicons
                      color={color}
                      name={icon.name}
                      size={Constants.Sizes.Icons.Tab} />
                )
                : (
                  <MaterialIcons
                      color={color}
                      name={icon.name}
                      size={Constants.Sizes.Icons.Tab} />
                );
          }

          return (
            <TouchableOpacity
                activeOpacity={1}
                key={Constants.Tabs[i]}
                style={_styles.tab}
                onPress={this._switchTab.bind(this, i)}>
              {iconView}
              <Text style={[ _styles.caption, { color: color }]}>{Translations[Constants.Tabs[i]]}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  tabContainer: {
    // height: 50,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.25)',
    backgroundColor: Constants.Colors.polarGrey,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginBottom: 2,
  },
  caption: {
    fontSize: Constants.Sizes.Text.Caption,
    marginTop: 2,
  },
});

const mapStateToProps = (store) => {
  return {
    language: store.config.options.language,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    switchTab: (tab: Tab) => dispatch(actions.switchTab(tab)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TabBar);
