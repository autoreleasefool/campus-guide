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
 * NavBar.js
 *
 * @description
 * Navigation and search bar for the top of the app, to allow the user to
 * search from anywhere.
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
  LayoutAnimation,
  Platform,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  View,
} = React;

// Imports
import TimerMixin from 'react-timer-mixin';
const Constants = require('../Constants');
const Ionicons = require('react-native-vector-icons/Ionicons');
const MaterialIcons = require('react-native-vector-icons/MaterialIcons');
const Preferences = require('../util/Preferences');
const StatusBarUtils = require('../util/StatusBarUtils');

// Get dimensions of the screen
const {height, width} = Dimensions.get('window');

// Declaring icons depending on the platform
var Icon;
var backIcon;
if (Platform.OS === 'ios') {
  Icon = Ionicons;
  backIcon = 'ios-arrow-back';
} else {
  Icon = require('react-native-vector-icons/MaterialIcons');
  backIcon = 'arrow-back';
}

class SearchBar extends Component {

  /**
   * Properties which the parent component should make available to this
   * component.
   */
  static propTypes = {
    onSearch: React.PropTypes.func.isRequired,
    onBack: React.PropTypes.func.isRequired,
  };

  /**
   * Pass props and declares initial state.
   *
   * @param props properties passed from container to this component.
   */
  constructor(props) {
    super(props);
    this.state = {
      showBackButton: false,
      refresh: false,
    };

    // Explicitly binding 'this' to certain methods
    this.getRefresh = this.getRefresh.bind(this);
  };

  /**
   * Configures the app to animate the next layout change, then updates the
   * state.
   *
   * @param state the new state for the component.
   */
  setState(state) {
    setTimeout(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      super.setState(state);
    }, 50);
  };

  /**
   * Returns the current state of the refresh variable, to allow it to be
   * flipped to re-render the view.
   *
   * @return {refresh}, from the state of the component.
   */
  getRefresh() {
    return this.state.refresh;
  };

  /**
   * Clears the search field and requests a back navigation.
   */
  _onBack() {
    this.refs.SearchInput.setNativeProps({text: ''});
    this.props.onBack();
  };

  /**
   * Prompts the app to search, so long as there is any text to search with.
   *
   * @param text params to search for.
   */
  _onSearch(text) {
    if (text && text.length > 0) {
      this.props.onSearch(text);
    }
  };

  /**
   * Renders a text input field for searching.
   *
   * @return the hierarchy of views to render.
   */
  render() {
    // Get current language for translations
    let Translations = null;
    if (Preferences.getSelectedLanguage() === 'fr') {
      Translations = require('../../assets/static/js/Translations.fr.js');
    } else {
      Translations = require('../../assets/static/js/Translations.en.js');
    }

    // Setting position of search bar and back button dependent on if back button is showing.
    let searchBarLeft = (this.state.showBackButton)
        ? 50
        : 10;
    let searchBarWidth = (this.state.showBackButton)
        ? width - 60
        : width - 20;
    let backButtonLeft = (this.state.showBackButton)
        ? 0
        : -60;

    return (
      <View style={_styles.container}>
        <TouchableOpacity onPress={this._onBack.bind(this)} style={{height: 40, alignItems: 'center', left: backButtonLeft}}>
          <Icon name={backIcon} size={24} color={'white'} style={{marginLeft: 20, marginRight: 20, marginTop: 8}} />
        </TouchableOpacity>
        <View style={[_styles.innerContainer, {position: 'absolute', width: searchBarWidth, left: searchBarLeft, top: 0}]}>
          <Ionicons
              onPress={() => this.refs.SearchInput.focus()}
              name={'ios-search'}
              size={24}
              color={'white'}
              style={{marginLeft: 10, marginRight: 10}} />
          <TextInput
              ref='SearchInput'
              style={{flex: 1, height: 40, color: Constants.Colors.polarGrey}}
              onChangeText={this._onSearch.bind(this)}
              autoCorrect={false}
              placeholder={Translations['search_placeholder']}
              placeholderTextColor={Constants.Colors.lightGrey} />
        </View>
      </View>
    )
  };
};

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
  }
});

// Expose component to app
module.exports = SearchBar;
