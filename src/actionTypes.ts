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

// Types
import * as Configuration from './util/Configuration';
import { SingleMenuSection, Name, Tab } from '../typings/global';
import { Building, Course, Destination, Residence, Semester } from '../typings/university';

/* Actions for app navigation. */
export enum Navigation {
  CanBack = 'NAV_CAN_BACK',
  NavigateBack = 'NAV_NAVIGATE_BACK',
  SetTitle = 'NAV_SET_TITLE',
  ShowBack = 'NAV_SHOW_BACK',
  ShowIntroTour = 'NAV_SHOW_INTRO_TOUR',
  ShowSearch = 'NAV_SHOW_SEARCH',
  SwitchDiscoverView = 'NAV_SWITCH_DISCOVER_VIEW',
  SwitchDiscoverLink = 'NAV_SWITCH_DISCOVER_LINK',
  SwitchDiscoverTransitCampus = 'NAV_SWITCH_DISCOVER_TRANSIT_CAMPUS',
  SwitchFindView = 'NAV_SWITCH_FIND_VIEW',
  SwitchHousingView = 'NAV_SWITCH_HOUSING_VIEW',
  SwitchHousingResidence = 'NAV_SWITCH_HOUSING_RESIDENCE',
  SwitchTab = 'NAV_SWITCH_TAB',
}

interface ShowIntroTourAction {
  type: Navigation.ShowIntroTour;
  show: boolean;
  skipped: boolean;
}

interface CanBackAction {
  type: Navigation.CanBack;
  can: boolean;
  key: string;
}

interface NavigateBackAction {
  type: Navigation.NavigateBack;
}

interface SetTitleAction {
  type: Navigation.SetTitle;
  setActive: boolean;
  title: Name | string | undefined;
  tab: Tab;
  view: number;
}

interface ShowBackAction {
  type: Navigation.ShowBack;
  disableAnimation: boolean;
  show: boolean;
  tab: Tab;
}

interface ShowSearchAction {
  type: Navigation.ShowSearch;
  disableAnimation: boolean;
  show: boolean;
  tab: Tab;
}

interface SwitchDiscoverViewAction {
  type: Navigation.SwitchDiscoverView;
  view: number;
}

interface SwitchDiscoverLinkAction {
  type: Navigation.SwitchDiscoverLink;
  linkId: string | number | undefined;
}

interface SwitchDiscoverTransitCampusAction {
  type: Navigation.SwitchDiscoverTransitCampus;
  campus: SingleMenuSection | undefined;
}

interface SwitchFindViewAction {
  type: Navigation.SwitchFindView;
  view: number;
}

interface SwitchHousingViewAction {
  type: Navigation.SwitchHousingView;
  view: number;
}

interface SwitchHousingResidenceAction {
  type: Navigation.SwitchHousingResidence;
  residence: Residence | undefined;
}

interface SwitchTabAction {
  type: Navigation.SwitchTab;
  tab: Tab;
}

/* Actions to specify the app configuration. */
export enum Config {
  ConfigUpdate = 'CONF_UPDATE_CONFIGURATION',
  ProgressUpdate = 'CONF_UPDATE_PROGRESS',
  ConfirmUpdate = 'CONF_CONFIRM_UPDATE',
}

interface ConfigUpdateAction {
  type: Config.ConfigUpdate;
  options: Configuration.Options;
}

interface ProgressUpdateAction {
  type: Config.ProgressUpdate;
  update: Configuration.ProgressUpdate;
}

interface ConfirmUpdateAction {
  type: Config.ConfirmUpdate;
}

/* Actions for directing the user. */
export enum Directions {
  SetDestination = 'DIR_SET_DESTINATION',
  SetStartingPoint = 'DIR_SET_STARTING_POINT',
  ViewBuilding = 'DIR_VIEW_BUILDING',
}

interface SetDestinationAction {
  type: Directions.SetDestination;
  destination: Destination;
}

interface SetStartingPointAction {
  type: Directions.SetStartingPoint;
  startingPoint: Destination;
}

interface ViewBuildingAction {
  type: Directions.ViewBuilding;
  building: Building;
}

/* Actions to adjust the user's schedule. */
export enum Schedule {
  Load = 'SCHED_LOAD',
  AddSemester = 'SCHED_ADD_SEMESTER',
  AddCourse = 'SCHED_ADD_COURSE',
  RemoveCourse = 'SCHED_REMOVE_COURSE',
}

interface LoadScheduleAction {
  type: Schedule.Load;
  schedule: object;
}

interface AddSemesterAction {
  type: Schedule.AddSemester;
  semester: Semester;
}

interface AddCourseAction {
  type: Schedule.AddCourse;
  semester: string;
  course: Course;
}

interface RemoveCourseAction {
  type: Schedule.RemoveCourse;
  semester: string;
  courseCode: string;
}

/* Actions to search the app. */
export enum Search {
  Search = 'SEARCH',
  ActivateStudyFilter = 'SEARCH_ACTIVATE_STUDY_FILTER',
  DeactivateStudyFilter = 'SEARCH_DEACTIVATE_STUDY_FILTER',
  SetStudyFilters = 'SEARCH_SET_STUDY_FILTERS',
}

interface SearchAction {
  type: Search.Search;
  tab: Tab;
  terms: string;
}

interface ActivateStudyFilterAction {
  type: Search.ActivateStudyFilter;
  filter: string;
}

interface DeactivateStudyFilterAction {
  type: Search.DeactivateStudyFilter;
  filter: string;
}

interface SetStudyFiltersAction {
  type: Search.SetStudyFilters;
  filters: string[];
}

/** Default "other" action type */
export enum Other {
  Invalid = 'INVALID_ACTION_TYPE',
}

interface OtherAction {
  type: Other.Invalid;
}

/** Valid action types */
export type ActionType =
  | OtherAction
  | CanBackAction
  | NavigateBackAction
  | SetTitleAction
  | ShowBackAction
  | ShowSearchAction
  | SwitchDiscoverViewAction
  | SwitchDiscoverLinkAction
  | SwitchDiscoverTransitCampusAction
  | SwitchFindViewAction
  | SwitchHousingViewAction
  | SwitchHousingResidenceAction
  | SwitchTabAction
  | ConfigUpdateAction
  | ProgressUpdateAction
  | ConfirmUpdateAction
  | SetDestinationAction
  | SetStartingPointAction
  | ViewBuildingAction
  | LoadScheduleAction
  | AddSemesterAction
  | AddCourseAction
  | RemoveCourseAction
  | SearchAction
  | ActivateStudyFilterAction
  | DeactivateStudyFilterAction
  | SetStudyFiltersAction
  | ShowIntroTourAction
  ;