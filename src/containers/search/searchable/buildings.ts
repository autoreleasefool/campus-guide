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
 * @created 2016-11-6
 * @file buildings.ts
 * @description Describes how buildings in the app should be searched.
 */
'use strict';

// React imports
import { Platform } from 'react-native';

// Imports
import * as Constants from '../../../constants';
import * as Display from '../../../util/Display';
import * as Translations from '../../../util/Translations';
import { filterBuilding, filterRoom } from '../../../util/Search';

// Types
import { SearchResult } from '../Searchable';
import { SearchSupport } from '../../../util/Search';
import { Section } from '../../../../typings/global';
import { Building, BuildingRoom, RoomTypeInfo } from '../../../../typings/university';

/**
 * Returns a promise containing a list of buildings which match the search terms.
 *
 * @param {string}     key         key for the results
 * @param {string}     searchTerms the search terms for the query
 * @param {Building[]} buildings   list of buildings
 * @returns {Promise<SearchResult[]>} promise which resolves with the results of the search, containing buildings
 */
async function _getBuildingResults(key: string,
                             searchTerms: string,
                             buildings: Building[]): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  for (const building of buildings) {
    const result = filterBuilding(searchTerms, building);
    if (result.success) {
      results.push({
        data: building,
        description: Translations.getName(building) || '',
        icon: {
          class: 'material',
          name: 'store',
        },
        key,
        matchedTerms: result.matches,
        title: building.shorthand,
      });
    }
  }

  return results;
}

/**
 * Returns a promise containing a list of rooms which match the search terms.
 *
 * @param {string}       key          key for the results
 * @param {string}       searchTerms  the search terms for the query
 * @param {RoomTypeInfo} roomTypeInfo info on available room types
 * @param {Building[]}   buildings    list of buildings
 * @returns {Promise<SearchResult[]>} promise which resolves with the results of the search, containing rooms
 */
async function _getRoomResults(key: string,
                         searchTerms: string,
                         roomTypeInfo: RoomTypeInfo,
                         buildings: Building[]): Promise<SearchResult[]> {
  const results: SearchResult[] = [];

  // Cache list of room types that match the search terms
  const matchingRoomTypes = new Set();
  for (const roomTypeId of roomTypeInfo.ids) {
    const roomTypeName = Translations.getName(roomTypeInfo.types[roomTypeId]);
    if (roomTypeName && roomTypeName.toUpperCase().indexOf(searchTerms) >= 0) {
      matchingRoomTypes.add(roomTypeId);
    }
  }

  buildings.forEach((building: Building) => {
    building.rooms.forEach((room: BuildingRoom) => {
      const result = filterRoom(searchTerms, matchingRoomTypes, building.shorthand, room);
      if (result.success) {
        const roomType = roomTypeInfo.types[room.type || Constants.DefaultRoomType];
        const icon = Display.getPlatformIcon(Platform.OS, roomType);
        const description = Translations.getName(roomType) || '';
        results.push({
          data: { building, shorthand: building.shorthand, room: room.name },
          description,
          icon: icon || { name: 'search', class: 'material' },
          key,
          matchedTerms: result.matches,
          title: `${building.shorthand} ${room.name}`,
        });
      }
    });
  });

  return results;
}

/**
 * Returns a promise containing a list of buildings and rooms which match the search terms.
 *
 * @param {string}                  searchTerms the search terms for the query
 * @param {SearchSupport|undefined} data        supporting data for the query
 * @returns {Promise<Section<SearchResult>[]>} promise which resolves with the results of the search,
 *                                                  containing buildings and rooms
 */
export async function getResults(
    searchTerms: string,
    data: SearchSupport | undefined): Promise<Section<SearchResult>[]> {
  if (searchTerms.length === 0) {
    return [];
  }

  const adjustedSearchTerms = searchTerms.toUpperCase();

  // Ensure proper supporting data is provided
  const roomTypeInfo = (data && data.roomTypeInfo) ? data.roomTypeInfo : undefined;
  if (!roomTypeInfo) {
    throw new Error('Must provide building search with data.roomTypeInfo');
  }

  // Ignore the case of the search terms
  const buildings: Building[] = require('../../../../assets/js/Buildings');
  const buildingTranslation = Translations.get('buildings');
  const roomTranslation = Translations.get('rooms');

  const buildingResults = await _getBuildingResults(buildingTranslation, adjustedSearchTerms, buildings);
  const roomResults = await _getRoomResults(roomTranslation, adjustedSearchTerms, roomTypeInfo, buildings);

  const sections = [{
    data: buildingResults,
    key: buildingTranslation,
  }, {
    data: roomResults,
    key: roomTranslation,
  }];

  return sections;
}

/**
 * Returns an object which maps the section names to an icon which represents it.
 *
 * @returns {any} section names mapped to icon objects
 */
export function getResultIcons(): any {
  const icons = {};
  icons[Translations.get('buildings')] = {
    icon: {
      class: 'material',
      name: 'store',
    },
  };
  icons[Translations.get('rooms')] = {
    icon: {
      class: 'material',
      name: 'room',
    },
  };

  return icons;
}
