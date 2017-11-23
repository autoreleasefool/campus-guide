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
 * @file Splash.tsx
 * @description Initial entry view for the application. Allows the user to select their
 *              preferred language on first run.
 */
'use strict';

// React imports
import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

// Redux imports
import { connect } from 'react-redux';
import * as actions from '../../actions';

// Imports
import * as Constants from '../../constants';
import * as Translations from '../../util/Translations';

// Types
import { Store } from '../../store/configureStore';
import { Language } from '../../util/Translations';

interface Props {
  language: Language;                         // Language currently selected by user
  navigator: any;                             // Parent navigator
  onLanguageSelect(language: Language): void; // Changes the user's selected language
}

interface State {}

class Splash extends React.PureComponent<Props, State> {

  /**
   * Handles the event when user selects a language.
   *
   * @param {Language} language the selected language
   */
  _onLanguageSelect(language: Language): void {
    this.props.onLanguageSelect(language);

    const onAction = (): void => {
      this._popOrPushToMain();
    };

    Alert.alert(
      Translations.get('only_once_title'),
      Translations.get('only_once_message'),
      [{
        onPress: onAction,
        text: Translations.get('ok'),
      }],
      { onDismiss: onAction }
    );
  }

  /**
   * Check if a 'main' route already exists on the navigator and pop to it if so.
   * Otherwise, push a new one.
   */
  _popOrPushToMain(): void {
    const routes = this.props.navigator.getCurrentRoutes();
    for (const route of routes) {
      if (route.id === 'main') {
        this.props.navigator.popToRoute(route);

        return;
      }
    }
    this.props.navigator.push({ id: 'main' });
  }

  /**
   * Displays two buttons to allow the user to select French or English.
   *
   * @returns {JSX.Element} the hierarchy of views to render
   */
  render(): JSX.Element {
    return (
      <View style={_styles.container}>
        <TouchableWithoutFeedback
            style={{ flex: 1 }}
            onPress={(): void => this._onLanguageSelect('en')}>
          <View style={_styles.englishContainer}>
            <View style={_styles.languageContainer}>
              <Text style={_styles.languageSubtitle}>
                {Translations.get('continue_in', 'en')}
              </Text>
              <View style={_styles.languageTextContainer}>
                <Text style={_styles.languageTitle}>
                  {Translations.get('language', 'en')}
                </Text>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback
            style={{ flex: 1 }}
            onPress={(): void => this._onLanguageSelect('fr')}>
          <View style={_styles.frenchContainer}>
            <View style={_styles.languageContainer}>
              <Text style={_styles.languageSubtitle}>
                {Translations.get('continue_in', 'fr')}
              </Text>
              <View style={_styles.languageTextContainer}>
                <Text style={_styles.languageTitle}>
                  {Translations.get('language', 'fr')}
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
    backgroundColor: Constants.Colors.primaryBackground,
    flex: 1,
    flexDirection: 'column',
  },
  englishContainer: {
    backgroundColor: Constants.Colors.primaryBackground,
    flex: 1,
  },
  frenchContainer: {
    backgroundColor: Constants.Colors.secondaryBackground,
    flex: 1,
  },
  languageContainer: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  languageSubtitle: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Subtitle,
  },
  languageTextContainer: {
    padding: 5,
  },
  languageTitle: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Title,
  },
});

const mapStateToProps = (store: Store): any => {
  return {
    language: store.config.options.language,
  };
};

const mapDispatchToProps = (dispatch: any): any => {
  return {
    onLanguageSelect:
        (language: Language): void => dispatch(actions.updateConfiguration({ language })),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Splash) as any;
