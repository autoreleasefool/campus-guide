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
 * @created 2016-10-19
 * @file BuildingGrid.js
 * @providesModule BuildingGrid
 * @description Displays the list of buildings in a grid, with the building's name and an image.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Types
import type { Building, Language } from 'types';

// Type definition for component props
type Props = {
  buildingList: Array < Object >,   // List of buildings to display
  columns: number,                  // Number of columns to show buildings in
  disableImages?: boolean,          // If true, grid should only show a list of names, with no images
  includeClear?: boolean,           // If true, an empty cell should be available to clear the choice
  filter: ?string,                  // Filter the list of buildings
  language: Language,               // Language to display building names in
  onSelect: (b: ?Building) => void, // Callback for when a building is selected
}

// Type definition for component state
type State = {
  buildings: Array < ?Building >,  // List of buildings
};

// Imports
import * as Constants from 'Constants';
import * as Translations from 'Translations';

// Determining size of building icons based on the screen size.
const { width } = Dimensions.get('window');

export default class BuildingGrid extends React.Component {

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
      buildings: [],
    };
  }

  /**
   * Loads the buildings once the view has been mounted, and registers a search listener.
   */
  componentDidMount(): void {
    this._filterBuildings(this.props);
  }

  /**
   * If a new filter is provided, update the list of buildings.
   *
   * @param {Props} nextProps the new props being received
   */
  componentWillReceiveProps(nextProps: Props): void {
    if (nextProps.filter != this.props.filter || nextProps.language != this.props.language) {
      this._filterBuildings(nextProps);
    }
  }

  /**
   * Gets a unique key for the building.
   *
   * @param {Building} building the building to get a key for
   * @param {number}   index    index of the building
   * @returns {string} the key
   */
  _buildingKeyExtractor(building: Building, index: number): string {
    return building.code || index.toString();
  }

  /**
   * Loads the names and images of the buildings from the assets to display them. Only shows buildings which names or
   * codes contain the search terms.
   *
   * @param {Props} props the props to filter with
   */
  _filterBuildings({ buildingList, filter, includeClear }: Props): void {
    // Ignore the case of the search terms
    const adjustedSearchTerms: ?string = (filter == null || filter.length === 0)
        ? null
        : filter.toUpperCase();

    // Create array for buildings
    const filteredBuildings: Array < ?Building > = [];

    if (includeClear) {
      filteredBuildings.push(null);
    }

    const totalBuildings = buildingList.length;
    for (let i = 0; i < totalBuildings; i++) {
      const building = buildingList[i];

      // If the search terms are empty, or the building name contains the terms, add it to the list
      const translated: boolean = !('name' in building);

      if (adjustedSearchTerms == null
          || (!translated && building.name.toUpperCase().indexOf(adjustedSearchTerms) >= 0)
          || (translated && (building.name_en.toUpperCase().indexOf(adjustedSearchTerms) >= 0
          || building.name_fr.toUpperCase().indexOf(adjustedSearchTerms) >= 0))
          || building.code.toUpperCase().indexOf(adjustedSearchTerms) >= 0) {
        filteredBuildings.push(building);
      }
    }

    // Update the state so the app reflects the changes made
    this.setState({ buildings: filteredBuildings });
  }

  /**
   * Displays a building's name and image.
   *
   * @param {Building} item information about the building to display
   * @returns {ReactElement<any>} an image (if enabled) and name for the building
   */
  _renderItem({ item }: { item: Building }): ReactElement < any > {
    const buildingImageSize: number = Math.floor(width / this.props.columns);

    let buildingStyle = { height: buildingImageSize, width: buildingImageSize };
    let textStyle = { backgroundColor: Constants.Colors.darkTransparentBackground };
    if (this.props.disableImages) {
      buildingStyle = { margin: 1, width: buildingImageSize - 2 };
      textStyle = {
        backgroundColor: Constants.Colors.darkMoreTransparentBackground,
        paddingTop: Constants.Sizes.Margins.Expanded,
        paddingBottom: Constants.Sizes.Margins.Expanded,
      };
    }

    const imageStyle = {
      width: width / this.props.columns,
      height: width / this.props.columns,
    };

    return (
      <TouchableOpacity onPress={() => this.props.onSelect(item)}>
        <View style={[ _styles.building, buildingStyle ]}>
          {this.props.disableImages || item == null
            ? null
            : <Image
                source={item.image}
                style={[ _styles.image, imageStyle ]} />}
          <Text style={[ _styles.buildingCode, textStyle ]}>
            {item == null ? Translations.get(this.props.language, 'none') : item.code}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  /**
   * Renders a list of the building names and icons once they have.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement < any > {
    let style = {};
    if (this.props.disableImages) {
      style = {
        marginTop: 1,
        marginBottom: 1,
      };
    }

    return (
      <FlatList
          data={this.state.buildings}
          keyExtractor={this._buildingKeyExtractor.bind(this)}
          numColumns={this.props.columns}
          renderItem={this._renderItem.bind(this)}
          style={style} />
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  building: {
    justifyContent: 'flex-end',
  },
  buildingCode: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
    textAlign: 'center',
    paddingTop: 5,
    paddingBottom: 5,
  },
  image: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
});
