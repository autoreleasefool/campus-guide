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
 * @file types.js
 * @providesModule types
 * @description Variable type definitions for use throughout the app.
 *
 * @flow
 */
'use strict';

//-----------------------------------------------------------------------------
//  General
//-----------------------------------------------------------------------------

/**
 * A function which takes any params and returns any value. Used as a placeholder function when
 * a more explicit definition is unnecessary or unavailable.
 */
export type DefaultFunction = () => any;

/** A name, valid in English or French. */
export type DefaultName = {name: string};

/** A name, translated for English and French. */
export type TranslatedName = {name_en: string, name_fr: string};

/** A link, valid in English or French. */
export type DefaultLink = {link: string};

/** A link, translated for English and French. */
export type TranslatedLink = {link_en: string, link_fr: string};

/** A set of details, valid in English or French. */
export type DefaultDetails = {details: Array < string >};

/** A set of details, translated for English and French. */
export type TranslatedDetails = {details_en: Array < string >, details_fr: Array < string >};

//-----------------------------------------------------------------------------
//  Configuration
//-----------------------------------------------------------------------------

/** Describes a configuration file. */
export type ConfigFile = {
  name: string,
  type: string,
  version: number,
};

//-----------------------------------------------------------------------------
//  Icons
//-----------------------------------------------------------------------------

/** A cross-platform icon object. */
export type DefaultIcon = {
  name: string,
  class: string,
};

/** An icon object with separate icon definitions for Android and iOS. */
export type PlatformIcon = {
  ios: DefaultIcon,
  android: DefaultIcon,
};

/** Type for when either a cross-platform, or platform-specific icon is expected. */
export type IconObject =
    | DefaultIcon
    | PlatformIcon;

//-----------------------------------------------------------------------------
//  Platforms
//-----------------------------------------------------------------------------

/** Platform types. Android or iOS. */
export type PlatformString =
    | 'ios'
    | 'android';

//-----------------------------------------------------------------------------
//  Languages
//-----------------------------------------------------------------------------

/** Shorthand for languages available in the application. English or French. */
export type Language =
    | 'en'
    | 'fr';

//-----------------------------------------------------------------------------
//  Location
//-----------------------------------------------------------------------------

/** Latitude and longitude of a location. */
export type LatLong = {
 latitude: number,
 longitude: number,
};

/** Difference in latitude and longitude on a map. */
export type LatLongDelta = {
 latitudeDelta: number,
 longitudeDelta: number,
}

//-----------------------------------------------------------------------------
//  Tabs
//-----------------------------------------------------------------------------

/** Describes the tabs available in the app. */
export type TabItems = {
  find: any,
  schedule: any,
  discover: any,
  settings: any,
};

/** A view ID and data to pass to that view. */
export type Route = {
  id: number | string,
  data: any,
};

//-----------------------------------------------------------------------------
//  Semesters
//-----------------------------------------------------------------------------

/** A semester at the school, with its name, identifier, and other info. */
export type Semester = {
  code: string,
  current?: boolean,
} & (DefaultName | TranslatedName);

//-----------------------------------------------------------------------------
//  University
//-----------------------------------------------------------------------------

/** Describes the university's name and location. */
export type University = {
  lat: number,
  long: number,
} & (DefaultName | TranslatedName);

//-----------------------------------------------------------------------------
//  Buses
//-----------------------------------------------------------------------------

/** Bus company name and link to their website */
export type BusInfo = (DefaultName | TranslatedName) & (DefaultLink | TranslatedLink);

/** Collection of bus stops near a University campus. */
export type BusCampus = {
  image: ReactClass < any >,
} & (DefaultName | TranslatedName);

/** Information about a bus transit route. */
export type DetailedRouteInfo = {
  number: number,
  sign: string,
  days: Object,
};

/** Information about a bus transit stop. */
export type TransitStop = {
  code: string,
  id: string,
  key?: number,
  lat: number,
  long: number,
  name: string,
  routes: Array< DetailedRouteInfo >,
  sorted?: boolean,
};

/** Information about a bus transit campus. */
export type TransitCampus = {
  id: string,
  lat: number,
  long: number,
  stops: Array < TransitStop >,
} & (DefaultName | TranslatedName);

//-----------------------------------------------------------------------------
//  Shuttle
//-----------------------------------------------------------------------------

/** A direction, valid in English/French. */
type DefaultDirection = {direction: string}

/** A direction, with separate translations for English and French. */
type TranslatedDirection = {direction_en: string, direction_fr: string};

/** Days that a shuttle schedule will run on, and the times it runs on those days. */
export type ScheduleTimes = {
  days: string,
  times: Array < string >,
};

/** A schedule for the shuttle, including times, start date, end date, and days which the schedule does not apply. */
export type ShuttleSchedule = {
  start_date: string,
  end_date: string,
  excluded_dates: Array < string >,
  times: Array < ScheduleTimes >,
} & (DefaultName | TranslatedName) & (DefaultDirection | TranslatedDirection);

/** A shuttle stop on a campus. */
export type ShuttleCampus = {
  accurate: boolean,
  id: string,
  lat: number,
  long: number,
  schedules: Array < ShuttleSchedule >,
} & (DefaultName | TranslatedName);

/** A set of details about the shuttle system. */
export type ShuttleDetails = {
  icon: IconObject,
  image: string,
} & (DefaultName | TranslatedName) & (DefaultDetails | TranslatedDetails);

//-----------------------------------------------------------------------------
//  Links
//-----------------------------------------------------------------------------

/** A URL and a name to display it with. */
export type NamedLink = (DefaultName | TranslatedName) & (DefaultLink | TranslatedLink);

/** A set of links belonging to a common category, with a name and image, and possibly subcategories. */
export type LinkCategoryType = {
  id: string,
  image?: string,
  links?: Array < NamedLink >,
  social?: Array < NamedLink >,
  categories?: Array < LinkCategoryType >,
} & (DefaultName | TranslatedName);

//-----------------------------------------------------------------------------
//  Buildings
//-----------------------------------------------------------------------------

/** A destination for navigation on campus. */
export type CampusDestination = {
  buildingCode: string,
  roomName: ?string,
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
    | 'pool';

/** A room on campus, with a name and the facilities it offers represented by an ID. */
export type BuildingRoom = {
  name: string,
  type: number,
};

/** A building on campus, with details describing it, its location, and its rooms. */
export type Building = {
  code: string,
  facilities: Array < Facility >,
  image: ReactClass < any >,
  lat: number,
  long: number,
  rooms: Array < BuildingRoom >,
} & (DefaultName | TranslatedName);
