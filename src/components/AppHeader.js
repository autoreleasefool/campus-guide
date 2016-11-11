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
 * @created 2016-10-14
 * @file AppHeader.js
 * @providesModule AppHeader
 * @description Navigation and search bar for the top of the app, to allow the user to
 *              search from anywhere
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
  Text,
  // TextInput,
  View,
} from 'react-native';

// Redux imports
import {connect} from 'react-redux';
import {
  navigateBack,
} from 'actions';

// Types
import type {
  Language,
  Name,
  TranslatedName,
} from 'types';

// Type definition for component props.
type Props = {
  appTitle: Name | TranslatedName,  // Title for the header
  language: Language,               // The user's currently selected language
  onBack: () => void,               // Tells the app to navigate one screen backwards
  shouldShowBack: boolean,          // Indicates if the header should show a back button
  shouldShowSearch: boolean,        // Indicates if the header should show a search input option
}

// Type definition for component state.
type State = {
  shouldShowBack: boolean,          // Indicates if the header should show a back button
  shouldShowSearch: boolean,        // Indicates if the header should show a search input option
}

// Imports
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Constants from 'Constants';
import * as TranslationUtils from 'TranslationUtils';

// Height of the navbar
const NAVBAR_HEIGHT: number = 50;
const HEADER_PADDING_IOS: number = 25;

class AppHeader extends React.Component {

  /**
   * Properties this component expects to be provided by its parent.
   */
  props: Props;

  /**
   * Current state of the component.
   */
  state: State;

  /**
   * Constructor.
   *
   * @param {props} props component props
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      shouldShowBack: false,
      shouldShowSearch: false,
    };
  }

  /**
   * Updates which icons are showing with an animation.
   *
   * @param {Props} nextProps the new props
   */
  componentWillReceiveProps(nextProps: Props): void {
    if (nextProps.shouldShowBack != this.props.shouldShowBack
        || nextProps.shouldShowSearch != this.props.shouldShowSearch) {
      LayoutAnimation.easeInEaseOut();
      this.setState({
        shouldShowBack: nextProps.shouldShowBack,
        shouldShowSearch: nextProps.shouldShowSearch,
      });
    }
  }

  _startSearch(): void {
    console.log('Search app');
  }

  _onBack(): void {
    this.props.onBack();
  }

  /**
   * Renders a title, back button for navigation, and search button.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render
   */
  render(): ReactElement < any > {
    const platformModifier: string = Platform.OS === 'ios' ? 'ios' : 'md';
    const backArrowIcon: string = platformModifier + '-arrow-back';
    const searchIcon: string = platformModifier + '-search';

    // If title is string, use it as key for translations
    let appTitle: string;
    if (typeof (this.props.appTitle) === 'string') {
      // Get current language for translations
      const Translations: Object = TranslationUtils.getTranslations(this.props.language);
      appTitle = Translations[this.props.appTitle];
    } else {
      appTitle = TranslationUtils.getTranslatedName(this.props.language, this.props.appTitle) || '';
    }

    // Hide/show back button
    let backIconStyle: Object = {left: -50};
    if (this.props.shouldShowBack) {
      backIconStyle = {left: 0};
    }

    // Hide/show search button
    let searchIconStyle: Object = {right: -50};
    if (this.props.shouldShowSearch) {
      searchIconStyle = {right: 0};
    }

    return (
      <View style={_styles.container}>
        <View style={_styles.titleContainer}>
          <Text style={_styles.title}>{appTitle}</Text>
        </View>
        <TouchableOpacity
            style={[_styles.icon, searchIconStyle]}
            onPress={this._startSearch.bind(this)}>
          <Ionicons
              color={Constants.Colors.primaryWhiteIcon}
              name={searchIcon}
              size={Constants.Sizes.Icons.Medium} />
        </TouchableOpacity>
        <TouchableOpacity
            style={[_styles.icon, backIconStyle]}
            onPress={this._onBack.bind(this)}>
          <Ionicons
              color={Constants.Colors.primaryWhiteIcon}
              name={backArrowIcon}
              size={Constants.Sizes.Icons.Medium} />
        </TouchableOpacity>
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    backgroundColor: Constants.Colors.primaryBackground,
    flexDirection: 'row',
    alignItems: 'center',
    height: NAVBAR_HEIGHT,
    marginTop: Platform.OS === 'ios' ? HEADER_PADDING_IOS : 0,
  },
  icon: {
    position: 'absolute',
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    fontSize: Constants.Sizes.Text.Title,
    color: Constants.Colors.primaryWhiteText,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
});

// Map state to props
const select = (store) => {
  return {
    appTitle: store.header.title,
    language: store.config.language,
    shouldShowBack: store.header.shouldShowBack,
    shouldShowSearch: store.header.shouldShowSearch,
  };
};

// Map dispatch to props
const actions = (dispatch) => {
  return {
    onBack: () => dispatch(navigateBack()),
  };
};

export default connect(select, actions)(AppHeader);
