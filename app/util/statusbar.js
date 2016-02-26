'use strict';

var React = require('react-native');
var {
  Platform,
  StatusBarIOS,
} = React;

var statusBarPadding = 0;
if (Platform.OS === 'ios') {
  statusBarPadding = 20;
}

module.exports = {

  /*
   * Changes the status bar text colors on iOS to be either light or dark. True for light, false for dark.
   */
  setLightStatusBarIOS(light) {
    if (Platform.OS === 'ios') {
      if (light) {
        StatusBarIOS.setStyle('light-content')
      } else {
        StatusBarIOS.setStyle('default')
      }
    }
  },

  /*
   * Returns an additional padding for the status bar on iOS.
   */
  getStatusBarPadding() {
    return statusBarPadding;
  }
}
