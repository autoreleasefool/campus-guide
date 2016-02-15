'use strict';

// Imports
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

var Constants = require('../../constants');
var Preferences = require('../../util/preferences');
var styles = require('../../styles');
var Translations = require('../../util/translations');
var {height, width} = Dimensions.get('window');

// View imports
var Buildings = require('./buildinggrid');
var Upcoming = require('./upcoming');

// Icons
var Ionicons = require('react-native-vector-icons/Ionicons');
var MaterialIcons = require('react-native-vector-icons/MaterialIcons');

// Additional padding at the top of the app if the iOS status bar must be accounted for
var statusBarPadding = 0;
if (Platform.OS === 'ios') {
  statusBarPadding = 20;
}

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
      <View style={_styles.container}>
        <View style={_styles.searchContainer}>

          <Ionicons
              onPress={() => this.refs.SearchInput.focus()}
              name={'ios-search'}
              size={24}
              color={'white'}
              style={{marginLeft: 10, marginRight: 10}} />
          <TextInput
              ref='SearchInput'
              style={{height: 40, flex: 1, color: Constants.Colors.polarGrey}}
              onChangeText={(text) => this._search(text)}
              autoCorrect={false}
              placeholder={Translations[Preferences.getSelectedLanguage()]['search_placeholder']}
              placeholderTextColor={Constants.Colors.lightGrey} />
        </View>

        <View style={_styles.header}>
          <MaterialIcons
              name={'event'}
              size={24}
              color={'white'}
              style={{marginLeft: 20}} />
          <Text style={[styles.largeText, {color: 'white', marginLeft: 20}]}>
            {Translations[Preferences.getSelectedLanguage()]['upcoming_classes']}
          </Text>
          <TouchableOpacity
              onPress={this._editSchedule}
              activeOpacity={0.4}
              style={{position: 'absolute', right: 0}}>
            <Text style={[styles.smallText, {color: 'white', marginTop: 17, marginBottom: 17, marginLeft: 20, marginRight: 20}]}>
              {Translations[Preferences.getSelectedLanguage()]['edit']}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={[_styles.content, {flex: 1}]}>
          <Upcoming onEdit={this._editSchedule} />
        </View>

        <View style={_styles.header}>
          <MaterialIcons
              name={'store'}
              size={24}
              color={'white'}
              style={{marginLeft: 20}} />
          <Text style={[styles.largeText, {color: 'white', marginLeft: 20}]}>
            {Translations[Preferences.getSelectedLanguage()]['building_directory']}
          </Text>
        </View>
        <View style={[_styles.content, {flex: 2}]}>
          <Buildings />
        </View>

      </View>
    );
  },
});

var _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.Colors.garnet,
  },
  searchContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    margin: 20,
    marginTop: 20 + statusBarPadding,
  },
  header: {
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    flexDirection: 'row',
  },
  content: {
    margin: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  }
});

module.exports = FindHome;
