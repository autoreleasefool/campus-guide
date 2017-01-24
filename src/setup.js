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
 * @created 2016-10-03
 * @file setup.js
 * @description Setup environment for the application.
 *
 * @flow
 */
'use strict';

/* eslint-disable react/prefer-stateless-function */
/* Future-proofing the root setup component. */

// React imports
import React from 'react';
import {
  Platform,
  UIManager,
} from 'react-native';

// Redux imports
import {Provider} from 'react-redux';
import configureStore from './store/configureStore';

// Imports
import CampusGuideApp from 'CampusGuideApp';

/**
 * Applies global settings to the app and returns the root view.
 *
 * @returns {ReactClass<any>} Returns the root component for the app
 */
export default function setup(): ReactClass < any > {

  // Fix function not found error
  // http://stackoverflow.com/a/35305611/4896787
  (process:any).nextTick = setImmediate;

  // Enable animations on Android
  if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  // Add the format function to string
  if (!(String:any).format) {
    (String:any).format = function format(str: string) {
      const args = Array.prototype.slice.call(arguments, 1);
      return str.replace(/{(\d+)}/g, (match, number) => {
        return typeof args[number] == 'undefined'
          ? match
          : args[number];
      });
    };
  }

  // Create the redux store
  const store = configureStore();

  class Root extends React.Component {
    render() {
      return (
        <Provider store={store}>
          <CampusGuideApp />
        </Provider>
      );
    }
  }

  return Root;
}
