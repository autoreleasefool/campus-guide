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
 * @file SearchView.tsx
 * @description Presents search results to the user.
 */
'use strict';

// React imports
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  FlatList,
  InteractionManager,
  Linking,
  Platform,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Navigator } from 'react-native-deprecated-custom-components';

// Redux imports
import { connect } from 'react-redux';
import * as actions from '../../actions';

// Imports
import Header from '../../components/Header';
import PaddedIcon from '../../components/PaddedIcon';
import * as Analytics from '../../util/Analytics';
import * as Arrays from '../../util/Arrays';
import * as Configuration from '../../util/Configuration';
import * as Constants from '../../constants';
import * as Display from '../../util/Display';
import * as External from '../../util/External';
import * as Searchable from './Searchable';
import * as TextUtils from '../../util/TextUtils';
import * as Translations from '../../util/Translations';

// Types
import { Store } from '../../store/configureStore';
import { SearchSupport } from '../../util/Search';
import { Language } from '../../util/Translations';
import { BasicIcon, Route, Section } from '../../../typings/global';

interface Props {
  filter: string;                                                   // Search terms
  language: Language;                                               // The current language, selected by the user
  onResultSelect(sectionKey: string | undefined, data: Searchable.SearchResult): void;
                                                                    // Callback for when result is selected
}

interface State {
  anyResults: boolean;                                  // False if no search results were returned
  filteredResults: Section<Searchable.SearchResult>[];  // Categories and their top results
  performingSearch: boolean;                            // Indicates if a search is in progresss
  singleResults: Searchable.SearchResult[];             // List of search results for a single category
  singleResultTitle: string | undefined;                // Category of search results being displayed
  supportData: SearchSupport | undefined;               // Support data for searches
}

// Render top filtered results
const FILTERED = 0;
// Render full results for a single category
const SINGLE = 1;

class SearchView extends React.PureComponent<Props, State> {

  /** Set of complete, unaltered search results */
  _searchResults: Section<Searchable.SearchResult>[] = [];

  /** Set of search result categories with their top results. */
  _filteredResults: Section<Searchable.SearchResult>[] = [];

  /** Set of specific search results to be displayed. */
  _singleResults: Searchable.SearchResult[] = [];

  /** Set of icons to display for each search result. */
  _searchIcons: any;

  /**
   * Pass props and declares initial state.
   *
   * @param {Props} props properties passed from container to this component
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      anyResults: false,
      filteredResults: [],
      performingSearch: false,
      singleResultTitle: undefined,
      singleResults: [],
      supportData: undefined,
    };
  }

  /**
   * Load supporting data for searches.
   */
  componentDidMount(): void {
    if (!this.state.supportData) {
      InteractionManager.runAfterInteractions(() => this.loadConfiguration());
    }
  }

  /**
   * Update the search results.
   *
   * @param {Props} nextProps updated props
   */
  componentWillReceiveProps(nextProps: Props): void {
    this._updateSearch(this.props, nextProps);
  }

  /**
   * Asynchronously load relevant configuration files and cache the results.
   */
  async loadConfiguration(): Promise<void> {
    try {
      const linkSections = await Configuration.getConfig('/useful_links.json');
      const roomTypeInfo = await Configuration.getConfig('/room_types.json');
      const studySpots = await Configuration.getConfig('/study_spots.json');
      this.setState({
        supportData: {
          linkSections,
          roomTypeInfo,
          studySpots,
        },
      });

    } catch (err) {
      console.error('Configuration could not be initialized for search view.', err);
    }
  }

  /**
   * Sets the transition between two views in the navigator.
   *
   * @returns {object} a configuration for the transition between scenes
   */
  _configureScene(): object {
    return Navigator.SceneConfigs.PushFromRight;
  }

  /**
   * Gets the top results from each of the categories of results returned.
   *
   * @param {Section<Searchable.SearchResult>[]} searchResults the results to get the top results from
   * @returns {Section<Searchable.SearchResult>[]} the top results for each section
   */
  _filterTopResults(searchResults: Section<Searchable.SearchResult>[]):
      Section<Searchable.SearchResult>[] {
    const filtered: Section<Searchable.SearchResult>[] = [];
    for (const searchResult of searchResults) {
      if (searchResult.data.length === 1) {
        filtered.push({
          data: [ searchResult.data[0] ],
          key: searchResult.key,
        });
      } else if (searchResult.data.length > 1) {
        filtered.push({
          data: [ searchResult.data[0], searchResult.data[1] ],
          key: searchResult.key,
        });
      }
    }

    return filtered;
  }

