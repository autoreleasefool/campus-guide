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
 * @created 2016-11-12
 * @file Searchable.js
 * @description Exports the various sources the app should search and present results for.
 *
 * @flow
 */
'use strict';

// Type imports
import type {
  Language,
  PlatformIcon,
} from 'types';

/** Defines the information provided by a search result. */
export type SearchResult = {
  description: string,            // Description of the result
  icon: PlatformIcon,             // Icon describing the result type
  matchedTerms: Array < string >, // Terms that should be used to narrow the result further
  title: string,                  // Title of the result
};

// Imports
import Promise from 'promise';

/**
 * Gets the list of sources which specify what the app will search and how they will be searched.
 *
 * @returns {Array<Object>} list of search result sources
 */
function _getSources(): Array < Object > {
  const sources: Array < Object > = [];

  sources.push(require('./searchable/building'));

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
      resolve({results: {}, icons: {}});
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
          const results: Object = {};
          for (let i = 0; i < sourceResults.length; i++) {
            for (const source in sourceResults[i]) {
              if (sourceResults[i][source].length === 0) {
                continue;
              }

              if (!(source in results)) {
                results[source] = [];
              }

              results[source] = results[source].concat(sourceResults[i][source]);
            }
          }

          resolve({results, icons: sourceIcons});
        })
        .catch((err: any) => reject(err));
  });
}

/**
 * Takes a set of results and narrows them based on new search terms.
 *
 * @param {?string} searchTerms     the search terms for the query.
 * @param {Object}  existingResults results to narrow.
 * @returns {Object} the narrowed results
 */
export function narrowResults(searchTerms: ?string, existingResults: Object): Object {
  if (existingResults == null || searchTerms == null || searchTerms.length === 0) {
    return {};
  }

  // Get case-insensitive results
  const adjustedSearchTerms: string = searchTerms.toUpperCase();
  const narrowedResults: Object = {};

  for (const source in existingResults) {
    if (existingResults.hasOwnProperty(source)) {
      for (let i = 0; i < existingResults[source].length; i++) {
        const totalTerms = existingResults[source][i].matchedTerms.length;
        for (let j = 0; j < totalTerms; j++) {
          if (existingResults[source][i].matchedTerms[j].indexOf(adjustedSearchTerms) >= 0) {
            if (!(source in narrowedResults)) {
              narrowedResults[source] = [];
            }

            narrowedResults[source].push(existingResults[source][i]);
            break;
          }
        }
      }
    }
  }

  return narrowedResults;
}
