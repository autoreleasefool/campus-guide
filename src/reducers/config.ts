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
 * @file config.ts
 * @description Reducers for config actions
 */
'use strict';

// Imports
import * as Actions from '../actionTypes';
import { Options, ProgressUpdate } from '../util/Configuration';
import { Semester } from '../../typings/university';

/** Config reducer state. */
export interface State {
  options: Options;
  update: ProgressUpdate;
  updateConfirmed: boolean;
}

/** Initial update state. */
const initialState: State = {
  options: {
    alwaysSearchAll: false,
    currentSemester: 0,
    language: undefined,
    preferredTimeFormat: '12h',
    prefersWheelchair: false,
    scheduleByCourse: false,
    semesters: ([] as Semester[]),
    transitInfo: undefined,
    universityLocation: undefined,
    universityName: undefined,
  },
  update: {
    currentDownload: undefined,
    filesDownloaded: [],
    intermediateProgress: 0,
    showRetry: false,
    showUpdateProgress: false,
    totalFiles: 0,
    totalProgress: 0,
    totalSize: 0,
  },
  updateConfirmed: false,
};

/**
 * When provided with a configuration action, parses the parameters and returns an updated state.
 *
 * @param {State} state  the current state
 * @param {any}   action the action being taken
 * @returns {State} an updated state based on the previous state and the action taken
 */
export default function config(state: State = initialState, action: any): State {
  switch (action.type) {
    case Actions.Configuration.ConfigUpdate:
      return {
        options: { ...state.options, ...action.options },
        update: { ...state.update },
        updateConfirmed: state.updateConfirmed,
      };
    case Actions.Configuration.ProgressUpdate:
      return {
        options: { ...state.options },
        update: { ...state.update, ...action.update },
        updateConfirmed: state.updateConfirmed,
      };
    case Actions.Configuration.ConfirmUpdate:
      return {
        options: { ...state.options },
        update: { ...state.update, ...action.update },
        updateConfirmed: true,
      };
    default:
      return state;
  }
}
