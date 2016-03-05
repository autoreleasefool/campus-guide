/*
 * Defines global styles for the app.
 */
'use strict';

// React imports
const React = require('react-native');
const {
  StyleSheet
} = React;

module.exports = StyleSheet.create({

  /* Headers */
  header: {
    height: 50,
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerIcon: {
    marginLeft: 20,
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
