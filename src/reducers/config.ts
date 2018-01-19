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
 * @file config.ts
 * @description Reducers for config actions
 */
'use strict';

// Imports
import * as Actions from '../actionTypes';
import { Options, ProgressUpdate } from '../util/Configuration';
import { setLanguage } from '../util/Translations';

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
    prefersShortestRoute: false,
    prefersWheelchair: false,
    scheduleByCourse: false,
    semesters: [],
    transitInfo: undefined,
    universityLocation: undefined,
    universityName: undefined,
  },
  update: {
    currentDownload: undefined,
    filesDownloaded: [],
    intermediateProgress: 0,
    totalFiles: 0,
    totalProgress: 0,
    totalSize: 0,
  },
  updateConfirmed: false,
};

/**
 * When provided with a configuration action, parses the parameters and returns an updated state.
 *
 * @param {State}              state  the current state
 * @param {Actions.ActionType} action the action being taken
 * @returns {State} an updated state based on the previous state and the action taken
 */
export default function config(state: State = initialState, action: Actions.ActionType): State {
  switch (action.type) {
    case Actions.Config.ConfigUpdate:
      if (action.options.language && state.options.language !== action.options.language) {
        setLanguage(action.options.language);
      }

      return {
        options: { ...state.options, ...action.options },
        update: { ...state.update },
        updateConfirmed: state.updateConfirmed,
      };
    case Actions.Config.ProgressUpdate:
      return {
        options: { ...state.options },
        update: { ...state.update, ...action.update },
        updateConfirmed: state.updateConfirmed,
      };
    case Actions.Config.ConfirmUpdate:
      return {
        options: { ...state.options },
        update: { ...state.update },
        updateConfirmed: true,
      };
    default:
      return state;
  }
}
