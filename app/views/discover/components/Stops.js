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

const LIST = 0;
const DETAILS = 1;

class Stops extends Component {

  /*
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    campus: React.PropTypes.object.isRequired,
    onStopSelected: React.PropTypes.func,
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
    this._loadStops = this._loadStops.bind(this);
    this._pressRow = this._pressRow.bind(this);
    this._renderRow = this._renderRow.bind(this);
    this._renderScene = this._renderScene.bind(this);
  };

  /*
   * Sets the transition between two views in the navigator.
   */
  _configureScene() {
    return Navigator.SceneConfigs.PushFromRight;
  };

  /*
   * Loads information about each of the stops on the campus into a list to display.
   */
  _loadStops() {
    let stops = [];
    for (let stop in this.props.campus['stops']) {
      stops.push(this.props.campus['stops'][stop]);
    }

    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(stops),
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
    this.refs.Navigator.push({id: DETAILS, stop: stop});
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
        <View>
          <SectionHeader
              sectionName={route.stop.name}
              sectionIcon={icon.name}
              sectionIconClass={icon.class}
              sectionIconOnClick={() => this.refs.Navigator.pop()}
              subtitleName={route.stop.code} />
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
              dataSource={this.state.dataSource}
              renderRow={this._renderRow} />
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
module.exports = Stops;
