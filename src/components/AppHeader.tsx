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
 * @file AppHeader.tsx
 * @description Navigation and search bar for the top of the app, to allow the user to
 *              search from anywhere
 */
'use strict';

// React imports
import React from 'react';
import {
  BackHandler,
  Dimensions,
  LayoutAnimation,
  Platform,
  ScaledSize,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  View,
} from 'react-native';

// Redux imports
import { connect } from 'react-redux';
import * as actions from '../actions';

// Imports
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Constants from '../constants';
import * as Translations from '../util/Translations';

// Types
import { Store } from '../store/configureStore';
import { Language } from '../util/Translations';
import { Name, Tab, TabSet } from '../../typings/global';

interface Props {
  appTitle: Name;                           // Title for the header
  language: Language;                       // The user's currently selected language
  shouldShowBack: boolean;                  // Indicates if the header should show a back button
  shouldShowSearch: boolean;                // Indicates if the header should show a search input option
  showBackDisableCount: number;             // Incremented when the next showBack animation should be disabled
  showSearchDisableCount: number;           // Incremented when the next showSearch animation should be disabled
  tab: Tab;                                 // The current tab the user has open
  tabFilters: TabSet<string>;               // The current search terms
  tabShowBack: TabSet<boolean>;             // Indicates if a tab should show a back button or not
  onBack(tab: Tab): void;                   // Tells the app to navigate one screen backwards
  onSearch(tab: Tab, terms: string): void;  // Updates the user's search terms
}

interface State {
  screenWidth: number;              // Active width of the screen
  searchText: string;               // The current search text
  shouldShowBack: boolean;          // Indicates if the header should show a back button
  shouldShowSearch: boolean;        // Indicates if the header should show a search button
  shouldShowSearchBar: boolean;     // Indicates if the header should hide the title and show a search input
}

// Height of the navbar
export const NavbarHeight = 50;
// Size of icons in the navbar
const ICON_SIZE = 50;

// Z index to place header above everything else
const HEADER_Z_INDEX = 1000;

// Time to delay searches by while user types
const SEARCH_DELAY_TIME = 1000;

class AppHeader extends React.PureComponent<Props, State> {

  /** ID of timer to delay search. */
  _delayTimer: number;

  /**
   * Update the screen width, and rerender component.
   *
   * @param {ScaledSize} dims the new dimensions
   */
  _dimensionsHandler = (dims: { window: ScaledSize }): void =>
      this.setState({ screenWidth: dims.window.width })

  /**
   * Constructor.
   *
   * @param {props} props component props
   */
  constructor(props: Props) {
    super(props);

    this._delayTimer = 0;
    this.state = {
      screenWidth: Dimensions.get('window').width,
      searchText: '',
      shouldShowBack: false,
      shouldShowSearch: false,
      shouldShowSearchBar: false,
    };

    this._delaySearch = this._delaySearch.bind(this);
    this._focusSearchInput = this._focusSearchInput.bind(this);
    this._onBack = this._onBack.bind(this);
    this._toggleSearch = this._toggleSearch.bind(this);
  }

  /**
   * Register back listener for Android and dimension size listener.
   */
  componentDidMount(): void {
    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', this._onBack);
    }

