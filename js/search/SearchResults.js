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
 * @file SearchResults.js
 * @providesModule SearchResults
 * @description Exports the various sources the app should search and present results for.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  ListView,
  StyleSheet,
} from 'react-native';

// Type imports
import type {
  IconObject,
} from 'types';

import type {
  SearchListener,
} from 'SearchManager';

import type {
  SearchResult,
} from 'Searchable';

// Type definition for component props.
type Props = {
  initialSearch: string,
};

// Type definition for component state.
type State = {
  loaded: boolean,
  searchResults: ListView.DataSource,
  searchTerms: ?string,
};

// Imports
const Searchable = require('Searchable');
const SearchManager = require('SearchManager');

class SearchResults extends React.Component {

  /** Properties which the parent component should make available to this component. */
  static propTypes = {
    initialSearch: React.PropTypes.string,
  };

  /** Define type for the component state. */
  state: State;

  /**
   * Pass props and declares initial state.
   *
   * @param {Props} props properties passed from container to this component.
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loaded: false,
      searchResults: new ListView.DataSource({
        // TODO: Replace r1 !== r2 with r1.title !== r2.title?
        rowHasChanged: (r1, r2) => r1 !== r2,
      }),
      searchTerms: this.props.initialSearch,
    };

    (this:any)._updateSearch = this._updateSearch.bind(this);
  }

  /**
   * Replaces the default SearchListener.
   */
  componentDidMount(): void {
    this._oldDefaultSearchListener = SearchManager.getDefaultSearchListener();
    SearchManager.setDefaultSearchListener({
      onSearch: this._updateSearch,
    });

    if (!this.state.loaded) {
      this._updateSearch(this.state.searchTerms);
    }
  }

  /**
   * Restores the original default SearchListener
   */
  componentWillUnmount(): void {
    SearchManager.setDefaultSearchListener(this._oldDefaultSearchListener);
  }

  /** Stores a reference to the default search listener that was mounted before this one was applied. */
  _oldDefaultSearchListener: SearchListener;

  /** List of currently displayed search results */
  _searchResults: Array < SearchResult >;

  /**
   * Updates the results displayed of the search through the entire app.
   *
   * @param {?string} searchTerms user search query
   */
  _updateSearch(searchTerms: ?string): void {
    // TODO: narrow the search results instead of completing resetting them
    // this._searchResults = Searchable.narrowResults(this._searchResults, searchTerms);
    this._searchResults = Searchable.getResults(searchTerms);

    this.setState({
      loaded: true,
      searchResults: this.state.searchResults.cloneWithRows(this._searchResults),
      searchTerms: searchTerms,
    });
  }

  /**
   * Renders a list of search results to the screen.
   *
   * @returns {ReactElement<any>} a list of results
   */
  render(): ReactElement< any > {
    return (
      <ListView
          dataSource={this.state.searchResults}
          enableEmptySections={true}
          renderRow={Searchable.renderResult} />
    );
  }
}

// const _styles = StyleSheet.create({
// });

module.exports = SearchResults;
