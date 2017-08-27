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
 * @created 2017-06-13
 * @file actions.ts
 * @description Type definitions for available actions in the application
 */

/* Actions with a global scope. */
export enum App {
  SwitchTab = 'APP_SWITCH_TAB',
  SwitchFindView = 'APP_SWITCH_FIND_VIEW',
  SwitchDiscoverView = 'APP_SWITCH_DISCOVER_VIEW',
  SwitchHousingView = 'APP_SWITCH_HOUSING_VIEW',
  SwitchHousingResidence = 'APP_SWITCH_HOUSING_RESIDENCE',
  SwitchDiscoverLink = 'APP_SWITCH_DISCOVER_LINK',
  SwitchDiscoverTransitCampus = 'APP_SWITCH_DISCOVER_TRANSIT_CAMPUS',
}

/* Actions for app navigation. */
export enum Navigation {
  NavigateBack = 'NAV_NAVIGATE_BACK',
  CanBack = 'NAV_CAN_BACK',
}

/* Actions to specify the app configuration. */
export enum Configuration {
  ConfigUpdate = 'CONF_UPDATE_CONFIGURATION',
  ProgressUpdate = 'CONF_UPDATE_PROGRESS',
  ConfirmUpdate = 'CONF_CONFIRM_UPDATE',
}

/* Actions for directing the user. */
export enum Directions {
  SetDestination = 'DIR_SET_DESTINATION',
  SetStartingPoint = 'DIR_SET_STARTING_POINT',
  ViewBuilding = 'DIR_VIEW_BUILDING',
}

/* Actions which affect the app header. */
export enum Header {
  SetTitle = 'HEADER_SET_TITLE',
  ShowBack = 'HEADER_SHOW_BACK',
  ShowSearch = 'HEADER_SHOW_SEARCH',
}

/* Actions to adjust the user's schedule. */
export enum Schedule {
  Load = 'SCHED_LOAD',
  AddSemester = 'SCHED_ADD_SEMESTER',
  AddCourse = 'SCHED_ADD_COURSE',
  RemoveCourse = 'SCHED_REMOVE_COURSE',
}

/* Actions to search the app. */
export enum Search {
  Search = 'SEARCH',
  ActivateStudyFilter = 'SEARCH_ACTIVATE_STUDY_FILTER',
  DeactivateStudyFilter = 'SEARCH_DEACTIVATE_STUDY_FILTER',
  SetStudyFilters = 'SEARCH_SET_STUDY_FILTERS',
}