    Dimensions.addEventListener('change', this._dimensionsHandler as any);
  }

  /**
   * Remove back listener for Android and dimension size listener. Clears search timer.
   */
  componentWillUnmount(): void {
    if (Platform.OS === 'android') {
      BackHandler.removeEventListener('hardwareBackPress', this._onBack);
    }

    if (this._delayTimer !== 0) {
      clearTimeout(this._delayTimer);
    }

    Dimensions.removeEventListener('change', this._dimensionsHandler as any);
  }

  /**
   * Updates which icons are showing with an animation.
   *
   * @param {Props} nextProps the new props
   */
  componentWillReceiveProps(nextProps: Props): void {
    if (nextProps.shouldShowBack !== this.props.shouldShowBack
        || nextProps.shouldShowSearch !== this.props.shouldShowSearch
        || nextProps.tab !== this.props.tab) {
      if (!(nextProps.shouldShowSearch && this.state.shouldShowSearchBar)) {
        (this.refs.SearchInput as any).blur();
      }

      if (nextProps.tab !== this.props.tab && nextProps.tab === 'search') {
        (this.refs.SearchInput as any).focus();
      }

      if (nextProps.showBackDisableCount === this.props.showBackDisableCount
          && nextProps.showSearchDisableCount === this.props.showSearchDisableCount) {
        LayoutAnimation.easeInEaseOut();
      }

      const searchExists = nextProps.tabFilters[nextProps.tab] && nextProps.tabFilters[nextProps.tab].length > 0;
      this.setState({
        searchText: nextProps.tabFilters[nextProps.tab],
        shouldShowBack: nextProps.shouldShowBack,
        shouldShowSearch: nextProps.shouldShowSearch || nextProps.tab === 'search',
        shouldShowSearchBar:
          (nextProps.shouldShowSearch && (this.state.shouldShowSearchBar || searchExists))
          || nextProps.tab === 'search',
      });
    } else if (this.props.tabFilters[this.props.tab] !== nextProps.tabFilters[nextProps.tab]) {
      this.setState({ searchText: nextProps.tabFilters[nextProps.tab] });
    }
  }

  /**
   * Delays the current search by a constant each time the search terms update, to allow the user
   * to stop typing before searching.
   *
   * @param {string} text the updated search text
   */
  _delaySearch(text: string): void {
    // Update the search text
    this.setState({ searchText: text });

    // Clear any waiting searches
    if (this._delayTimer !== 0) {
      clearTimeout(this._delayTimer);
    }

    this._delayTimer = setTimeout(() => {
      this._delayTimer = 0;
      this._onSearch(text);
    }, SEARCH_DELAY_TIME);
  }

  /**
   * Request focus in the SearchInput.
   */
  _focusSearchInput(): void {
    (this.refs.SearchInput as any).focus();
  }

  /**
   * Calculate the search input width based on current screen size.
   *
   * @returns {number} size for input width
   */
  _getSearchInputWidth(): number {
    return this.state.screenWidth - ICON_SIZE * 2 - Constants.Sizes.Margins.Regular * 2;
  }

  /**
   * Shows/hides the search input.
   */
  _toggleSearch(): void {
    if (this.state.shouldShowSearchBar) {
      (this.refs.SearchInput as any).blur();
      this.props.onSearch(this.props.tab, '');
    } else {
      (this.refs.SearchInput as any).focus();
    }

    LayoutAnimation.easeInEaseOut();
    this.setState({
      shouldShowSearchBar: !this.state.shouldShowSearchBar,
    });
  }

  /**
   * Navigates back in the application.
   */
  _onBack(): boolean {
    if (!this.props.tabShowBack[this.props.tab]) {
      return false;
    }

    (this.refs.SearchInput as any).clear();
    (this.refs.SearchInput as any).blur();
    this.props.onBack(this.props.tab);

    return true;
  }

  /**
   * Prompts the app to search.
   *
   * @param {string} text params to search for
   */
  _onSearch(text: string): void {
    if (text === this.props.tabFilters[this.props.tab]) {
      return;
    }
    this.props.onSearch(this.props.tab, text);
  }

  /**
   * Renders a title, back button for navigation, and search button.
   *
   * @returns {JSX.Element} the hierarchy of views to render
   */
  render(): JSX.Element {
    const platformModifier = Platform.OS === 'android' ? 'md' : 'ios';
    const backArrowIcon = `${platformModifier}-arrow-back`;
    const searchIcon = `${platformModifier}-search`;
    const closeIcon = `${platformModifier}-close`;

    // If title is string, use it as key for translations
    const appTitle = (typeof (this.props.appTitle) === 'string')
        ? Translations.get(this.props.appTitle)
        : Translations.getName(this.props.appTitle) || '';

    // Hide/show back button
    let backIconStyle = { left: -ICON_SIZE };
    if (this.props.shouldShowBack) {
      backIconStyle = { left: 0 };
    }

    // Hide/show search button, title
    let searchIconStyle = { right: -ICON_SIZE };
    if (this.props.shouldShowSearch) {
      searchIconStyle = { right: 0 };
    }

    // Hide/show title and search input
    let titleStyle = {};
    let searchInputStyle = { right: -(this._getSearchInputWidth() + Constants.Sizes.Margins.Regular * 2) };
    if (this.state.shouldShowSearchBar) {
      titleStyle = { opacity: 0 };
      searchInputStyle = { right: ICON_SIZE };
    }

    return (
      <View style={_styles.container}>
        <View style={_styles.header}>
          <View style={_styles.titleContainer}>
            <Text
                ellipsizeMode={'tail'}
                numberOfLines={1}
                style={[ _styles.title, titleStyle ]}>
              {appTitle}
            </Text>
          </View>
          <View style={[ _styles.searchContainer, searchInputStyle, { width: this._getSearchInputWidth() } ]}>
            <Ionicons
                color={Constants.Colors.primaryWhiteIcon}
                name={searchIcon}
                size={Constants.Sizes.Icons.Medium}
                style={_styles.searchIcon}
                onPress={this._focusSearchInput} />
            <TextInput
                autoCorrect={false}
                placeholder={Translations.get('search_placeholder')}
                placeholderTextColor={Constants.Colors.secondaryWhiteText}
                ref='SearchInput'
                returnKeyType={'done'}
                selectionColor={Constants.Colors.secondaryWhiteText}
                style={_styles.searchText}
                underlineColorAndroid={'transparent'}
                value={this.state.searchText}
                onChangeText={this._delaySearch} />
          </View>
          <TouchableOpacity
              style={[ _styles.icon, searchIconStyle ]}
              onPress={this._toggleSearch}>
            <Ionicons
                color={Constants.Colors.primaryWhiteIcon}
                name={(this.state.shouldShowSearchBar) ? closeIcon : searchIcon}
                size={Constants.Sizes.Icons.Medium}
                style={_styles.noBackground} />
          </TouchableOpacity>
          <TouchableOpacity
              style={[ _styles.icon, backIconStyle ]}
              onPress={this._onBack}>
            <Ionicons
                color={Constants.Colors.primaryWhiteIcon}
                name={backArrowIcon}
                size={Constants.Sizes.Icons.Medium}
                style={_styles.noBackground} />
          </TouchableOpacity>
          <View style={[ _styles.separator, { width: this.state.screenWidth }]} />
        </View>
        <View style={[ _styles.statusBar, { width: this.state.screenWidth }]} />
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    backgroundColor: Constants.Colors.primaryBackground,
    elevation: Constants.Sizes.Margins.Regular,
    zIndex: HEADER_Z_INDEX,
  },
  header: {
    alignItems: 'center',
    backgroundColor: Constants.Colors.primaryBackground,
    flexDirection: 'row',
    height: NavbarHeight,
    zIndex: HEADER_Z_INDEX,
  },
  icon: {
    alignItems: 'center',
    height: ICON_SIZE,
    justifyContent: 'center',
    position: 'absolute',
    width: ICON_SIZE,
  },
  noBackground: {
    backgroundColor: 'rgba(0,0,0,0)',
  },
  searchContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: Constants.Sizes.Margins.Regular,
    flex: 1,
    flexDirection: 'row',
    margin: Constants.Sizes.Margins.Regular,
    position: 'absolute',
  },
  searchIcon: {
    marginLeft: Constants.Sizes.Margins.Regular,
    marginRight: Constants.Sizes.Margins.Regular,
  },
  searchText: {
    color: Constants.Colors.primaryWhiteText,
    flex: 1,
    height: 40,
  },
  separator: {
    backgroundColor: Constants.Colors.tertiaryBackground,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    position: 'absolute',
  },
  statusBar: {
    backgroundColor: Constants.Colors.primaryBackground,
    position: 'absolute',
    top: 0,
    zIndex: HEADER_Z_INDEX + 1,
  },
  title: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Title,
    left: ICON_SIZE,
    position: 'absolute',
    right: ICON_SIZE,
    textAlign: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    bottom: 0,
    flex: 1,
    justifyContent: 'center',
    left: 0,
    right: 0,
    top: 0,
  },
});

const mapStateToProps = (store: Store): any => {
  return {
    appTitle: store.navigation.title,
    language: store.config.options.language,
    shouldShowBack: store.navigation.showBack,
    shouldShowSearch: store.navigation.showSearch,
    showBackDisableCount: store.navigation.showBackDisableCount,
    showSearchDisableCount: store.navigation.showSearchDisableCount,
    tab: store.navigation.tab,
    tabFilters: store.search.tabTerms,
    tabShowBack: store.navigation.tabShowBack,
  };
};

const mapDispatchToProps = (dispatch: any): any => {
  return {
    onBack: (tab: Tab): void => {
      dispatch(actions.navigateBack());
      dispatch(actions.search(tab, ''));
    },
    onSearch: (tab: Tab, text: string): void => dispatch(actions.search(tab, text)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AppHeader) as any;
