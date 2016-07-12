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

// React imports
import React from 'react';
import {
  View,
} from 'react-native';

// Type imports
import type {
  Building,
} from '../types';

import type {
  SearchResult,
} from './Searchable';

module.exports = {

  /**
   * Returns a list of buildings which match the search terms.
   *
   * @param {?string} searchTerms the search terms for the query.
   * @returns {Array<SearchResult>} the results of the search, containing buildings
   */
  getResults(searchTerms: ?string): Array< SearchResult > {
    if (searchTerms == null || searchTerms.length === 0) {
      return [];
    }

    // Ignore the case of the search terms
    const adjustedSearchTerms: string = searchTerms.toUpperCase();
    console.log('adjusted: ' + adjustedSearchTerms);
    const buildings: Array<Building> = require('../../assets/js/Buildings');
    const results: Array<SearchResult> = [];

    for (let i = 0; i < buildings.length; i++) {
      console.log('Building code: ' + buildings[i].code);
      const translated: boolean = !('name' in buildings[i]);

      if ((!translated && buildings[i].name.toUpperCase().indexOf(adjustedSearchTerms) >= 0)
          || (translated && (buildings[i].name_en.toUpperCase().indexOf(adjustedSearchTerms) >= 0
          || buildings[i].name_fr.toUpperCase().indexOf(adjustedSearchTerms) >= 0))
          || buildings[i].code.toUpperCase().indexOf(adjustedSearchTerms) >= 0) {
        console.log('Building accepted: ' + buildings[i].code);
        results.push({
          description: buildings[i].name,
          icon: {
            name: 'store',
            class: 'material',
          },
          matchedTerms: (translated) ? buildings[i].name_fr + buildings[i].name_en : buildings[i].name,
          title: buildings[i].code,
        });
      }
    }

    return results;
  },
};
