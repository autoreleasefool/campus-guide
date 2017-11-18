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
 * @file TabBar.tsx
 * @description Renders the tab bar.
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
import * as actions from '../actions';

// Imports
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as Constants from '../constants';
import * as Display from '../util/Display';
import * as Translations from '../util/Translations';

// Types
import { Store } from '../store/configureStore';
import { Language } from '../util/Translations';
import { Icon, Tab, TabSet } from '../../typings/global';

interface Props {
  activeTab: number;          // Current active tab
  language: Language;         // The user's currently selected language
  tabs: any[];                // Array of tabs to render
  switchTab(tab: Tab): void;  // Switches the current tab
}

interface State {}

// Icons for tab items when active
// NOTE: Should be kept in line with inactiveTabIcons below
const activeTabIcons: TabSet<{ icon: Icon }> = {
  discover: {
    icon: {
      android: {
        class: 'ionicon',
        name: 'md-compass',
      },
      ios: {
        class: 'ionicon',
        name: 'ios-compass',
      },
    },
  },
  find: {
    icon: {
      android: {
        class: 'ionicon',
        name: 'md-navigate',
      },
      ios: {
        class: 'ionicon',
        name: 'ios-navigate',
      },
    },
  },
  schedule: {
    icon: {
      android: {
        class: 'ionicon',
        name: 'md-calendar',
      },
      ios: {
        class: 'ionicon',
        name: 'ios-calendar',
      },
    },
  },
  search: {
    icon: {
      android: {
        class: 'ionicon',
        name: 'md-search',
      },
      ios: {
        class: 'ionicon',
        name: 'ios-search',
      },
    },
  },
  settings: {
    icon: {
      android: {
        class: 'ionicon',
        name: 'md-settings',
      },
      ios: {
        class: 'ionicon',
        name: 'ios-settings',
      },
    },
  },
};

// Icons for tab items when inactive
// NOTE: Should be kept in line with activeTabIcons above
const inactiveTabIcons: TabSet<{ icon: Icon }> = {
  discover: {
    icon: {
      android: Display.getAndroidIcon(activeTabIcons.discover),
      ios: {
        class: 'ionicon',
        name: 'ios-compass-outline',
      },
    },
  },
  find: {
    icon: {
      android: Display.getAndroidIcon(activeTabIcons.find),
      ios: {
        class: 'ionicon',
        name: 'ios-navigate-outline',
      },
    },
  },
  schedule: {
    icon: {
      android: Display.getAndroidIcon(activeTabIcons.schedule),
      ios: {
        class: 'ionicon',
        name: 'ios-calendar-outline',
      },
    },
  },
  search: {
    icon: {
      android: Display.getAndroidIcon(activeTabIcons.search),
      ios: {
        class: 'ionicon',
        name: 'ios-search-outline',
      },
    },
  },
  settings: {
    icon: {
      android: Display.getAndroidIcon(activeTabIcons.settings),
      ios: {
        class: 'ionicon',
        name: 'ios-settings-outline',
      },
    },
  },
};

class TabBar extends React.PureComponent<Props, State> {

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
   * @returns {JSX.Element} the hierarchy of views to render
   */
  render(): JSX.Element {
    return (
      <View style={_styles.tabContainer}>
        {this.props.tabs.map((_: any, i: number) => {
          const iconSet = this.props.activeTab === i ? activeTabIcons : inactiveTabIcons;
          const icon = Display.getPlatformIcon(Platform.OS, iconSet[Constants.Tabs[i]]);
          const color = this.props.activeTab === i
              ? Constants.Colors.primaryBackground
              : Constants.Colors.secondaryBackground;

          let iconView: JSX.Element;
          if (icon == undefined) {
            iconView = undefined;
          } else {
            iconView = (icon.class === 'ionicon')
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
              <Text style={[ _styles.caption, { color }]}>
                {Translations.get(Constants.Tabs[i])}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  caption: {
    fontSize: Constants.Sizes.Text.Caption,
    marginTop: 2,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginBottom: Constants.Sizes.Margins.Condensed,
    marginTop: Constants.Sizes.Margins.Condensed,
  },
  tabContainer: {
    backgroundColor: Constants.Colors.tertiaryBackground,
    borderTopColor: 'rgba(0, 0, 0, 0.25)',
    borderTopWidth: 1,
    flexDirection: 'row',
  },
});

const mapStateToProps = (store: Store): any => {
  return {
    language: store.config.options.language,
  };
};

const mapDispatchToProps = (dispatch: any): any => {
  return {
    switchTab: (tab: Tab): void => dispatch(actions.switchTab(tab)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TabBar) as any;
