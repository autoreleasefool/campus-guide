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
 * @file NavBar.js
 * @module NavBar
 * @description Navigation and search bar for the top of the app, to allow the user to
 *              search from anywhere.
 * @flow
 *
 */
'use strict';

// React Native imports
import React from 'react';
import {
  Dimensions,
  Platform,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  View,
} from 'react-native';

// Imports
const Constants = require('../Constants');
const MaterialIcons = require('react-native-vector-icons/MaterialIcons');
const Preferences = require('../util/Preferences');
const StatusBarUtils = require('../util/StatusBarUtils');

// Get dimensions of the screen
const {width} = Dimensions.get('window');

// Type definition for component props.
type Props = {
  onBack: ?() => any,
  onDrawerToggle: ?() => any,
  onSearch: () => any,
};

// Type definition for component state.
type State = {
  refresh: ?boolean,
};

class NavBar extends React.Component {

  /**
   * Properties which the parent component should make available to this
   * component.
   */
  static propTypes = {
    onBack: React.PropTypes.func,
    onDrawerToggle: React.PropTypes.func,
    onSearch: React.PropTypes.func.isRequired,
  };

  /**
   * Define type for the component state.
   */
  state: State;

  /**
   * Pass props and declares initial state.
   *
   * @param {Props} props properties passed from container to this component.
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      refresh: false,
    };

    // Explicitly binding 'this' to certain methods
    (this:any).getRefresh = this.getRefresh.bind(this);
  }

  /**
   * Returns the current state of the refresh variable, to allow it to be
   * flipped to re-render the view.
   *
   * @returns {boolean} the value of {this.state.refresh}.
   */
  getRefresh(): boolean {
    if (this.state.refresh == null) {
      return false;
    }

    return this.state.refresh;
  }

  /**
   * Prompts the app to search, so long as there is any text to search with.
   *
   * @param {string} text params to search for.
   */
  _onSearch(text: string): void {
    if (text && text.length > 0) {
      this.props.onSearch(text);
    }
  }

  /**
   * Calls the component prop to toggle the navigation drawer.
   */
  _toggleDrawer(): void {
    if (this.props.onDrawerToggle) {
      this.props.onDrawerToggle();
    }
  }

  /**
   * Renders a text input field for searching.
   *
   * @returns {ReactElement} the hierarchy of views to render.
   */
  render(): ReactElement {
    // Get current language for translations
    let Translations = null;
    if (Preferences.getSelectedLanguage() === 'fr') {
      Translations = require('../../assets/static/js/Translations.fr.js');
    } else {
      Translations = require('../../assets/static/js/Translations.en.js');
    }

    const searchBarLeft: number = 50;
    const searchBarWidth: number = width - 60;

    return (
      <View style={_styles.container}>
        <TouchableOpacity
            style={_styles.drawerToggle}
            onPress={this._toggleDrawer.bind(this)}>
          <MaterialIcons
              color={'white'}
              name={'menu'}
              size={24}
              style={{marginLeft: 20, marginRight: 20, marginTop: 8}} />
        </TouchableOpacity>
        <View style={[_styles.innerContainer, _styles.searchContainer, {width: searchBarWidth, left: searchBarLeft}]}>
          <MaterialIcons
              color={'white'}
              name={'search'}
              size={24}
              style={{marginLeft: 10, marginRight: 10}}
              onPress={() => this.refs.SearchInput.focus()} />
          <TextInput
              autoCorrect={false}
              placeholder={Translations.search_placeholder}
              placeholderTextColor={Constants.Colors.lightGrey}
              ref='SearchInput'
              style={{flex: 1, height: 40, color: Constants.Colors.polarGrey}}
              onChangeText={this._onSearch.bind(this)} />
        </View>
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    marginTop: StatusBarUtils.getStatusBarPadding(Platform),
  },
  innerContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    margin: 10,
    marginLeft: 0,
  },
  searchContainer: {
    position: 'absolute',
    top: 0,
  },
  drawerToggle: {
    height: 40,
    alignItems: 'center',
    left: 0,
  },
});

// Expose component to app
module.exports = NavBar;
