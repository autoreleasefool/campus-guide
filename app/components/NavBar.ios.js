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
  LayoutAnimation,
  Platform,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  View,
} from 'react-native';

// Import type definitions.
import type {
  DefaultFunction,
} from '../Types';

// Imports
const Constants = require('../Constants');
const DisplayUtils = require('../util/DisplayUtils');
const Ionicons = require('react-native-vector-icons/Ionicons');
const Preferences = require('../util/Preferences');
const StatusBarUtils = require('../util/StatusBarUtils');

// Get dimensions of the screen
const {width} = Dimensions.get('window');
// Size of icons in the navbar
const NAVBAR_ICON_SIZE: number = 24;

// Number of milliseconds to offset animation by.
const ANIMATION_OFFSET: number = 50;

// Type definition for component props.
type Props = {
  onBack: ?DefaultFunction,
  onDrawerToggle: ?DefaultFunction,
  onSearch: (text: ?string) => any,
};

// Type definition for component state.
type State = {
  showBackButton: ?boolean,
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
      showBackButton: false,
      refresh: false,
    };

    // Explicitly binding 'this' to certain methods
    (this:any).getRefresh = this.getRefresh.bind(this);
  }

  /**
   * Configures the app to animate the next layout change, then updates the
   * state.
   *
   * @param {State} state the new state for the component.
   */
  setState(state: State): void {
    if (state.showBackButton == null) {
      super.setState(state);
    } else {
      setTimeout(() => {
        LayoutAnimation.configureNext(DisplayUtils.getEaseInEaseOutLayoutAnimation(LayoutAnimation));
        super.setState(state);
      }, ANIMATION_OFFSET);
    }
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
   * Clears the search field and requests a back navigation.
   */
  _onBack(): void {
    this.refs.SearchInput.setNativeProps({text: ''});
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

    // Width of the back icon when it is visible
    const backIconWidth = 50;
    const searchBarPadding = 10;

    // Setting position of search bar and back button dependent on if back button is showing.
    const searchBarLeft = (this.state.showBackButton)
        ? backIconWidth
        : searchBarPadding;
    const searchBarWidth = (this.state.showBackButton)
        ? width - (searchBarPadding + backIconWidth)
        : width - (searchBarPadding * 2);
    const backButtonLeft = (this.state.showBackButton)
        ? 0
        : -(searchBarPadding + backIconWidth);

    return (
      <View style={_styles.container}>
        <TouchableOpacity
            style={{height: 40, alignItems: 'center', left: backButtonLeft}}
            onPress={this._onBack.bind(this)}>
          <Ionicons
              color={'white'}
              name={'ios-arrow-back'}
              size={NAVBAR_ICON_SIZE}
              style={_styles.backIcon} />
        </TouchableOpacity>
        <View style={[_styles.innerContainer, _styles.searchContainer, {width: searchBarWidth, left: searchBarLeft}]}>
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
  searchIcon: {
    marginLeft: 10,
    marginRight: 10,
  },
  searchText: {
    flex: 1,
    height: 40,
    color: Constants.Colors.polarGrey,
  },
  backIcon: {
    marginLeft: 20,
    marginRight: 20, marginTop: 8,
  },
});

// Expose component to app
module.exports = NavBar;
