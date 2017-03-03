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
  Alert,
  Clipboard,
  Linking,
  ListView,
  Navigator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Redux imports
import { connect } from 'react-redux';
import * as actions from 'actions';

// Types
import type { Icon, Language, Route } from 'types';

// Type definition for component props
type Props = {
  filter: ?string,                                        // Search terms
  language: Language,                                     // The current language, selected by the user
  onResultSelect: (sectionID: string, data: any) => void, // Callback for when result is selected
};

// Type definition for component state
type State = {
  anyResults: boolean,                  // False if no search results were returned
  filteredResults: ListView.DataSource, // Categories and their top results
  singleResults: ListView.DataSource,   // List of search results for a single category
  singleResultTitle: string,            // Category of search results being displayed
};

// Imports
import Header from 'Header';
import PaddedIcon from 'PaddedIcon';
import * as Constants from 'Constants';
import * as DisplayUtils from 'DisplayUtils';
import * as ExternalUtils from 'ExternalUtils';
import * as Searchable from './Searchable';
import * as TextUtils from 'TextUtils';
import * as TranslationUtils from 'TranslationUtils';

// Render top filtered results
const FILTERED = 0;
// Render full results for a single category
const SINGLE = 1;

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
      filteredResults: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
        sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
      }),
      singleResults: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
      }),
      singleResultTitle: '',
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

  /** Set of complete, unaltered search results */
  _searchResults: Object = {};

  /** Set of search result categories with their top results. */
  _filteredResults: Object = {};

  /** Set of specific search results to be displayed. */
  _singleResults: Array < Searchable.SearchResult > = [];

  /** Set of icons to display for each search result. */
  _searchIcons: Object;

  /**
   * Sets the transition between two views in the navigator.
   *
   * @returns {Object} a configuration for the transition between scenes.
   */
  _configureScene(): Object {
    return Navigator.SceneConfigs.PushFromRight;
  }

  /**
   * Gets the top results from each of the categories of results returned.
   *
   * @param {Object} searchResults the results to get the top results from
   * @returns {Object} the top results for each section
   */
  _filterTopResults(searchResults: Object): Object {
    const filtered = {};
    for (const source in searchResults) {
      if (searchResults.hasOwnProperty(source)) {
        if (searchResults[source].length == 1) {
          filtered[source] = [ searchResults[source][0] ];
        } else if (searchResults[source].length > 1) {
          filtered[source] = [ searchResults[source][0], searchResults[source][1] ];
        }
      }
    }

    return filtered;
  }

  /**
   * Updates the results displayed of the search through the entire app.
   *
   * @param {?string} searchTerms user search query
   */
  _updateSearch(searchTerms: ?string): void {
    if (this.props.filter != null && this.props.filter.length > 0
        && searchTerms != null && searchTerms.length > 0
        && searchTerms.indexOf(this.props.filter) >= 0
        && Object.keys(this._searchResults).length > 0) {

      this._searchResults = Searchable.narrowResults(searchTerms, this._searchResults);
      this._filteredResults = this._filterTopResults(this._searchResults);

      if (this.state.singleResultTitle.length > 0) {
        this._singleResults = this._searchResults[this.state.singleResultTitle] || [];
      }

      this.setState({
        anyResults: this._searchResults != null && Object.keys(this._searchResults).length > 0,
        filteredResults: this.state.filteredResults.cloneWithRowsAndSections(this._filteredResults),
        singleResults: this.state.singleResults.cloneWithRows(this._singleResults),
      });
    } else {
      Searchable.getResults(this.props.language, searchTerms)
          .then((results: Object) => {
            this._searchResults = results.results;
            this._searchIcons = results.icons;
            this._filteredResults = this._filterTopResults(this._searchResults);

            if (this.state.singleResultTitle.length > 0) {
              this._singleResults = this._searchResults[this.state.singleResultTitle];
            }

            this.setState({
              anyResults: this._searchResults != null && Object.keys(this._searchResults).length > 0,
              filteredResults: this.state.filteredResults.cloneWithRowsAndSections(this._filteredResults),
              singleResults: this.state.singleResults.cloneWithRows(this._singleResults),
            });
          })
          .catch((err: any) => console.error('Could not get search results.', err));
    }
  }

  /**
   * Callback for when a result is tapped by the user.
   *
   * @param {Searchable.SearchResult} result    the result selected
   * @param {string}                  sectionID id of the section the result belongs to
   */
  _onResultSelect(result: Searchable.SearchResult, sectionID: string): void {
    const routes = this.refs.Navigator.getCurrentRoutes();
    if (routes != null && routes[routes.length - 1].id === SINGLE) {
      this.props.onResultSelect(this.state.singleResultTitle, result.data);
    } else {
      this.props.onResultSelect(sectionID, result.data);
    }
    this.refs.Navigator.pop();
  }

  /**
   * Callback for when a source is tapped by the user.
   *
   * @param {?string} source name of the section selected
   */
  _onSourceSelect(source: ?string): void {
    if (source == null) {
      this.setState({
        singleResultTitle: '',
      });
      this.refs.Navigator.pop();
    } else {
      this._singleResults = this._searchResults[source];
      if (this._singleResults.length > 2) {
        this.setState({
          singleResultTitle: source,
          singleResults: this.state.singleResults.cloneWithRows(this._singleResults),
        });
        this.refs.Navigator.push({ id: SINGLE });
      }
    }
  }

  /**
   * Renders a view which indicates the user's has not performed a search yet.
   *
   * @param {Object} Translations translations for the current language
   * @returns {ReactElement<any>} a centred text view with text indicating there is no search
   */
  _renderEmptySearch(Translations: Object): ReactElement < any > {
    return (
      <View style={[ _styles.container, _styles.noSearch ]}>
        <Text style={_styles.noSearchText}>
          {`${Translations.no_search}`}
        </Text>
      </View>
    );
  }

  /**
   * Renders a search result based on its source.
   *
   * @param {SearchResult} result    the result and its source to render
   * @param {string}       sectionID id of the section
   * @returns {?ReactElement<any>} a view describing the result, or null
   */
  _renderResult(result: Searchable.SearchResult, sectionID: string): ?ReactElement < any > {
    // Construct the icon view for the result
    const icon: ?Icon = DisplayUtils.getPlatformIcon(Platform.OS, result);
    let iconView: any = null;

    if (icon != null) {
      iconView = (
        <PaddedIcon
            color={Constants.Colors.primaryWhiteIcon}
            icon={icon} />
      );
    }

    return (
      <TouchableOpacity onPress={this._onResultSelect.bind(this, result, sectionID)}>
        <View style={_styles.result}>
          {iconView}
          <View style={_styles.resultText}>
            <Text style={_styles.resultTitle}>{result.title}</Text>
            <Text style={_styles.resultBody}>{result.description}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  /**
   * Renders a heading for a set of search results from a source.
   *
   * @param {Object}   sectionData   section contents
   * @param {string}   sectionName   name of the source
   * @param {?boolean} nonExpandable indicates if an "expand" icon should be shown
   * @returns {ReactElement<any>} a {SectionHeader} with the name of the source.
   */
  _renderSource(sectionData: Object, sectionName: string, nonExpandable: ?boolean): ReactElement < any > {
    // Get current language for translations
    const Translations: Object = TranslationUtils.getTranslations(this.props.language);

    if (nonExpandable) {
      const platformModifier: string = Platform.OS === 'ios' ? 'ios' : 'md';
      const subtitle = `${this._searchResults[sectionName].length} ${Translations.results.toLowerCase()}`;

      return (
        <TouchableOpacity onPress={this._onSourceSelect.bind(this, null)}>
          <Header
              backgroundColor={Constants.Colors.polarGrey}
              icon={{ name: `${platformModifier}-arrow-back`, class: 'ionicon' }}
              subtitle={subtitle}
              title={sectionName} />
        </TouchableOpacity>
      );
    } else {
      const icon = DisplayUtils.getPlatformIcon(Platform.OS, this._searchIcons[sectionName])
          || { name: 'search', class: 'material' };

      let subtitle = null;
      let subtitleIcon = null;
      if (this._searchResults[sectionName].length > 2) {
        subtitle = `${this._searchResults[sectionName].length - 2} ${Translations.more}`;
        subtitleIcon = { name: 'chevron-right', class: 'material' };
      }

      return (
        <TouchableOpacity onPress={this._onSourceSelect.bind(this, sectionName)}>
          <Header
              backgroundColor={Constants.Colors.polarGrey}
              icon={icon}
              subtitle={subtitle}
              subtitleIcon={subtitleIcon}
              title={sectionName} />
        </TouchableOpacity>
      );
    }
  }

  /**
   * Renders a view which indicates the user's search returned no results.
   *
   * @param {Object} Translations translations for the current language
   * @returns {ReactElement<any>} a centred text view with text indicating no results were found
   */
  _renderNoResults(Translations: Object): ReactElement < any > {
    const searchTerms = this.props.filter || '';
    return (
      <View style={[ _styles.container, _styles.noResults ]}>
        <Text style={_styles.noResultsText}>
          {`${Translations.no_results_for} '${searchTerms}'`}
        </Text>
      </View>
    );
  }

  /**
   * Renders a separator line between rows.
   *
   * @param {any} sectionID section id
   * @param {any} rowID     row id
   * @returns {ReactElement<any>} a separator for the list of settings
   */
  _renderSeparator(sectionID: any, rowID: any): ReactElement < any > {
    return (
      <View
          key={`Separator,${sectionID},${rowID}`}
          style={_styles.separator} />
    );
  }

  /**
   * Renders the top search results of each category.
   *
   * @returns {ReactElement<any>} a list of results
   */
  _renderFilteredResults(): ReactElement < any > {
    // Get current language for translations
    const Translations: Object = TranslationUtils.getTranslations(this.props.language);

    let results = null;
    if (this.props.filter == null || this.props.filter.length === 0) {
      results = this._renderEmptySearch(Translations);
    } else if (this.state.anyResults) {
      results = (
        <ListView
            dataSource={this.state.filteredResults}
            enableEmptySections={true}
            keyboardShouldPersistTaps={'always'}
            renderRow={this._renderResult.bind(this)}
            renderSectionHeader={this._renderSource.bind(this)}
            renderSeparator={this._renderSeparator.bind(this)} />
      );
    } else {
      results = this._renderNoResults(Translations);
    }

    return (
      <View style={_styles.container}>
        {results}
      </View>
    );
  }

  /**
   * Renders the results for a single category.
   *
   * @returns {ReactElement<any>} a list of results
   */
  _renderSingleResults(): ReactElement < any > {
    // Get current language for translations
    const Translations: Object = TranslationUtils.getTranslations(this.props.language);

    let results = null;
    if (this.props.filter == null || !this.state.anyResults) {
      results = this._renderNoResults(Translations);
    } else {
      results = (
        <ListView
            dataSource={this.state.singleResults}
            enableEmptySections={true}
            keyboardShouldPersistTaps={'always'}
            renderRow={this._renderResult.bind(this)}
            renderSeparator={this._renderSeparator.bind(this)} />
      );
    }

    return (
      <View style={_styles.container}>
        {this._renderSource({}, this.state.singleResultTitle, true)}
        {results}
      </View>
    );
  }

  /**
   * Renders a view according to the current route of the navigator.
   *
   * @param {Route} route object with properties to identify the route to display.
   * @returns {?ReactElement<any>} the view to render, based on {route}.
   */
  _renderScene(route: Route): ?ReactElement < any > {
    switch (route.id) {
      case FILTERED:
        return this._renderFilteredResults();
      case SINGLE:
        return this._renderSingleResults();
      default:
        // TODO: render generic error screen?
        console.error(`Invalid navigator route: ${route.id}.`);
        return null;
    }
  }

  /**
   * Renders search results.
   *
   * @returns {ReactElement<any>} a navigator between types of results
   */
  render(): ReactElement < any > {
    return (
      <View style={_styles.container}>
        <Navigator
            configureScene={this._configureScene}
            initialRoute={{ id: FILTERED }}
            ref='Navigator'
            renderScene={this._renderScene.bind(this)}
            style={_styles.container} />
      </View>
    );
  }
}

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.Colors.secondaryBackground,
  },
  result: {
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: Constants.Colors.secondaryBackground,
  },
  resultText: {
    marginBottom: Constants.Sizes.Margins.Expanded,
    marginTop: Constants.Sizes.Margins.Expanded,
    marginRight: Constants.Sizes.Margins.Expanded,
    flexDirection: 'column',
  },
  resultTitle: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Subtitle,
  },
  resultBody: {
    color: Constants.Colors.secondaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    textAlign: 'center',
    marginLeft: Constants.Sizes.Margins.Expanded,
    marginRight: Constants.Sizes.Margins.Expanded,
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
    fontStyle: 'italic',
  },
  noSearch: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noSearchText: {
    textAlign: 'center',
    marginLeft: Constants.Sizes.Margins.Expanded,
    marginRight: Constants.Sizes.Margins.Expanded,
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Constants.Colors.primaryWhiteText,
    marginLeft: Constants.Sizes.Margins.Expanded,
  },
});

