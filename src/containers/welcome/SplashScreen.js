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
 * @created 2016-10-08
 * @file SplashScreen.js
 * @description Initial entry view for the application. Allows the user to select their preferred language on first run.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

// Redux imports
import {connect} from 'react-redux';
import {changeLanguage} from 'actions';

// Types
import type {
  Language,
} from 'types';

// Imports
const Constants = require('Constants');
const CoreTranslations: Object = require('../../../assets/json/CoreTranslations.json');

class SplashScreen extends React.Component {

  /**
   * Properties this component expects to be provided by its parent.
   */
  props: {
    onLanguageSelect: (language: Language) => void,
    navigator: ReactClass < any >,  // Parent navigator
  };

  /**
   * Current state of the component.
   */
  state: {
    loading: boolean, // Indicates if the view is still loading
  };

  /**
   * Constructor.
   *
   * @param {props} props component props
   */
  constructor(props) {
    super(props);
    this.state = {
      loading: false, // TODO: switch to true once actually loading something
    };
  }

  /**
   * Checks if a language has been selected, and moves to the next screen if so.
   */
  componentDidMount(): void {
    if (this.props.language != null) {
      this.props.navigator.push({id: 'main'});
    }
  }

  /**
   * Handles the event when user selects a language.
   *
   * @param {Language} language the selected language
   */
  _onLanguageSelect(language: Language): void {
    this.props.onLanguageSelect(language);
    this.props.navigator.push({id: 'main'});
  }

  /**
   * Displays two buttons to allow the user to select French or English.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement < any > {
    if (this.state.loading) {
      return (
        <View style={_styles.container} />
      );
    }

    return (
      <View style={_styles.container}>
        <TouchableWithoutFeedback
            style={{flex: 1}}
            onPress={this._onLanguageSelect.bind(this, 'en')}>
          <View style={_styles.englishContainer}>
            <View style={_styles.languageContainer}>
              <Text style={_styles.languageSubtitle}>
                {CoreTranslations.en.continue_in}
              </Text>
              <View style={{padding: 5}}>
                <Text style={_styles.languageTitle}>
                  {CoreTranslations.en.language}
                </Text>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback
            style={{flex: 1}}
            onPress={this._onLanguageSelect.bind(this, 'fr')}>
          <View style={_styles.frenchContainer}>
            <View style={_styles.languageContainer}>
              <Text style={_styles.languageSubtitle}>
                {CoreTranslations.fr.continue_in}
              </Text>
              <View style={{padding: 5}}>
                <Text style={_styles.languageTitle}>
                  {CoreTranslations.fr.language}
                </Text>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: Constants.Colors.primaryBackground,
  },
  englishContainer: {
    flex: 1,
    backgroundColor: Constants.Colors.garnet,
  },
  frenchContainer: {
    flex: 1,
    backgroundColor: Constants.Colors.charcoalGrey,
  },
  languageContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageTitle: {
    color: 'white',
    fontSize: Constants.Sizes.Text.Title,
  },
  languageSubtitle: {
    color: 'white',
    fontSize: Constants.Sizes.Text.Subtitle,
  },
});

// Map state to props
const select = (store) => {
  return {
    language: store.config.language,
  };
};

// Map dispatch to props
const actions = (dispatch) => {
  return {
    onLanguageSelect: (language: Language) => dispatch(changeLanguage(language)),
  };
};

module.exports = connect(select, actions)(SplashScreen);
