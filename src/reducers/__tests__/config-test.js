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
 * @file config-test.js
 * @description Tests config reducers
 *
 */
'use strict';

// Types
import { UPDATE_CONFIGURATION, UPDATE_PROGRESS } from 'actionTypes';

// Imports
import reducer from '../config';

// Expected initial state
const initialState = {
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

// Test configuration update
const configurationUpdate = {
  alwaysSearchAll: true,
  transitInfo: { name: 'Transit', link: 'http://example.com' },
  language: 'en',
  scheduleByCourse: true,
};

// Expected state when configuration updated
const updatedConfigOptions = {
  update: initialState.update,
  options: {
    alwaysSearchAll: true,
    transitInfo: { name: 'Transit', link: 'http://example.com' },
    currentSemester: 0,
    firstTime: false,
    language: 'en',
    preferredTimeFormat: '12h',
    prefersWheelchair: false,
    semesters: [],
    scheduleByCourse: true,
    universityLocation: null,
  },
};

// Test progress update
const progressUpdate = {
  currentDownload: 'download.jpg',
  filesDownloaded: [
    'download1.jpg',
    'download2.jpg',
  ],
  intermediateProgress: 1,
  showRetry: true,
  totalSize: 1,
};

// Expected state when progress updated
const updatedProgress = {
  options: initialState.options,
  update: {
    currentDownload: 'download.jpg',
    filesDownloaded: [
      'download1.jpg',
      'download2.jpg',
    ],
    intermediateProgress: 1,
    showUpdateProgress: false,
    showRetry: true,
    totalFiles: 0,
    totalProgress: 0,
    totalSize: 1,
  },
};

describe('config reducer', () => {

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should update the config options', () => {
    expect(reducer(initialState, { type: UPDATE_CONFIGURATION, options: configurationUpdate }))
        .toEqual(updatedConfigOptions);
  });

  it('should update the update options', () => {
    expect(reducer(initialState, { type: UPDATE_PROGRESS, update: progressUpdate }))
        .toEqual(updatedProgress);
  });

});
