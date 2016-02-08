'use strict';

var React = require('react-native');

var {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} = React;

var Constants = require('../constants');
var styles = require('../styles');
var Icon;
var tabIcons;

if (Platform.OS === 'ios') {
  Icon = require('react-native-vector-icons/Ionicons');
  tabIcons = {
    'Find': 'navigate',
    'Buses': 'android-bus',
    'Discover': 'compass',
    'Settings': 'ios-gear',
  };
} else {
  Icon = require('react-native-vector-icons/MaterialIcons');
  tabIcons = {
    'Find': 'directions',
    'Buses': 'directions-bus',
    'Discover': 'near-me',
    'Settings': 'settings',
  };
}

var currentTab = Constants.Views.Find.Home;

var TabBar = React.createClass({

  _changeTabs(tab) {
    // Switch to the selected tab
    currentTab = tab;
    this.props.navigator.push({id: tab});
  },

  render() {
    let findColor = Constants.Colors.charcoalGrey;
    let busColor = Constants.Colors.charcoalGrey;
    let discoverColor = Constants.Colors.charcoalGrey;
    let settingsColor = Constants.Colors.charcoalGrey;

    // Set the color of the current tab to garnet
    if (currentTab === Constants.Views.Find.Home) {
      findColor = Constants.Colors.garnet;
    } else if (currentTab === Constants.Views.Buses.Home) {
      busColor = Constants.Colors.garnet;
    } else if (currentTab === Constants.Views.Discover.Home) {
      discoverColor = Constants.Colors.garnet;
    } else if (currentTab === Constants.Views.Settings.Home) {
      settingsColor = Constants.Colors.garnet;
    }

    return (
      <View style={_styles.container}>
        <TouchableOpacity onPress={() => {this._changeTabs(Constants.Views.Find.Home)}} style={_styles.tab}>
          <Icon name={tabIcons['Find']} size={30} color={findColor} style={_styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {this._changeTabs(Constants.Views.Buses.Home)}} style={_styles.tab}>
          <Icon name={tabIcons['Buses']} size={30} color={busColor} style={_styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {this._changeTabs(Constants.Views.Discover.Home)}} style={_styles.tab}>
          <Icon name={tabIcons['Discover']} size={30} color={discoverColor} style={_styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {this._changeTabs(Constants.Views.Settings.Home)}} style={_styles.tab}>
          <Icon name={tabIcons['Settings']} size={30} color={settingsColor} style={_styles.icon} />
        </TouchableOpacity>
      </View>
    )
  },
});

var _styles = StyleSheet.create({
  container: {
    height: 50,
    flexDirection: 'row',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopColor: 'rgba(0, 0, 0, 0.4)',
    backgroundColor: Constants.Colors.polarGrey,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 30,
    height: 30,
  },
});

module.exports = TabBar;
