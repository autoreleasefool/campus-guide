/*
 * Initial entry view for the application. Allows the user to select their preferred language on first run.
 */
'use strict';

// React imports
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

// Imports
var Configuration = require('../util/Configuration');
var Constants = require('../Constants');
var Preferences = require('../util/Preferences');
var Styles = require('../Styles');
var Translations = require('../util/Translations');

// Root view
var SplashScreen = React.createClass({

  /*
   * Sets the language of the app and opens the main screen.
   */
  _selectLanguage(language) {
    Preferences.setSelectedLanguage(language);
    this.props.navigator.push({id: 2});
  },

  /*
   * Returns the initial state of the view.
   */
  getInitialState() {
    return {
      isLoading: true,
    };
  },

  /*
   * Calls the startup functions of the application.
   */
  componentDidMount() {
    var self = this;
    Configuration.getConfiguration();
    Preferences.loadInitialPreferences().done(function() {
      if (!Preferences.isLanguageSelected()) {
        self.setState({
          isLoading: false,
        });
      } else {
        // If a lanuage has been selected, remove this language select screen, open the main screen
        self.props.navigator.replace({id: 2});
        // TODO: comment above and uncomment below to always show splash screen
        // this.setState({
        //   isLoading: false
        // });
      }
    });
  },

  /*
   * Displays two buttons to allow the user to select French or English.
   */
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
              <Text style={[Styles.mediumText, {color: 'white'}]}>
                {Translations['en']['continue_in']}
              </Text>
              <View style={{padding: 5}}>
                <Text style={[Styles.titleText, {color: 'white'}]}>
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
              <Text style={[Styles.mediumText, {color: 'white'}]}>
                {Translations['fr']['continue_in']}
              </Text>
              <View style={{padding: 5}}>
                <Text style={[Styles.titleText, {color: 'white'}]}>
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

// View styles
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
