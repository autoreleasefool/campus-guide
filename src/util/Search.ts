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
 * @created 2017-05-31
 * @file Search.ts
 * @description Provides methods for searching various structures in the application.
 */

// Imports
import * as Constants from '../constants';
import * as Translations from './Translations';

import { GridImage, LinkSection } from '../../typings/global';
import { Building, BuildingRoom, RoomTypeInfo, StudySpot, StudySpotInfo } from '../../typings/university';

/** Support data required for searches. */
export interface SearchSupport {
  linkSections: LinkSection[];  // Link sections to search
  roomTypeInfo: RoomTypeInfo;   // Room type info for room searches
  studySpots: StudySpotInfo;                    // Study spots to search
}

/** Results for a search. */
export interface SearchResult {
  success: boolean;   // True indicates a successful result, false otherwise
  matches: string[];  // List of terms that matched the filter for further narrowing of results
}

/**
 * Returns true if the GridImage matches the filter, and the terms that match, or false otherwise.
 *
 * @param {string}    filter    the provided filter
 * @param {GridImage} gridImage the building to compare
 * @returns {SearchResult} success true if the GridImage matches the filter, false otherwise, and all matching terms
 */
export function filterGridImage(filter: string, gridImage: GridImage): SearchResult {
  const matches = [];

  // Compare building properties to search terms to add to results
  const name = (Translations.getName(gridImage) || '').toUpperCase();
  if (name.indexOf(filter) >= 0) {
    matches.push(name);
  }

  const shorthand = (gridImage.shorthand || '').toUpperCase();
  if (shorthand.indexOf(filter) >= 0) {
    matches.push(shorthand);
  }

  return {
    matches,
    success: matches.length > 0,
  };
}

/**
 * Returns true if the building matches the filter, and the terms that match, or false otherwise.
 *
 * @param {string}   filter   the provided filter
 * @param {Building} building the building to compare
 * @returns {SearchResult} success true if the building matches the filter, false otherwise, and all matching terms
 */
export function filterBuilding(filter: string, building: Building): SearchResult {
  return filterGridImage(filter, building);
}

/**
 * Returns true if the study spot matches the filter, and the terms that match, or false otherwise.
 *
 * @param {string}    filter    the provided filter
 * @param {StudySpot} studySpot the spot to compare
 * @returns {SearchResult} success true if the spot matches the filter, false otherwise, and all matching terms
 */
export function filterStudySpot(filter: string, studySpot: StudySpot): SearchResult {
  const matches = [];

  const spotName = (Translations.getName(studySpot) || '').toUpperCase();
  if (spotName.indexOf(filter) >= 0) {
    matches.push(spotName);
  }

  const spotBuilding = studySpot.building.toUpperCase();
  if (spotBuilding.toUpperCase().indexOf(filter) >= 0) {
    matches.push(spotBuilding);
  }

  if (studySpot.room && studySpot.room.indexOf(filter) >= 0) {
    matches.push(studySpot.room);
  }

  return {
    matches,
    success: matches.length > 0,
  };
}

/**
 * Returns true if the room matches the filter, and the terms that match, or false otherwise.
 *
 * @param {string}       filter            the provided filter
 * @param {Set<string>}  matchingRoomTypes set of room types which are valid
 * @param {string}       shorthand         shorthand for the building the room is in
 * @param {BuildingRoom} room              the room to compare
 * @returns {SearchResult} success true if the room matches the filter, false otherwise, and all matching terms
 */
export function filterRoom(
    filter: string,
    matchingRoomTypes: Set<string>,
    shorthand: string,
    room: BuildingRoom): SearchResult {
  const matches = [];

  const roomName = `${shorthand} ${room.name}`.toUpperCase();
  if (roomName.indexOf(filter) >= 0) {
    matches.push(roomName);
  }

  const roomAltName = (Translations.getVariant('alt_name', room) || '').toUpperCase();
  if (roomAltName.indexOf(filter) >= 0) {
    matches.push(roomAltName);
  }

  if (matchingRoomTypes.has(room.type || Constants.DefaultRoomType)) {
    matches.push((room.type || Constants.DefaultRoomType).toUpperCase());
  }

  return {
    matches,
    success: matches.length > 0,
  };
}
