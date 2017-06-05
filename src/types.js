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

/** A name, optionally translated to French and English. */
export type Name = {
  name?: string,
  name_en?: string,
  name_fr?: string,
};

/** An external link, optionally translated to French and English. */
export type Link = {
  link?: string,
  link_en?: string,
  link_fr?: string,
}

/** A description, optionally translated to French and English. */
export type Description = {
  description?: string,
  description_en?: string,
  description_fr?: string,
}

/** A set of details, optionally translated to English or French. */
export type Details = {
  details?: Array < string >,     // The written details
  details_en?: Array < string >,  // The written details, in English
  details_fr?: Array < string >,  // The written details, in French
  image: string,                  // Image for the details
  icon: PlatformIcon,             // Icon representing the details
} & Name;

/** Describes an image displayed in ImageGrid. **/
export type GridImage = {
  shorthand?: string,                       // Optional short version of name
  image: string | ReactClass < any >,       // Image for the grid
  thumbnail?: string | ReactClass < any >,  // Optional thumbnail image for the grid
} & Name;

/** A URL and a name to display it with. */
export type NamedLink = Name & Link & Description;

//-----------------------------------------------------------------------------
//  Icons
//-----------------------------------------------------------------------------

/** Available classes for icons to be from. */
export type IconClass =
  | 'material'
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
  | 'en'
  | 'fr'
  ;

//-----------------------------------------------------------------------------
//  Time
//-----------------------------------------------------------------------------

/** Either 12 or 24 hour time formats. */
export type TimeFormat =
  | '12h'
  | '24h'
  ;

//-----------------------------------------------------------------------------
//  Platforms
//-----------------------------------------------------------------------------

/** Platform types. Android or iOS. */
export type PlatformString =
  | 'ios'
  | 'android'
  ;

//-----------------------------------------------------------------------------
//  Sections
//-----------------------------------------------------------------------------

/** Section for a SectionList */
export type Section < T > = {
  key: string,        // Key of the section
  data: Array < T >,  // Data in the section
} & Name;

//-----------------------------------------------------------------------------
//  Settings
//-----------------------------------------------------------------------------

/** Setting for the app */
export type Setting = {
  key: string,          // Unique key to identify the setting
  type: string,         // Type of setting
  icon?: PlatformIcon,  // Icon for the setting
} & Name & Link;

//-----------------------------------------------------------------------------
//  Location
//-----------------------------------------------------------------------------

/** Latitude and longitude of a location. */
export type LatLong = {
  latitude: number,   // Latitude of the location
  longitude: number,  // Longitude of the location
};

/** Difference in latitude and longitude on a map. */
export type LatLongDelta = {
  latitudeDelta: number,  // Change in latitude
  longitudeDelta: number, // Change in longitude
}

//-----------------------------------------------------------------------------
//  Transit
//-----------------------------------------------------------------------------

/** Information about a transit route. */
export type RouteDetails = {
  number: number, // Transit bus number
  sign: string,   // Display sign
  days: Object,   // Days that the route runs
};

/** Information about a transit stop. */
export type TransitStop = {
  code: string,                   // Short code identifying the stop (not necessarily unique)
  lat: number,                    // Central latitude for the stop
  long: number,                   // Central longitude for the stop
  name: string,                   // Name of the stop
  sorted?: boolean,               // True to indicate the routes have been sorted, false or null otherwise
};

/** Information about a transit campus. */
export type TransitCampus = {
  id: string,     // Campus id
  lat: number,    // Central latitude for the campus to display on a map
  long: number,   // Central longitude for the campus to display on a map
  stops: Object,  // List of stops near the campus
} & Name;

/** Details of the city transit system. */
export type TransitSystem = {
  campuses: Array < TransitCampus >,  // List of campuses that will be served by the city transit
  stopDetails: Object,                // Set of stops identified by their ID
};

/** High level information about the city transit system. */
export type TransitInfo = NamedLink;

//-----------------------------------------------------------------------------
//  Shuttle
//-----------------------------------------------------------------------------

