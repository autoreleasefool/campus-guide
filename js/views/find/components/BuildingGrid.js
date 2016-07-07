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
 * @file BuildingGrid.js
 * @module BuildingGrid
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

// Type imports
import type {
  Building,
  DefaultFunction,
} from '../../../types';

// Type definition for component props.
type Props = {
  showBuilding: DefaultFunction,
};

// Type definition for component state.
type State = {
  dataSource: ListView.DataSource,
  loaded: boolean,
};

// Imports
const Constants = require('../../../Constants');

// Determining size of building icons based on the screen size.
const {width} = Dimensions.get('window');
// Number of columns to show buildings in
const BUILDING_COLUMNS: number = 3;
// Size of a single icon in the grid
const BUILDING_IMAGE_SIZE: number = Math.floor(width / BUILDING_COLUMNS);

class BuildingGrid extends React.Component {

  /**
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    showBuilding: React.PropTypes.func.isRequired,
  };

  /**
   * Define type for the component state.
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
      dataSource: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
      }),
      loaded: false,
    };

    // Explicitly binding 'this' to all methods that need it
    (this:any)._loadBuildingsList = this._loadBuildingsList.bind(this);
  }

  /**
   * Loads the buildings once the view has been mounted.
   */
  componentDidMount(): void {
    if (!this.state.loaded) {
      this._loadBuildingsList();
    }
  }

  /**
   * Loads the names and images of the buildings from the assets to display them.
   */
  _loadBuildingsList(): void {
    const buildingsList: Array<Building> = require('../../../../assets/js/Buildings');
    const buildingSetList: Array<Array<Building>> = [];
    for (let i = 0; i < buildingsList.length; i += BUILDING_COLUMNS) {

      // Create a list of buildings with up to BUILDING_COLUMNS indices
      const intermediateList: Array<Building> = [];
      for (let j = 0; j + i < buildingsList.length && j < BUILDING_COLUMNS; j++) {
        intermediateList.push(buildingsList[i + j]);
      }

      buildingSetList.push(intermediateList);
    }

    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(buildingSetList),
      loaded: true,
    });
  }

  /**
   * Displays a row of buildings with their names and images.
   *
   * @param {Array<Building>} buildingSet information about the buildings to display.
   * @returns {ReactElement<any>} an image and name for the building.
   */
  _renderRow(buildingSet: Array<Building>): ReactElement<any> {

    return (
      <View style={_styles.buildingSet}>
        {buildingSet.map((building, index) => (
          <TouchableOpacity
              key={index}
              onPress={() => this.props.showBuilding(building)}>
            <View style={_styles.building}>
              <Image
                  source={building.image}
                  style={_styles.buildingIcon} />
              <Text style={_styles.buildingCode}>{building.code}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  /**
   * Renders the view. Displays an empty view before the buildings have loaded and a list of the building names and
   * icons once they have.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement<any> {
    if (!this.state.loaded) {
      // Return an empty view until the data has been loaded
      return (
        <View />
      );
    }

    return (
      <ListView
          dataSource={this.state.dataSource}
          renderRow={this._renderRow.bind(this)} />
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  building: {
    justifyContent: 'flex-end',
    width: BUILDING_IMAGE_SIZE,
    height: BUILDING_IMAGE_SIZE,
  },
  buildingIcon: {
    position: 'absolute',
    width: width / BUILDING_COLUMNS,
    height: width / BUILDING_COLUMNS,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  buildingCode: {
    backgroundColor: Constants.Colors.defaultComponentBackgroundColor,
    color: 'white',
    fontSize: Constants.Text.Medium,
    textAlign: 'center',
    paddingTop: 5,
    paddingBottom: 5,
  },
  buildingSet: {
    flexDirection: 'row',
  },
});

module.exports = BuildingGrid;
