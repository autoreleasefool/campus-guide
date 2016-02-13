'use strict';

// Imports
var React = require('react-native');
var {
  AsyncStorage,
  Dimensions,
  Navigator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} = React;

var Constants = require('../constants');
var Preferences = require('../util/preferences');
var styles = require('../styles');
var Translations = require('../util/translations');

// Root view
var SplashScreen = React.createClass({

  _selectLanguage(language) {
    // Set the language of the app, open the main screen
    Preferences.setSelectedLanguage(language);
    this.props.navigator.push({id: 2});
  },

  getInitialState() {
    return {
      isLoading: true,
    };
  },

  componentDidMount() {
    var self = this;
    Preferences.loadInitialPreferences().done(function() {
      if (!Preferences.isLanguageSelected()) {
        self.setState({
          isLoading: false,
        });
      } else {
        // If a lanuage has been selected, remove this language select screen, open the main screen
        self.props.navigator.push({id: 2});
        // TODO: comment above and uncomment below to always show splash screen
        // this.setState({
        //   isLoading: false
        // });
      }
    });
  },

  render() {
    // Get the width and height of the screen
    var {height, width} = Dimensions.get('window');
    var onlyOnceTextWidth = Math.min(width, 400);
    var onlyOnceTextLeft = (width - onlyOnceTextWidth) / 2;

    if (this.state.isLoading) {
      // While checking to see if a language has been selected, display an empty view
      return (
        <View style={{flex: 1, backgroundColor: Constants.Colors.garnet}}></View>
      );
    }

    return (
      <View style = {_styles.container}>
        <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => this._selectLanguage('en')}
            style={{flex: 1}}>
          <View style={{flex: 1, backgroundColor: Constants.Colors.garnet}}>
            <View style={_styles.languageContainer}>
              <Text style={[styles.mediumText, {color: 'white'}]}>
                {Translations['en']['continue_in']}
              </Text>
              <View style={{padding: 5}}>
                <Text style={[styles.titleText, {color: 'white'}]}>
                  {Translations['en']['language']}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => this._selectLanguage('fr')}
            style={{flex: 1}}>
          <View style={{flex: 1, backgroundColor: Constants.Colors.charcoalGrey}}>
            <View style={_styles.languageContainer}>
              <Text style={[styles.mediumText, {color: 'white'}]}>
                {Translations['fr']['continue_in']}
              </Text>
              <View style={{padding: 5}}>
                <Text style={[styles.titleText, {color: 'white'}]}>
                  {Translations['fr']['language']}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  },
});

var _styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#000000',
  },
  languageContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

module.exports = SplashScreen;
