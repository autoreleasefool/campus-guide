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
 * @file MainScreen.js
 * @description Container for the main application.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  View,
} from 'react-native';

// Imports
const Constants = require('Constants');

class MainScreen extends React.Component {

  /**
   * Renders the main view of the application.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement < any > {
    return (
      <View style={{flex: 1, backgroundColor: Constants.Colors.charcoalGrey}} />
    );
  }
}

module.exports = MainScreen;
