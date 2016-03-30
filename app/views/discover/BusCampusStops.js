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
  ListView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} = React;

const Configuration = require('../../util/Configuration');
const Constants = require('../../Constants');
const LanguageUtils = require('../../util/LanguageUtils');
const MapView = require('react-native-maps');
const Preferences = require('../../util/Preferences');
const SectionHeader = require('../../components/SectionHeader');
const Styles = require('../../Styles');

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
      dataSource: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
      }),
    }

    // Explicitly binding 'this' to all methods that need it
    this._getCampusMap = this._getCampusMap.bind(this);
    this._getCampusStops = this._getCampusStops.bind(this);
    this._loadCampusInfo = this._loadCampusInfo.bind(this);
    this._renderRow = this._renderRow.bind(this);
  };

  _getCampusMap() {
    let lat = 0;
    let long = 0;
    let markers = []

    if (this.state.campus == null) {
      let university = Configuration.getUniversity();
      lat = university['lat'];
      long = university['long'];
    } else {
      lat = this.state.campus['lat'];
      long = this.state.campus['long'];

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
          initialRegion={{
            latitude: lat,
            longitude: long,
            latitudeDelta: 0.04,
            longitudeDelta: 0.04,
          }}>
        {markers.map((marker) => (
          <MapView.Marker
            key={marker.id}
            coordinate={marker.latlng}
            title={marker.title}
            description={marker.desc}
          />
        ))}
      </MapView>
    );
  };

  /*
   * Returns a view containing a header and list with the stops surrounding the campus provided by
   * this.props.campusName.
   */
  _getCampusStops() {
    // Get current language for translations
    let Translations = null;
    if (Preferences.getSelectedLanguage() === 'fr') {
      Translations = require('../../../assets/static/js/Translations.fr.js');
    } else {
      Translations = require('../../../assets/static/js/Translations.en.js');
    }

    if (this.state.campus == null) {
      return (
        <View style={_styles.container} />
      );
    }

    return (
      <View style={_styles.container}>
        <SectionHeader
            sectionName={LanguageUtils.getTranslatedName(Preferences.getSelectedLanguage(), this.state.campus)}
            sectionIcon={'directions-bus'}
            sectionIconClass={'material'}
            subtitleName={Translations['filter']}
            subtitleOnClick={this._toggleFilter} />
        <ListView
            style={_styles.listview}
            dataSource={this.state.dataSource}
            renderRow={this._renderRow} />
      </View>
    );
  };

  /*
   * Retrieves data about the stop provided as this.props.campusName.
   */
  _loadCampusInfo() {
    let campuses = require('../../../assets/static/json/transit_stops.json');
    if (this.props.campusName in campuses) {
      let stops = [];
      for (let stop in campuses[this.props.campusName]['stops']) {
        stops.push(campuses[this.props.campusName]['stops'][stop]);
      }

      this.setState({
        campus: campuses[this.props.campusName],
        dataSource: this.state.dataSource.cloneWithRows(stops),
      });
    }
  };

  /*
   * Displays details about a single stop.
   */
  _pressRow(stop) {
    // TODO: open stop
    console.log('TODO: open stop');
  };

  /*
   * Shows partial details about a stop.
   */
  _renderRow(stop, sectionIndex, rowIndex) {
    return (
      <View>
        <TouchableOpacity onPress={() => this._pressRow(stop)}>
          <View style={_styles.stopHeader}>
            <Text style={[Styles.largeText, _styles.stopHeaderTitle]}>
              {stop.name}
            </Text>
            <Text style={[Styles.smallText, _styles.stopHeaderSubtitle]}>
              {stop.code}
            </Text>
          </View>
          <Text style={[Styles.mediumText, _styles.stopRoutes]}>
            {stop.routes.join(', ')}
          </Text>
        </TouchableOpacity>
        {(rowIndex != this.state.dataSource.getRowCount() - 1)
            ? <View style={_styles.divider} />
            : null}
      </View>
    );
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
  listview: {
    backgroundColor: Constants.Colors.defaultComponentBackgroundColor,
    margin: 10,
  },
  stopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
  },
  stopHeaderTitle: {
    flex: 1,
    textAlign: 'left',
    color: Constants.Colors.primaryWhiteText,
  },
  stopHeaderSubtitle: {
    textAlign: 'right',
    color: Constants.Colors.secondaryWhiteText,
  },
  stopRoutes: {
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
    color: Constants.Colors.primaryWhiteText,
  },
  divider: {
    flex: 1,
    height: 1,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: Constants.Colors.secondaryWhiteText,
  },
});

// Expose component to app
module.exports = CampusStops;
