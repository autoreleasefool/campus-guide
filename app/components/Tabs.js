/*
 * Tab bar to manage navigation between the root views in the application.
 */
'use strict';

// React imports
var React = require('react-native');
var {
  Animated,
  Component,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} = React;

var Constants = require('../Constants');

// Declaring icons depending on the platform
var Icon;
var tabIcons;
if (Platform.OS === 'ios') {
  Icon = require('react-native-vector-icons/Ionicons');
  tabIcons = {
    'Find': 'navigate',
    'Schedule': 'ios-calendar-outline',
    'Discover': 'compass',
    'Settings': 'ios-gear',
  };
} else {
  Icon = require('react-native-vector-icons/MaterialIcons');
  tabIcons = {
    'Find': 'directions',
    'Schedule': 'event',
    'Discover': 'near-me',
    'Settings': 'settings',
  };
}

// Determining the size of the current tab indicator based on the screen size
var {height, width} = Dimensions.get('window');
const indicatorWidth = Math.ceil(width / 4);
const indicatorHeight = 5;
const tabIconSize = 30;

class TabBar extends Component {

  /*
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    requestTabChange: React.PropTypes.func.isRequired,
  };

  /*
   * Pass props and declares initial state.
   */
  constructor(props) {
    super(props);
    this.state = {
      currentTab: Constants.Views.Find.Home,
    };

    // Explicitly binding 'this' to all methods that need it
    this._changeTabs = this._changeTabs.bind(this);
  };

  /*
   * Switch to the selected tab, as determined by tabId.
   */
  _changeTabs(tabId) {
    // Switch to the selected tab
    this.props.requestTabChange(tabId);
  };

  /*
   * Renders the app tabs and icons, and an indicator to show the current tab.
   */
  render() {
    let findColor = Constants.Colors.charcoalGrey;
    let scheduleColor = Constants.Colors.charcoalGrey;
    let discoverColor = Constants.Colors.charcoalGrey;
    let settingsColor = Constants.Colors.charcoalGrey;
    let indicatorLeft = 0;

    // Set the color of the current tab to garnet
    if (this.state.currentTab === Constants.Views.Find.Home) {
      indicatorLeft = 0;
      findColor = Constants.Colors.garnet;
    } else if (this.state.currentTab === Constants.Views.Schedule.Home) {
      indicatorLeft = indicatorWidth;
      scheduleColor = Constants.Colors.garnet;
    } else if (this.state.currentTab === Constants.Views.Discover.Home) {
      indicatorLeft = indicatorWidth * 2;
      discoverColor = Constants.Colors.garnet;
    } else if (this.state.currentTab === Constants.Views.Settings.Home) {
      indicatorLeft = indicatorWidth * 3;
      settingsColor = Constants.Colors.garnet;
    }

    return (
      <View style={_styles.container}>
        <TouchableOpacity onPress={() => {this._changeTabs(Constants.Views.Find.Home)}} style={_styles.tab}>
          <Icon name={tabIcons['Find']} size={tabIconSize} color={findColor} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {this._changeTabs(Constants.Views.Schedule.Home)}} style={_styles.tab}>
          <Icon name={tabIcons['Schedule']} size={tabIconSize} color={scheduleColor} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {this._changeTabs(Constants.Views.Discover.Home)}} style={_styles.tab}>
          <Icon name={tabIcons['Discover']} size={tabIconSize} color={discoverColor} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {this._changeTabs(Constants.Views.Settings.Home)}} style={_styles.tab}>
          <Icon name={tabIcons['Settings']} size={tabIconSize} color={settingsColor} />
        </TouchableOpacity>
        <View style={[_styles.indicator, {left: indicatorLeft}]} />
      </View>
    )
  };
};

// Private styles for component
var _styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Constants.Colors.rootElementBorder,
    backgroundColor: Constants.Colors.polarGrey,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    width: indicatorWidth,
    height: indicatorHeight,
    backgroundColor: Constants.Colors.garnet,
  }
});

// Expose component to app
module.exports = TabBar;
