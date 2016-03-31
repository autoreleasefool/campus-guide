/*
 * Displays a campus' location on a map, relative to a user's location, as well as a list of the stops
 * near the campus.
 */
'use strict';

// Imports
const React = require('react-native');
const {
  Component,
  Image,
  StyleSheet,
  View,
} = React;

const Configuration = require('../../util/Configuration');
const Constants = require('../../Constants');
const MapView = require('react-native-maps');
const Stops = require('./components/Stops');

class CampusStops extends Component {

  /*
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    campusName: React.PropTypes.string.isRequired,
  };

  /*
   * Pass props and declares initial state.
   */
  constructor(props) {
    super(props);

    this.state = {
      campus: null,
      region: null,
    }

    // Explicitly binding 'this' to all methods that need it
    this._busStopSelected = this._busStopSelected.bind(this);
    this._getCampusMap = this._getCampusMap.bind(this);
    this._getCampusStops = this._getCampusStops.bind(this);
    this._loadCampusInfo = this._loadCampusInfo.bind(this);
  };

  /*
   * Invoked when the user selects a stop.
   */
  _busStopSelected(stop) {
    if (stop === null) {
      this.setState({
        region: null,
      });
    } else {
      this.setState({
        region: {
          latitude: stop.lat,
          longitude: stop.long,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
      });
    }
  }

  /*
   * Renders a map with a list of markers to denote bus stops near the campus.
   */
  _getCampusMap() {
    let lat = 0;
    let long = 0;
    let markers = []
    let initialRegion = {};

    if (this.state.campus == null) {
      let university = Configuration.getUniversity();
      lat = university['lat'];
      long = university['long'];
      initialRegion = {
        latitude: lat,
        longitude: long,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    } else {
      lat = this.state.campus['lat'];
      long = this.state.campus['long'];
      initialRegion = {
        latitude: lat,
        longitude: long,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      for (let stop in this.state.campus['stops']) {
        markers.push({
          'title': this.state.campus['stops'][stop].name,
          'desc': this.state.campus['stops'][stop].code,
          'id': stop,
          'latlng': {
            'latitude': this.state.campus['stops'][stop].lat,
            'longitude': this.state.campus['stops'][stop].long,
          },
        });
      }

    }

    return (
      <MapView
          style={_styles.map}
          region={this.state.region || initialRegion}>
        {markers.map((marker) => (
          <MapView.Marker
              key={marker.id}
              coordinate={marker.latlng}
              title={marker.title}
              description={marker.desc}>
          </MapView.Marker>
        ))}
      </MapView>
    );
  };

  /*
   * Returns a view containing a header and list with the stops surrounding the campus provided by
   * this.props.campusName.
   */
  _getCampusStops() {
    if (this.state.campus == null) {
      return (
        <View style={_styles.container} />
      );
    } else {
      return (
        <Stops campus={this.state.campus} campusName={this.props.campusName} onStopSelected={this._busStopSelected} />
      )
    }
  };

  /*
   * Retrieves data about the campus provided as this.props.campusName.
   */
  _loadCampusInfo() {
    let campuses = require('../../../assets/static/json/transit_stops.json');
    if (this.props.campusName in campuses) {
      this.setState({
        campus: campuses[this.props.campusName],
      });
    }
  };

  componentDidMount() {
    if (this.state.campus == null) {
      this._loadCampusInfo();
    }
  };

  render() {
    return (
      <View style={_styles.container}>
        <View style={_styles.container}>
          {this._getCampusMap()}
        </View>
        {this._getCampusStops()}
      </View>
    );
  };
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

// Expose component to app
module.exports = CampusStops;
