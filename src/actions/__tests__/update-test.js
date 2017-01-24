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
 * @created 2016-10-17
 * @file update-test.js
 * @description Tests update actions
 *
 */
'use strict';

// Types
import type {
  Update,
} from 'types';

// Imports
import * as actions from '../update';

describe('navigation actions', () => {
  it('should create an action to update the download progress', () => {
    const update: Update = {
      currentDownload: 'download.jpg',
      filesDownloaded: [
        'download1.jpg',
        'download2.jpg',
      ],
      totalFiles: 1,
    };

    const expectedAction = {
      type: 'UPDATE_PROGRESS',
      update,
    };

    expect(actions.updateProgress(update)).toEqual(expectedAction);
  });
});
