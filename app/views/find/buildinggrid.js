'use strict';

// Imports
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

  _loadBuildingsList() {
    var buildingsList = require('./buildings').Buildings;

    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(buildingsList),
      loaded: true,
    });
  },

  _renderRow(building, sectionId, rowId) {
    let rowVal = parseInt(rowId);
    let iconWidth = (rowVal % 3 === 1)
        ? buildingItemSize - 20
        : buildingItemSize - 30;
    let iconLeftMargin = 10;
    let iconRightMargin = 10;
    let iconTopMargin = 0;

    if (rowVal % 3 === 0) {
      iconLeftMargin += 10;
    } else if (rowVal % 3 === 2) {
      iconRightMargin += 10;
    }

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

  _pressRow(code) {
    // TODO: open building page with rooms
    console.log('TODO: open building page with rooms');
  },

  getInitialState: function() {
    return {
      dataSource: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
      }),
      loaded: false,
    }
  },

  componentDidMount() {
    if (!this.state.loaded) {
      this._loadBuildingsList();
    }
  },

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