const mapStateToProps = (store) => {
  return {
    filter: store.search.terms,
    language: store.config.options.language,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onResultSelect: (sectionID: string, data: any) => {
      switch (sectionID) {
        case 'Buildings':
        case 'Bâtiments': {
          const name = {
            name_en: TranslationUtils.getTranslatedName('en', data) || '',
            name_fr: TranslationUtils.getTranslatedName('fr', data) || '',
          };

          dispatch(actions.setHeaderTitle(name, 'find'));
          dispatch(actions.viewBuilding(data));
          dispatch(actions.switchFindView(Constants.Views.Find.Building));
          dispatch(actions.switchTab('find'));
          break;
        }
        case 'Rooms':
        case 'Chambres': {
          const name = {
            name_en: TranslationUtils.getTranslatedName('en', data.building) || '',
            name_fr: TranslationUtils.getTranslatedName('fr', data.building) || '',
          };

          dispatch(actions.setHeaderTitle(name, 'find'));
          dispatch(actions.setDestination({ code: data.code, room: data.room }));
          dispatch(actions.switchFindView(Constants.Views.Find.StartingPoint));
          dispatch(actions.switchTab('find'));
          break;
        }
        case 'Useful links':
        case 'Liens utiles': {
          dispatch(actions.switchLinkCategory(data));
          dispatch(actions.switchDiscoverView(Constants.Views.Discover.Links));
          dispatch(actions.switchTab('discover'));
          break;
        }
        case 'External links':
        case 'Liens externes': {
          ExternalUtils.openLink(data.link, data.translations, Linking, Alert, Clipboard, TextUtils);
          break;
        }
        default:
          throw new Error(`Search result type not recognized: ${sectionID}`);
      }
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Search);
