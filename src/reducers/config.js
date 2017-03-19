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
 * @file config.js
 * @description Reducers for config actions
 *
 * @flow
 */
'use strict';

// Types
import type { ConfigurationOptions, Update } from 'types';
import { UPDATE_CONFIGURATION, UPDATE_PROGRESS } from 'actionTypes';

type State = {
  options: ConfigurationOptions,
  update: Update,
}

// Initial update state.
const initialState: State = {
  options: {
    alwaysSearchAll: false,
    transitInfo: null,
    currentSemester: 0,
    firstTime: false,
    language: null,
    preferredTimeFormat: '12h',
    prefersWheelchair: false,
    semesters: [],
    scheduleByCourse: false,
    universityLocation: null,
    universityName: null,
  },
  update: {
    currentDownload: null,
    filesDownloaded: [],
    intermediateProgress: 0,
    showUpdateProgress: false,
    showRetry: false,
    totalFiles: 0,
    totalProgress: 0,
    totalSize: 0,
  },
};

/**
 * When provided with a configuration action, parses the parameters and returns an updated state.
 *
 * @param {State} state  the current state
 * @param {any}   action the action being taken
 * @returns {State} an updated state based on the previous state and the action taken.
 */
function config(state: State = initialState, action: any): State {
  switch (action.type) {
    case UPDATE_CONFIGURATION:
      return {
        options: Object.assign({}, state.options, action.options),
        update: Object.assign({}, state.update),
      };
    case UPDATE_PROGRESS:
      return {
        options: Object.assign({}, state.options),
        update: Object.assign({}, state.update, action.update),
      };
    default:
      return state;
  }
}

module.exports = config;
