/*
 * Displays details about the departure times of the shuttle from a single campus.
 */
'use strict';

// React imports
const React = require('react-native');
const {
  Component,
  Image,
  StyleSheet,
  View,
} = React;

const Configuration = require('../../util/Configuration');
const Constants = require('../../Constants');
const DisplayUtils = require('../../util/DisplayUtils');
const LanguageUtils = require('../../util/LanguageUtils');
const MapView = require('react-native-maps');
const Preferences = require('../../util/Preferences');


class ShuttleCampusInfo extends Component {

  /*
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    campusName: React.PropTypes.string.isRequired,
    campusColor: React.PropTypes.string.isRequired,
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
    this._getCampusMap = this._getCampusMap.bind(this);
    this._loadCampusInfo = this._loadCampusInfo.bind(this);
  };

  /*
   * Renders a map with a list of markers to denote bus stops near the campus.
   */
  _getCampusMap(Translations) {
    let initialRegion = {};
    let marker = null;

    if (this.state.campus == null) {
      let university = Configuration.getUniversity();
      let lat = university['lat'];
      let long = university['long'];
      initialRegion = {
        latitude: lat,
        longitude: long,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    } else {
      let lat = this.state.campus['lat'];
      let long = this.state.campus['long'];
      initialRegion = {
        latitude: lat,
        longitude: long,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      marker = (
        <MapView.Marker
            coordinate={initialRegion}
            description={LanguageUtils.getTranslatedName(Preferences.getSelectedLanguage(), this.state.campus)}
            title={Translations['shuttle_stop']}>
        </MapView.Marker>
      );
    }

    return (
      <MapView
          style={_styles.map}
          region={initialRegion}>
        {marker}
      </MapView>
    );
  };

  /*
   * Retrieves data about the campus provided as this.props.campusName.
   */
  _loadCampusInfo() {
    let campuses = require('../../../assets/static/json/shuttle.json');
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
    // Get current language for translations
    let Translations = null;
    if (Preferences.getSelectedLanguage() === 'fr') {
      Translations = require('../../../assets/static/js/Translations.fr.js');
    } else {
      Translations = require('../../../assets/static/js/Translations.en.js');
    }

    return (
      <View style={[_styles.container, {backgroundColor: this.props.campuscolor}]}>
        <View style={_styles.mapContainer}>
          {this._getCampusMap(Translations)}
        </View>
        <View style={_styles.timeContainer} />
      </View>
    );
  };
};

// Private styles for the component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 3,
  },
  timeContainer: {
    flex: 4,
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
module.exports = ShuttleCampusInfo;
