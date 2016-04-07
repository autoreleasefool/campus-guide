/*
 * Presents a list of defined, useful links for the user regarding the university.
 */

'use strict';

const React = require('react-native');
const {
  Component,
  Image,
  ListView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} = React;

const Constants = require('../../Constants');
const LanguageUtils = require('../../util/LanguageUtils');
const Preferences = require('../../util/Preferences');
const Styles = require('../../Styles');

class LinksHome extends Component {

  /*
   * Pass props and declares initial state.
   */
  constructor(props) {
    super(props);
    this.state = {
      dataSource: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
      }),
      loaded: false,
    };

    // Explicitly binding 'this' to all methods that need it
    this._loadLinkCategories = this._loadLinkCategories.bind(this);
    this._pressRow = this._pressRow.bind(this);
    this._renderRow = this._renderRow.bind(this);
  };

  /*
   * Retrieves the set of categories that the various useful links in the app belong to.
   */
  _loadLinkCategories() {
    let links = require('../../../assets/static/js/UsefulLinks');
    let categories = [];
    for (let category in links) {
      categories.push(links[category]);
    }

    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(categories),
      loaded: true,
    });
  }

  /*
   * Displays a single category name and an image which represents it.
   */
  _renderRow(category) {
    return (
      <TouchableOpacity style={_styles.categoryContainer}>
        <Image
            resizeMode={'cover'}
            source={category.image}
            style={_styles.categoryImage} />
        <View style={_styles.categoryTextContainer}>
          <Text style={[_styles.categoryText, Styles.titleText]}>
            {LanguageUtils.getTranslatedName(Preferences.getSelectedLanguage(), category)}
          </Text>
        </View>
      </TouchableOpacity>
    )
  };

  /*
   * Loads the links to display.
   */
  componentDidMount() {
    if (!this.state.loaded) {
      this._loadLinkCategories();
    }
  };

  render() {
    if (!this.state.loaded) {
      return (
        <View style={_styles.container} />
      );
    } else {
      return (
        <View style={_styles.container}>
          <ListView
              dataSource={this.state.dataSource}
              renderRow={this._renderRow} />
        </View>
      )
    }
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.Colors.darkGrey,
  },
  categoryContainer: {
    height: 175,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  categoryImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: null,
    height: null,
  },
  categoryTextContainer: {
    backgroundColor: Constants.Colors.defaultComponentBackgroundColor,
  },
  categoryText: {
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 20,
    marginRight: 20,
    color: Constants.Colors.primaryWhiteText,
  },
});

// Expose component to app
module.exports = LinksHome;