/** Information about the university shuttle */
export type ShuttleInfo = {
  stops: Array < ShuttleStop >,         // Stops the shuttle makes
  schedules: Array < ShuttleSchedule >, // Schedules for the shuttle
  additional_info: Array < Details >,   // Additional info for taking the shuttle
};

/** A stop the shuttle makes */
export type ShuttleStop = {
  id: string,   // Unique stop id
  lat: number,  // Latitude of the stop
  long: number, // Longitude of the stop
} & Name;

/** A shuttle's schedule for a certain time of year */
export type ShuttleSchedule = {
  start_date: string,                     // Date which the schedule becomes effective
  end_date: string,                       // Final date for which the schedule is effective
  excluded_dates: Array < string>,        // Dates for which the schedule is explicitly not in effect
  directions: Array < ShuttleDirection >, // Directions and times for the schedule
} & Name;

/** Describes a direction of the shuttle and when it departs in that direction */
export type ShuttleDirection = {
  route?: string,     // Description of the route the shuttle takes
  route_en?: string,  // Description of the route the shuttle takes, in English
  route_fr?: string,  // Description of the route the shuttle takes, in French
  day_times: Object,  // Days and times which the shuttle departs
} & Name;

//-----------------------------------------------------------------------------
//  Study spots
//-----------------------------------------------------------------------------

/** Study spot filter descriptions and whether they are active. */
export type StudySpotFilter = {
  icon: PlatformIcon, // Icon to represent the filter
} & Name & Description;

/** Locations to reserve spots at the university. */
export type StudySpotReservation = Name & Link & Description;

/** Location and properties of a study spot. */
export type StudySpot = {
  image: string,              // Name of the image of the study spot
  building: string,           // Building code
  room: ?string,              // Room number
  opens: string,              // Time the spot opens at
  closes: string,             // Time the spot closes at
  filters: Array < string >,  // List of properties to filter on
} & Name & Description;

/** Information about study spots. */
export type StudySpotInfo = {
  filters: Array < string >,  // List of filter IDs
  filterDescriptions: Object, // Filter IDs mapped to their descriptions
  reservations: LinkSection,  // Links for making reservations of study spots
  spots: Array < StudySpot >, // Study spots available on campus
};

//-----------------------------------------------------------------------------
//  Courses
//-----------------------------------------------------------------------------

/** A semester at the school, with its name, identifier, and other info. */
export type Semester = {
  id: string,                 // Unique identifier for the semester
  courses?: Array < Course >  // Courses the user has defined in the semester
} & Name;

/** A set of lectures. */
export type Course = {
  code: string,                 // Course code
  lectures: Array < Lecture >,  // List of lectures that are a part of the course
};

/** A single lecture of a course. */
export type Lecture = {
  day: number,            // Day of the week the course occurs. 0 is Monday
  endTime: number,        // Time the course ends at
  format: number,         // Index of the course format
  location: ?Destination, // Location of the lecture
  startTime: number,      // Time the course starts at
};

/** The format of a single lecture in a course. */
export type LectureFormat = {
  code: string, // Unique code for the lecture format
} & Name;

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
//  Menus
//-----------------------------------------------------------------------------

/** Expected format for menu sections. */
export type MenuSection = {
  icon?: PlatformIcon,  // Icon for the section to display
  id: string,           // Unique id to report which section was selected
  image?: string,       // Image to display when section is expanded
} & Name;

/** Expected format for link sections. */
export type LinkSection = {
  links?: Array < NamedLink >,        // List of links in the category
  social?: Array < NamedLink >,       // List of social media links in the platform
  categories?: Array < LinkSection >, // List of subcategories
} & MenuSection;

//-----------------------------------------------------------------------------
//  Buildings
//-----------------------------------------------------------------------------

/** A destination for navigation on campus. */
export type Destination = {
  shorthand: string,  // Shorthand building code
  room: ?string,      // Room number in the building
};

