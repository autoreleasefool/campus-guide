'use strict';

// react-native imports
var React = require('react-native');

var {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} = React;

// Other imports
var Constants = require('../../constants');
var Preferences = require('../../util/preferences');
var styles = require('../../styles');
var Translations = require('../../util/translations');

var Icon;
var findIcons;
if (Platform.OS === 'ios') {
  Icon = require('react-native-vector-icons/Ionicons');
  findIcons = {
    'Search': 'ios-search',
  };
} else {
  Icon = require('react-native-vector-icons/MaterialIcons');
  findIcons = {
    'Search': 'search',
  };
}

var {height, width} = Dimensions.get('window');

var FindHome = React.createClass({

  _search(text) {
    // TODO: search for a building, class, or professor
    console.log('TODO: search for a building, class, or professor');
  },

  _editSchedule() {
    // TODO: edit the user's class schedule
    console.log('TODO: edit the user\'s class schedule');
  },

  render() {
    return (
      <View style={[_styles.container, {backgroundColor: Constants.Colors.garnet}]}>
        <View style={[_styles.innerContainer, _styles.searchContainer]}>
          <Icon name={findIcons['Search']} size={25} color={Constants.Colors.lightGrey} style={_styles.searchIcon} />
          <TextInput
              style={{height: 40, flex: 1, color: Constants.Colors.polarGrey}}
              onChangeText={(text) => this._search(text)}
              autoCorrect={false}
              placeholder={Translations[Preferences.getSelectedLanguage()]['search_placeholder']}
              placeholderTextColor={Constants.Colors.lightGrey} />
        </View>
        <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
          <Text style={[styles.mediumText, {color: 'white', marginTop: 20, marginBottom: 10}]}>
            {Translations[Preferences.getSelectedLanguage()]['upcoming_classes']}
          </Text>
          <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => this._editSchedule()}
              style={{position: 'absolute', right: 0}}>
            <Text style={[styles.smallText, {color: 'white', marginTop: 20, marginBottom: 10, marginLeft: 10}]}>
              {Translations[Preferences.getSelectedLanguage()]['edit']}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={[_styles.innerContainer, _styles.upcomingClassesContainer]}>
        </View>
        <Text style={[styles.mediumText, {color: 'white', marginTop: 20, marginBottom: 10}]}>
          {Translations[Preferences.getSelectedLanguage()]['uottawa_buildings']}
        </Text>
        <View style={[_styles.innerContainer, _styles.buildingsContainer]}>
        </View>
      </View>
    );
  },
});

var _styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    padding: 20,
  },
  innerContainer: {
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  searchContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  upcomingClassesContainer: {
    flex: 1,
  },
  buildingsContainer: {
    flex: 2,
  },
  searchIcon: {
    marginLeft: 10,
    marginRight: 10,
  },
});

module.exports = FindHome;
