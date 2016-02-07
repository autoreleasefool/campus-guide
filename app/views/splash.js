'use strict';

// react-native imports
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

// Other imports
var Constants = require('../constants');
var I18n = require('react-native-i18n');
var Orientation = require('react-native-orientation');
var styles = require('../styles');

var SplashScreen = React.createClass({

  _selectLanguage(language) {
    // Set the language of the app, open the main screen
    AsyncStorage.setItem(Constants.PREF_LANGUAGE, language);
    this.props.navigator.push({id: 2});
  },

  getInitialState() {
    return {
      isLoading: true,
    };
  },

  componentWillMount() {
    // Checks if the key PREF_LANGUAGE exists before the app loads
    AsyncStorage.getItem(Constants.PREF_LANGUAGE).then((value) => {
      if (value === null) {
        this.setState({
          isLoading: false,
        });
      } else {
        // If a lanuage has been selected, remove this language select screen, open the main screen
        this.props.navigator.push({id: 2});
        // TODO: comment above and uncomment below to always show splash screen
        // this.setState({
        //   isLoading: false
        // });
      }
    });
  },

  componentDidMount() {
    // Ensure the splash screen can only be viewed in portrait
    Orientation.lockToPortrait();
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
            onPress={() => this._selectLanguage('0')}
            style={{flex: 1}}>
            <View style={{flex: 1, backgroundColor: Constants.Colors.garnet}}>
              <View style={_styles.languageContainer}>
              <Text style={[styles.mediumText, {color: 'white'}]}>
                {I18n.t('continue_in', {locale: 'en'})}
              </Text>
              <View style={{padding: 5}}>
                <Text style={[styles.titleText, {color: 'white'}]}>
                  {I18n.t('language', {locale: 'en'})}
                </Text>
              </View>
            </View>
            <Text style={[styles.smallText, _styles.onlyOnceText, {width: onlyOnceTextWidth, left: onlyOnceTextLeft, bottom: 20, backgroundColor: Constants.Colors.transparent}]}>
              {I18n.t('only_once', {locale: 'en'})}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => this._selectLanguage('1')}
            style={{flex: 1}}>
          <View style={{flex: 1, backgroundColor: Constants.Colors.charcoalGrey}}>
            <View style={_styles.languageContainer}>
              <Text style={[styles.mediumText, {color: 'white'}]}>
                {I18n.t('continue_in', {locale: 'fr'})}
              </Text>
              <View style={{padding: 5}}>
                <Text style={[styles.titleText, {color: 'white'}]}>
                  {I18n.t('language', {locale: 'fr'})}
                </Text>
              </View>
            </View>
            <Text style={[styles.smallText, _styles.onlyOnceText, {width: onlyOnceTextWidth, left: onlyOnceTextLeft,  top: 20, backgroundColor: Constants.Colors.transparent}]}>
              {I18n.t('only_once', {locale: 'fr'})}
            </Text>
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
  onlyOnceText: {
    position: 'absolute',
    color: 'white',
    textAlign: 'center',
  },
});

I18n.fallbacks = true;
I18n.translations = {
    en: {
        continue_in: 'Continue in',
        language: 'ENGLISH',
        only_once: 'We\'ll only ask you once, but feel free to switch at any time through the settings.',
    },
    fr: {
        continue_in: 'Continuer en',
        language: 'FRANÇAIS',
        only_once: 'Nous vous demandons seulement une fois, mais sentons libres de changer à tout moment à travers les paramètres.',
    },
}

module.exports = SplashScreen;
