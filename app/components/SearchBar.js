/*
 * Search bar for the top of the app.
 */
'use strict';

// React imports
var React = require('react-native');
var {
  StyleSheet,
  TextInput,
  View,
} = React;

var Constants = require('../Constants');
var Preferences = require('../util/Preferences');
var StatusBar = require('../util/StatusBar');

// Icons
var Ionicons = require('react-native-vector-icons/Ionicons');

// Root view
var SearchBar = React.createClass({
  propTypes: {
    onSearch: React.PropTypes.func.isRequired,
  },

  getInitialState() {
    return {
      searchBackground: Constants.Colors.garnet,
    };
  },

  render() {
    // Translations
    let Translations = null;
    if (Preferences.getSelectedLanguage() === 'en') {
      Translations = require('../util/Translations.en.js');
    } else {
      Translations = require('../util/Translations.fr.js');
    }

    return (
      <View style={[_styles.searchContainer, {backgroundColor: this.state.searchBackground}]}>
        <View style={_styles.innerContainer}>
          <Ionicons
              onPress={() => this.refs.SearchInput.focus()}
              name={'ios-search'}
              size={24}
              color={'white'}
              style={{marginLeft: 10, marginRight: 10}} />
          <TextInput
              ref='SearchInput'
              style={{height: 40, flex: 1, color: Constants.Colors.polarGrey}}
              onChangeText={(text) => this.props.onSearch(text)}
              autoCorrect={false}
              placeholder={Translations['search_placeholder']}
              placeholderTextColor={Constants.Colors.lightGrey} />
        </View>
      </View>
    )
  }
});

var _styles = StyleSheet.create({
  searchContainer: {

  },
  innerContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    margin: 10,
    marginTop: 10 + StatusBar.getStatusBarPadding(),
  }
});

module.exports = SearchBar;
