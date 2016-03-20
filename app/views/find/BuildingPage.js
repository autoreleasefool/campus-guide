'use strict';

// Imports
const React = require('react-native');
const {
  Component,
  View,
} = React;

// Root view
class BuildingPage extends Component {

  /*
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    buildingCode: React.PropTypes.string.isRequired,
  };

  /*
   * Pass props and declares initial state.
   */
  constructor(props) {
    super(props);
  };
};

module.exports = BuildingPage;