  /**
   * Updates the results displayed of the search through the entire app.
   *
   * @param {Props} prevProps the props last filtered by
   * @param {Props} nextProps the props to filter by
   */
  _updateSearch(prevProps: Props, nextProps: Props): void {
    if (prevProps.filter.length > 0
        && nextProps.filter.length > 0
        && nextProps.filter.indexOf(prevProps.filter) >= 0
        && this._searchResults.length > 0) {

      this._searchResults = Searchable.narrowResults(nextProps.filter, this._searchResults);
      this._filteredResults = this._filterTopResults(this._searchResults);

      this._updateSingleResults(this.state.singleResultTitle);

      this.setState({
        anyResults: this._searchResults != undefined && this._searchResults.length > 0,
        filteredResults: this._filteredResults,
        performingSearch: false,
        singleResults: this._singleResults,
      });
    } else {
      Searchable.getResults(nextProps.filter, this.state.supportData)
          .then((results: Searchable.ResultData) => {
            this._searchResults = results.results;
            this._searchIcons = results.icons;
            this._filteredResults = this._filterTopResults(this._searchResults);

            this._updateSingleResults(this.state.singleResultTitle);

            this.setState({
              anyResults: this._searchResults != undefined && this._searchResults.length > 0,
              filteredResults: this._filteredResults,
              performingSearch: false,
              singleResults: this._singleResults,
            });
          })
          .catch((err: any) => console.log('Could not get search results.', err));
    }
  }

  /**
   * Updates the set of single results.
   *
   * @param {string|undefined} source the source for the single results. Can be undefined
   */
  _updateSingleResults(source: string | undefined): void {
    if (source != undefined) {
      const singleResultIndex = Arrays.linearSearchObjectArrayByKeyValue(this._searchResults, 'key', source);
      this._singleResults = (singleResultIndex >= 0) ? this._searchResults[singleResultIndex].data : [];
    }
  }

  /**
   * Callback for when a result is tapped by the user.
   *
   * @param {Searchable.SearchResult} result the result selected
   */
  _onResultSelect(result: Searchable.SearchResult): void {
    const routes = (this.refs.Navigator as any).getCurrentRoutes();
    if (routes != undefined && routes[routes.length - 1].id === SINGLE) {
      Analytics.selectedSearchResult(this.state.singleResultTitle, result.title, this.props.filter);
      this.props.onResultSelect(this.state.singleResultTitle, result);
    } else {
      Analytics.selectedSearchResult(result.key, result.title, this.props.filter);
      this.props.onResultSelect(result.key, result);
    }
    (this.refs.Navigator as any).pop();
  }

  /**
   * Callback for when a source is tapped by the user.
   *
   * @param {string|undefined} source name of the section selected
   */
  _onSourceSelect(source: string | undefined): void {
    if (source == undefined) {
      this.setState({ singleResultTitle: undefined });
      (this.refs.Navigator as any).pop();
    } else {
      this._updateSingleResults(source);
      if (this._singleResults.length > 2) {
        this.setState({
          singleResultTitle: source,
          singleResults: this._singleResults,
        });
        (this.refs.Navigator as any).push({ id: SINGLE });
      }
    }
  }

  /**
   * Renders an activity indicator when the user's search is being processed.
   *
   * @returns {JSX.Element} an activity indicator
   */
  _renderActivityIndicator(): JSX.Element {
    return (
      <View
          pointerEvents={'none'}
          style={_styles.activityIndicator}>
        <View style={_styles.emptyPaddingTop} />
        <ActivityIndicator
            animating={this.state.performingSearch}
            color={Constants.Colors.tertiaryBackground} />
        <View style={_styles.emptyPaddingBottom} />
      </View>
    );
  }

  /**
   * Renders a view which indicates the user's has not performed a search yet.
   *
   * @returns {JSX.Element} a centred text view with text indicating there is no search
   */
  _renderEmptySearch(): JSX.Element {
    return (
      <View style={[ _styles.container, _styles.noSearch ]}>
        <View style={_styles.emptyPaddingTop} />
        <Text style={_styles.noSearchText}>
          {`${Translations.get('no_search')}`}
        </Text>
        <View style={_styles.emptyPaddingBottom} />
      </View>
    );
  }

