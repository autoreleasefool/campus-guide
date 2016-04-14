/*
 * Displays a title, an image, and text to the user. These details can be provided so the component can be used
 * multiple times.
 */
'use strict';

const React = require('react-native');
const {
  Component,
  StyleSheet,
  View,
} = React;

const Constants = require('../Constants');

class DetailsScreen extends Component {

  /*
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    title: React.PropTypes.string,
    image: React.PropTypes.any,
    text: React.PropTypes.array,
    backgroundColor: React.PropTypes.string,
  };

  /*
   * Pass props and declares initial state.
   */
  constructor(props) {
    super(props);
  };

  render() {
    let backgroundColor = this.props.backgroundColor || Constants.Colors.garnet;

    return (
      <View style={{flex: 1, backgroundColor: backgroundColor}}/>
    );
  }
};

// Private styles for the component
const _styles = StyleSheet.create({
});

// Expose module to app
module.exports = DetailsScreen;
