/**
 *
 * @license
 * Copyright (C) 2017 Joseph Roque
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
 * @created 2017-08-26
 * @file EmptyMain.tsx
 * @description Displays a false version of the Main view while the app loads in the background
 */
'use strict';

// React imports
import React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

// Imports
import * as Constants from '../../constants';

export function renderEmptyMain(): JSX.Element {
  return (
    <View style={_styles.container}>
      <View style={_styles.header} />
      <View style={_styles.separator} />
      <View style={_styles.innerContainer} />
      <View style={_styles.tabBar} />
    </View>
  );
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    backgroundColor: Constants.Colors.primaryBackground,
    flex: 1,
  },
  header: {
    backgroundColor: Constants.Colors.primaryBackground,
    height: 45,
  },
  innerContainer: {
    backgroundColor: Constants.Colors.darkTransparentBackground,
    flex: 1,
  },
  separator: {
    backgroundColor: Constants.Colors.tertiaryBackground,
    height: StyleSheet.hairlineWidth,
  },
  tabBar: {
    backgroundColor: Constants.Colors.tertiaryBackground,
    borderTopColor: 'rgba(0, 0, 0, 0.25)',
    borderTopWidth: 1,
    height: 55,
  },
});
