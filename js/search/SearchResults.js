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
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// Admob imports
import {
  AdMobBanner,
} from 'react-native-admob';

// Type imports
import type {
  DefaultIcon,
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
const Constants = require('Constants');
const DisplayUtils = require('DisplayUtils');
const Ionicons = require('react-native-vector-icons/Ionicons');
const MaterialIcons = require('react-native-vector-icons/MaterialIcons');
const Searchable = require('Searchable');
const SearchManager = require('SearchManager');
const SectionHeader = require('SectionHeader');

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
        sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
      }),
      searchTerms: this.props.initialSearch,
    };

    (this:any)._updateSearch = this._updateSearch.bind(this);
  }

  /**
   * Replaces the default SearchListener.
   */
  componentDidMount(): void {
    const Tooltip = require('Tooltip');
    Tooltip.dismiss();

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
  _oldDefaultSearchListener: ?SearchListener;

  /** List of currently displayed search results */
  _searchResults: Object;

  /**
   * Outputs an error when one occurs while loading an ad.
   *
   * @param {any} err the error that occurred
   */
  _adError(err: any) {
    console.log('Error occurred while loading ad:');
    if (typeof (err) === 'object') {
      console.log(JSON.stringify(err));
    } else {
      console.log(err);
    }
  }

  /**
   * Updates the results displayed of the search through the entire app.
   *
   * @param {?string} searchTerms user search query
   */
  _updateSearch(searchTerms: ?string): void {
    if (this.state.loaded
        && this.state.searchTerms != null && this.state.searchTerms.length > 0
        && searchTerms != null && searchTerms.length > 0
        && searchTerms.indexOf(this.state.searchTerms) >= 0) {
      this._searchResults = Searchable.narrowResults(searchTerms, this._searchResults);
      this.setState({
        loaded: true,
        searchResults: this.state.searchResults.cloneWithRowsAndSections(this._searchResults),
        searchTerms: searchTerms,
      });
    } else {
      Searchable.getResults(searchTerms)
          .then(results => {
            this._searchResults = results;
            this.setState({
              loaded: true,
              searchResults: this.state.searchResults.cloneWithRowsAndSections(this._searchResults),
              searchTerms: searchTerms,
            });
          })
          .catch(err => console.log('Could not get search results.', err));
    }
  }

  /**
   * Renders a search result based on its source.
   *
   * @param {SearchResult} result the result and its source to render
   * @returns {?ReactElement<any>} a view describing the result, or null
   */
  _renderResult(result: SearchResult): ?ReactElement < any > {
    // Construct the icon view for the result
    const iconObject: ?DefaultIcon = DisplayUtils.getPlatformIcon(Platform.OS, result);
    let iconView: ?ReactElement < any > = null;
    if (iconObject != null) {
      if (iconObject.class === 'material') {
        iconView = (
          <MaterialIcons
              color={Constants.Colors.primaryWhiteText}
              name={iconObject.name}
              size={Constants.Icon.Medium}
              style={_styles.icon} />
        );
      } else {
        iconView = (
          <Ionicons
              color={Constants.Colors.primaryWhiteText}
              name={iconObject.name}
              size={Constants.Icon.Medium}
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
  }

  /**
   * Renders a heading for a set of search results from a source.
   *
   * @param {Object} sectionData section contents
   * @param {string} sectionName name of the source.
   * @returns {ReactElement<any>} a {SectionHeader} with the name of the source.
   */
  _renderSource(sectionData: Object, sectionName: string): ReactElement < any > {
    return (
      <View style={{backgroundColor: Constants.Colors.garnet}}>
        <SectionHeader sectionName={sectionName} />
      </View>
    );
  }

  /**
   * Renders a list of search results to the screen.
   *
   * @returns {ReactElement<any>} a list of results
   */
  render(): ReactElement < any > {
    const env = require('env');

    let results = null;
    if (this.state.searchTerms == null) {
      results = (
        <View style={_styles.container}>
          <Text>{'No search results'}</Text>
        </View>
      );
    } else {
      results = (
        <ListView
            dataSource={this.state.searchResults}
            enableEmptySections={true}
            renderRow={this._renderResult}
            renderSectionHeader={this._renderSource} />
      );
    }

    return (
      <View style={_styles.container}>
        {results}
        <AdMobBanner
            adUnitID={env.admob_unit_ids.search}
            bannerSize='smartBannerPortrait'
            didFailToReceiveAdWithError={this._adError.bind(this)}
            testDeviceID='EMULATOR' />
      </View>
    );
  }
}

const _styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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


module.exports = SearchResults;