  /**
   * Renders a search result based on its source.
   *
   * @param {SearchResult} result the result and its source to render
   * @returns {JSX.Element|undefined} a view describing the result, or undefined
   */
  _renderResult({ item }: { item: Searchable.SearchResult }): JSX.Element | undefined {
    // Construct the icon view for the result
    const icon = Display.getPlatformIcon(Platform.OS, item);
    let iconView: any;

    if (icon != undefined) {
      iconView = (
        <PaddedIcon
            color={Constants.Colors.primaryWhiteIcon}
            icon={icon} />
      );
    }

    return (
      <TouchableOpacity onPress={this._onResultSelect.bind(this, item)}>
        <View style={_styles.result}>
          {iconView}
          <View style={_styles.resultText}>
            <Text style={_styles.resultTitle}>{item.title}</Text>
            <Text style={_styles.resultBody}>{item.description}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  /**
   * Renders a heading for a set of search results from a source.
   *
   * @param {Section}  section       section contents
   * @param {boolean|undefined} nonExpandable indicates if an "expand" icon should be shown
   * @returns {JSX.Element} a {Header} with the name of the source
   */
  _renderSource({ section }: { section: Section<any> }, nonExpandable: boolean | undefined): JSX.Element {
    const resultPosition = Arrays.linearSearchObjectArrayByKeyValue(this._searchResults, 'key', section.key);
    const numberOfResults = this._searchResults[resultPosition].data.length;
    if (nonExpandable) {
      const platformModifier = Platform.OS === 'android' ? 'md' : 'ios';
      const subtitle = `${numberOfResults} ${Translations.get('results').toLowerCase()}`;

      return (
        <TouchableOpacity onPress={this._onSourceSelect.bind(this, undefined)}>
          <Header
              backgroundColor={Constants.Colors.tertiaryBackground}
              icon={{ name: `${platformModifier}-arrow-back`, class: 'ionicon' }}
              subtitle={subtitle}
              title={section.key} />
        </TouchableOpacity>
      );
    } else {
      const icon: BasicIcon = Display.getPlatformIcon(Platform.OS, this._searchIcons[section.key])
          || { name: 'search', class: 'material' };

      let subtitle: string | undefined;
      let subtitleIcon: BasicIcon | undefined;
      if (numberOfResults > 2) {
        subtitle = `${numberOfResults - 2} ${Translations.get('more')}`;
        subtitleIcon = { name: 'chevron-right', class: 'material' };
      }

      return (
        <TouchableOpacity onPress={this._onSourceSelect.bind(this, section.key)}>
          <Header
              backgroundColor={Constants.Colors.tertiaryBackground}
              icon={icon}
              subtitle={subtitle}
              subtitleIcon={subtitleIcon}
              title={section.key} />
        </TouchableOpacity>
      );
    }
  }

  /**
   * Renders a view which indicates the user's search returned no results.
   *
   * @returns {JSX.Element|undefined} a centred text view with text indicating no results were found
   */
  _renderNoResults(): JSX.Element | undefined {
    // If a search is being performed, do not render anything
    if (this.state.performingSearch) {
      return undefined;
    }

    const searchTerms = this.props.filter || '';

    return (
      <View style={[ _styles.container, _styles.noResults ]}>
        <View style={_styles.emptyPaddingTop} />
        <Text style={_styles.noResultsText}>
          {`${Translations.get('no_results_for')} '${searchTerms}'`}
        </Text>
        <View style={_styles.emptyPaddingBottom} />
      </View>
    );
  }

  /**
   * Renders a separator line between rows.
   *
   * @returns {JSX.Element} a separator for the list of search results
   */
  _renderSeparator(): JSX.Element {
    return <View style={_styles.separator} />;
  }

  /**
   * Renders the top search results of each category.
   *
   * @returns {JSX.Element} a list of results
   */
  _renderFilteredResults(): JSX.Element {
    let results: JSX.Element | undefined;
    if (this.props.filter.length === 0) {
      results = this._renderEmptySearch();
    } else if (this.state.anyResults) {
      results = (
        <SectionList
            ItemSeparatorComponent={this._renderSeparator.bind(this)}
            keyExtractor={(result: Searchable.SearchResult): string => `${result.key}.${result.title}`}
            renderItem={this._renderResult.bind(this)}
            renderSectionHeader={this._renderSource.bind(this)}
            sections={this.state.filteredResults} />
      );
    } else {
      results = this._renderNoResults();
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
   * @returns {JSX.Element|undefined} a list of results
   */
  _renderSingleResults(): JSX.Element | undefined {
    let results: JSX.Element | undefined;
    if (this.props.filter.length === 0 || !this.state.anyResults) {
      results = this._renderNoResults();
    } else {
      results = (
        <FlatList
            ItemSeparatorComponent={this._renderSeparator.bind(this)}
            data={this.state.singleResults}
            keyExtractor={(result: Searchable.SearchResult): string => `${result.key}.${result.title}`}
            renderItem={this._renderResult.bind(this)} />
      );
    }

    return (
      <View style={_styles.container}>
        {this._renderSource({ section: { key: this.state.singleResultTitle || '', data: [] } }, true)}
        {results}
      </View>
    );
  }

  /**
   * Renders a view according to the current route of the navigator.
   *
   * @param {Route} route object with properties to identify the route to display
   * @returns {JSX.Element|undefined} the view to render, based on {route}
   */
  _renderScene(route: Route): JSX.Element | undefined {
    switch (route.id) {
      case FILTERED:
        return this._renderFilteredResults();
      case SINGLE:
        return this._renderSingleResults();
      default:
        throw new Error(`Attempting to render invalid SearchView scene: ${route}`);
    }
  }

  /**
   * Renders search results.
   *
   * @returns {JSX.Element} a navigator between types of results
   */
  render(): JSX.Element {
    if (!this.state.supportData) {
      return this._renderEmptySearch();
    }

    return (
      <View style={_styles.container}>
        <Navigator
            configureScene={this._configureScene}
            initialRoute={{ id: FILTERED }}
            ref='Navigator'
            renderScene={this._renderScene.bind(this)}
            style={_styles.container} />
        {this._renderActivityIndicator()}
      </View>
    );
  }
}

const _styles = StyleSheet.create({
  activityIndicator: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    backgroundColor: Constants.Colors.secondaryBackground,
    flex: 1,
  },
  emptyPaddingBottom: {
    flex: 3,
  },
  emptyPaddingTop: {
    flex: 1,
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
    fontStyle: 'italic',
    marginLeft: Constants.Sizes.Margins.Expanded,
    marginRight: Constants.Sizes.Margins.Expanded,
    textAlign: 'center',
  },
  noSearch: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noSearchText: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
    marginLeft: Constants.Sizes.Margins.Expanded,
    marginRight: Constants.Sizes.Margins.Expanded,
    textAlign: 'center',
  },
  result: {
    alignItems: 'center',
    backgroundColor: Constants.Colors.secondaryBackground,
    flex: 1,
    flexDirection: 'row',
  },
  resultBody: {
    color: Constants.Colors.secondaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
  },
  resultText: {
    flex: 1,
    flexDirection: 'column',
    marginBottom: Constants.Sizes.Margins.Expanded,
    marginRight: Constants.Sizes.Margins.Expanded,
    marginTop: Constants.Sizes.Margins.Expanded,
  },
  resultTitle: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Subtitle,
  },
  separator: {
    backgroundColor: Constants.Colors.primaryWhiteText,
    height: StyleSheet.hairlineWidth,
    marginLeft: Constants.Sizes.Margins.Expanded,
  },
});

const mapStateToProps = (store: Store): any => {
  return {
    filter: store.search.tabTerms.search,
    language: store.config.options.language,
  };
};

const mapDispatchToProps = (dispatch: any): any => {
  return {
    onResultSelect: (sectionKey: string | undefined, result: Searchable.SearchResult): any => {
      if (sectionKey == undefined) {
        return;
      }

      switch (sectionKey) {
        case 'Buildings':
        case 'Bâtiments': {
          const name = {
            name_en: Translations.getEnglishName(result.data) || '',
            name_fr: Translations.getFrenchName(result.data) || '',
          };

          dispatch(actions.setHeaderTitle(name, 'find', Constants.Views.Find.Building));
          dispatch(actions.viewBuilding(result.data));
          dispatch(actions.switchFindView(Constants.Views.Find.Building));
          dispatch(actions.switchTab('find'));
          break;
        }
        case 'External links':
        case 'Liens externes':
          External.openLink(result.data.link, Linking, Alert, Clipboard, TextUtils);
          break;
        case 'Rooms':
        case 'Chambres':
          dispatch(actions.setHeaderTitle('directions', 'find', Constants.Views.Find.StartingPoint));
          dispatch(actions.setDestination({ shorthand: result.data.shorthand, room: result.data.room }));
          dispatch(actions.switchFindView(Constants.Views.Find.StartingPoint));
          dispatch(actions.switchTab('find'));
          break;
        case 'uO Info':
          dispatch(actions.setHeaderTitle({ name: result.title }, 'discover', Constants.Views.Discover.Links));
          dispatch(actions.switchLinkCategory(result.data));
          dispatch(actions.switchDiscoverView(Constants.Views.Discover.Links));
          dispatch(actions.switchTab('discover'));
          break;
        case 'Study spots':
        case 'Taches d\'étude':
          dispatch(actions.setHeaderTitle('directions', 'find', Constants.Views.Find.StartingPoint));
          dispatch(actions.setDestination({ shorthand: result.data.shorthand, room: result.data.room }));
          dispatch(actions.switchFindView(Constants.Views.Find.StartingPoint));
          dispatch(actions.switchTab('find'));
          break;
        default:
          throw new Error(`Search result type not recognized: ${sectionKey}`);
      }
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchView) as any;
