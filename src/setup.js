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
 * @created 2016-10-03.
 * @file setup.js
 * @description Setup environment for the application.
 *
 * @flow
 */
'use strict';

// React
import React from 'react';

// React Native
import {
  Platform,
  UIManager,
} from 'react-native';

// Redux
const {Provider} = require('react-redux');
const configureStore = require('./store/configureStore');

// Components
const CampusGuideApp = require('CampusGuideApp');

/**
 * Applies global settings to the app and returns the root view.
 *
 * @returns {ReactClass<any>} Returns the root component for the app
 */
function setup(): ReactClass < any > {

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

  class Root extends React.Component {

    state: {
      isLoading: boolean;
      store: any;
    };

    constructor() {
      super();
      this.state = {
        isLoading: true,
        store: configureStore(() => this.setState({isLoading: false})),
      };
    }

    render() {
      if (this.state.isLoading) {
        return null;
      }

      return (
        <Provider store={this.state.store}>
          <CampusGuideApp />
        </Provider>
      );
    }
  }

  return Root;
}

module.exports = setup;
