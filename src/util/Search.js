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
 * @file Search.js
 * @providesModule Search
 * @description Provides methods for searching various structures in the application.
 *
 * @flow
 */

// Types
import type {
  Building,
  BuildingRoom,
  // TODO: use type GridImage,
  Language,
  StudySpot,
} from 'types';

// Imports
import * as Constants from 'Constants';
import * as Translations from 'Translations';

/** Results for a search. */
export type SearchResult = {
  success: boolean,           // True indicates a successful result, false otherwise
  matches: Array < string >,  // List of terms that matched the filter for further narrowing of results
}

/**
 * Returns true if the GridImage matches the filter, and the terms that match, or false otherwise.
 *
 * @param {Language}  language  the user's selected language
 * @param {string}    filter    the provided filter
 * @param {GridImage} gridImage the building to compare
 * @returns {SearchResult} success true if the GridImage matches the filter, false otherwise, and all matching terms
 */
export function filterGridImage(language: Language, filter: string, gridImage: any): SearchResult {
  // FIXME: Using type `any` for gridImage is a workaround for Building not extending GridImage type
  const matches = [];

  // Compare building properties to search terms to add to results
  const name = (Translations.getName(language, gridImage) || '').toUpperCase();
  if (name.indexOf(filter) >= 0) {
    matches.push(name);
  }

  const shorthand = (gridImage.shorthand || '').toUpperCase();
  if (shorthand.indexOf(filter) >= 0) {
    matches.push(shorthand);
  }

  return {
    success: matches.length > 0,
    matches,
  };
}

/**
 * Returns true if the building matches the filter, and the terms that match, or false otherwise.
 *
 * @param {Language} language the user's selected language
 * @param {string}   filter   the provided filter
 * @param {Building} building the building to compare
 * @returns {SearchResult} success true if the building matches the filter, false otherwise, and all matching terms
 */
export function filterBuilding(language: Language, filter: string, building: Building): SearchResult {
  return filterGridImage(language, filter, building);
}

/**
 * Returns true if the study spot matches the filter, and the terms that match, or false otherwise.
 *
 * @param {Language}  language the user's selected language
 * @param {string}    filter   the provided filter
 * @param {StudySpot} studySpot the spot to compare
 * @returns {SearchResult} success true if the spot matches the filter, false otherwise, and all matching terms
 */
export function filterStudySpot(language: Language, filter: string, studySpot: StudySpot): SearchResult {
  const matches = [];

  const spotName = (Translations.getName(language, studySpot) || '').toUpperCase();
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
    success: matches.length > 0,
    matches,
  };
}

/**
 * Returns true if the room matches the filter, and the terms that match, or false otherwise.
 *
 * @param {Language}     language          the user's selected language
 * @param {string}       filter            the provided filter
 * @param {Set<string>}  matchingRoomTypes set of room types which are valid
 * @param {string}       shorthand         shorthand for the building the room is in
 * @param {BuildingRoom} room              the room to compare
 * @returns {SearchResult} success true if the room matches the filter, false otherwise, and all matching terms
 */
export function filterRoom(
    language: Language,
    filter: string,
    matchingRoomTypes: Set < string >,
    shorthand: string,
    room: BuildingRoom): SearchResult {
  const matches = [];

  const roomName = `${shorthand} ${room.name}`.toUpperCase();
  if (roomName.indexOf(filter) >= 0) {
    matches.push(roomName);
  }

  const roomAltName = (Translations.getVariant(language, 'alt_name', room) || '').toUpperCase();
  if (roomAltName.indexOf(filter) >= 0) {
    matches.push(roomAltName);
  }

  if (matchingRoomTypes.has(room.type || Constants.DefaultRoomType)) {
    matches.push(room.type || Constants.DefaultRoomType);
  }

  return {
    success: matches.length > 0,
    matches,
  };
}
