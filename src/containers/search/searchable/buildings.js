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
 * @created 2016-11-6
 * @file buildings.js
 * @description Describes how buildings in the app should be searched.
 *
 * @flow
 */
'use strict';

// React imports
import { Platform } from 'react-native';

// Types
import type { Building, BuildingRoom, Language, RoomTypeInfo, SearchSupport, Section } from 'types';
import type { SearchResult } from '../Searchable';

// Imports
import Promise from 'promise';
import * as Constants from 'Constants';
import * as DisplayUtils from 'DisplayUtils';
import * as Translations from 'Translations';
import { filterBuilding, filterRoom } from 'Search';

/**
 * Returns a promise containing a list of buildings which match the search terms.
 *
 * @param {string}          key         key for the results
 * @param {Language}        language    the current language
 * @param {string}          searchTerms the search terms for the query
 * @param {Array<Building>} buildings   list of buildings
 * @returns {Promise<Array<SearchResult>>} promise which resolves with the results of the search, containing buildings
 */
function _getBuildingResults(key: string,
                             language: Language,
                             searchTerms: string,
                             buildings: Array < Building >): Promise < Array < SearchResult > > {
  return new Promise((resolve) => {
    const results: Array < SearchResult > = [];

    for (let i = 0; i < buildings.length; i++) {
      const result = filterBuilding(language, searchTerms, buildings[i]);
      if (result.success) {
        results.push({
          key,
          description: Translations.getName(language, buildings[i]) || '',
          data: buildings[i],
          icon: {
            name: 'store',
            class: 'material',
          },
          matchedTerms: result.matches,
          title: buildings[i].shorthand,
        });
      }
    }

    resolve(results);
  });
}

/**
 * Returns a promise containing a list of rooms which match the search terms.
 *
 * @param {string}          key          key for the results
 * @param {Language}        language     the current language
 * @param {string}          searchTerms  the search terms for the query
 * @param {RoomTypeInfo}    roomTypeInfo info on available room types
 * @param {Array<Building>} buildings    list of buildings
 * @returns {Promise<Array<SearchResult>>} promise which resolves with the results of the search, containing rooms
 */
function _getRoomResults(key:string,
                         language: Language,
                         searchTerms: string,
                         roomTypeInfo: RoomTypeInfo,
                         buildings: Array < Building >): Promise < Array < SearchResult > > {
  return new Promise((resolve) => {
    const results: Array < SearchResult > = [];

    // Cache list of room types that match the search terms
    const matchingRoomTypes = new Set();
    for (let i = 0; i < roomTypeInfo.ids.length; i++) {
      const id = roomTypeInfo.ids[i];
      const roomTypeName = Translations.getName(language, roomTypeInfo.types[id]);
      if (roomTypeName && roomTypeName.toUpperCase().indexOf(searchTerms) >= 0) {
        matchingRoomTypes.add(id);
      }
    }

    buildings.forEach((building: Building) => {
      building.rooms.forEach((room: BuildingRoom) => {
        const result = filterRoom(language, searchTerms, matchingRoomTypes, building.shorthand, room);
        if (result.success) {
          const roomType = roomTypeInfo.types[room.type || Constants.DefaultRoomType];
          const icon = DisplayUtils.getPlatformIcon(Platform.OS, roomType);
          const description = Translations.getName(language, roomType) || '';
          results.push({
            key,
            description,
            data: { building: building, shorthand: building.shorthand, room: room.name },
            icon: icon || { name: 'search', class: 'material' },
            matchedTerms: result.matches,
            title: `${building.shorthand} ${room.name}`,
          });
        }
      });
    });

    resolve(results);
  });
}

/**
 * Returns a promise containing a list of buildings and rooms which match the search terms.
 *
 * @param {Language}       language    the current language
 * @param {?string}        searchTerms the search terms for the query
 * @param {?SearchSupport} data        supporting data for the query
 * @returns {Promise<Array<Section<SearchResult>>>} promise which resolves with the results of the search,
 *                                                  containing buildings and rooms
 */
export function getResults(language: Language, searchTerms: ?string, data: ?SearchSupport):
    Promise < Array < Section < SearchResult > > > {
  return new Promise((resolve, reject) => {
    if (searchTerms == null || searchTerms.length === 0) {
      resolve([]);
      return;
    }

    // Ensure proper supporting data is provided
    const roomTypeInfo = (data && data.roomTypeInfo) ? data.roomTypeInfo : null;
    if (!roomTypeInfo) {
      reject(new Error('Must provide building search with data.roomTypeInfo'));
      return;
    }

    // Ignore the case of the search terms
    const adjustedSearchTerms: string = searchTerms.toUpperCase();
    const buildings: Array < Building > = require('../../../../assets/js/Buildings');

    const buildingTranslation = Translations.get(language, 'buildings');
    const roomTranslation = Translations.get(language, 'rooms');

    Promise.all([
      _getBuildingResults(buildingTranslation, language, adjustedSearchTerms, buildings),
      _getRoomResults(roomTranslation, language, adjustedSearchTerms, roomTypeInfo, buildings),
    ])
        .then((results: Array < Object >) => {
          const sections = [];
          sections.push({
            key: buildingTranslation,
            data: results[0],
          });
          sections.push({
            key: roomTranslation,
            data: results[1],
          });

          resolve(sections);
        })
        .catch((err: any) => {
          console.error('Could not complete building search.');
          reject(err);
        });
  });
}

/**
 * Returns an object which maps the section names to an icon which represents it.
 *
 * @param {Language} language the current language
 * @returns {Object} section names mapped to icon objects
 */
export function getResultIcons(language: Language): Object {
  const icons = {};
  icons[Translations.get(language, 'buildings')] = {
    icon: {
      class: 'material',
      name: 'store',
    },
  };
  icons[Translations.get(language, 'rooms')] = {
    icon: {
      class: 'material',
      name: 'room',
    },
  };

  return icons;
}
