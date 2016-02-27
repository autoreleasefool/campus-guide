/*
 * Displays the list of buildings in a grid, with the building's name and an image.
 */
'use strict';

// React imports
var React = require('react-native');
var {
  Dimensions,
  Image,
  ListView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} = React;

var {height, width} = Dimensions.get('window');
var buildingItemSize = (width - 40) / 3;

// Root view
var BuildingGrid = React.createClass({

  /*
   * Loads the names and images of the buildings from the assets to display them.
   */
  _loadBuildingsList() {
    var buildingsList = require('../../../assets/static/js/Buildings');

    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(buildingsList),
      loaded: true,
    });
  },

  /*
   * Displays a single building with its name and image.
   */
  _renderRow(building, sectionId, rowId) {
    let rowVal = parseInt(rowId);
    let iconWidth = (rowVal % 3 === 1)
        ? buildingItemSize - 20
        : buildingItemSize - 30;
    let iconLeftMargin = 10;
    let iconRightMargin = 10;
    let iconTopMargin = 0;

    // Add additional left and right spacing to items on the edges
    if (rowVal % 3 === 0) {
      iconLeftMargin += 10;
    } else if (rowVal % 3 === 2) {
      iconRightMargin += 10;
    }

    // Add additional top margin to the first row
    if (rowVal < 3) {
      iconTopMargin = 10;
    }

    return (
      <TouchableOpacity onPress={() => this._pressRow(building.code)}>
        <View style={{width: iconWidth, marginLeft: iconLeftMargin, marginRight: iconRightMargin, marginTop: iconTopMargin, marginBottom: 10}}>
          <Image style={_styles.buildingIcon} source={building.icon} />
          <Text style={_styles.buildingCode}>{building.code}</Text>
        </View>
      </TouchableOpacity>
    );
  },

  /*
   * Displays the details of a single building.
   */
  _pressRow(code) {
    // TODO: open building page with rooms
    console.log('TODO: open building page with rooms');
  },

  /*
   * Returns the initial state of the view.
   */
  getInitialState() {
    return {
      dataSource: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
      }),
      loaded: false,
    }
  },

  /*
   * Loads the buildings once the view has been mounted.
   */
  componentDidMount() {
    if (!this.state.loaded) {
      this._loadBuildingsList();
    }
  },

  /*
   * Renders the view. Displays an empty view before the buildings have loaded and a list of the building names
   * and icons once they have.
   */
  render() {
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
          renderRow={this._renderRow} />
    );
  },
});

// View styles
var _styles = StyleSheet.create({
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
    width: (width - 120) / 3,
    height: (width - 120) / 3,
  },
  buildingCode: {
    textAlign: 'center',
    color: 'white',
    marginTop: 5,
  },
});

module.exports = BuildingGrid;
