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

import { SectionListData } from 'react-native';

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
  details?: string[];     // The written details
  details_en?: string[];  // The written details, in English
  details_fr?: string[];  // The written details, in French
  icon: Icon;             // Icon representing the details
  image: string;          // Image for the details
}

/** Describes an image displayed in ImageGrid. */
export interface GridImage extends Name {
  image: React.ReactType;       // Image for the grid
  shorthand?: string;           // Optional short version of name
  thumbnail?: React.ReactType;  // Optional thumbnail image for the grid
}

/** A URL and a name to display it with. */
export type NamedLink = Description & Link & Name;

/** Either 12 or 24 hour time formats. */
export type TimeFormat =
  | '12h'
  | '24h'
  ;

/** Section for a SectionList. */
export interface Section<T> extends Name, SectionListData<T> {}

//-----------------------------------------------------------------------------
//  Maps
//-----------------------------------------------------------------------------

/** Latitude and longitude of a location. */
export interface LatLong {
  latitude: number;   // Latitude of the location
  longitude: number;  // Longitude of the location
}

/** Difference in latitude and longitude on a map. */
export interface LatLongDelta {
  latitudeDelta: number;  // Change in latitude
  longitudeDelta: number; // Change in longitude
}

//-----------------------------------------------------------------------------
//  Icons
//-----------------------------------------------------------------------------

/** Available classes for icons to be from. */
export type IconClass =
  | 'material'
  | 'ionicon'
  ;

/** A cross-platform icon object. */
export interface BasicIcon {
  class: IconClass; // Class of the icon
  name: string;     // Name of the icon in the class
}

/** An icon object with separate icon definitions for Android and iOS. */
export interface PlatformIcon {
  android: BasicIcon; // Icon to use on Android
  ios: BasicIcon;     // Icon to use on iOS
}

/** A universal Icon definition. */
export type Icon =
  | BasicIcon
  | PlatformIcon
  ;

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
  links?: NamedLink[];        // List of links in the category
  social?: NamedLink[];       // List of social media links in the platform
  categories?: LinkSection[]; // List of subcategories
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
