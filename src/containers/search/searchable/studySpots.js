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
import type { Language, SearchSupport, Section, StudySpot, StudySpotInfo } from 'types';
import type { SearchResult } from '../Searchable';

// Imports
import Promise from 'promise';
import * as Translations from 'Translations';
import { filterStudySpot } from 'Search';

/**
 * Returns a promise containing a list of external links and categories which match the search terms.
 *
 * @param {Language}      language    the current language
 * @param {string}        searchTerms the search terms for the query
 * @param {StudySpotInfo} studySpots  study spot informaation
 * @returns {Promise<Array<SearchResult>>} promise which resolves with the results of the search,
 *                                         containing study spots
 */
function _getResults(language: Language,
                     searchTerms: string,
                     studySpots: StudySpotInfo): Promise < Array < Section < SearchResult > > > {
  return new Promise((resolve) => {
    const matchedSpots: Array < SearchResult > = [];

    const studySpotsTranslation = Translations.get(language, 'study_spots');

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

    studySpots.spots.forEach((studySpot: StudySpot) => {
      const result = filterStudySpot(language, searchTerms, studySpot);
      if (result.success) {
        matchedSpots.push({
          key: studySpotsTranslation,
          description: Translations.getDescription(language, studySpot) || '',
          data: { shorthand: studySpot.building, room: studySpot.room },
          icon: { name: 'import-contacts', class: 'material' },
          matchedTerms: result.matches,
          title: `${studySpot.building} ${studySpot.room || ''}`,
        });
      }
    });

    resolve([{
      key: studySpotsTranslation,
      data: matchedSpots,
    }]);
  });
}

/**
 * Returns a promise containing a list of study spots which match the search terms.
 *
 * @param {Language}       language    the current language
 * @param {?string}        searchTerms the search terms for the query
 * @param {?SearchSupport} data        supporting data for the query
 * @returns {Promise<Array<Section<SearchResult>>>} promise which resolves with the results of the search,
 *                                                  containing study spots
 */
export function getResults(language: Language, searchTerms: ?string, data: ?SearchSupport):
    Promise < Array < Section < SearchResult > > > {
  return new Promise((resolve, reject) => {
    if (searchTerms == null || searchTerms.length === 0) {
      resolve([]);
      return;
    }

    // Ensure proper supporting data is provided
    const studySpots = (data && data.studySpots) ? data.studySpots : null;
    if (!studySpots) {
      reject(new Error('Must provide study spots search with data.studySpots'));
      return;
    }

    // Ignore the case of the search terms
    const adjustedSearchTerms: string = searchTerms.toUpperCase();

    _getResults(language, adjustedSearchTerms, studySpots)
        .then((results: Array < Section < SearchResult > >) => resolve(results))
        .catch((err: any) => {
          console.error('Could not complete study spot search.', err);
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
