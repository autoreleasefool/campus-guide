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
 * @file index.js
 * @providesModule actions
 * @description Combines all actions
 *
 * @flow
 */
'use strict';

// Imports
import * as configActions from './config';
import * as discoverActions from './discover';
import * as findActions from './find';
import * as headerActions from './header';
import * as navigationActions from './navigation';
import * as searchActions from './search';
import * as scheduleActions from './schedule';
import * as updateActions from './update';

// Combine and export actions
module.exports = {
  ...configActions,
  ...discoverActions,
  ...findActions,
  ...headerActions,
  ...navigationActions,
  ...searchActions,
  ...scheduleActions,
  ...updateActions,
};
