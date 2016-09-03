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
 * @file Searchable.js
 * @providesModule Searchable
 * @description Exports the various sources the app should search and present results for.
 *
 * @flow
 */
'use strict';

// Type imports
import type {
  IconObject,
} from 'types';

/** Defines the information provided by a search result. */
export type SearchResult = {
  description: string,
  icon: IconObject,
  matchedTerms: Array < string >,
  title: string,
};

const Promise = require('promise');

/**
 * Gets the list of sources which specify what the app will search and how they will be searched.
 *
 * @returns {Array<Object>} list of search result sources
 */
function _getSources(): Array < Object > {
  const sources: Array < Object > = [];

  sources.push(require('SearchableBuilding'));

  return sources;
}

/**
 * Gets the results of a search by querying all search result sources.
 *
 * @param {?string} searchTerms the search terms for the query.
 * @returns {Promise<Object>} a promise which resolves with the results of the search,
 *                            with each result naming its source.
 */
export function getResults(searchTerms: ?string): Promise < Object > {
  return new Promise((resolve, reject) => {
    if (searchTerms == null || searchTerms.length === 0) {
      resolve({});
    }

    const sources: Array < Object > = _getSources();
    const sourcePromises: Array < Promise > = [];

    for (let i = 0; i < sources.length; i++) {
      sourcePromises.push(sources[i].getResults(searchTerms));
    }

    Promise.all(sourcePromises)
        .then(sourceResults => {
          const results: Object = {};
          for (let i = 0; i < sourceResults.length; i++) {
            for (const source in sourceResults[i]) {
              if (!(source in results)) {
                results[source] = [];
              }

              results[source] = results[source].concat(sourceResults[i][source]);
            }
          }

          resolve(results);
        })
        .catch(err => reject(err));
  });
}

/**
 * Takes a set of results and narrows them based on new search terms.
 *
 * @param {?string} searchTerms    the search terms for the query.
 * @param {Object} existingResults results to narrow.
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
          }
        }
      }
    }
  }

  return narrowedResults;
}
