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
 * @file global.d.ts
 * @description Type definitions for use throughout the application
 */

//-----------------------------------------------------------------------------
//  General
//-----------------------------------------------------------------------------

/** A name, optionally translated to French and English. */
export interface Name {
  name?: string;    // Default translation of the name
  name_en?: string; // Name translated for English
  name_fr?: string; // Name translated for French
}

/** An external link, optionally translated to French and English. */
export interface Link {
  link?: string;    // Default translation of the link
  link_en?: string; // Link translated for English
  link_fr?: string; // Link translated for French
}

/** A description, optionally translated to French and English. */
export interface Description {
  description?: string;     // Default translation of the description
  description_en?: string;  // Description translated for English
  description_fr?: string;  // Description translated for French
}

/** A set of details, optionally translated to English or French. */
export interface Details extends Name {
  details?: ReadonlyArray<string>;    // The written details
  details_en?: ReadonlyArray<string>; // The written details, in English
  details_fr?: ReadonlyArray<string>; // The written details, in French
  icon: Icon;                         // Icon representing the details
  image: string;                      // Image for the details
}

/** Describes an image displayed in ImageGrid. */
export interface GridImage extends Name {
  image: React.ReactType;       // Image for the grid
  shorthand?: string;           // Optional short version of name
  thumbnail?: React.ReactType;  // Optional thumbnail image for the grid
}

/** A URL and a name to display it with. */
export type NamedLink = Description & Link & Name;

/** Platform types. Android or iOS. */
export type PlatformString =
  | 'ios'
  | 'android'
  ;

/** Either 12 or 24 hour time formats. */
export type TimeFormat =
  | '12h'
  | '24h'
  ;

  /** Section for a SectionList. */
export interface Section < T > extends Name {
  data: ReadonlyArray<T>; // Data in the section
  key: string;            // Key of the section
}

//-----------------------------------------------------------------------------
//  Menus
//-----------------------------------------------------------------------------

/** Expected format for menu sections. */
export interface MenuSection extends Name {
  icon?: Icon;    // Icon for the section to display
  id: string;     // Unique id to report which section was selected
  image?: string; // Image to display when section is expanded
}

/** Expected format for link sections. */
export interface LinkSection extends MenuSection {
  links?: ReadonlyArray < NamedLink >;        // List of links in the category
  social?: ReadonlyArray < NamedLink >;       // List of social media links in the platform
  categories?: ReadonlyArray < LinkSection >; // List of subcategories
}

//-----------------------------------------------------------------------------
//  Tabs
//-----------------------------------------------------------------------------

/** Describes the tabs available in the app initial state. */
export type WelcomeTab =
  | 'splash'
  | 'update'
  | 'main'
  ;

/** Describes the tabs available in the app. */
export type Tab =
  | 'find'
  | 'schedule'
  | 'discover'
  | 'search'
  | 'settings'
  ;

/** The set of tabs in the app. */
export interface TabSet {
  discover: any;  // Represents the discovery tab
  find: any;      // Represents the find tab
  schedule: any;  // Represents the schedule tab
  search: any;    // Represents the search tab
  settings: any;  // Represents the setting tab
}

/** A navigator route. */
export interface Route {
  id: number | string; // Unique ID for the route
  data: any;           // Any data to pass along to be used to render the view
}


// declare module "*.json" {
//   const value: any;
//   [propName: string]: any;
//   export default value;
// }

// declare global {


// //-----------------------------------------------------------------------------
// //  Settings
// //-----------------------------------------------------------------------------

// /** Setting for the app */
// interface Setting extends Link, Name {
//   icon?: Icon;  // Icon for the setting
//   key: string;  // Unique key to identify the setting
//   type: string; // Type of setting
// }

// //-----------------------------------------------------------------------------
// //  Transit
// //-----------------------------------------------------------------------------

// /** Information about a transit route. */
// interface RouteDetails {
//   days: object;   // Days that the route runs
//   number: number; // Transit bus number
//   sign: string;   // Display sign
// }

// /** Information about a transit stop. */
// interface TransitStop extends LatLong {
//   code: string;     // Short code identifying the stop (not necessarily unique)
//   name: string;     // Name of the stop
//   sorted?: boolean; // True to indicate the routes have been sorted, false or null otherwise
// }

// /** Information about a transit campus. */
// interface TransitCampus extends LatLong, Name {
//   id: string;     // Campus id
//   stops: object;  // List of stops near the campus
// }

// /** Details of the city transit system. */
// interface TransitSystem {
//   campuses: ReadonlyArray < TransitCampus >;  // List of campuses that will be served by the city transit
//   stopDetails: object;                        // Set of stops identified by their ID
// }

// /** High level information about the city transit system. */
// type TransitInfo = NamedLink;

// //-----------------------------------------------------------------------------
// //  Shuttle
// //-----------------------------------------------------------------------------

// /** A stop the shuttle makes */
// interface ShuttleStop extends LatLong, Name {
//   id: string; // Unique stop id
// }

// /** A shuttle's schedule for a certain time of year */
// interface ShuttleSchedule extends Name {
//   start_date: string;                             // Date which the schedule becomes effective
//   end_date: string;                               // Final date for which the schedule is effective
//   excluded_dates: ReadonlyArray < string>;        // Dates for which the schedule is explicitly not in effect
//   directions: ReadonlyArray < ShuttleDirection >; // Directions and times for the schedule
// }

// /** Describes a direction of the shuttle and when it departs in that direction */
// interface ShuttleDirection extends Name {
//   route?: string;     // Description of the route the shuttle takes
//   route_en?: string;  // Description of the route the shuttle takes, in English
//   route_fr?: string;  // Description of the route the shuttle takes, in French
//   day_times: Object;  // Days and times which the shuttle departs
// }

// /** Information about the university shuttle */
// interface ShuttleInfo {
//   stops: ReadonlyArray < ShuttleStop >;         // Stops the shuttle makes
//   schedules: ReadonlyArray < ShuttleSchedule >; // Schedules for the shuttle
//   additional_info: ReadonlyArray < Details >;   // Additional info for taking the shuttle
// }

// //-----------------------------------------------------------------------------
// //  Study spots
// //-----------------------------------------------------------------------------

// /** Study spot filter descriptions and whether they are active. */
// interface StudySpotFilter extends Description, Name {
//   icon: Icon; // Icon to represent the filter
// }

// /** Locations to reserve spots at the university. */
// type StudySpotReservation = Description & Link & Name;

// /** Location and properties of a study spot. */
// interface StudySpot extends Description, Name {
//   image: string;                      // Name of the image of the study spot
//   building: string;                   // Building code
//   room: string | undefined;           // Room number
//   opens: string;                      // Time the spot opens at
//   closes: string;                     // Time the spot closes at
//   filters: ReadonlyArray < string >;  // List of properties to filter on
// }

// /** Information about study spots. */
// interface StudySpotInfo {
//   filters: ReadonlyArray < string >;  // List of filter IDs
//   filterDescriptions: object;         // Filter IDs mapped to their descriptions
//   reservations: LinkSection;          // Links for making reservations of study spots
//   spots: ReadonlyArray < StudySpot >; // Study spots available on campus
// }
