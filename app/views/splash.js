'use strict';

var Constants = require('../constants');
var I18n = require('react-native-i18n');
var React = require('react-native');

var {
  AsyncStorage,
  Navigator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} = React;

// <TouchableOpacity onPress={this._selectEnglish} style={{flex: 1}}>
//   <View style={[styles.languageContainer, Constants.styles.garnetBackground]}>
//     <Text style={[Constants.styles.mediumText, {color: 'white'}]}>
//       {I18n.t('continue_in', {locale: 'en'})}
//     </Text>
//     <View style={{paddingVertical: 10, paddingHorizontal: 20}}>
//       <Text style={[Constants.styles.titleText, {color: 'white'}]}>
//         {I18n.t('language', {locale: 'en'})}
//       </Text>
//     </View>
//     <Text style={[Constants.styles.smallText, {color: 'white', textAlign: 'center'}]}>
//       {I18n.t('only_once', {locale: 'en'})}
//     </Text>
//   </View>
// </TouchableOpacity>
//
//
//
// <TouchableOpacity onPress={this._selectFrench} style={{flex: 1}}>
//   <View style={[styles.languageContainer, Constants.styles.charcoalGreyBackground]}>
//     <Text style={[Constants.styles.mediumText, {color: 'white'}]}>
//       {I18n.t('continue_in', {locale: 'fr'})}
//     </Text>
//     <View style={{paddingVertical: 10, paddingHorizontal: 20}}>
//       <Text style={[Constants.styles.titleText, {color: 'white'}]}>
//         {I18n.t('language', {locale: 'fr'})}
//       </Text>
//     </View>
//     <Text style={[Constants.styles.smallText, {color: 'white', textAlign: 'center'}]}>
//       {I18n.t('only_once', {locale: 'fr'})}
//     </Text>
//   </View>
// </TouchableOpacity>


var SplashPage = React.createClass({

  _selectEnglish() {
    AsyncStorage.setItem(Constants.PREF_LANGUAGE, '0');
    this.props.navigator.push({id: 2});
  },

  _selectFrench() {
    AsyncStorage.setItem(Constants.PREF_LANGUAGE, '1');
    this.props.navigator.push({id: 2});
  },

  render() {
    return (
      <View style = {styles.container}>

        <TouchableOpacity onPress={this._selectEnglish} style={{flex: 1}}>
          <View style={[Constants.styles.garnetBackground, styles.languageContainer]}>
            <Text style={[Constants.styles.mediumText, {color: 'white'}]}>
              {I18n.t('continue_in', {locale: 'en'})}
            </Text>
            <View style={{padding: 5}}>
              <Text style={[Constants.styles.titleText, {color: 'white'}]}>
                {I18n.t('language', {locale: 'en'})}
              </Text>
            </View>
          </View>
          <Text style={[Constants.styles.smallText, styles.onlyOnceText, {bottom: 0}]}>
            {I18n.t('only_once', {locale: 'en'})}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={this._selectFrench} style={{flex: 1}}>
          <View style={[Constants.styles.charcoalGreyBackground, styles.languageContainer]}>
            <Text style={[Constants.styles.mediumText, {color: 'white'}]}>
              {I18n.t('continue_in', {locale: 'fr'})}
            </Text>
            <View style={{padding: 5}}>
              <Text style={[Constants.styles.titleText, {color: 'white'}]}>
                {I18n.t('language', {locale: 'fr'})}
              </Text>
            </View>
          </View>
          <Text style={[Constants.styles.smallText, styles.onlyOnceText, {top: 0}]}>
            {I18n.t('only_once', {locale: 'fr'})}
          </Text>
        </TouchableOpacity>

      </View>
    );
  },
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  languageContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  onlyOnceText: {
    position: 'absolute',
    color: 'white',
    textAlign: 'center',
    left: 0,
    right: 0,
    padding: 10,
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

module.exports = SplashPage;
