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
 * @file StudySpots.js
 * @description List of places to study ron campus, along with directions and filtering
 *
 * @flow
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
import * as actions from 'actions';

// Types
import type {
  Language,
  StudySpot,
  StudySpotFilter,
  StudySpotReservation,
  TimeFormat,
} from 'types';

// Type definition for component props.
type Props = {
  activateFilter: (filter: number) => void,         // Activates an inactive study filter
  deactivateFilter: (filter: number) => void,       // Deactivates an active study filter
  setFilters: (filters: Array < number >) => void,  // Sets the active filters, removing any other filters
  activeFilters: Array < number >,                  // List of filters actively being used
  filter: ?string,                                  // Current search terms
  language: Language,                               // The current language, selected by the user
  timeFormat: TimeFormat,                           // Format to display times in
}

// Type definition for component state.
type State = {
  filters: Array < StudySpotFilter >,           // List of filters for filtering spots
  filterDescriptionsVisible: boolean,           // True to show filter descriptions, false to hide
  filterSelected: boolean,                      // Indicates if any filter has been initially selected
  loaded: boolean,                              // Indicates if the data has been loaded for this view
  spots: Array < StudySpot >,                   // List of available study spots
  reservations: Array < StudySpotReservation >, // List of sites to reserve study spots
}

// Imports
import Header from 'Header';
import FilterDescriptions from './modals/FilterDescriptions';
import ModalHeader from 'ModalHeader';
import StudyFilters from 'StudyFilters';
import StudySpotList from 'StudySpotList';
import * as Configuration from 'Configuration';
import * as Constants from 'Constants';
import * as TranslationUtils from 'TranslationUtils';

// Height of the screen for animating filters
const { height } = Dimensions.get('window');

class StudySpots extends React.Component {

  /**
   * Properties this component expects to be provided by its parent.
   */
  props: Props;

  /**
   * Current state of the component.
   */
  state: State;

  /**
   * Constructor.
   *
   * @param {props} props component props
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      filters: [],
      filterDescriptionsVisible: false,
      filterSelected: false,
      loaded: false,
      spots: [],
      reservations: [],
    };
  }

  /**
   * If the study spot info has not been loaded, then load it.
   */
  componentDidMount(): void {
    if (!this.state.loaded) {
      Configuration.init()
          .then(() => Configuration.getConfig('/study_spots.json'))
          .then((studySpots: Object) => {
            this.setState({
              filters: studySpots.filters,
              spots: studySpots.spots,
              reservations: studySpots.reservations,
            });
          })
          .catch((err: any) => console.error('Configuration could not be initialized for study spots.', err));
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
   * Updates the active filters.
   *
   * @param {number} index index of the selected filter
   */
  _onFilterSelected(index: number): void {
    LayoutAnimation.easeInEaseOut();
    this.setState({ filterSelected: true });

    if (index >= 0) {
      if (this.props.activeFilters == null) {
        this.props.setFilters([ index ]);
      } else if (this.props.activeFilters.indexOf(index) >= 0) {
        this.props.deactivateFilter(index);
      } else {
        this.props.activateFilter(index);
      }
    } else {
      this.props.setFilters([]);
    }
  }

  _onSpotSelected(spot: StudySpot): void {
    // TODO: spot selected
    console.log(`TODO: ${JSON.stringify(spot)} selected`);
  }

  /**
   * Renders the filtered study spots and views to filter them.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement < any > {
    // Get current language for translations
    const Translations: Object = TranslationUtils.getTranslations(this.props.language);

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
              rightActionText={Translations.done}
              title={Translations.filter_descriptions}
              onRightAction={this._setFilterDescriptionsVisible.bind(this, false)} />
          <FilterDescriptions
              filters={this.state.filters}
              language={this.props.language} />
        </Modal>
        <View style={_styles.container}>
          <StudySpotList
              activeFilters={this.props.activeFilters}
              filter={this.props.filter}
              language={this.props.language}
              spots={this.state.spots}
              studyFilters={this.state.filters}
              timeFormat={this.props.timeFormat}
              onSelect={this._onSpotSelected.bind(this)} />
        </View>
        <Header
            backgroundColor={Constants.Colors.tertiaryBackground}
            icon={{ name: 'filter-list', class: 'material' }}
            subtitleCallback={this._setFilterDescriptionsVisible.bind(this, true)}
            subtitleIcon={{ name: 'info', class: 'material' }}
            title={Translations.filters} />
        <StudyFilters
            activeFilters={this.props.activeFilters}
            filters={this.state.filters}
            fullSize={false}
            language={this.props.language}
            onFilterSelected={this._onFilterSelected.bind(this)} />
        <View style={[ _styles.filterSelection, filterStyle ]}>
          <StudyFilters
              filters={this.state.filters}
              fullSize={true}
              language={this.props.language}
              onFilterSelected={this._onFilterSelected.bind(this)} />
          <View style={_styles.separator} />
          <TouchableOpacity onPress={() => this._onFilterSelected(-1)}>
            <Header
                backgroundColor={Constants.Colors.secondaryBackground}
                icon={{ class: 'material', name: 'list' }}
                subtitleIcon={{ class: 'material', name: 'chevron-right' }}
                title={Translations.view_full_list} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.Colors.primaryBackground,
  },
  filterSelection: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  filterNotSelected: {
    top: 0,
    bottom: 0,
  },
  filterSelected: {
    top: height,
    bottom: -height,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Constants.Colors.tertiaryBackground,
  },
});

const mapStateToProps = (store) => {
  return {
    activeFilters: store.search.studyFilters,
    filter: store.search.terms || '',
    language: store.config.options.language,
    timeFormat: store.config.options.preferredTimeFormat,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    activateFilter: (filter: number) => dispatch(actions.activateStudyFilter(filter)),
    deactivateFilter: (filter: number) => dispatch(actions.deactivateStudyFilter(filter)),
    setFilters: (filters: Array < number >) => dispatch(actions.setStudyFilters(filters)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(StudySpots);
