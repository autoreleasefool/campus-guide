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
 * @created 2016-10-10
 * @file update.js
 * @description Reducers for update actions
 *
 * @flow
 */
'use strict';

// Types
import type {
  Action,
  Update,
} from 'types';

// Initial update state.
const initialState: Update = {
  currentDownload: null,
  filesDownloaded: [],
  intermediateProgress: 0,
  showUpdateProgress: false,
  showRetry: false,
  totalFiles: 0,
  totalProgress: 0,
  totalSize: 0,
};

/**
 * When provided with an update action, parses the parameters and returns an updated state.
 *
 * @param {Update} state  the current state
 * @param {Action} action the action being taken
 * @returns {Update} an updated state based on the previous state and the action taken.
 */
function update(state: Update = initialState, action: Action): Update {
  switch (action.type) {
    case 'UPDATE_PROGRESS':
      return Object.assign({}, state, action.update);
    default:
      return state;
  }
}

module.exports = update;
