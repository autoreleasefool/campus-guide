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
 * @file config-test.ts
 * @description Tests config reducers
 *
 */
'use strict';

// Imports
import { default as reducer, State } from '../config';

// Types
import * as Actions from '../../actionTypes';

// Expected initial state
const initialState: State = {
  options: {
    alwaysSearchAll: false,
    currentSemester: 0,
    language: undefined,
    preferredTimeFormat: '12h',
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

// Test configuration update
const configurationUpdate = {
  alwaysSearchAll: true,
  language: 'en',
  scheduleByCourse: true,
  transitInfo: { name: 'Transit', link: 'http://example.com' },
};

// Expected state when configuration updated
const updatedConfigOptions: State = {
  options: {
    alwaysSearchAll: true,
    currentSemester: 0,
    language: 'en',
    preferredTimeFormat: '12h',
    prefersWheelchair: false,
    scheduleByCourse: true,
    semesters: [],
    transitInfo: { name: 'Transit', link: 'http://example.com' },
    universityLocation: undefined,
    universityName: undefined,
  },
  update: initialState.update,
  updateConfirmed: initialState.updateConfirmed,
};

// Test progress update
const progressUpdate = {
  currentDownload: 'download.jpg',
  filesDownloaded: [
    'download1.jpg',
    'download2.jpg',
  ],
  intermediateProgress: 1,
  totalSize: 1,
};

// Expected state when progress updated
const updatedProgress: State = {
  options: initialState.options,
  update: {
    currentDownload: 'download.jpg',
    filesDownloaded: [
      'download1.jpg',
      'download2.jpg',
    ],
    intermediateProgress: 1,
    totalFiles: 0,
    totalProgress: 0,
    totalSize: 1,
  },
  updateConfirmed: initialState.updateConfirmed,
};

// Expected state when update confirmed
const confirmUpdate = {
  options: initialState.options,
  update: initialState.update,
  updateConfirmed: true,
};

describe('config reducer', () => {

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should update the config options', () => {
    expect(reducer(initialState, { type: Actions.Configuration.ConfigUpdate, options: configurationUpdate }))
        .toEqual(updatedConfigOptions);
  });

  it('should update the update options', () => {
    expect(reducer(initialState, { type: Actions.Configuration.ProgressUpdate, update: progressUpdate }))
        .toEqual(updatedProgress);
  });

  it('should confirm the update', () => {
    expect(reducer(initialState, { type: Actions.Configuration.ConfirmUpdate })).toEqual(confirmUpdate);
  });

});
