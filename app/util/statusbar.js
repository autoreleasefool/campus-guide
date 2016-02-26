'use strict';

var React = require('react-native');
var {
  Platform,
  StatusBarIOS,
} = React;

module.exports = {

  /*
   * Changes the status bar text colors on iOS to be either light or dark. True for light, false for dark.
   */
  setLightStatusBarIOS(light) {
    if (Platform.OS == 'ios') {
      if (light) {
        StatusBarIOS.setStyle('light-content')
      } else {
        StatusBarIOS.setStyle('default')
      }
    }
  },
}
