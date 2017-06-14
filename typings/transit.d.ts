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
 * @file transit.d.ts
 * @description Global type definitions for transit related data
 */

import { Details, LatLong, Name, NamedLink } from './global';

//-----------------------------------------------------------------------------
//  Transit
//-----------------------------------------------------------------------------

/** Information about a transit route. */
export interface RouteDetails {
  days: object;   // Days that the route runs
  number: number; // Transit bus number
  sign: string;   // Display sign
}

/** Information about a transit stop. */
export interface TransitStop extends LatLong {
  code: string;     // Short code identifying the stop (not necessarily unique)
  name: string;     // Name of the stop
  sorted?: boolean; // True to indicate the routes have been sorted, false or null otherwise
}

/** Information about a transit campus. */
export interface TransitCampus extends LatLong, Name {
  id: string;     // Campus id
  stops: object;  // List of stops near the campus
}

/** Details of the city transit system. */
export interface TransitSystem {
  campuses: ReadonlyArray < TransitCampus >;  // List of campuses that will be served by the city transit
  stopDetails: object;                        // Set of stops identified by their ID
}

/** High level information about the city transit system. */
export type TransitInfo = NamedLink;

//-----------------------------------------------------------------------------
//  Shuttle
//-----------------------------------------------------------------------------

/** A stop the shuttle makes. */
export interface ShuttleStop extends LatLong, Name {
  id: string; // Unique stop id
}

/** A shuttle's schedule for a certain time of year. */
export interface ShuttleSchedule extends Name {
  start_date: string;                             // Date which the schedule becomes effective
  end_date: string;                               // Final date for which the schedule is effective
  excluded_dates: ReadonlyArray < string>;        // Dates for which the schedule is explicitly not in effect
  directions: ReadonlyArray < ShuttleDirection >; // Directions and times for the schedule
}

/** Describes a direction of the shuttle and when it departs in that direction. */
export interface ShuttleDirection extends Name {
  route?: string;     // Description of the route the shuttle takes
  route_en?: string;  // Description of the route the shuttle takes, in English
  route_fr?: string;  // Description of the route the shuttle takes, in French
  day_times: Object;  // Days and times which the shuttle departs
}

/** Information about the university shuttle. */
export interface ShuttleInfo {
  stops: ReadonlyArray < ShuttleStop >;         // Stops the shuttle makes
  schedules: ReadonlyArray < ShuttleSchedule >; // Schedules for the shuttle
  additional_info: ReadonlyArray < Details >;   // Additional info for taking the shuttle
}
