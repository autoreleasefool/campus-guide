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
 * @description Displays the list of buildings in a grid, with the building's
 *              name and an image.
 * @flow
 *
 */
'use strict';

// React Native imports
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

// Import type definitions
import type {
  Building,
} from '../../../Types';

// Determining size of building icons based on the screen size.
const {height, width} = Dimensions.get('window');
const buildingIconSize: number = Math.floor((width - 60) / 3);

// Type definition for component props.
type Props = {
  showBuilding: () => any,
};

// Type definition for component state.
type State = {
  dataSource: ListView.DataSource,
  loaded: boolean,
};

class BuildingGrid extends React.Component {
  state: State;

  /*
   * Properties which the parent component should make available to this
   * component.
   */
  static propTypes = {
    showBuilding: React.PropTypes.func.isRequired,
  };

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
  };

  /**
   * Loads the names and images of the buildings from the assets to display
   * them.
   */
  _loadBuildingsList(): void {
    let buildingsList: Array<Building> = require('../../../../assets/static/js/Buildings');

    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(buildingsList),
      loaded: true,
    });
  };

  /**
   * Displays a single building with its name and image.
   *
   * @param {Building} building information about the building to display.
   * @param {string} sectionId  index of the section the building is in.
   * @param {number} rowId      index of the row the building is in.
   * @return {ReactElement} an image and name for the building.
   */
  _renderRow(building: Building, sectionId: string, rowIndex: number): ReactElement {
    let iconLeftMargin: number = 5;
    let iconRightMargin: number = 5;
    let iconTopMargin: number = 0;

    // Add additional left and right spacing to items on the edges
    if (rowIndex % 3 === 0) {
      iconLeftMargin += 5;
    } else if (rowIndex % 3 === 2) {
      iconRightMargin += 5;
    }

    // Add additional top margin to the first row
    if (rowIndex < 3) {
      iconTopMargin = 10;
    }

    return (
      <TouchableOpacity onPress={() => this.props.showBuilding(building)}>
        <View style={{width: buildingIconSize, marginLeft: iconLeftMargin, marginRight: iconRightMargin, marginTop: iconTopMargin, marginBottom: 15}}>
          <Image style={_styles.buildingIcon} source={building.image} />
          <Text style={_styles.buildingCode}>{building.code}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  /**
   * Loads the buildings once the view has been mounted.
   */
  componentDidMount(): void {
    if (!this.state.loaded) {
      this._loadBuildingsList();
    }
  };

  /**
   * Renders the view. Displays an empty view before the buildings have loaded and a list of the building names
   * and icons once they have.
   *
   * @return {ReactElement} the hierarchy of views to render.
   */
  render(): ReactElement {
    if (!this.state.loaded) {
      // Return an empty view until the data has been loaded
      return (
        <View />
      );
    }

    return (
      <ListView
          contentContainerStyle={_styles.listview}
          dataSource={this.state.dataSource}
          renderRow={this._renderRow.bind(this)} />
    );
  };
};

// Private styles for component
const _styles = StyleSheet.create({
  listview: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  building: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buildingIcon: {
    width: (width - 60) / 3,
    height: (width - 60) / 3,
  },
  buildingCode: {
    textAlign: 'center',
    color: 'white',
    marginTop: 5,
  },
});

// Expose component to app
module.exports = BuildingGrid;
