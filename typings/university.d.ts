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
 * @file university.d.ts
 * @description Global type definitions for university related data
 */

import { Description, Icon, LatLong, Link, LinkSection, MenuSection, Name } from './global';

//-----------------------------------------------------------------------------
//  Buildings
//-----------------------------------------------------------------------------

/** A destination for navigation on campus. */
export interface Destination {
  shorthand: string;          // Shorthand building code
  room?: string | undefined;  // Room number in the building
}

/** IDs for available room types. */
export type RoomTypeId =
  | 'bath_men'
  | 'bath_women'
  | 'bath_uni'
  | 'cafe'
  | 'class'
  | 'comp'
  | 'fit'
  | 'gym'
  | 'health'
  | 'kitchen'
  | 'lab_res'
  | 'lab_teach'
  | 'library'
  | 'meet'
  | 'office'
  | 'other'
  | 'pool'
  | 'service'
  | 'storage'
  | 'store'
  | 'study'
  | 'test';

/** A room on campus, with a name and the facilities it offers represented by an ID. */
export interface BuildingRoom {
  name: string;         // Name of the room
  type?: RoomTypeId;    // Type of the room, corresponding to a RoomType
  alt_name?: string;    // Alternative name of the room, suitable for English or French
  alt_name_en?: string; // Alternative name of the room, translated to English
  alt_name_fr?: string; // Alternative name of the room, translated to French
}

/** A predefined type of room and how it should be represented visually. */
export interface RoomType extends Name {
  icon: Icon; // Icon to display for the room type
}

/** Information available on room types. */
export interface RoomTypeInfo {
  ids: string[];  // List of IDs of room types
  types: object;  // IDs mapped to their descriptions
}

/** Street address for a location, optionally translated to French or English. */
export interface Address {
  address?: string;
  address_en?: string;
  address_fr?: string;
}

/** A building on campus, with details describing it, its location, and its rooms. */
export interface Building extends Name, Address {
  shorthand: string;          // Shorthand building code
  facilities: Facility[];     // List of facilities in the building
  image: React.ReactType;     // Image to display for the building
  thumbnail: React.ReactType; // Smaller size image to display as preview
  location: LatLong;          // Location of the building
  rooms: BuildingRoom[];      // List of rooms in the building
}

/** Properties which describe a building, */
export interface BuildingProperty extends Description {
  name: string; // Name of the property
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
  | 'invalid'
  ;

//-----------------------------------------------------------------------------
//  Courses
//-----------------------------------------------------------------------------

/** A semester at the school, with its name, identifier, and other info. */
interface Semester extends Name {
  id: string;         // Unique identifier for the semester
  courses?: Course[]; // Courses the user has defined in the semester
}

/** A set of lectures. */
interface Course {
  code: string;         // Course code
  lectures: Lecture[];  // List of lectures that are a part of the course
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
//  Housing
//-----------------------------------------------------------------------------

/** Properties which describe each residence. */
export interface ResidenceProperty extends Name {
  key: string;  // Key to identify the property
}

/** Organized categories of similar properties which describe each residence. */
interface ResidenceCategory extends Name {
  key: string;                // Key to identify the category
  props: ResidenceProperty[]; // List of properties in the category
}

/** A university residence and specific information about its services and facilities. */
interface Residence extends Address, Description, Name {
  image: string;      // Image of the residence
  location: LatLong;  // Location of the residence
  props: object;      // Indicates which services and facilities are available in the residence
}

/** Information on housing at the university. */
interface HousingInfo {
  offCampusHousing: Link;           // Link to info about off campus housing
  categories: ResidenceCategory[];  // List of categories which residences can be described by
  residences: Residence[];          // List of residences at the university
  resources: LinkSection;           // List of other resources for finding housing at the university
  sections: MenuSection[];          // List of sections of housing info
}

//-----------------------------------------------------------------------------
//  Study spots
//-----------------------------------------------------------------------------

/** Study spot filter IDs */
export type StudySpotFilterId =
  | 'individual'
  | 'group'
  | 'silent'
  | 'food'
  | 'outlets'
  | 'computers'
  | 'open'
  | 'lighting';

/** Study spot filter descriptions and whether they are active. */
export interface StudySpotFilter extends Description, Name {
  icon: Icon; // Icon to represent the filter
}

/** Locations to reserve spots at the university. */
export type StudySpotReservation = Description & Link & Name;

/** Location and properties of a study spot. */
export interface StudySpot extends Description, Name {
  image: string;                // Name of the image of the study spot
  building: string;             // Building code
  room?: string;                // Room number
  opens: string;                // Time the spot opens at
  closes: string;               // Time the spot closes at
  filters: StudySpotFilterId[]; // List of properties to filter on
}

/** Information about study spots. */
export interface StudySpotInfo {
  filters: string[];          // List of filter IDs
  filterDescriptions: object; // Filter IDs mapped to their descriptions
  reservations: LinkSection;  // Links for making reservations of study spots
  spots: StudySpot[];         // Study spots available on campus
}
