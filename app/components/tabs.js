'use strict';

var React = require('react-native');

var {
  StyleSheet,
  TouchableOpacity,
  View,
} = React;

var Constants = require('../constants');
var styles = require('../styles');
var Icon = require('react-native-vector-icons/Ionicons');

var currentTab = Constants.Views.Find.Home;

var TabBar = React.createClass({

  _changeTabs(tab) {
    // Switch to the selected tab
    currentTab = tab;
    this.props.navigator.push({id: tab});
  },

  render() {
    return (
      <View style={_styles.container}>
        <TouchableOpacity onPress={() => {this._changeTabs(Constants.Views.Find.Home)}} style={_styles.tab}>
          {currentTab === Constants.Views.Find.Home
              ? <Icon name={'navigate'} size={30} color='white' style={_styles.icon} />
              : <Icon name={'navigate'} size={30} color={Constants.Colors.darkGrey} style={_styles.icon} />}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {this._changeTabs(Constants.Views.Buses.Home)}} style={_styles.tab}>
        {currentTab === Constants.Views.Buses.Home
            ? <Icon name={'android-bus'} size={30} color='white' style={_styles.icon} />
            : <Icon name={'android-bus'} size={30} color={Constants.Colors.darkGrey} style={_styles.icon} />}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {this._changeTabs(Constants.Views.Discover.Home)}} style={_styles.tab}>
        {currentTab === Constants.Views.Discover.Home
            ? <Icon name={'compass'} size={30} color='white' style={_styles.icon} />
            : <Icon name={'compass'} size={30} color={Constants.Colors.darkGrey} style={_styles.icon} />}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {this._changeTabs(Constants.Views.Settings.Home)}} style={_styles.tab}>
        {currentTab === Constants.Views.Settings.Home
            ? <Icon name={'ios-gear'} size={30} color='white' style={_styles.icon} />
            : <Icon name={'ios-gear'} size={30} color={Constants.Colors.darkGrey} style={_styles.icon} />}
        </TouchableOpacity>
      </View>
    )
  },
});

var _styles = StyleSheet.create({
  container: {
    height: 45,
    flexDirection: 'row',
    paddingTop: 5,
    borderWidth: 1,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10,
  },
  icon: {
    width: 30,
    height: 30,
    position: 'absolute',
    top: 0,
    left: 20,
  },
});

module.exports = TabBar;
