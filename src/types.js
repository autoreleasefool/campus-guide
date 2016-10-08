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
 * @created 2016-10-05
 * @file types.js
 * @providesModule types
 * @description Type definitions for use throughout the application
 *
 * @flow
 */
'use strict';

/** A function with no parameters and no return type. */
export type VoidFunction = () => void;

//-----------------------------------------------------------------------------
//  Languages
//-----------------------------------------------------------------------------

/** Shorthand for languages available in the application. English or French. */
export type Language =
    'en'
  | 'fr'
  ;

//-----------------------------------------------------------------------------
//  Actions
//-----------------------------------------------------------------------------

/** Available actions for modifying the application state. */
export type Action =
    { type: 'SEARCH_ALL', searchTerms: ?string }
    { type: 'CLEAR_SEARCH' }
  | { type: 'SWITCH_TAB', tab: Tab; }
  | { type: 'CHANGE_LANGUAGE', language: Language }
  ;

//-----------------------------------------------------------------------------
//  Tabs
//-----------------------------------------------------------------------------

/** Describes the tabs available in the app's initial state. */
export type WelcomeTab =
    'splash'
  | 'update'
  | 'main'
  ;

/** Describes the tabs available in the app. */
export type Tab =
    'find'
  | 'schedule'
  | 'discover'
  | 'search'
  | 'settings'
  ;

/** Indicates how an object describing tabs must be defined. */
export type TabItems = {
  find: any,
  schedule: any,
  discover: any,
  search: any,
  settings: any,
};

/** A navigator route. */
export type Route = {
  id: number | string, // Unique ID for the route
  data: any,           // Any data to pass along to be used to render the view
};
