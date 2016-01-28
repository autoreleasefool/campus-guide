'use strict';

var React = require('react-native');
var Constants = require('../constants');

var {
  AsyncStorage,
  Navigator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} = React;


var SplashPage = React.createClass({

  _selectEnglish() {
    AsyncStorage.setItem(Constants.PREF_LANGUAGE, 0);
    this.props.navigator.push({ id: 2 });
  },

  _selectFrench() {
    AsyncStorage.setItem(Constants.PREF_LANGUAGE, 1);
    this.props.navigator.push({ id: 2 });
  },

  render() {
    return (
      <View style = { styles.container }>
        <View style={[ styles.languageContainer, styles.garnetBackground ]}>
          <Text style={ styles.welcome }>Greetings!</Text>
          <TouchableOpacity onPress={ this._selectEnglish }>
            <View style={{ paddingVertical: 10, paddingHorizontal: 20, backgroundColor: 'black' }}>
              <Text style={ styles.welcome }>Go to page two</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={ [styles.languageContainer, styles.charcoalGreyBackground] }>
          <Text style={ styles.welcome }>Greetings!</Text>
          <TouchableOpacity onPress={ this._selectFrench }>
            <View style={{ paddingVertical: 10, paddingHorizontal: 20, backgroundColor: 'black' }}>
              <Text style={ styles.welcome }>Go to page two</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  languageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  garnetBackground: {
    backgroundColor: '#8F001A'
  },
  charcoalGreyBackground: {
    backgroundColor: '#2D2D2C'
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
    color: 'white',
  }
});

module.exports = SplashPage;
