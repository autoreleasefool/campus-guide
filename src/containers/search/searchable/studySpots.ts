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
 * @file studySpots.ts
 * @description Describes how study spots in the app should be searched.
 */
'use strict';

// Imports
import * as Translations from '../../../util/Translations';
import { filterStudySpot } from '../../../util/Search';

// Types
import { SearchResult } from '../Searchable';
import { SearchSupport } from '../../../util/Search';
import { Language } from '../../../util/Translations';
import { Section } from '../../../../typings/global';
import { StudySpot, StudySpotInfo } from '../../../../typings/university';

/**
 * Returns a promise containing a list of external links and categories which match the search terms.
 *
 * @param {Language}      language    the current language
 * @param {string}        searchTerms the search terms for the query
 * @param {StudySpotInfo} studySpots  study spot informaation
 * @returns {Promise<Section<SearchResult[]>>} promise which resolves with the results of the search,
 *                                         containing study spots
 */
async function _getResults(language: Language,
                     searchTerms: string,
                     studySpots: StudySpotInfo): Promise<Section<SearchResult>[]> {
  const matchedSpots: SearchResult[] = [];
  const studySpotsTranslation = Translations.get(language, 'study_spots');

  studySpots.spots.forEach((studySpot: StudySpot) => {
    const result = filterStudySpot(language, searchTerms, studySpot);
    if (result.success) {
      matchedSpots.push({
        data: { shorthand: studySpot.building, room: studySpot.room },
        description: Translations.getDescription(language, studySpot) || '',
        icon: { name: 'import-contacts', class: 'material' },
        key: studySpotsTranslation,
        matchedTerms: result.matches,
        title: `${studySpot.building} ${studySpot.room || ''}`,
      });
    }
  });

  return [{
    data: matchedSpots,
    key: studySpotsTranslation,
  }];

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
}

/**
 * Returns a promise containing a list of study spots which match the search terms.
 *
 * @param {Language}                language    the current language
 * @param {string|undefined}        searchTerms the search terms for the query
 * @param {SearchSupport|undefined} data        supporting data for the query
 * @returns {Promise<Section<SearchResult>[]>} promise which resolves with the results of the search,
 *                                             containing study spots
 */
export async function getResults(
    language: Language,
    searchTerms: string | undefined,
    data: SearchSupport | undefined): Promise<Section<SearchResult>[]> {
  if (searchTerms == undefined || searchTerms.length === 0) {
    return [];
  }

  // Ensure proper supporting data is provided
  const studySpots = (data && data.studySpots) ? data.studySpots : undefined;
  if (!studySpots) {
    throw new Error('Must provide study spots search with data.studySpots');
  }

  // Ignore the case of the search terms
  const adjustedSearchTerms: string = searchTerms.toUpperCase();
  const results = await _getResults(language, adjustedSearchTerms, studySpots);

  return results;
}

/**
 * Returns an object which maps the section names to an icon which represents it.
 *
 * @param {Language} language the current language
 * @returns {any} section names mapped to icon objects
 */
export function getResultIcons(language: Language): any {
  const icons = {};
  icons[Translations.get(language, 'study_spots')] = {
    icon: {
      class: 'material',
      name: 'import-contacts',
    },
  };

  return icons;
}
