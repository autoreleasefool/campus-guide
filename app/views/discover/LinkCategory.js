/*
 *
 */
'use strict';

// React imports
const React = require('react-native');
const {
  Component,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  View,
} = React;

const Constants = require('../../Constants');
const LanguageUtils = require('../../util/LanguageUtils');
const Preferences = require('../../util/Preferences');
const Styles = require('../../Styles');

class LinkCategory extends Component {

  /*
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    category: React.PropTypes.object.isRequired,
    showLinkCategory: React.PropTypes.func.isRequired,
  };

  /*
   * Pass props and declares initial state.
   */
  constructor(props) {
    super(props);
  };

  render() {
    return (
      <View style={_styles.container}>
        <View style={_styles.banner}>
          <Image
              resizeMode={'cover'}
              source={this.props.category.image}
              style={_styles.bannerImage} />
          <View style={_styles.bannerTextContainer}>
            <Text style={[_styles.bannerText, Styles.titleText]}>
              {LanguageUtils.getTranslatedName(Preferences.getSelectedLanguage(), this.props.category)}
            </Text>
          </View>
        </View>
      </View>
    );
  };
};

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.Colors.darkGrey,
  },
  banner: {
    height: 175,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  bannerImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: null,
    height: null,
  },
  bannerTextContainer: {
    backgroundColor: Constants.Colors.defaultComponentBackgroundColor,
  },
  bannerText: {
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 20,
    marginRight: 20,
    color: Constants.Colors.primaryWhiteText,
  },
});

// Expose component to app
module.exports = LinkCategory;
