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
 * @created 2016-10-05
 * @file globals.d.ts
 * @description Type definitions for use throughout the application
 */
'use strict';

declare global {

  //-----------------------------------------------------------------------------
  //  General
  //-----------------------------------------------------------------------------

  /** A name, optionally translated to French and English. */
  interface Name {
    name?: string;    // Default translation of the name
    name_en?: string; // Name translated for English
    name_fr?: string; // Name translated for French
  }

  /** An external link, optionally translated to French and English. */
  interface Link {
    link?: string;    // Default translation of the link
    link_en?: string; // Link translated for English
    link_fr?: string; // Link translated for French
  }

  /** A description, optionally translated to French and English. */
  interface Description {
    description?: string;     // Default translation of the description
    description_en?: string;  // Description translated for English
    description_fr?: string;  // Description translated for French
  }

  /** A set of details, optionally translated to English or French. */
  interface Details extends Name {
    details?: ReadonlyArray<string>;    // The written details
    details_en?: ReadonlyArray<string>; // The written details, in English
    details_fr?: ReadonlyArray<string>; // The written details, in French
    icon: Icon;                         // Icon representing the details
    image: string;                      // Image for the details
  }

  /** Describes an image displayed in ImageGrid. **/
  interface GridImage extends Name {
    image: React.ReactType;       // Image for the grid
    shorthand?: string;           // Optional short version of name
    thumbnail?: React.ReactType;  // Optional thumbnail image for the grid
  }

  /** A URL and a name to display it with. */
  type NamedLink = Description & Link & Name;

  //-----------------------------------------------------------------------------
  //  Search
  //-----------------------------------------------------------------------------

  /** Support data required for searches. */
  interface SearchSupport {
    linkSections: ReadonlyArray < LinkSection >;  // Link sections to search
    roomTypeInfo: RoomTypeInfo;                   // Room type info for room searches
    studySpots: StudySpotInfo;                    // Study spots to search
  }

  //-----------------------------------------------------------------------------
  //  Icons
  //-----------------------------------------------------------------------------

  /** Available classes for icons to be from. */
  type IconClass =
    | 'material'
    | 'ionicon'
    ;

  /** A cross-platform icon object. */
  interface BasicIcon {
    class: IconClass; // Class of the icon
    name: string;     // Name of the icon in the class
  }

  /** An icon object with separate icon definitions for Android and iOS. */
  interface PlatformIcon {
    android: BasicIcon; // Icon to use on Android
    ios: BasicIcon;     // Icon to use on iOS
  }

  /** A universal Icon definition. */
  type Icon =
    | BasicIcon
    | PlatformIcon
    ;

  //-----------------------------------------------------------------------------
  //  Languages
  //-----------------------------------------------------------------------------

  /** Shorthand for languages available in the application. English or French. */
  type Language =
    | 'en'
    | 'fr'
    ;

  //-----------------------------------------------------------------------------
  //  Time
  //-----------------------------------------------------------------------------

  /** Either 12 or 24 hour time formats. */
  type TimeFormat =
    | '12h'
    | '24h'
    ;

  //-----------------------------------------------------------------------------
  //  Platforms
  //-----------------------------------------------------------------------------

  /** Platform types. Android or iOS. */
  type PlatformString =
    | 'ios'
    | 'android'
    ;

  //-----------------------------------------------------------------------------
  //  Sections
  //-----------------------------------------------------------------------------

  /** Section for a SectionList */
  interface Section < T > extends Name {
    data: ReadonlyArray<T>; // Data in the section
    key: string;            // Key of the section
  }

  //-----------------------------------------------------------------------------
  //  Settings
  //-----------------------------------------------------------------------------

  /** Setting for the app */
  interface Setting extends Link, Name {
    icon?: Icon;  // Icon for the setting
    key: string;  // Unique key to identify the setting
    type: string; // Type of setting
  }

  //-----------------------------------------------------------------------------
  //  Location
  //-----------------------------------------------------------------------------

  /** Latitude and longitude of a location. */
  interface LatLong {
    latitude: number;   // Latitude of the location
    longitude: number;  // Longitude of the location
  }

  /** Difference in latitude and longitude on a map. */
  interface  LatLongDelta {
    latitudeDelta: number;  // Change in latitude
    longitudeDelta: number; // Change in longitude
  }

  //-----------------------------------------------------------------------------
  //  Transit
  //-----------------------------------------------------------------------------

  /** Information about a transit route. */
  interface RouteDetails {
    days: object;   // Days that the route runs
    number: number; // Transit bus number
    sign: string;   // Display sign
  }

  /** Information about a transit stop. */
  interface TransitStop extends LatLong {
    code: string;     // Short code identifying the stop (not necessarily unique)
    name: string;     // Name of the stop
    sorted?: boolean; // True to indicate the routes have been sorted, false or null otherwise
  }

  /** Information about a transit campus. */
  interface TransitCampus extends LatLong, Name {
    id: string;     // Campus id
    stops: object;  // List of stops near the campus
  }

  /** Details of the city transit system. */
  interface TransitSystem {
    campuses: ReadonlyArray < TransitCampus >;  // List of campuses that will be served by the city transit
    stopDetails: object;                        // Set of stops identified by their ID
  }

  /** High level information about the city transit system. */
  type TransitInfo = NamedLink;

  //-----------------------------------------------------------------------------
  //  Shuttle
  //-----------------------------------------------------------------------------

  /** A stop the shuttle makes */
  interface ShuttleStop extends LatLong, Name {
    id: string; // Unique stop id
  }

  /** A shuttle's schedule for a certain time of year */
  interface ShuttleSchedule extends Name {
    start_date: string;                             // Date which the schedule becomes effective
    end_date: string;                               // Final date for which the schedule is effective
    excluded_dates: ReadonlyArray < string>;        // Dates for which the schedule is explicitly not in effect
    directions: ReadonlyArray < ShuttleDirection >; // Directions and times for the schedule
  }

  /** Describes a direction of the shuttle and when it departs in that direction */
  interface ShuttleDirection extends Name {
    route?: string;     // Description of the route the shuttle takes
    route_en?: string;  // Description of the route the shuttle takes, in English
    route_fr?: string;  // Description of the route the shuttle takes, in French
    day_times: Object;  // Days and times which the shuttle departs
  }

  /** Information about the university shuttle */
  interface ShuttleInfo {
    stops: ReadonlyArray < ShuttleStop >;         // Stops the shuttle makes
    schedules: ReadonlyArray < ShuttleSchedule >; // Schedules for the shuttle
    additional_info: ReadonlyArray < Details >;   // Additional info for taking the shuttle
  }

  //-----------------------------------------------------------------------------
  //  Study spots
  //-----------------------------------------------------------------------------

  /** Study spot filter descriptions and whether they are active. */
  interface StudySpotFilter extends Description, Name {
    icon: Icon; // Icon to represent the filter
  }

  /** Locations to reserve spots at the university. */
  type StudySpotReservation = Description & Link & Name;

  /** Location and properties of a study spot. */
  interface StudySpot extends Description, Name {
    image: string;                      // Name of the image of the study spot
    building: string;                   // Building code
    room: string | undefined;           // Room number
    opens: string;                      // Time the spot opens at
    closes: string;                     // Time the spot closes at
    filters: ReadonlyArray < string >;  // List of properties to filter on
  }

  /** Information about study spots. */
  interface StudySpotInfo {
    filters: ReadonlyArray < string >;  // List of filter IDs
    filterDescriptions: object;         // Filter IDs mapped to their descriptions
    reservations: LinkSection;          // Links for making reservations of study spots
    spots: ReadonlyArray < StudySpot >; // Study spots available on campus
  }

  //-----------------------------------------------------------------------------
  //  Buildings
  //-----------------------------------------------------------------------------

  /** A destination for navigation on campus. */
  interface Destination {
    shorthand: string;        // Shorthand building code
    room: string | undefined; // Room number in the building
  }

  /** A room on campus, with a name and the facilities it offers represented by an ID. */
  interface BuildingRoom {
    name: string;         // Name of the room
    type: string;         // Type of the room, corresponding to a RoomType
    alt_name?: string;    // Alternative name of the room, suitable for English or French
    alt_name_en?: string; // Alternative name of the room, translated to English
    alt_name_fr?: string; // Alternative name of the room, translated to French
  }

  /** A predefined type of room and how it should be represented visually. */
  interface RoomType extends Name {
    icon: Icon; // Icon to display for the room type
  }

  /** Information available on room types. */
  interface RoomTypeInfo {
    ids: ReadonlyArray < string >;  // List of IDs of room types
    types: object;                  // IDs mapped to their descriptions
  }

  /** Street address for a location, optionally translated to French or English. */
  interface Address {
    address?: string,
    address_en?: string,
    address_fr?: string,
  }

  /** A building on campus, with details describing it, its location, and its rooms. */
  interface Building extends Name, Address {
    shorthand: string;                      // Shorthand building code
    facilities: ReadonlyArray < Facility >; // List of facilities in the building
    image: React.ReactType;                 // Image to display for the building
    thumbnail: React.ReactType;             // Smaller size image to display as preview
    location: LatLong;                      // Location of the building
    rooms: ReadonlyArray < BuildingRoom >;  // List of rooms in the building
  }

  /** Properties which describe a building, */
  interface BuildingProperty {
    name: string;         // Name of the property
    description: string;  // Description of the building property
  }

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
  //  Courses
  //-----------------------------------------------------------------------------

  /** A semester at the school, with its name, identifier, and other info. */
  interface Semester extends Name {
    id: string;                         // Unique identifier for the semester
    courses?: ReadonlyArray < Course >  // Courses the user has defined in the semester
  }

  /** A set of lectures. */
  interface Course {
    code: string;                         // Course code
    lectures: ReadonlyArray < Lecture >;  // List of lectures that are a part of the course
  }

  /** A single lecture of a course. */
  interface Lecture {
    day: number;                        // Day of the week the course occurs. 0 is Monday
    endTime: number;                    // Time the course ends at
    format: number;                     // Index of the course format
    location: Destination | undefined;  // Location of the lecture
    startTime: number;                  // Time the course starts at
  }

  /** The format of a single lecture in a course. */
  interface LectureFormat extends Name {
    code: string; // Unique code for the lecture format
  }

  //-----------------------------------------------------------------------------
  //  Tabs
  //-----------------------------------------------------------------------------

  /** Describes the tabs available in the app initial state. */
  type WelcomeTab =
    | 'splash'
    | 'update'
    | 'main'
    ;

  /** Describes the tabs available in the app. */
  type Tab =
    | 'find'
    | 'schedule'
    | 'discover'
    | 'search'
    | 'settings'
    ;

  /** The set of tabs in the app. */
  interface TabSet {
    discover: any;  // Represents the discovery tab
    find: any;      // Represents the find tab
    schedule: any;  // Represents the schedule tab
    search: any;    // Represents the search tab
    settings: any;  // Represents the setting tab
  }

  /** A navigator route. */
  interface Route {
    id: number | string; // Unique ID for the route
    data: any;           // Any data to pass along to be used to render the view
  }

  //-----------------------------------------------------------------------------
  //  Menus
  //-----------------------------------------------------------------------------

  /** Expected format for menu sections. */
  interface MenuSection extends Name {
    icon?: Icon;    // Icon for the section to display
    id: string;     // Unique id to report which section was selected
    image?: string; // Image to display when section is expanded
  }

  /** Expected format for link sections. */
  interface LinkSection extends MenuSection {
    links?: ReadonlyArray < NamedLink >;        // List of links in the category
    social?: ReadonlyArray < NamedLink >;       // List of social media links in the platform
    categories?: ReadonlyArray < LinkSection >; // List of subcategories
  }

  //-----------------------------------------------------------------------------
  //  Steps
  //-----------------------------------------------------------------------------

  interface Step extends Description {
    key: string;  // Unique key to identify each step
    icon?: Icon;  // Icon to represent the step
  }

  //-----------------------------------------------------------------------------
  //  Housing
  //-----------------------------------------------------------------------------

  /** Properties which describe each residence. */
  interface ResidenceProperty extends Name {
    key: string;  // Key to identify the property
  }

  /** Organized categories of similar properties which describe each residence. */
  interface ResidenceCategory extends Name {
    key: string;                                // Key to identify the category
    props: ReadonlyArray < ResidenceProperty >; // List of properties in the category
  }

  /** A university residence and specific information about its services and facilities. */
  interface Residence extends Address, Description, Name {
    image: string;      // Image of the residence
    location: LatLong;  // Location of the residence
    props: Object;      // Indicates which services and facilities are available in the residence
  }

  /** Information on housing at the university. */
  interface HousingInfo {
    offCampusHousing: Link;                           // Link to info about off campus housing
    categories: ReadonlyArray < ResidenceCategory >;  // List of categories which residences can be described by
    residences: ReadonlyArray < Residence >;          // List of residences at the university
    resources: LinkSection;                           // List of other resources for finding housing at the university
    sections: ReadonlyArray < MenuSection >;          // List of sections of housing info
  }

  //-----------------------------------------------------------------------------
  //  Configuration
  //-----------------------------------------------------------------------------

  /** Describes configuration state. */
  interface ConfigurationOptions {
    alwaysSearchAll?: boolean;                // Always search the entire app, never within a view
    transitInfo?: TransitInfo | undefined;    // High level information about the city transit
    currentSemester?: number;                 // Current semester for editing, selected by the user
    firstTime?: boolean;                      // Indicates if it's the user's first time in the app
    language?: Language | undefined;          // User's preferred language
    preferredTimeFormat?: TimeFormat;         // Either 12 or 24h time
    prefersWheelchair?: boolean;              // Only provide wheelchair accessible routes
    preferByCourse?: boolean;                 // True to default schedule view by course, false for by week
    semesters?: ReadonlyArray < Semester >;   // List of semesters currently available
    universityLocation?: LatLong | undefined; // Latitude and longitude of the university
    universityName?: Name | undefined;        // Name of the univeristy
  };

  /** Describes a configuration file. */
  interface ConfigFile {
    name: string;     // Name of the file
    type: string;     // Type of file: image, json, csv, etc.
    version: number;  // Version number
  }

  /** Describes the progress of an app update. */
  interface Update {
    currentDownload?: string | undefined;       // Name of file being downloaded
    filesDownloaded?: ReadonlyArray < string >; // Array of filenames downloaded
    intermediateProgress?: number;              // Updated progress of current download
    showRetry?: boolean;                        // True to show retry button, false to hide
    showUpdateProgress?: boolean;               // True to show progress bar, false to hide
    totalFiles?: number;                        // Total number of files to download
    totalProgress?: number;                     // Total bytes downloaded
    totalSize?: number;                         // Total number of bytes across all files
  }

}