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
 * @created 2016-11-12
 * @file Searchable.ts
 * @description Exports the various sources the app should search and present results for.
 */
'use strict';

// Imports
import * as Arrays from '../../util/Arrays';

// Types
import { SearchSupport } from '../../util/Search';
import { Language } from '../../util/Translations';
import { Icon, Section } from '../../../typings/global';

/** Defines the information provided by a search result. */
export interface SearchResult {
  description: string;     // Description of the result
  data: any;               // Additional data for displaying the result if selected
  key: string;             // Key for the section the result belongs to
  icon: Icon | undefined;  // Icon describing the result type
  matchedTerms: string[];  // Terms that should be used to narrow the result further
  title: string;           // Title of the result
}

/** The object returned with the search results, and the icons for those results/ */
export interface ResultData {
  results: Section<SearchResult>[];
  icons: any;
}

/**
 * Gets the list of sources which specify what the app will search and how they will be searched.
 *
 * @returns {any[]} list of search result sources
 */
function _getSources(): any[] {
  const sources = [];

  sources.push(require('./searchable/buildings'));
  sources.push(require('./searchable/links'));
  sources.push(require('./searchable/studySpots'));

  return sources;
}

/**
 * Gets the results of a search by querying all search result sources.
 *
 * @param {Language}                language    the current language
 * @param {string}                  searchTerms the search terms for the query
 * @param {SearchSupport|undefined} supportData data to support searches
 * @returns {Promise<any>} a promise which resolves with the results of the search,
 *                            with each result naming its source.
 */
export function getResults(
    language: Language,
    searchTerms: string,
    supportData: SearchSupport | undefined): Promise<any> {
  return new Promise((resolve: (r: ResultData) => void, reject: (err: any) => void): void => {
    if (searchTerms.length === 0) {
      resolve({ results: [], icons: {} });
    }

    const sources = _getSources();
    const sourcePromises: Promise<any>[] = [];
    let sourceIcons: any = {};

    for (const source of sources) {
      sourceIcons = {
        ...sourceIcons,
        ...source.getResultIcons(language),
      };

      sourcePromises.push(source.getResults(language, searchTerms, supportData));
    }

    Promise.all(sourcePromises)
        .then((sourceResults: any[]) => {
          const results: Section<SearchResult>[] = [];
          for (const sourceResult of sourceResults) {
            for (const resultSet of sourceResult) {
              if (resultSet.data.length === 0) {
                continue;
              }

              const position = Arrays.linearSearchObjectArrayByKeyValue(results, 'key', resultSet.key);
              if (position < 0) {
                results.push(resultSet);
              } else {
                results[position].data.concat(resultSet.data);
              }
            }
          }

          resolve({ results, icons: sourceIcons });
        })
        .catch(reject);
  });
}

/**
 * Takes a set of results and narrows them based on new search terms.
 *
 * @param {string}                  searchTerms     the search terms for the query
 * @param {Section<SearchResult>[]} existingResults results to narrow
 * @returns {Section<SearchResult>[]} the narrowed results
 */
export function narrowResults(
    searchTerms: string,
    existingResults: Section<SearchResult>[]): Section<SearchResult>[] {
  if (existingResults == undefined || searchTerms.length === 0) {
    return [];
  }

  // Get case-insensitive results
  const adjustedSearchTerms = searchTerms.toUpperCase();
  const narrowedResults: Section<SearchResult>[] = [];

  for (const existingResult of existingResults) {
    let position = Arrays.linearSearchObjectArrayByKeyValue(narrowedResults, 'key', existingResult.key);
    for (const data of existingResult.data) {
      const terms = data.matchedTerms;
      for (const term of terms) {
        if (term.indexOf(adjustedSearchTerms) >= 0) {
          if (position < 0) {
            narrowedResults.push({
              data: [],
              key: existingResult.key,
            });
            position = narrowedResults.length - 1;
          }

          narrowedResults[position].data.push(data);
          break;
        }
      }
    }
  }

  return narrowedResults;
}
