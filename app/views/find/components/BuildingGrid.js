/*
 * Displays the list of buildings in a grid, with the building's name and an image.
 */
'use strict';

// React imports
const React = require('react-native');
const {
  Component,
  Dimensions,
  Image,
  ListView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} = React;

// Determining size of building icons based on the screen size.
const {height, width} = Dimensions.get('window');
const buildingIconSize = Math.floor((width - 60) / 3);

class BuildingGrid extends Component {

  /*
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    showBuilding: React.PropTypes.func.isRequired,
  };

  /*
   * Pass props and declares initial state.
   */
  constructor(props) {
    super(props);
    this.state = {
      dataSource: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
      }),
      loaded: false,
    }

    // Explicitly binding 'this' to all methods that need it
    this._loadBuildingsList = this._loadBuildingsList.bind(this);
    this._renderRow = this._renderRow.bind(this);
  };

  /*
   * Loads the names and images of the buildings from the assets to display them.
   */
  _loadBuildingsList() {
    let buildingsList = require('../../../../assets/static/js/Buildings');

    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(buildingsList),
      loaded: true,
    });
  };

  /*
   * Displays a single building with its name and image.
   */
  _renderRow(building, sectionId, rowId) {
    let rowVal = parseInt(rowId);
    let iconLeftMargin = 5;
    let iconRightMargin = 5;
    let iconTopMargin = 0;

    // Add additional left and right spacing to items on the edges
    if (rowVal % 3 === 0) {
      iconLeftMargin += 5;
    } else if (rowVal % 3 === 2) {
      iconRightMargin += 5;
    }

    // Add additional top margin to the first row
    if (rowVal < 3) {
      iconTopMargin = 10;
    }

    return (
      <TouchableOpacity onPress={() => this.props.showBuilding(building)}>
        <View style={{width: buildingIconSize, marginLeft: iconLeftMargin, marginRight: iconRightMargin, marginTop: iconTopMargin, marginBottom: 15}}>
          <Image style={_styles.buildingIcon} source={building.icon} />
          <Text style={_styles.buildingCode}>{building.code}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  /*
   * Loads the buildings once the view has been mounted.
   */
  componentDidMount() {
    if (!this.state.loaded) {
      this._loadBuildingsList();
    }
  };

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
