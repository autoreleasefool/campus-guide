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
 * @created 2016-11-6
 * @file Search.js
 * @description Presents search results to the user.
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

// Redux imports
import {connect} from 'react-redux';
// import {
// } from 'actions';

// Admob imports
import {
  AdMobBanner,
} from 'react-native-admob';

// Type imports
import type {
  Icon,
  Language,
} from 'types';

// Type definition for component props
type Props = {
  filter: ?string,    // Search terms
  language: Language, // The current language, selected by the user
};

// Type definition for component state
type State = {
  anyResults: boolean,                // False if no search results were returned
  searchResults: ListView.DataSource, // List of search results
};

// Imports
import Header from 'Header';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as Constants from 'Constants';
import * as DisplayUtils from 'DisplayUtils';
import * as Searchable from './Searchable';
import * as TranslationUtils from 'TranslationUtils';

class Search extends React.Component {

  /**
   * Properties this component expects to be provided by its parent.
   */
  props: Props;

  /**
   * Current state of the component.
   */
  state: State;

  /**
   * Pass props and declares initial state.
   *
   * @param {Props} props properties passed from container to this component.
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      anyResults: false,
      searchResults: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
        sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
      }),
    };
  }

  /**
   * Retrieve the search results.
   */
  componentWillMount(): void {
    this._updateSearch(this.props.filter);
  }

  /**
   * Update the search results.
   *
   * @param {Props} nextProps updated props
   */
  componentWillReceiveProps(nextProps: Props): void {
    this._updateSearch(nextProps.filter);
  }

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
    if (this.props.filter != null && this.props.filter.length > 0
        && searchTerms != null && searchTerms.length > 0
        && searchTerms.indexOf(this.props.filter) >= 0) {
      this._searchResults = Searchable.narrowResults(searchTerms, this._searchResults);
      this.setState({
        anyResults: this._searchResults != null && Object.keys(this._searchResults).length > 0,
        searchResults: this.state.searchResults.cloneWithRowsAndSections(this._searchResults),
      });
    } else {
      Searchable.getResults(this.props.language, searchTerms)
          .then((results: Object) => {
            console.log(`Results: ${JSON.stringify(results)}`);
            this._searchResults = results;
            this.setState({
              anyResults: this._searchResults != null && Object.keys(this._searchResults).length > 0,
              searchResults: this.state.searchResults.cloneWithRowsAndSections(this._searchResults),
            });
          })
          .catch((err: any) => console.log('Could not get search results.', err));
    }
  }

  /**
   * Renders a search result based on its source.
   *
   * @param {SearchResult} result the result and its source to render
   * @returns {?ReactElement<any>} a view describing the result, or null
   */
  _renderResult(result: Searchable.SearchResult): ?ReactElement < any > {
    // Construct the icon view for the result
    const icon: ?Icon = DisplayUtils.getPlatformIcon(Platform.OS, result);
    let iconView: any = null;

    if (icon != null) {
      if (icon.class === 'material') {
        iconView = (
          <MaterialIcons
              color={Constants.Colors.primaryWhiteIcon}
              name={icon.name}
              size={Constants.Sizes.Icons.Medium}
              style={_styles.icon} />
        );
      } else {
        iconView = (
          <Ionicons
              color={Constants.Colors.primaryWhiteIcon}
              name={icon.name}
              size={Constants.Sizes.Icons.Medium}
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
      <View style={{backgroundColor: Constants.Colors.primaryBackground}}>
        <Header title={sectionName} />
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

    // Get current language for translations
    const Translations: Object = TranslationUtils.getTranslations(this.props.language);

    let results = null;
    if (this.props.filter == null || !this.state.anyResults) {
      const searchTerms = this.props.filter || '';
      results = (
        <View style={[_styles.container, _styles.noResults]}>
          <Text style={_styles.noResultsText}>
            {(String:any).format(Translations.no_search_results, searchTerms)}
          </Text>
        </View>
      );
    } else {
      results = (
        <ListView
            dataSource={this.state.searchResults}
            enableEmptySections={true}
            renderRow={this._renderResult.bind(this)}
            renderSectionHeader={this._renderSource.bind(this)} />
      );
    }

    return (
      <View style={_styles.container}>
        <AdMobBanner
            adUnitID={env.admobUnitIds.search}
            bannerSize='smartBannerPortrait'
            didFailToReceiveAdWithError={this._adError.bind(this)}
            testDeviceID='EMULATOR' />
        {results}
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
    marginBottom: Constants.Sizes.Margins.Regular,
    marginTop: Constants.Sizes.Margins.Regular,
  },
  text: {
    flexDirection: 'column',
  },
  title: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Title,
  },
  body: {
    color: Constants.Colors.secondaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
  },
  icon: {
    margin: Constants.Sizes.Margins.Regular,
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    textAlign: 'center',
    marginLeft: Constants.Sizes.Margins.Regular,
    marginRight: Constants.Sizes.Margins.Regular,
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
    fontStyle: 'italic',
  },
});

// Map state to props
const select = (store) => {
  return {
    filter: store.search.searchTerms,
    language: store.config.language,
  };
};

// Map dispatch to props
// const actions = (dispatch) => {
//   return {};
// };

export default connect(select)(Search);
