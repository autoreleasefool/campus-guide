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
 * @created 2016-10-09
 * @file preferences.js
 * @description Redux middleware to save preferences when updated
 *
 * @flow
 */
'use strict';

// React imports
import {
  AsyncStorage,
} from 'react-native';

// Imports
const Preferences = require('Preferences');

export const preferenceCache = () => (next) => (action) => {
  // Cache configuration updates
  if (action.type === 'UPDATE_CONFIGURATION') {
    for (const option in action.options) {
      if (action.options.hasOwnProperty(option)) {
        switch (option) {
          case 'alwaysSearchAll':
            Preferences.setAlwaysSearchAll(AsyncStorage, action.options[option]);
            break;
          case 'currentSemester':
            Preferences.setCurrentSemester(AsyncStorage, action.options[option]);
            break;
          case 'language':
            Preferences.setSelectedLanguage(AsyncStorage, action.options[option]);
            break;
          case 'preferredTimeFormat':
            Preferences.setPreferredTimeFormat(AsyncStorage, action.options[option]);
            break;
          case 'prefersWheelchair':
            Preferences.setPrefersWheelchair(AsyncStorage, action.options[option]);
            break;
          default:
            console.log('Configuration update not saved: ' + option);
        }
      }
    }
  }

  // Pass to the next middleware
  next(action);
};
