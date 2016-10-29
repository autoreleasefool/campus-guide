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

//-----------------------------------------------------------------------------
//  General
//-----------------------------------------------------------------------------

/** A function with no parameters and no return type. */
export type VoidFunction = () => void;

/** A name, valid in English or French. */
export type Name = {name: string};

/** A name, translated for English and French. */
export type TranslatedName = {name_en: string, name_fr: string};

/** A link, valid in English or French. */
export type Link = {link: string};

/** A link, translated for English and French. */
export type TranslatedLink = {link_en: string, link_fr: string};

/** A set of details, valid in English or French. */
export type Details = {details: Array < string >};

/** A set of details, translated for English and French. */
export type TranslatedDetails = {details_en: Array < string >, details_fr: Array < string >};

//-----------------------------------------------------------------------------
//  Icons
//-----------------------------------------------------------------------------

/** Available classes for icons to be from. */
export type IconClass =
    'material'
  | 'ionicon'
  ;

/** A cross-platform icon object. */
export type Icon = {
  name: string,     // Name of the icon in the class
  class: IconClass, // Class of the icon
};

/** An icon object with separate icon definitions for Android and iOS. */
export type PlatformIcon =
  | {
      android: Icon,  // Icon to use on Android
      ios: Icon,      // Icon to use on iOS
    }
  | Icon
  ;

//-----------------------------------------------------------------------------
//  Languages
//-----------------------------------------------------------------------------

/** Shorthand for languages available in the application. English or French. */
export type Language =
    'en'
  | 'fr'
  ;

//-----------------------------------------------------------------------------
//  Platforms
//-----------------------------------------------------------------------------

/** Platform types. Android or iOS. */
export type PlatformString =
    | 'ios'
    | 'android';

//-----------------------------------------------------------------------------
//  Semesters
//-----------------------------------------------------------------------------

/** A semester at the school, with its name, identifier, and other info. */
export type Semester = {
  code: string,       // Unique identifier for the semester
  current?: boolean,  // True if this is the current semester
} & (Name | TranslatedName);

//-----------------------------------------------------------------------------
//  Courses
//-----------------------------------------------------------------------------

/** A set of lectures. */
export type Course = {
  name: string,                 // Name of the course
  lectures: Array < Lecture >,  // List of lectures that are a part of the course
};

/** A single lecture of a course. */
export type Lecture = {
  dayOfTheWeek: number,   // Day of the week the course occurs. 0 is Monday
  duration: number,       // Length of the course, in minutes
  formatCode: string,     // ID of the course format
  location?: {            // Location the lecture is located, if known
    buildingCode: string, // Shorthand building code
    room: string,         // Room in the building
  },
  startingTime: string,   // Time the course starts at
};

/** The format of a single lecture in a course. */
export type LectureFormat = {
  code: string, // Unique code for the lecture format
} & (Name | TranslatedName);

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

/** The set of tabs in the app. */
export type TabSet = {
  discover: any,  // Represents the discovery tab
  find: any,      // Represents the find tab
  schedule: any,  // Represents the schedule tab
  search: any,    // Represents the search tab
  settings: any,  // Represents the setting tab
};

/** A navigator route. */
export type Route = {
  id: number | string, // Unique ID for the route
  data: any,           // Any data to pass along to be used to render the view
};

//-----------------------------------------------------------------------------
//  Discover
//-----------------------------------------------------------------------------

/** A section of the university the user can explore. */
export type DiscoverSection = {
  icon: PlatformIcon, // Icon to display for the section
  id: string,         // Unique ID of the section
  image: any,         // Image to display for the section
} & (Name | TranslatedName);

//-----------------------------------------------------------------------------
//  Buildings
//-----------------------------------------------------------------------------

/** A destination for navigation on campus. */
export type NavigationDestination = {
  code: string,   // Shorthand builing code
  room: ?string,  // Room number in the building
};

/** A room on campus, with a name and the facilities it offers represented by an ID. */
export type BuildingRoom = {
  name: string, // Name of the room
  type: number, // Type of the room, corresponding to a RoomType
};

/** A predefined type of room and how it should be represented visually. */
export type RoomType = {
  icon: PlatformIcon, // Icon to display for the room type
} & (Name | TranslatedName);

/** A building on campus, with details describing it, its location, and its rooms. */
export type Building = {
  code: string,                   // Shorthand building code
  default_room_type: number,      // Default room type when one is not specified for a room
  facilities: Array < Facility >, // List of facilities in the building
  image: ReactClass < any >,      // Image to display for the building
  lat: number,                    // Latitude of the building
  long: number,                   // Longitude of the building
  rooms: Array < BuildingRoom >,  // List of rooms in the building
} & (Name | TranslatedName);

/** Types of facilities that a certain building on campus may offer. */
export type Facility =
  | 'atm'
  | 'food'
  | 'printer'
  | 'store'
  | 'bed'
  | 'alcohol'
  | 'laundry'
  | 'library'
  | 'parking'
  | 'mail'
  | 'pharmacy'
  | 'gym'
  | 'pool'
  ;

//-----------------------------------------------------------------------------
//  Configuration
//-----------------------------------------------------------------------------

/** Describes configuration state. */
export type ConfigurationOptions = {
  alwaysSearchAll?: boolean,       // Always search the entire app, never within a view
  currentSemester?: number,        // Current semester for editing, selected by the user
  firstTime?: boolean,             // Indicates if it's the user's first time in the app
  language?: ?Language,            // User's preferred language
  preferredTimeFormat?: string,    // Either 12 or 24h time
  prefersWheelchair?: boolean,     // Only provide wheelchair accessible routes
  semesters?: Array < Semester >,  // List of semesters currently available
};

/** Describes a configuration file. */
export type ConfigFile = {
  name: string,     // Name of the file
  type: string,     // Type of file: image, json, csv, etc.
  version: number,  // Version number
};

export type Update = {
  currentDownload?: ?string,           // Name of file being downloaded
  filesDownloaded?: Array < string >,  // Array of filenames downloaded
  intermediateProgress?: number,       // Updated progress of current download
  showRetry?: boolean,                 // True to show retry button, false to hide
  showUpdateProgress?: boolean,        // True to show progress bar, false to hide
  totalFiles?: number,                 // Total number of files to download
  totalProgress?: number,              // Total bytes downloaded
  totalSize?: number,                  // Total number of bytes across all files
}

//-----------------------------------------------------------------------------
//  Actions
//-----------------------------------------------------------------------------

/** Available actions for modifying the application state. */
export type Action =
    { type: 'SEARCH_ALL', searchTerms: ?string }
  | { type: 'CLEAR_SEARCH' }
  | { type: 'SWITCH_TAB', tab: Tab; }
  | { type: 'CHANGE_LANGUAGE', language: Language }
  | { type: 'UPDATE_CONFIGURATION', options: ConfigurationOptions }
  | { type: 'UPDATE_PROGRESS', update: Update }
  | { type: 'SET_HEADER_TITLE', title: Name | TranslatedName }
  | { type: 'HEADER_SHOW_BACK', shouldShowBack: boolean }
  | { type: 'HEADER_SHOW_SEARCH', shouldShowSearch: boolean }
  | { type: 'FIND_VIEW', view: number }
  | { type: 'NAVIGATE_TO', destination: NavigationDestination }
  | { type: 'VIEW_BUILDING', building: Building }
  | { type: 'DISCOVER_VIEW', view: number }
  | { type: 'DISCOVER_SECTION', section: number }
  | { type: 'SET_DISCOVER_SECTIONS', sections: Array < DiscoverSection > }
  | { type: 'SCHEDULE_VIEW', view: number }
  ;
