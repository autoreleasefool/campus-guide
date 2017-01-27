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
 * @created 2017-01-27
 * @file Schedule.js
 * @description Navigator for managing views for defining a weekly schedule.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

// Redux imports
import {connect} from 'react-redux';

// Types
import type {
  Language,
} from 'types';

// Imports
import ScrollableTabView from 'react-native-scrollable-tab-view';
import * as Constants from 'Constants';
import * as TranslationUtils from 'TranslationUtils';

// Tabs
import Weekly from './WeeklyView';
import ByCourse from './ByCourseView';

class Schedule extends React.Component {

  /**
   * Properties this component expects to be provided by its parent.
   */
  props: {
    language: Language, // The user's currently selected language
  };

  /**
   * Renders the app tabs and icons, an indicator to show the current tab, and a navigator with the tab contents.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement < any > {
    // Get current language for translations
    const Translations: Object = TranslationUtils.getTranslations(this.props.language);

    return (
      <View style={_styles.container}>
        <ScrollableTabView
            style={{borderBottomWidth: 0}}
            tabBarActiveTextColor={Constants.Colors.primaryWhiteText}
            tabBarBackgroundColor={Constants.Colors.darkTransparentBackground}
            tabBarInactiveTextColor={Constants.Colors.secondaryWhiteText}
            tabBarPosition='top'
            tabBarUnderlineStyle={{backgroundColor: Constants.Colors.primaryWhiteText}}>
          <Weekly tabLabel={Translations.weekly} />
          <ByCourse tabLabel={Translations.by_course} />
        </ScrollableTabView>
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

// Map state to props
const select = (store) => {
  return {
    language: store.config.language,
  };
};

export default connect(select)(Schedule);
