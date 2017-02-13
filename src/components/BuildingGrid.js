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
  Image,
  ListView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Types
import type { Building, Language } from 'types';

// Type definition for component props
type Props = {
  columns: number,                  // Number of columns to show buildings in
  disableImages?: boolean,          // If true, grid should only show a list of names, with no images
  includeClear?: boolean,           // If true, an empty cell should be available to clear the choice
  filter: ?string,                  // Filter the list of buildings
  language: Language,               // Language to display building names in
  onSelect: (b: ?Building) => void, // Callback for when a building is selected
}

// Type definition for component state
type State = {
  dataSource: ListView.DataSource,  // List of buildings for the ListView
};

// Imports
import * as Constants from 'Constants';
import * as TranslationUtils from 'TranslationUtils';

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
      dataSource: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
      }),
    };
  }

  /**
   * Loads the buildings once the view has been mounted, and registers a search listener.
   */
  componentDidMount(): void {
    this._filterBuildings(this.props.filter);
  }

  /**
   * If a new filter is provided, update the list of buildings.
   *
   * @param {Props} nextProps the new props being received
   */
  componentWillReceiveProps(nextProps: Props): void {
    if (nextProps.filter != this.props.filter || nextProps.language != this.props.language) {
      this._filterBuildings(nextProps.filter);
    }
  }

  /* List of buildings on the campus. */
  _buildingsList: Array < Object > = [];

  /**
   * Loads the names and images of the buildings from the assets to display them. Only shows buildings which names or
   * codes contain the search terms.
   *
   * @param {?string} searchTerms user input search terms.
   */
  _filterBuildings(searchTerms: ?string): void {
    if (this._buildingsList == null || this._buildingsList.length === 0) {
      this._buildingsList = require('../../assets/js/Buildings');
    }

    // Ignore the case of the search terms
    const adjustedSearchTerms: ?string = (searchTerms == null || searchTerms.length === 0)
        ? null
        : searchTerms.toUpperCase();

    // Create array for buildings
    const filteredBuildings: Array < ?Building > = [];

    if (this.props.includeClear) {
      filteredBuildings.push(null);
    }

    for (let i = 0; i < this._buildingsList.length; i++) {
      // If the search terms are empty, or the building name contains the terms, add it to the list
      const translated: boolean = !('name' in this._buildingsList[i]);

      if (adjustedSearchTerms == null
          || (!translated && this._buildingsList[i].name.toUpperCase().indexOf(adjustedSearchTerms) >= 0)
          || (translated && (this._buildingsList[i].name_en.toUpperCase().indexOf(adjustedSearchTerms) >= 0
          || this._buildingsList[i].name_fr.toUpperCase().indexOf(adjustedSearchTerms) >= 0))
          || this._buildingsList[i].code.toUpperCase().indexOf(adjustedSearchTerms) >= 0) {
        filteredBuildings.push(this._buildingsList[i]);
      }
    }

    // Update the state so the app reflects the changes made
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(filteredBuildings),
    });
  }

  /**
   * Displays a building's name and image.
   *
   * @param {?Building} building information about the building to display
   * @returns {ReactElement<any>} an image (if enabled) and name for the building
   */
  _renderRow(building: ?Building): ReactElement < any > {
    // Get current language for translations
    const Translations: Object = TranslationUtils.getTranslations(this.props.language);

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
      <TouchableOpacity onPress={() => this.props.onSelect(building)}>
        <View style={[ _styles.building, buildingStyle ]}>
          {this.props.disableImages || building == null
            ? null
            : <Image
                source={building.image}
                style={[ _styles.image, imageStyle ]} />}
          <Text style={[ _styles.buildingCode, textStyle ]}>
            {building == null ? Translations.none : building.code}
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
      <ListView
          contentContainerStyle={_styles.listView}
          dataSource={this.state.dataSource}
          enableEmptySections={true}
          pageSize={this.props.columns}
          renderRow={this._renderRow.bind(this)}
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
  listView: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
