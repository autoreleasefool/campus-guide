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
 * @file header.ts
 * @description Provides header actions.
 */
'use strict';

// Types
import * as Actions from '../../typings/actions';
import { Name, Tab } from '../../typings/global';

export function setHeaderTitle(title: Name | string | undefined, tab?: Tab): any {
  return {
    tab,
    title,
    type: Actions.Header.SetTitle,
  };
}

export function showBack(show: boolean, tab?: Tab): any {
  return {
    show,
    tab,
    type: Actions.Header.ShowBack,
  };
}

export function showSearch(show: boolean, tab?: Tab): any {
  return {
    show,
    tab,
    type: Actions.Header.ShowSearch,
  };
}
