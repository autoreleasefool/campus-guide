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
 * @created 2016-10-18
 * @file update-test.js
 * @description Tests update reducers
 *
 */
'use strict';

// Imports
import reducer from '../update';

// Initial update state.
const initialState = {
  currentDownload: null,
  filesDownloaded: [],
  intermediateProgress: 0,
  showUpdateProgress: false,
  showRetry: false,
  totalFiles: 0,
  totalProgress: 0,
  totalSize: 0,
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

// Initial update state.
const updatedProgress = {
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
};

describe('update reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should update the progress', () => {
    expect(
      reducer(
        initialState,
        {
          type: 'UPDATE_PROGRESS',
          update: progressUpdate,
        }
      )
    ).toEqual(updatedProgress);
  });
});
