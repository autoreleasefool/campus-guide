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
 * @created 2016-10-09
 * @file persistence.js
 * @description Redux middleware to persist data when updated
 *
 * @flow
 */
'use strict';

/* eslint-disable callback-return */
// Call the next() middleware then perform persistance based on new state

// React imports
import { AsyncStorage } from 'react-native';

// Types
import { UPDATE_CONFIGURATION, ADD_SEMESTER, ADD_COURSE, REMOVE_COURSE } from 'actionTypes';

// Imports
import { saveSchedule } from 'Database';
import * as Preferences from 'Preferences';

export const persist = ({ getState }: any) => (next: any) => (action: any) => {
  next(action);
  const store = getState();

  switch (action.type) {
    case UPDATE_CONFIGURATION:
      for (const option in action.options) {
        if (action.options.hasOwnProperty(option)) {
          switch (option) {
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
            case 'scheduleByCourse':
              Preferences.setPreferScheduleByCourse(AsyncStorage, action.options[option]);
              break;
            default:
              console.log('Configuration update not saved: ' + option);
          }
        }
      }
      break;
    case ADD_SEMESTER:
    case ADD_COURSE:
    case REMOVE_COURSE:
      saveSchedule(store.schedule.semesters);
      break;
    default:
      // does nothing
  }
};
