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
 * @file header.js
 * @description Provides header actions.
 *
 * @flow
 */
'use strict';

// Types
import type {
  Action,
  Name,
  Tab,
  TranslatedName,
} from 'types';

module.exports = {
  setHeaderTitle: (title: ?(Name | TranslatedName | string), tab?: Tab): Action => ({
    type: 'SET_HEADER_TITLE',
    title,
    tab,
  }),
  setShowBack: (showBack: boolean, tab?: Tab): Action => ({
    type: 'HEADER_SHOW_BACK',
    shouldShowBack: showBack,
    tab,
  }),
  setShowSearch: (showSearch: boolean, tab?: Tab): Action => ({
    type: 'HEADER_SHOW_SEARCH',
    shouldShowSearch: showSearch,
    tab,
  }),
};
