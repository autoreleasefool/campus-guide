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
 * @created 2017-03-09
 * @file StudySpots.tsx
 * @description List of places to study ron campus, along with directions and filtering
 */
'use strict';

// React imports
import React from 'react';
import {
  Dimensions,
  LayoutAnimation,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

// Redux imports
import { connect } from 'react-redux';
import * as actions from '../../actions';

// Imports
import Header from '../../components/Header';
import FilterDescriptions from './modals/FilterDescriptions';
import LinkCategoryView from '../../components/LinkCategoryView';
import ModalHeader from '../../components/ModalHeader';
import Snackbar from 'react-native-snackbar';
import StudyFilters from '../../components/StudyFilters';
import StudySpotList from '../../components/StudySpotList';
import * as Configuration from '../../util/Configuration';
import * as Constants from '../../constants';
import * as Translations from '../../util/Translations';

// Types
import { Language } from '../../util/Translations';
import { TimeFormat } from '../../../typings/global';
import { StudySpot, StudySpotInfo } from '../../../typings/university';

interface Props {
  activeFilters: Set<string>;                 // List of filters actively being used
  filter: string;                             // Current search terms
  language: Language;                         // The current language, selected by the user
  timeFormat: TimeFormat;                     // Format to display times in
  activateFilter(filter: string): void;       // Activates an inactive study filter
  deactivateFilter(filter: string): void;     // Deactivates an active study filter
  navigateToStudySpot(spot: StudySpot): void; // Opens directions to the study spot
  setFilters(filters: string[]): void;        // Sets the active filters, removing any other filters
  showSearch(show: boolean): void;            // Shows or hides the search button
}

interface State {
  filterDescriptionsVisible: boolean;     // True to show filter descriptions, false to hide
  filterSelected: boolean;                // Indicates if any filter has been initially selected
  loaded: boolean;                        // Indicates if the data has been loaded for this view
  reservationsVisible: boolean;           // True to show reservation info, false to hide
  studySpots: StudySpotInfo | undefined;  // Information to display about study spots
}

// Height of the screen for animating filters
const screenHeight = Dimensions.get('window').height;

class StudySpots extends React.PureComponent<Props, State> {

  /**
   * Constructor.
   *
   * @param {props} props component props
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      filterDescriptionsVisible: false,
      filterSelected: false,
      loaded: false,
      reservationsVisible: false,
      studySpots: undefined,
    };
  }

  /**
   * If the study spot info has not been loaded, then load it.
   */
  componentDidMount(): void {
    if (!this.state.loaded) {
      this.loadConfiguration();
    }
  }

  /**
   * Asynchronously load relevant configuration files and cache the results.
   */
  async loadConfiguration(): Promise<void> {
    try {
      const studySpots = await Configuration.getConfig('/study_spots.json');
      this.setState({ studySpots });
    } catch (err) {
      console.error('Configuration could not be initialized for study spots.', err);
    }
  }

  /**
   * Hide or show the filter descriptions.
   *
   * @param {boolean} visible true to show, false to hide
   */
  _setFilterDescriptionsVisible(visible: boolean): void {
    this.setState({ filterDescriptionsVisible: visible });
  }

  /**
   * Hide or show the info for reserving a study spot.
   *
   * @param {boolean} visible true to show, false to hide
   */
  _setReservationsVisible(visible: boolean): void {
    this.setState({ reservationsVisible: visible });
  }

  /**
   * Updates the active filters.
   *
   * @param {string|undefined} id identifier of the selected filter
   */
  _onFilterSelected(id?: string | undefined): void {
    const studySpotInfo = this.state.studySpots;
    if (studySpotInfo == undefined) {
      return;
    }

    LayoutAnimation.easeInEaseOut(undefined, undefined);
    this.setState({ filterSelected: true });
    this.props.showSearch(true);

    const filterId = id;
    if (filterId) {
      const filterName = Translations.getName(
        this.props.language,
        studySpotInfo.filterDescriptions[filterId]) || '';
      if (this.props.activeFilters == undefined) {
        this.props.setFilters([ filterId ]);
      } else if (this.props.activeFilters.has(filterId)) {
        Snackbar.show({
          duration: Snackbar.LENGTH_SHORT,
          title: `${Translations.get(this.props.language, 'filter_removed')}: ${filterName}`,
        });
        this.props.deactivateFilter(filterId);
      } else {
        Snackbar.show({
          duration: Snackbar.LENGTH_SHORT,
          title: `${Translations.get(this.props.language, 'filter_added')}: ${filterName}`,
        });
        this.props.activateFilter(filterId);
      }
    } else {
      this.props.setFilters([]);
    }
  }

  /**
   * Display navigation directions to the spot.
   *
   * @param {StudySpot} spot the spot selected by the user
   */
  _onSpotSelected(spot: StudySpot): void {
    this.props.navigateToStudySpot(spot);
  }

  /**
   * Renders the filtered study spots and views to filter them.
   *
   * @returns {JSX.Element} the hierarchy of views to render
   */
  render(): JSX.Element {
    const studySpotInfo = this.state.studySpots;
    if (studySpotInfo == undefined) {
      return (
        <View style={_styles.container} />
      );
    }

    const filterStyle = this.state.filterSelected
        ? _styles.filterSelected
        : _styles.filterNotSelected;

    return (
      <View style={_styles.container}>
        <Modal
            animationType={'slide'}
            transparent={false}
            visible={this.state.filterDescriptionsVisible}
            onRequestClose={this._setFilterDescriptionsVisible.bind(this, false)}>
          <ModalHeader
              rightActionEnabled={true}
              rightActionText={Translations.get(this.props.language, 'done')}
              title={Translations.get(this.props.language, 'filter_descriptions')}
              onRightAction={this._setFilterDescriptionsVisible.bind(this, false)} />
          <FilterDescriptions
              descriptions={studySpotInfo.filterDescriptions}
              filters={studySpotInfo.filters}
              language={this.props.language} />
        </Modal>
        <Modal
            animationType={'slide'}
            transparent={false}
            visible={this.state.reservationsVisible}
            onRequestClose={this._setReservationsVisible.bind(this, false)}>
          <ModalHeader
              rightActionEnabled={true}
              rightActionText={Translations.get(this.props.language, 'done')}
              title={Translations.get(this.props.language, 'study_spots')}
              onRightAction={this._setReservationsVisible.bind(this, false)} />
          <LinkCategoryView
              filter={this.props.filter}
              language={this.props.language}
              section={studySpotInfo.reservations} />
        </Modal>
        <View style={_styles.container}>
          <StudySpotList
              activeFilters={this.props.activeFilters}
              filter={this.props.filter}
              language={this.props.language}
              spots={studySpotInfo.spots}
              studyFilters={studySpotInfo.filterDescriptions}
              timeFormat={this.props.timeFormat}
              onSelect={this._onSpotSelected.bind(this)} />
        </View>
        <TouchableOpacity onPress={this._setReservationsVisible.bind(this, true)}>
          <Header
              backgroundColor={Constants.Colors.secondaryBackground}
              icon={{ name: 'book', class: 'material' }}
              subtitleIcon={{ name: 'chevron-right', class: 'material' }}
              title={Translations.get(this.props.language, 'reserve_study_spot')} />
        </TouchableOpacity>
        <Header
            backgroundColor={Constants.Colors.tertiaryBackground}
            icon={{ name: 'filter-list', class: 'material' }}
            subtitleCallback={this._setFilterDescriptionsVisible.bind(this, true)}
            subtitleIcon={{ name: 'info', class: 'material' }}
            title={Translations.get(this.props.language, 'filters')} />
        <StudyFilters
            activeFilters={this.props.activeFilters}
            filterDescriptions={studySpotInfo.filterDescriptions}
            filters={studySpotInfo.filters}
            fullSize={false}
            language={this.props.language}
            onFilterSelected={this._onFilterSelected.bind(this)} />
        <View style={[ _styles.filterSelection, filterStyle ]}>
          <StudyFilters
              filterDescriptions={studySpotInfo.filterDescriptions}
              filters={studySpotInfo.filters}
              fullSize={true}
              language={this.props.language}
              onFilterSelected={this._onFilterSelected.bind(this)} />
          <View style={_styles.separator} />
          <TouchableOpacity onPress={(): void => this._onFilterSelected()}>
            <Header
                backgroundColor={Constants.Colors.secondaryBackground}
                icon={{ class: 'material', name: 'list' }}
                subtitleIcon={{ class: 'material', name: 'chevron-right' }}
                title={Translations.get(this.props.language, 'view_full_list')} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    backgroundColor: Constants.Colors.primaryBackground,
    flex: 1,
  },
  filterNotSelected: {
    bottom: 0,
    top: 0,
  },
  filterSelected: {
    bottom: -screenHeight,
    top: screenHeight,
  },
  filterSelection: {
    left: 0,
    position: 'absolute',
    right: 0,
  },
  separator: {
    backgroundColor: Constants.Colors.tertiaryBackground,
    height: StyleSheet.hairlineWidth,
  },
});

const mapStateToProps = (store: any): any => {
  return {
    activeFilters: store.search.studyFilters,
    filter: store.search.tabTerms.discover,
    language: store.config.options.language,
    timeFormat: store.config.options.preferredTimeFormat,
  };
};

const mapDispatchToProps = (dispatch: any): any => {
  return {
    activateFilter: (filter: string): void => dispatch(actions.activateStudyFilter(filter)),
    deactivateFilter: (filter: string): void => dispatch(actions.deactivateStudyFilter(filter)),
    navigateToStudySpot: (spot: StudySpot): void => {
      dispatch(actions.setHeaderTitle('directions', 'find'));
      dispatch(actions.setDestination({ shorthand: spot.building, room: spot.room }));
      dispatch(actions.switchFindView(Constants.Views.Find.StartingPoint));
      dispatch(actions.switchTab('find'));
    },
    setFilters: (filters: string[]): void => dispatch(actions.setStudyFilters(filters)),
    showSearch: (show: boolean): void => dispatch(actions.showSearch(show, 'discover')),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(StudySpots) as any;
