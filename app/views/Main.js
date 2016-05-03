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
 * @file Main.js
 * @module MainScreen
 * @description Main navigational point of the application.
 * @flow
 *
 */
'use strict';

// React Native imports
const React = require('react-native');
const {
  Alert,
  Component,
  StyleSheet,
  View,
} = React;

// Imports
const Constants = require('../Constants');
const NavBar = require('../components/NavBar');
const Preferences = require('../util/Preferences');
const TabsView = require('../components/Tabs');

class MainScreen extends Component {

  /**
   * Pass props to parent and declare initial state.
   *
   * @param {{}} props properties passed from container to this component.
   */
  constructor(props: {}) {
    super(props);

    // Explicitly binding 'this' to all methods that need it
    (this:any)._navigateBack = this._navigateBack.bind(this);
    (this:any)._onSearch = this._onSearch.bind(this);
    (this:any)._refreshNavbar = this._refreshNavbar.bind(this);
  };

  /**
   * Returns to the previous page.
   */
  _navigateBack(): void {
    this.refs.Tabs.navigateBack();
  };

  /**
   * Displays the results of the user's search parameters.
   *
   * @param {string} searchTerms string of terms to search for.
   */
  _onSearch(searchTerms: string): void {
    // TODO: search...
    console.log('TODO: search...');
    this.refs.Tabs.navigateForward(Constants.Views.Find.Search, searchTerms);
  };

  /**
   * Forces the navbar to be re-rendered.
   */
  _refreshNavbar(): void {
    this.refs.NavBar.setState({refresh: !this.refs.NavBar.getRefresh()})
  }

  /**
   * Shows or hides the back button in the navbar.
   *
   * @param {boolean} show true to show back button, false to hide
   */
  _showBackButton(show: boolean): void {
    this.refs.NavBar.setState({
      showBackButton: show,
    });
  }

  /**
   * Displays a pop up when the application opens for the first time after the
   * user selects their preferred language.
   */
  componentDidMount(): void {
    // Get current language for translations
    let Translations: Object;
    if (Preferences.getSelectedLanguage() === 'fr') {
      Translations = require('../../assets/static/js/Translations.fr.js');
    } else {
      Translations = require('../../assets/static/js/Translations.en.js');
    }

    if (Preferences.isFirstTimeOpened()) {
      Alert.alert(
        Translations['only_once_title'],
        Translations['only_once_message'],
      );
    }
  };

  /**
   * Renders a tab bar to switch between the app's tabs, and a search bar.
   *
   * @return {ReactElement} the hierarchy of views to render.
   */
  render(): ReactElement {
    return (
      <View style={_styles.container}>
        <NavBar ref='NavBar' onSearch={this._onSearch} onBack={this._navigateBack} />
        <TabsView
            ref='Tabs'
            refreshParent={this._refreshNavbar}
            showBackButton={(show: boolean) => this._showBackButton(show)} />
      </View>
    );
  };
};

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.Colors.garnet,
  },
});

// Expose component to app
module.exports = MainScreen;
