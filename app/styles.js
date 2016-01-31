'use strict';

var React = require('react-native');

var {
  StyleSheet,
} = React;

module.exports = StyleSheet.create({

  controlPanel: {
    flex: 1,
    backgroundColor:'#326945',
  },
  controlPanelWelcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 25,
    color:'white',
    fontWeight:'bold',
  },

  /* Background Colours */
  garnetBackground: {
    backgroundColor: '#8F001A',
  },
  darkGreyBackground: {
    backgroundColor: '#80746C',
  },
  polarGreyBackground: {
    backgroundColor: '#F2F2F2',
  },
  lightGreyBackground: {
    backgroundColor: '#ACA39A',
  },
  charcoalGreyBackground: {
    backgroundColor: '#2D2D2C',
  },

  /* Text Formatting */
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 20,
  },
  titleText: {
    fontSize: 24,
  },
});
