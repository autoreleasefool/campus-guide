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

// React imports
import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// Type imports
import type {
  DefaultIcon,
  IconObject,
} from 'types';

/** Defines the information provided by a search result. */
export type SearchResult = {
  description: string,
  icon: IconObject,
  matchedTerms: Array < string >,
  title: string,
};

/** Defines the information provided by a search source.. */
export type SearchSource = {
  name: string,
  content: Object,
};

// Imports
const Constants = require('Constants');
const DisplayUtils = require('DisplayUtils');
const Ionicons = require('react-native-vector-icons/Ionicons');
const MaterialIcons = require('react-native-vector-icons/MaterialIcons');

// Size of the icon representing a result's source
const RESULT_ICON_SIZE: number = 24;

module.exports = {

  /**
   * Gets the results of a search by querying all search result sources.
   *
   * @param {?string} searchTerms the search terms for the query.
   * @returns {Array<SearchResult>} the results of the search, with each result naming its source.
   */
  getResults(searchTerms: ?string): Array< SearchResult > {
    if (searchTerms == null || searchTerms.length === 0) {
      return [];
    }

    const sources: Array< SearchSource > = this._getSources();
    const results: Array< SearchResult > = [];

    for (let i = 0; i < sources.length; i++) {
      const sourceResults: Array< SearchResult > = sources[i].content.getResults(searchTerms);
      for (let j = 0; j < sourceResults.length; j++) {
        results.push(sourceResults[j]);
      }
    }

    return results;
  },

  /**
   * Takes a set of results and narrows them based on new search terms.
   *
   * @param {?string} searchTerms                 the search terms for the query.
   * @param {Array<SearchResult>} existingResults results to narrow.
   */
  narrowResults(searchTerms: ?string, existingResults: ?Array< SearchResult >): Array< SearchResult > {
    if (existingResults == null || existingResults.length === 0 || searchTerms == null || searchTerms.length === 0) {
      return;
    }

    for (let i = existingResults.length - 1; i >= 0; i--) {
      let stillMatches: boolean = false;
      for (let j = 0; j < existingResults[i].matchedTerms.length; j++) {
        if (existingResults[i].matchedTerms[j].indexOf(searchTerms) >= 0) {
          stillMatches = true;
        }
      }

      if (!stillMatches) {
        existingResults.splice(i, 1);
      }
    }
  },

  /**
   * Gets the list of sources which specify what the app will search and how they will be searched.
   *
   * @returns {Array<SearchSource>} list of search result sources
   */
  _getSources(): Array< SearchSource > {
    const sources: Array< SearchSource > = [];

    sources.push({
      name: 'SearchableBuilding',
      content: require('SearchableBuilding'),
    });

    return sources;
  },

  /**
   * Renders a search result based on its source.
   *
   * @param {SearchResult} result the result and its source to render
   * @returns {?ReactElement<any>} a view describing the result, or null
   */
  renderResult(result: SearchResult): ?ReactElement< any > {

    // Construct the icon view for the result
    const iconObject: ?DefaultIcon = DisplayUtils.getPlatformIcon(Platform.OS, result);
    let iconView: ?ReactElement<any> = null;
    if (iconObject != null) {
      if (iconObject.class === 'material') {
        iconView = (
          <MaterialIcons
              color={Constants.Colors.primaryWhiteText}
              name={iconObject.name}
              size={RESULT_ICON_SIZE}
              style={_styles.icon} />
        );
      } else {
        iconView = (
          <Ionicons
              color={Constants.Colors.primaryWhiteText}
              name={iconObject.name}
              size={RESULT_ICON_SIZE}
              style={_styles.icon} />
        );
      }
    }

    return (
      <View style={[_styles.result, {}]}>
        {iconView}
        <View style={_styles.text}>
          <Text style={_styles.title}>{result.title}</Text>
          <Text style={_styles.body}>{result.description}</Text>
        </View>
      </View>
    );
  },
};

const _styles = StyleSheet.create({
  result: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 10,
    marginTop: 10,
  },
  text: {
    flexDirection: 'column',
  },
  title: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Text.Large,
  },
  body: {
    color: Constants.Colors.secondaryWhiteText,
    fontSize: Constants.Text.Medium,
  },
  icon: {
    margin: 10,
  },
});
