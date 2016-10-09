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
 * @file config.js
 * @description Reducers for config actions
 *
 * @flow
 */
'use strict';

// Types
import type {
  Action,
  ConfigurationOptions,
} from 'types';

// Initial navigation state.
const initialState: ConfigurationOptions = {
  alwaysSearchAll: false,
  currentSemester: 0,
  firstTime: false,
  language: null,
  preferredTimeFormat: '12h',
  prefersWheelchair: false,
  semesters: [],
  timesAppOpened: 0,
};

/**
 * When provided with a configuration action, parses the parameters and returns an updated state.
 *
 * @param {ConfigurationOptions} state   the current state
 * @param {Action}               action  the action being taken
 * @returns {ConfigurationOptions} an updated state based on the previous state and the action taken.
 */
function config(state: ConfigurationOptions = initialState, action: Action): ConfigurationOptions {
  switch (action.type) {
    case 'UPDATE_CONFIGURATION':
      return Object.assign({}, state, action.options);
    default:
      return state;
  }
}

module.exports = config;
