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
 * @providesModule NavBar
 * @description Navigation and search bar for the top of the app, to allow the user to
 *              search from anywhere.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  LayoutAnimation,
  Platform,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  View,
} from 'react-native';

// Type imports
import type {
  DefaultFunction,
} from 'types';

// Type definition for component props.
type Props = {
  onBack: ?DefaultFunction,
  onDrawerToggle: ?DefaultFunction,
  onSearch: (text: ?string) => any,
};

// Type definition for component state.
type State = {
  refresh?: boolean,
  showBackButton?: boolean,
  searching?: boolean,
};

// Imports
const Constants = require('Constants');
const Ionicons = require('react-native-vector-icons/Ionicons');
const Preferences = require('Preferences');
const SearchManager = require('SearchManager');
const StatusBarUtils = require('StatusBarUtils');

// Size of icons in the navbar
const NAVBAR_ICON_SIZE: number = 24;
// Size of large icons in the navbar
const NAVBAR_LARGE_ICON: number = 30;
// Number of milliseconds to offset animation by.
const ANIMATION_OFFSET: number = 50;

class NavBar extends React.Component {

  /**
   * Properties which the parent component should make available to this component.
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
      showBackButton: false,
      searching: false,
    };

    // Explicitly binding 'this' to certain methods
    (this:any).getRefresh = this.getRefresh.bind(this);
  }

  /**
   * Configures the app to animate the next layout change, then updates the state.
   *
   * @param {State} state the new state for the component.
   */
  setState(state: State): void {
    if (state.showBackButton == null && state.searching == null) {
      super.setState(state);
    } else {
      setTimeout(() => {
        LayoutAnimation.easeInEaseOut();
        super.setState(state);
      }, ANIMATION_OFFSET);
    }
  }

  /**
   * Returns the current state of the refresh variable, to allow it to be flipped to re-render the view.
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
   * Clears the search field.
   */
  clearSearch(): void {
    this.refs.SearchInput.clear();
    this.refs.SearchInput.blur();
    this._onSearch(null);
  }

  /**
   * Removes all search listeners.
   */
  _searchAll(): void {
    SearchManager.pauseAllSearchListeners();
    this._onSearch(this.refs.SearchInput.value);
  }

  /**
   * Clears the search field and requests a back navigation.
   */
  _onBack(): void {
    SearchManager.resumeAllSearchListeners();
    this.clearSearch();
    if (this.props.onBack) {
      this.props.onBack();
    }
  }

  /**
   * Prompts the app to search.
   *
   * @param {?string} text params to search for.
   */
  _onSearch(text: ?string): void {
    this.props.onSearch(text);
    if (text != null && text.length > 0) {
      if (!this.state.searching) {
        LayoutAnimation.easeInEaseOut();
        this.setState({
          searching: true,
        });
      }
    } else if (this.state.searching) {
      LayoutAnimation.easeInEaseOut();
      this.setState({
        searching: false,
      });
    }
  }

  /**
   * Renders a text input field for searching.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement<any> {
    // Get current language for translations
    let Translations = null;
    if (Preferences.getSelectedLanguage() === 'fr') {
      Translations = require('../../assets/js/Translations.fr.js');
    } else {
      Translations = require('../../assets/js/Translations.en.js');
    }

    const searchMargin = 10;
    let searchLeftMargin: number = searchMargin;
    let searchRightMargin: number = searchMargin;
    let backIconStyle: Object = {width: 0};
    let searchAllIconStyle: Object = {width: 0};

    if (this.state.showBackButton) {
      backIconStyle = {width: 50};
      searchLeftMargin = 0;
    }

    if (this.state.searching && SearchManager.numberOfSearchListeners() > 0 && !Preferences.getAlwaysSearchAll()) {
      searchAllIconStyle = {width: 50};
      searchRightMargin = 0;
    }

    return (
      <View style={_styles.container}>
        <TouchableOpacity
            style={[_styles.iconWrapper, backIconStyle]}
            onPress={this._onBack.bind(this)}>
          <Ionicons
              color={'white'}
              name={'ios-arrow-back'}
              size={NAVBAR_ICON_SIZE}
              style={_styles.navBarIcon} />
        </TouchableOpacity>
        <View style={[_styles.searchContainer, {marginLeft: searchLeftMargin, marginRight: searchRightMargin}]}>
          <Ionicons
              color={'white'}
              name={'ios-search'}
              size={NAVBAR_ICON_SIZE}
              style={_styles.searchIcon}
              onPress={() => this.refs.SearchInput.focus()} />
          <TextInput
              autoCorrect={false}
              placeholder={Translations.search_placeholder}
              placeholderTextColor={Constants.Colors.lightGrey}
              ref='SearchInput'
              style={_styles.searchText}
              onChangeText={this._onSearch.bind(this)} />
          {(this.state.searching)
              ? <Ionicons
                  color={'white'}
                  name={'ios-close'}
                  size={NAVBAR_LARGE_ICON}
                  style={_styles.clearIcon}
                  onPress={this.clearSearch.bind(this)} /> : null}
        </View>
        <TouchableOpacity
            style={[_styles.iconWrapper, searchAllIconStyle]}
            onPress={this._searchAll.bind(this)}>
          <Ionicons
              color={'white'}
              name={'md-globe'}
              size={NAVBAR_ICON_SIZE}
              style={_styles.navBarIcon} />
        </TouchableOpacity>
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
  searchContainer: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    margin: 10,
  },
  searchIcon: {
    marginLeft: 10,
    marginRight: 10,
  },
  clearIcon: {
    width: 30,
  },
  searchText: {
    flex: 1,
    height: 40,
    color: Constants.Colors.polarGrey,
  },
  navBarIcon: {
    marginTop: 8,
  },
  iconWrapper: {
    height: 40,
    alignItems: 'center',
  },
});

module.exports = NavBar;
