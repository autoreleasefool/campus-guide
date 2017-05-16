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
 * @created 2016-10-18
 * @file header.js
 * @description Provides header actions.
 *
 * @flow
 */
'use strict';

// Types
import type { Name, Tab } from 'types';
import { SET_HEADER_TITLE, SHOW_BACK, SHOW_SEARCH } from 'actionTypes';

module.exports = {

  setHeaderTitle: (title: ?(Name | string), tab?: Tab) => ({
    type: SET_HEADER_TITLE,
    title,
    tab,
  }),

  showBack: (show: boolean, tab?: Tab) => ({
    type: SHOW_BACK,
    show,
    tab,
  }),

  showSearch: (show: boolean, tab?: Tab) => ({
    type: SHOW_SEARCH,
    show,
    tab,
  }),

};
