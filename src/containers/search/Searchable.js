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
 * @file Searchable.js
 * @description Exports the various sources the app should search and present results for.
 *
 * @flow
 */
'use strict';

// Types
import type { Language, PlatformIcon, Section } from 'types';

/** Defines the information provided by a search result. */
export type SearchResult = {
  description: string,            // Description of the result
  data: any,                      // Additional data for displaying the result if selected
  key: string,                    // Key for the section the result belongs to
  icon: PlatformIcon,             // Icon describing the result type
  matchedTerms: Array < string >, // Terms that should be used to narrow the result further
  title: string,                  // Title of the result
};

/** The object returned with the search results, and the icons for those results/ */
export type ResultData = {
  results: Array < Section < SearchResult > >,
  icons: Object,
}

// Imports
import Promise from 'promise';
import * as ArrayUtils from 'ArrayUtils';

/**
 * Gets the list of sources which specify what the app will search and how they will be searched.
 *
 * @returns {Array<Object>} list of search result sources
 */
function _getSources(): Array < Object > {
  const sources: Array < Object > = [];

  sources.push(require('./searchable/buildings'));
  sources.push(require('./searchable/links'));
  sources.push(require('./searchable/studySpots'));

  return sources;
}

/**
 * Gets the results of a search by querying all search result sources.
 *
 * @param {Language} language    the current language
 * @param {?string}  searchTerms the search terms for the query.
 * @returns {Promise<Object>} a promise which resolves with the results of the search,
 *                            with each result naming its source.
 */
export function getResults(language: Language, searchTerms: ?string): Promise < Object > {
  return new Promise((resolve, reject) => {
    if (searchTerms == null || searchTerms.length === 0) {
      resolve({ results: [], icons: {}});
    }

    const sources: Array < Object > = _getSources();
    const sourcePromises: Array < Promise > = [];
    let sourceIcons: Object = {};

    for (let i = 0; i < sources.length; i++) {
      sourceIcons = {
        ...sourceIcons,
        ...sources[i].getResultIcons(language),
      };

      sourcePromises.push(sources[i].getResults(language, searchTerms));
    }

    Promise.all(sourcePromises)
        .then((sourceResults: Array < Object >) => {
          const results: Array < Section < SearchResult > > = [];
          for (let i = 0; i < sourceResults.length; i++) {
            for (let j = 0; j < sourceResults[i].length; j++) {
              if (sourceResults[i][j].data.length === 0) {
                continue;
              }

              const position = ArrayUtils.linearSearchObjectArrayByKeyValue(results, 'key', sourceResults[i][j].key);
              if (position < 0) {
                results.push(sourceResults[i][j]);
              } else {
                results[position].data.concat(sourceResults[i][j].data);
              }

            }
          }

          resolve({ results, icons: sourceIcons });
        })
        .catch((err: any) => reject(err));
  });
}

/**
 * Takes a set of results and narrows them based on new search terms.
 *
 * @param {?string}                      searchTerms     the search terms for the query.
 * @param {Array<Section<SearchResult>>} existingResults results to narrow
 * @returns {Array<Section<SearchResult>>} the narrowed results
 */
export function narrowResults(searchTerms: ?string, existingResults: Array < Section < SearchResult > >):
      Array < Section < SearchResult > > {
  if (existingResults == null || searchTerms == null || searchTerms.length === 0) {
    return [];
  }

  // Get case-insensitive results
  const adjustedSearchTerms: string = searchTerms.toUpperCase();
  const narrowedResults: Array < Section < SearchResult > > = [];

  for (let i = 0; i < existingResults.length; i++) {
    let position = ArrayUtils.linearSearchObjectArrayByKeyValue(narrowedResults, 'key', existingResults[i].key);
    for (let j = 0; j < existingResults[i].data.length; j++) {
      const terms = existingResults[i].data[j].matchedTerms;
      for (let k = 0; k < terms.length; k++) {
        if (terms[k].indexOf(adjustedSearchTerms) >= 0) {
          if (position <= 0) {
            narrowedResults.push({
              key: existingResults[i].key,
              data: [],
            });
            position = narrowedResults.length - 1;
          }

          narrowedResults[position].data.push(existingResults[i].data[j]);
          break;
        }
      }
    }
  }

  return narrowedResults;
}
