/*
 * Displays details about the stops provided. Navigates between a list of stops and their individual details.
 */
'use strict';

// Imports
const React = require('react-native');
const {
  Component,
  ListView,
  Navigator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} = React;

const Constants = require('../../../Constants');
const LanguageUtils = require('../../../util/LanguageUtils');
const Preferences = require('../../../util/Preferences');
const SectionHeader = require('../../../components/SectionHeader');
const Styles = require('../../../Styles');
const TextUtils = require('../../../util/TextUtils');

const LIST = 0;
const DETAILS = 1;

class Stops extends Component {

  /*
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    campus: React.PropTypes.object.isRequired,
    campusName: React.PropTypes.string.isRequired,
    onStopSelected: React.PropTypes.func,
  };

  /*
   * Pass props and declares initial state.
   */
  constructor(props) {
    super(props);

    this.state = {
      dataSourceStops: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
      }),
      dataSourceTimes: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
      }),
      loaded: false,
    }

    // Explicitly binding 'this' to all methods that need it
    this._clearStop = this._clearStop.bind(this);
    this._loadStops = this._loadStops.bind(this);
    this._pressRow = this._pressRow.bind(this);
    this._renderStopRow = this._renderStopRow.bind(this);
    this._renderTimeRow = this._renderTimeRow.bind(this);
    this._renderScene = this._renderScene.bind(this);
  };

  /*
   * Informs parent that no stop is selected.
   */
  _clearStop() {
    this.refs.Navigator.pop();
    if (this.props.onStopSelected) {
      this.props.onStopSelected(null);
    }
  }


  /*
   * Sets the transition between two views in the navigator.
   */
  _configureScene() {
    return Navigator.SceneConfigs.PushFromRight;
  };

  /*
   * If a time has an hour greater than 23, it is adjusted to be within 24 hours.
   */
  _getAdjustedTime(time) {
    let hours = parseInt(time.substring(0, 2));
    let minutes = time.substring(3, 5);
    if (hours > 23) {
      hours = hours - 24;
    }

    return TextUtils.leftPad(hours.toString(), 2, '0')
    + ':' + minutes;
  }

  /*
   * Loads information about each of the stops on the campus into a list to display.
   */
  _loadStops() {
    let stops = [];
    for (let stop in this.props.campus['stops']) {
      let stopInfo = {
        code: this.props.campus['stops'][stop].code,
        name: this.props.campus['stops'][stop].name,
        lat: this.props.campus['stops'][stop].lat,
        long: this.props.campus['stops'][stop].long,
        routes: this.props.campus['stops'][stop].routes.slice(),
        key: stop,
      };

      stops.push(stopInfo);
    }

    this.setState({
      dataSourceStops: this.state.dataSourceStops.cloneWithRows(stops),
      loaded: true,
    });
  }

  /*
   * Displays details about a single stop.
   */
  _pressRow(stop) {
    if (this.props.onStopSelected) {
      this.props.onStopSelected(stop);
    }

    let stopInfo = require('../../../../assets/static/json/transit_times.json');
    stopInfo = stopInfo[this.props.campusName]['stops'][stop.key]['routes'];
    let routesAndTimes = [];
    for (let route in stopInfo) {
      routesAndTimes.push({
        number: route,
        sign: stopInfo[route]['sign'],
        days: stopInfo[route]['days'],
      });
    }

    this.refs.Navigator.push({id: DETAILS, stop: stop});
    this.setState({
      dataSourceTimes: this.state.dataSourceTimes.cloneWithRows(routesAndTimes),
    })
  };

  /*
   * Shows partial details about a stop.
   */
  _renderStopRow(stop, sectionIndex, rowIndex) {
    return (
      <View>
        <TouchableOpacity onPress={() => this._pressRow(stop)}>
          <View style={_styles.header}>
            <Text style={[Styles.largeText, _styles.headerTitle]}>
              {stop.name}
            </Text>
            <Text style={[Styles.smallText, _styles.headerSubtitle]}>
              {stop.code}
            </Text>
          </View>
          <Text style={[Styles.mediumText, _styles.stopRoutes]}>
            {stop.routes.join(', ')}
          </Text>
        </TouchableOpacity>
        {(rowIndex != this.state.dataSourceStops.getRowCount() - 1)
            ? <View style={_styles.divider} />
            : null}
      </View>
    );
  };

  _renderTimeRow(route, sectionIndex, rowIndex) {
    return (
      <View>
        <View style={_styles.header}>
          <Text style={[Styles.largeText, _styles.headerTitle]}>
            {route.sign}
          </Text>
          <Text style={[Styles.smallText, _styles.headerSubtitle]}>
            {route.number}
          </Text>
        </View>
        <Text style={[Styles.mediumText, _styles.stopTimes]}>
          {this._retrieveUpcomingTimes(route.days)}
        </Text>
        {(rowIndex != this.state.dataSourceTimes.getRowCount() - 1)
            ? <View style={_styles.divider} />
            : null}
      </View>
    );
  };

  _retrieveUpcomingTimes(days) {
    let upcomingTimes = [];
    let now = new Date();
    let currentDay = now.getDay().toString();
    let currentTime = TextUtils.leftPad(now.getHours().toString(), 2, '0')
        + ':'
        + TextUtils.leftPad(now.getMinutes().toString(), 2, '0');
    for (let day in days) {
      if (day.indexOf(currentDay) > -1) {
        let i = days[day].length - 1;
        while (i >= 0) {
          if (days[day][i].localeCompare(currentTime) < 0 || i == 0) {
            let j = 1;
            while (j < 4 && i + j < days[day].length) {
              upcomingTimes.push(this._getAdjustedTime(days[day][i + j]));
              j += 1;
            }
            break;
          }
          i -= 1;
        }
      }
    }

    if (upcomingTimes.length > 0) {
      return upcomingTimes.join('   ');
    } else {
      return 'No upcoming buses';
    }
  }

  /*
   * Renders a view according to the current route of the navigator.
   */
  _renderScene(route, navigator) {
    if (route.id === DETAILS && route.stop != null) {
      let icon = {
        class: 'material',
        name: 'arrow-back',
      };
      if (Platform.OS === 'ios') {
        icon = {
          class: 'ionicon',
          name: 'ios-arrow-back',
        };
      }

      return (
        <View style={_styles.container}>
          <SectionHeader
              sectionName={route.stop.name}
              sectionIcon={icon.name}
              sectionIconClass={icon.class}
              sectionIconOnClick={this._clearStop}
              subtitleName={route.stop.code} />
          <ListView
              dataSource={this.state.dataSourceTimes}
              renderRow={this._renderTimeRow} />
        </View>
      );
    } else {
      return (
        <View style={_styles.container}>
          <SectionHeader
              sectionName={LanguageUtils.getTranslatedName(Preferences.getSelectedLanguage(), this.props.campus)}
              sectionIcon={'directions-bus'}
              sectionIconClass={'material'} />
          <ListView
              dataSource={this.state.dataSourceStops}
              renderRow={this._renderStopRow} />
        </View>
      );
    }
  };

  componentDidMount() {
    if (!this.state.loaded) {
      this._loadStops();
    }
  };

  render() {
    return (
      <View style={_styles.container}>
        <Navigator
            ref='Navigator'
            configureScene={this._configureScene}
            initialRoute={{id: LIST}}
            renderScene={this._renderScene} />
      </View>
    );
  }
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'left',
    color: Constants.Colors.primaryWhiteText,
  },
  headerSubtitle: {
    textAlign: 'right',
    color: Constants.Colors.secondaryWhiteText,
  },
  stopRoutes: {
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
    color: Constants.Colors.primaryWhiteText,
  },
  stopTimes: {
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
    color: Constants.Colors.primaryWhiteText,
    fontStyle: 'italic',
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
module.exports = Stops;
