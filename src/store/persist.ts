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
 * @file persist.ts
 * @description Redux middleware to persist data when updated
 */
'use strict';

// React imports
import { AsyncStorage } from 'react-native';

// Imports
import { saveSchedule } from '../util/Database';
import * as Preferences from '../util/Preferences';

import * as Actions from '../actionTypes';

// Types
import { Middleware } from 'redux';
import { Store } from './configureStore';

export const persist: Middleware = ({ getState }: any): any => (next: any): any => (action: any): any => {
  const result = next(action);
  const store: Store = getState();

  switch (action.type) {
    case Actions.Config.ConfigUpdate:
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
            case 'prefersShortestRoute':
              Preferences.setPrefersShortestRoute(AsyncStorage, action.options[option]);
              break;
            case 'scheduleByCourse':
              Preferences.setPreferScheduleByCourse(AsyncStorage, action.options[option]);
              break;
            default:
              if (__DEV__) {
                console.log(`Configuration update not saved: ${option}`);
              }
          }
        }
      }
      break;
    case Actions.Schedule.AddCourse:
    case Actions.Schedule.AddSemester:
    case Actions.Schedule.RemoveCourse:
      saveSchedule(store.schedule.semesters);
      break;
    default:
      // does nothing
  }

  return result;
};
