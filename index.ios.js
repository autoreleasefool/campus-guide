'use strict';

var React = require('react-native');

class CampusGuide extends React.Component {
  render() {
    return React.createElement(React.Text, {style: styles.text}, "Hello World!");
  }
}

const styles = React.StyleSheet.create({
  text: {
    color: 'black',
    backgroundColor: 'white',
    fontSize: 30,
    margin: 80
  }
});

React.AppRegistry.registerComponent('CampusGuide', function() { return CampusGuide });
