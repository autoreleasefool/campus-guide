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
 * @file StudySpotList.js
 * @providesModule StudySpotList
 * @description Displays a list of filterable study spots
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  Image,
  ListView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Types
import type { Language, StudySpot, StudySpotFilter, TimeFormat } from 'types';

// Type definition for component props.
type Props = {
  activeFilters: Array < number >,          // List of active study spot filters
  filter: ?string,                          // Filter the list of buildings
  studyFilters: Array < StudySpotFilter >,  // Set of available study room filters
  language: Language,                       // Language to display building names in
  onSelect: (s: StudySpot) => void,         // Callback for when a spot is selected
  spots: Array < StudySpot >,               // Study spot properties to display
  timeFormat: TimeFormat,                   // Format to display times in
}

// Type definition for component state
type State = {
  dataSource: ListView.DataSource,  // List of spots for the ListView
};

// Imports
import PaddedIcon from 'PaddedIcon';
import * as Configuration from 'Configuration';
import * as Constants from 'Constants';
import * as DisplayUtils from 'DisplayUtils';
import * as TextUtils from 'TextUtils';
import * as TranslationUtils from 'TranslationUtils';

export default class StudySpotList extends React.Component {

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
      dataSource: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
      }),
    };
  }

  /**
   * Loads the study spots once the view has been mounted.
   */
  componentDidMount(): void {
    this._filterStudySpots(this.props);
  }

  /**
   * If a new filter is provided, update the list of study spots.
   *
   * @param {Props} nextProps the new props being received
   */
  componentWillReceiveProps(nextProps: Props): void {
    // Basic boolean comparisons to see if re-filtering needs to occur
    if (nextProps.filter != this.props.filter
        || nextProps.language != this.props.language
        || nextProps.spots != this.props.spots) {
      this._filterStudySpots(nextProps);
      return;
    }

    // Compare filters to see if re-filtering needs to occur
    if (!this.props.activeFilters || nextProps.activeFilters.length !== this.props.activeFilters.length) {
      this._filterStudySpots(nextProps);
      return;
    }

    for (let i = 0; i < nextProps.activeFilters.length; i++) {
      if (nextProps.activeFilters[i] !== this.props.activeFilters[i]) {
        this._filterStudySpots(nextProps);
        return;
      }
    }
  }

  /**
   * Check if the spot contains all of the active filters.
   *
   * @param {Array<number>} activeFilters currently active filters
   * @param {Array<number>} spotFilters   filters applied to the spot
   * @returns {boolean} true iff the spot contains all the active filters, false otherwise
   */
  _spotMatchesAllFilters(activeFilters: Array < number >, spotFilters: Array < number >): boolean {
    if (!activeFilters || activeFilters.length === 0) {
      return true;
    }

    const totalActiveFilters = activeFilters.length;
    const totalSpotFilters = spotFilters.length;
    let activeIdx = 0;
    let spotIdx = 0;
    let matches = 0;

    while (activeIdx < totalActiveFilters && spotIdx < totalSpotFilters) {
      if (activeFilters[activeIdx] === spotFilters[spotIdx]) {
        matches += 1;
        activeIdx += 1;
        spotIdx += 1;
      } else if (activeFilters[activeIdx] < spotFilters[spotIdx]) {
        activeIdx += 1;
      } else {
        spotIdx += 1;
      }
    }

    return matches === totalActiveFilters;
  }

  /**
   * Only show study spots which names or building names contain the search terms.
   *
   * @param {Props} props the props to use to filter
   */
  _filterStudySpots({ filter, activeFilters, spots }: Props): void {
    // Ignore the case of the search terms
    const adjustedSearchTerms: ?string = (filter == null || filter.length === 0)
        ? null
        : filter.toUpperCase();

    // Create array for spots
    const filteredSpots: Array < StudySpot > = [];

    for (let i = 0; spots && i < spots.length; i++) {
      const spot: Object = spots[i];

      // Don't add the spot if it doesn't match all the filters
      if (!this._spotMatchesAllFilters(activeFilters, spot.filters)) {
        continue;
      }

      // If the search terms are empty, or the spot properties contains the terms, add it to the list
      if (adjustedSearchTerms == null
          || spot.building.toUpperCase().indexOf(adjustedSearchTerms) >= 0
          || (spot.name && spot.name.toUpperCase().indexOf(adjustedSearchTerms) >= 0)
          || (spot.name_en && spot.name_en.toUpperCase().indexOf(adjustedSearchTerms) >= 0)
          || (spot.name_fr && spot.name_fr.toUpperCase().indexOf(adjustedSearchTerms) >= 0)) {
        filteredSpots.push(spot);
        continue;
      }
    }

    // Update the state so the app reflects the changes made
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(filteredSpots),
    });
  }

  /**
   * Displays a spots's name, image and description.
   *
   * @param {?StudySpot} spot information about the study spot to display
   * @returns {ReactElement<any>} an image and views describing the spot
   */
  _renderRow(spot: StudySpot): ReactElement < any > {
    const altName = TranslationUtils.getTranslatedName(this.props.language, spot);
    const name = `${spot.building} ${spot.room}`;
    const openingTime = TextUtils.convertTimeFormat(this.props.timeFormat, spot.opens);
    const closingTime = TextUtils.convertTimeFormat(this.props.timeFormat, spot.closes);
    const description = TranslationUtils.getTranslatedVariant(this.props.language, 'description', spot) || '';

    return (
      <TouchableOpacity
          key={name}
          onPress={() => this.props.onSelect(spot)}>
        <View style={_styles.spot}>
          <Image
              resizeMode={'cover'}
              source={{ uri: Configuration.getImagePath(spot.image) }}
              style={_styles.spotImage} />
          <View style={_styles.spotProperties}>
            <Text style={_styles.spotName}>{name}</Text>
            {altName == null ? null : <Text style={_styles.spotSubtitle}>{altName}</Text>}
            <Text style={_styles.spotSubtitle}>{`${openingTime} - ${closingTime}`}</Text>
            <Text style={_styles.spotDescription}>{description}</Text>
            <View style={_styles.spotFilters}>
              {spot.filters.map((filter) => (
                <PaddedIcon
                    color={Constants.Colors.primaryWhiteIcon}
                    icon={DisplayUtils.getPlatformIcon(Platform.OS, this.props.studyFilters[filter])}
                    key={filter}
                    size={Constants.Sizes.Icons.Medium}
                    width={Constants.Sizes.Icons.Medium + Constants.Sizes.Margins.Expanded} />
              ))}
            </View>
          </View>
        </View>
      </TouchableOpacity>
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
   * Returns a list of touchable views listing the study spot descriptions.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement < any > {
    return (
      <View style={_styles.container}>
        <ListView
            dataSource={this.state.dataSource}
            enableEmptySections={true}
            renderRow={this._renderRow.bind(this)}
            renderSeparator={this._renderSeparator} />
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
  spot: {
    flex: 1,
    margin: Constants.Sizes.Margins.Expanded,
    alignItems: 'center',
    flexDirection: 'row',
  },
  spotProperties: {
    flex: 1,
  },
  spotImage: {
    alignSelf: 'flex-start',
    marginRight: Constants.Sizes.Margins.Expanded,
    width: 64,
    height: 64,
  },
  spotName: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Subtitle,
  },
  spotSubtitle: {
    color: Constants.Colors.secondaryWhiteText,
    fontSize: Constants.Sizes.Text.Caption,
    marginTop: Constants.Sizes.Margins.Condensed,
  },
  spotDescription: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
    marginTop: Constants.Sizes.Margins.Condensed,
  },
  spotFilters: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    marginTop: Constants.Sizes.Margins.Expanded,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Constants.Sizes.Margins.Expanded,
    backgroundColor: Constants.Colors.tertiaryBackground,
  },
});
