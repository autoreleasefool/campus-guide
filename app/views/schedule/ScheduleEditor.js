'use strict';

// Imports
const React = require('react-native');
const {
  Component,
  View,
} = React;

class ScheduleEditor extends Component {

  /*
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {

  };

  /*
   * Pass props and declares initial state.
   */
  constructor(props) {
    super(props);

    // Explicitly binding 'this' to all methods that need it
  };

  render() {
    return (
      <View style={{flex: 1, backgroundColor: 'black'}} />
    );
  };
};

// Expose component to app
module.exports = ScheduleEditor;
