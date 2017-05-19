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
 * @created 2017-02-10
 * @file actionTypes.js
 * @providesModule actionTypes
 * @description Type definitions for available actions in the application
 *
 * @flow
 */
'use strict';

//-----------------------------------------------------------------------------
//  App navigation
//-----------------------------------------------------------------------------

export const SWITCH_TAB = 'SWITCH_TAB';
export const SWITCH_FIND_VIEW = 'SWITCH_FIND_VIEW';
export const SWITCH_DISCOVER_VIEW = 'SWITCH_DISCOVER_VIEW';
export const SWITCH_HOUSING_VIEW = 'SWITCH_HOUSING_VIEW';
export const SWITCH_DISCOVER_LINK = 'SWITCH_DISCOVER_LINK';
export const SWITCH_DISCOVER_TRANSIT_CAMPUS = 'SWITCH_DISCOVER_TRANSIT_CAMPUS';

//-----------------------------------------------------------------------------
//  Back navigation
//-----------------------------------------------------------------------------

export const NAVIGATE_BACK = 'NAVIGATE_BACK';
export const SET_CAN_BACK = 'SET_CAN_BACK';

//-----------------------------------------------------------------------------
//  Configuration
//-----------------------------------------------------------------------------

export const UPDATE_CONFIGURATION = 'UPDATE_CONFUGRATION';
export const UPDATE_PROGRESS = 'UPDATE_PROGRESS';

//-----------------------------------------------------------------------------
//  Directions
//-----------------------------------------------------------------------------

export const SET_DESTINATION = 'SET_DESTINATION';
export const SET_STARTING_POINT = 'SET_STARTING_POINT';
export const VIEW_BUILDING = 'VIEW_BUILDING';

//-----------------------------------------------------------------------------
//  Header
//-----------------------------------------------------------------------------

export const SET_HEADER_TITLE = 'SET_HEADER_TITLE';
export const SHOW_BACK = 'SHOW_BACK';
export const SHOW_SEARCH = 'SHOW_SEARCH';

//-----------------------------------------------------------------------------
//  Schedule
//-----------------------------------------------------------------------------

export const LOAD_SCHEDULE = 'LOAD_SCHEDULE';
export const ADD_SEMESTER = 'ADD_SEMESTER';
export const ADD_COURSE = 'ADD_COURSE';
export const REMOVE_COURSE = 'REMOVE_COURSE';

//-----------------------------------------------------------------------------
//  Search
//-----------------------------------------------------------------------------

export const SEARCH = 'SEARCH';
export const ACTIVATE_STUDY_FILTER = 'ACTIVATE_STUDY_FILTER';
export const DEACTIVATE_STUDY_FILTER = 'DEACTIVATE_STUDY_FILTER';
export const SET_STUDY_FILTERS = 'SET_STUDY_FILTERS';
