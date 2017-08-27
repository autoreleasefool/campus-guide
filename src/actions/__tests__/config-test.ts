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
 * @description Tests config actions
 *
 */
'use strict';

// Imports
import * as config from '../config';

// Types
import * as Actions from '../../actionTypes';

describe('configuration actions', () => {

  it('should create an action to update the configuration', () => {
    const language = 'en';
    const expectedAction = { type: Actions.Configuration.ConfigUpdate, options: { language } };
    expect(config.updateConfiguration({ language })).toEqual(expectedAction);
  });

  it('should create an action to update the download progress', () => {
    const update = {
      currentDownload: 'download.jpg',
      filesDownloaded: [ 'download1.jpg', 'download2.jpg' ],
      totalFiles: 1,
    };
    const expectedAction = { type: Actions.Configuration.ProgressUpdate, update };

    expect(config.updateProgress(update)).toEqual(expectedAction);
  });

  it('should create an action to confirm an update', () => {
    const expectedAction = { type: Actions.Configuration.ConfirmUpdate };
    expect(config.confirmUpdate()).toEqual(expectedAction);
  });

});
