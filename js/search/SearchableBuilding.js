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
 * @file SearchableBuilding.js
 * @providesModule SearchableBuilding
 * @description Describes how the buildings in the app should be searched.
 *
 * @flow
 */
'use strict';

// Type imports
import type {
  Language,
} from 'types';

// Imports
const TranslationUtils = require('TranslationUtils');
const Preferences = require('Preferences');

// Section name for buildings
const BUILDINGS_SECTION: string = 'Buildings';
// Section name for rooms
const ROOMS_SECTION: string = 'Rooms';

module.exports = {

  /**
   * Returns a list of buildings which match the search terms.
   *
   * @param {?string} searchTerms the search terms for the query.
   * @returns {Object} the results of the search, containing buildings and rooms
   */
  getResults(searchTerms: ?string): Object {
    if (searchTerms == null || searchTerms.length === 0) {
      return {};
    }

    // Cache the language
    const language: Language = Preferences.getSelectedLanguage();

    // Ignore the case of the search terms
    const adjustedSearchTerms: string = searchTerms.toUpperCase();
    const buildings: Array < Object > = require('../../assets/js/Buildings');
    const results: Object = {};

    for (let i = 0; i < buildings.length; i++) {
      const translated: boolean = !('name' in buildings[i]);
      const name: string = TranslationUtils.getTranslatedName(language, buildings[i]) || '';

      // Compare building properties to search terms to add to results
      if ((!translated && buildings[i].name.toUpperCase().indexOf(adjustedSearchTerms) >= 0)
          || (translated && (buildings[i].name_en.toUpperCase().indexOf(adjustedSearchTerms) >= 0
          || buildings[i].name_fr.toUpperCase().indexOf(adjustedSearchTerms) >= 0))
          || buildings[i].code.toUpperCase().indexOf(adjustedSearchTerms) >= 0) {
        if (!(BUILDINGS_SECTION in results)) {
          results[BUILDINGS_SECTION] = [];
        }

        results[BUILDINGS_SECTION].push({
          description: name,
          icon: {
            name: 'store',
            class: 'material',
          },
          matchedTerms: (translated)
              ? [
                buildings[i].code.toUpperCase(),
                buildings[i].name_fr.toUpperCase(),
                buildings[i].name_en.toUpperCase(),
              ]
              : [
                buildings[i].code.toUpperCase(),
                buildings[i].name.toUpperCase(),
              ],
          title: buildings[i].code,
        });
      }

      // Search the rooms in the building and add them to results as well
      for (let j = 0; j < buildings[i].rooms.length; j++) {
        const room = buildings[i].rooms[j];
        if (room.name.toUpperCase().indexOf(adjustedSearchTerms) >= 0) {
          if (!(ROOMS_SECTION in results)) {
            results[ROOMS_SECTION] = [];
          }

          results[ROOMS_SECTION].push({
            description: name, // TODO: change depending on room type
            icon: {
              name: 'local-library', // TODO: change depending on room type
              class: 'material',
            },
            matchedTerms: [room.name.toUpperCase()],
            title: room.name,
          });
        }
      }
    }

    return results;
  },
};
