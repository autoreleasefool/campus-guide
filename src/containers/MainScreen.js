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
 * @created 2016-10-08
 * @file MainScreen.js
 * @description Container for the main application.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';

// Redux imports
import { connect } from 'react-redux';
import * as actions from 'actions';

// Types
import type { Language } from 'types';

// Imports
import AppHeader from 'AppHeader';
import TabView from './TabView';
import * as Configuration from 'Configuration';
import * as Constants from 'Constants';
import * as Translations from 'Translations';

class MainScreen extends React.Component {

  /**
   * Properties this component expects to be provided by its parent.
   */
  props: {
    language: Language,                 // The current language, selected by the user
    navigator: ReactClass < any >,      // Parent navigator
    shouldShowLanguageMessage: boolean, // True to show message reminding user they can switch languages
  };

  /**
   * Displays a pop up when the application opens for the first time.
   */
  componentDidMount(): void {
    if (this.props.shouldShowLanguageMessage) {
      const language = this.props.language;

      Alert.alert(
        Translations.get(language, 'only_once_title'),
        Translations.get(language, 'only_once_message'),
        [{ text: Translations.get(language, 'ok'), onPress: this._checkConfiguration.bind(this) }]
      );
    } else {
      this._checkConfiguration();
    }
  }

  /**
   * Checks if a configuration update is available and prompts the user to update.
   */
  _checkConfiguration(): void {
    if (Configuration.didCheckForUpdate()) {
      // Do not check for configuration updates more than once
      return;
    }

    Configuration.isConfigUpdateAvailable()
        .then((available: boolean) => {
          if (available) {
            const language = this.props.language;

            Alert.alert(
              Translations.get(language, 'update_available_title'),
              Translations.get(language, 'update_available_msg'),
              [
                { text: Translations.get(language, 'cancel'), style: 'cancel' },
                { text: Translations.get(language, 'update'), onPress: this._updateConfiguration.bind(this) },
              ]
            );
          }
        })
        .catch((err: any) => console.error('Error checking for configuration.', err));
  }

  /**
   * Opens the update screen to update the configuration.
   */
  _updateConfiguration(): void {
    this.props.navigator.push({ id: 'update' });
  }

  /**
   * Renders the main view of the application.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement < any > {
    return (
      <View style={_styles.container}>
        <AppHeader />
        <TabView />
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.Colors.primaryBackground,
  },
});

const mapStateToProps = (store) => {
  return {
    language: store.config.options.language,
    shouldShowLanguageMessage: store.config.options.firstTime,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    acknowledgedLanguageMessage: () => dispatch(actions.updateConfiguration({ firstTime: false })),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MainScreen);
