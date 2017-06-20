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
 * @created 2016-11-12
 * @file search.ts
 * @description Provides search actions.
 */
'use strict';

// Types
import * as Actions from '../../typings/actions';

export function activateStudyFilter(filter: string): any {
  return {
    filter,
    type: Actions.Search.ActivateStudyFilter,
  };
}

export function deactivateStudyFilter(filter: string): any {
  return {
    filter,
    type: Actions.Search.DeactivateStudyFilter,
  };
}

export function search(terms?: string | undefined): any {
  return {
    terms,
    type: Actions.Search.Search,
  };
}

export function setStudyFilters(filters: string[]): any {
  return {
    filters,
    type: Actions.Search.SetStudyFilters,
  };
}
