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
 * @created 2017-03-14
 * @file studySpots.js
 * @description Describes how study spots in the app should be searched.
 *
 * @flow
 */
'use strict';

// Types
import type { Language, StudySpotInfo } from 'types';
import type { SearchResult } from '../Searchable';

// Imports
import Promise from 'promise';
import * as Configuration from 'Configuration';
import * as Translations from 'Translations';

/**
 * Returns a promise containing a list of external links and categories which match the search terms.
 *
 * @param {Language}      language    the current language
 * @param {string}        searchTerms the search terms for the query.
 * @param {StudySpotInfo} studySpots  study spot informaation
 * @returns {Promise<Object>} promise which resolves with the results of the search, containing study spots
 */
function _getResults(language: Language,
                     searchTerms: string,
                     studySpots: StudySpotInfo): Promise < Object > {
  return new Promise((resolve) => {
    const matchedSpots: Array < SearchResult > = [];

    // Returns true if the two sorted arrays have at least one matching element
    // const hasAnyMatchingElements = (a, b) => {
    //   const aLength = a.length;
    //   const bLength = b.length;
    //   let aIdx = 0;
    //   let bIdx = 0;
    //   while (aIdx < aLength && bIdx < bLength) {
    //     if (a[aIdx] === b[bIdx]) {
    //       return true;
    //     } else if (a[aIdx] < b[bIdx]) {
    //       aIdx += 1;
    //     } else {
    //       bIdx += 1;
    //     }
    //   }
    //   return false;
    // }

    // Cache list of filters that match the search terms
    // const matchingFilters = [];
    // for (let i = 0; i < studySpots.filters.length; i++) {
    //   const filterName = Translations.getName(language, studySpots.filters[i]);
    //   if (filterName != null && filterName.toUpperCase().indexOf(searchTerms) >= 0) {
    //     matchingFilters.push(i);
    //   }
    // }

    for (let i = 0; i < studySpots.spots.length; i++) {
      const spot = studySpots.spots[i];
      const spotName = Translations.getName(language, spot) || '';

      if (spotName.toUpperCase().indexOf(searchTerms) >= 0
          || spot.building.toUpperCase().indexOf(searchTerms) >= 0
          || spot.room.indexOf(searchTerms) >= 0) {
        matchedSpots.push({
          description: Translations.getVariant(language, 'description', spot) || '',
          data: { code: spot.building, room: spot.room },
          icon: { name: 'import-contacts', class: 'material' },
          matchedTerms: [ spotName.toUpperCase(), spot.building.toUpperCase(), spot.room ],
          title: `${spot.building} ${spot.room}`,
        });
      }
    }

    const results = {};
    results[Translations.get(language, 'study_spots')] = matchedSpots;
    resolve(results);
  });
}

/**
 * Returns a promise containing a list of study spots which match the search terms.
 *
 * @param {Language} language    the current language
 * @param {?string}  searchTerms the search terms for the query.
 * @returns {Promise<Object>} promise which resolves with the results of the search, containing study spots
 */
export function getResults(language: Language, searchTerms: ?string): Promise < Object > {
  return new Promise((resolve, reject) => {
    if (searchTerms == null || searchTerms.length === 0) {
      resolve({});
      return;
    }

    // Ignore the case of the search terms
    const adjustedSearchTerms: string = searchTerms.toUpperCase();

    Configuration.init()
        .then(() => Configuration.getConfig('/study_spots.json'))
        .then((studySpots: StudySpotInfo) => _getResults(language, adjustedSearchTerms, studySpots))
        .then((results: Array < Object >) => resolve(results))
        .catch((err: any) => {
          console.error('Configuration could not be initialized for study spot search.', err);
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
  icons[Translations.get(language, 'study_spots')] = {
    icon: {
      class: 'material',
      name: 'import-contacts',
    },
  };

  return icons;
}