/** A room on campus, with a name and the facilities it offers represented by an ID. */
export type BuildingRoom = {
  name: string,         // Name of the room
  type: string,         // Type of the room, corresponding to a RoomType
  alt_name?: string,    // Alternative name of the room, suitable for English or French
  alt_name_en?: string, // Alternative name of the room, translated to English
  alt_name_fr?: string, // Alternative name of the room, translated to French
};

/** A predefined type of room and how it should be represented visually. */
export type RoomType = {
  icon: PlatformIcon, // Icon to display for the room type
} & Name;

/** Information available on room types. */
export type RoomTypeInfo = {
  ids: Array < string >,  // List of IDs of room types
  types: Object,          // IDs mapped to their descriptions
}

/** Street address for a location, optionally translated to French or English. */
type Address = {
  address?: string,
  address_en?: string,
  address_fr?: string,
};

/** A building on campus, with details describing it, its location, and its rooms. */
export type Building = {
  shorthand: string,                      // Shorthand building code
  facilities: Array < Facility >,         // List of facilities in the building
  image: string | ReactClass < any >,     // Image to display for the building
  thumbnail: string | ReactClass < any >, // Smaller size image to display as preview
  location: LatLong,                      // Location of the building
  rooms: Array < BuildingRoom >,          // List of rooms in the building
} & Name & Address;

/** Properties which describe a building, */
export type BuildingProperty = {
  name: string,         // Name of the property
  description: string,  // Description of the building property
};

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
//  Steps
//-----------------------------------------------------------------------------

export type Step = {
  key: string,          // Unique key to identify each step
  icon?: PlatformIcon,  // Icon to represent the step
} & Description;

//-----------------------------------------------------------------------------
//  Housing
//-----------------------------------------------------------------------------

/** Properties which describe each residence. */
export type ResidenceProperty = {
  key: string,  // Key to identify the property
} & Name;

/** Organized categories of similar properties which describe each residence. */
export type ResidenceCategory = {
  key: string,                        // Key to identify the category
  props: Array < ResidenceProperty >, // List of properties in the category
} & Name;

/** A university residence and specific information about its services and facilities. */
export type Residence = {
  image: string,       // Image of the residence
  location: LatLong,  // Location of the residence
  props: Object,      // Indicates which services and facilities are available in the residence
} & Name & Address & Description;

/** Information on housing at the university. */
export type HousingInfo = {
  offCampusHousing: Link,                   // Link to info about off campus housing
  categories: Array < ResidenceCategory >,  // List of categories which residences can be described by
  residences: Array < Residence >,          // List of residences at the university
  resources: LinkSection,                   // List of other resources for finding housing at the university
  sections: Array < MenuSection >,          // List of sections of housing info
};

//-----------------------------------------------------------------------------
//  Search
//-----------------------------------------------------------------------------

/** Support data required for searches. */
export type SearchSupport = {
  linkSections: Array < LinkSection >,  // Link sections to search
  roomTypeInfo: RoomTypeInfo,           // Room type info for room searches
  studySpots: StudySpotInfo,            // Study spots to search
};

//-----------------------------------------------------------------------------
//  Configuration
//-----------------------------------------------------------------------------

/** Describes configuration state. */
export type ConfigurationOptions = {
  alwaysSearchAll?: boolean,        // Always search the entire app, never within a view
  transitInfo?: ?TransitInfo,       // High level information about the city transit
  currentSemester?: number,         // Current semester for editing, selected by the user
  firstTime?: boolean,              // Indicates if it's the user's first time in the app
  language?: ?Language,             // User's preferred language
  preferredTimeFormat?: TimeFormat, // Either 12 or 24h time
  prefersWheelchair?: boolean,      // Only provide wheelchair accessible routes
  preferByCourse?: boolean,         // True to default schedule view by course, false for by week
  semesters?: Array < Semester >,   // List of semesters currently available
  universityLocation?: ?LatLong,    // Latitude and longitude of the university
  universityName?: ?Name,           // Name of the univeristy
};

/** Describes a configuration file. */
export type ConfigFile = {
  name: string,     // Name of the file
  type: string,     // Type of file: image, json, csv, etc.
  version: number,  // Version number
};

/** Describes the progress of an app update. */
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
