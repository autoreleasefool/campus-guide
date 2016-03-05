/*
 * Search bar for the top of the app, to allow the user to search from anywhere.
 */
'use strict';

// React imports
const React = require('react-native');
const {
  Component,
  StyleSheet,
  TextInput,
  View,
} = React;

const Constants = require('../Constants');
const Ionicons = require('react-native-vector-icons/Ionicons');
const Preferences = require('../util/Preferences');
const StatusBar = require('../util/StatusBar');

class SearchBar extends Component {

  /*
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    onSearch: React.PropTypes.func.isRequired,
  };

  /*
   * Pass props.
   */
  constructor(props) {
    super(props);
  };

  /*
   * Renders a text input field for searching.
   */
  render() {
    // Get current language for translations
    let Translations = null;
    if (Preferences.getSelectedLanguage() === 'en') {
      Translations = require('../util/Translations.en.js');
    } else {
      Translations = require('../util/Translations.fr.js');
    }

    return (
      <View style={{backgroundColor: Constants.Colors.garnet}}>
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
  };
};

// Private styles for component
const _styles = StyleSheet.create({
  innerContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    margin: 10,
    marginTop: 10 + StatusBar.getStatusBarPadding(),
  }
});

// Expose component to app
module.exports = SearchBar;
