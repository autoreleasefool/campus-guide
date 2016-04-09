/*
 *
 */
'use strict';

// React imports
const React = require('react-native');
const {
  Component,
  Image,
  LayoutAnimation,
  Linking,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} = React;

const Constants = require('../../Constants');
const DisplayUtils = require('../../util/DisplayUtils');
const Icon = require('react-native-vector-icons/Ionicons');
const LanguageUtils = require('../../util/LanguageUtils');
const Preferences = require('../../util/Preferences');
const SectionHeader = require('../../components/SectionHeader');
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

    this.state = {
      showLinks: false,
    };

    // Explicitly bind 'this' to those methods that require it.
    this._getCategories = this._getCategories.bind(this);
    this._getLinks = this._getLinks.bind(this);
    this._getSocialMediaLinks = this._getSocialMediaLinks.bind(this);
    this._openLink = this._openLink.bind(this);
  };

  /*
   * Gets the list of categories.
   */
  _getCategories(categories) {
    return null;
  };

  /*
   * Gets the list of links.
   */
  _getLinks(links) {
    let language = Preferences.getSelectedLanguage();

    return (
      <View style={_styles.linksContainer}>
        {links.map((link, index) => (
          <View>
            <TouchableOpacity
                onPress={() => this._openLink(LanguageUtils.getTranslatedLink(language, link))}
                key={LanguageUtils.getTranslatedLink(language, link)}
                style={{flexDirection: 'row', alignItems: 'center'}}>
              <Icon
                  color={Constants.Colors.secondaryBlackText}
                  name={'android-open'}
                  size={24}
                  style={_styles.linkIcon} />
              <Text style={[_styles.link, Styles.largeText]}>
                {LanguageUtils.getTranslatedName(language, link)}
              </Text>
            </TouchableOpacity>
            {(index != links.length - 1) ?
                <View style={_styles.separator} />
                : null
            }
          </View>
        ))}
      </View>
    );
  };

  /*
   * Gets the list of social media icons.
   */
  _getSocialMediaLinks(socialMediaLinks) {
    return (
      <View style={_styles.socialMediaContainer}>
        {socialMediaLinks.map(socialLink => (
          <TouchableOpacity onPress={() => this._openLink(socialLink.link)} key={socialLink.link}>
            <Icon
                color={DisplayUtils.getSocialMediaIconColor(socialLink.name)}
                name={DisplayUtils.getSocialMediaIconName(socialLink.name)}
                size={30}
                style={_styles.socialMediaIcon} />
          </TouchableOpacity>
        ))}
      </View>
    )
  };

  /*
   * Opens a URL
   */
  _openLink(url) {
    Linking.openURL(url);
  };

  /*
   * Hides or shows the list of links in the category.
   */
  _toggleLinks() {
    let linksHeader = this.refs.UsefulLinks;
    let linksIcon = 'expand-less';
    if (this.state.showLinks) {
      linksIcon = 'expand-more';
    }
    linksHeader.updateSubtitle(linksHeader.getSubtitleName(), linksIcon, linksHeader.getSubtitleIconClass());

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    this.setState({
      showLinks: !this.state.showLinks,
    });
  };

  render() {
    // Get current language for translations
    let Translations = null;
    if (Preferences.getSelectedLanguage() === 'fr') {
      Translations = require('../../../assets/static/js/Translations.fr.js');
    } else {
      Translations = require('../../../assets/static/js/Translations.en.js');
    }

    let social = null;
    if (this.props.category.social) {
      social = this._getSocialMediaLinks(this.props.category.social);
    }

    let usefulLinks = null;
    if (this.state.showLinks && this.props.category.links) {
      usefulLinks = this._getLinks(this.props.category.links);
    }

    let categories = null;
    if (this.props.category.categories) {
      categories = this._getCategories(this.props.category.categories);
    }

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
        <ScrollView style={_styles.scrollview}>
          {social}
          <TouchableOpacity onPress={this._toggleLinks.bind(this)}>
            <SectionHeader
                ref='UsefulLinks'
                sectionName={Translations['useful_links']}
                sectionIcon={'insert-link'}
                sectionIconClass={'material'}
                subtitleIcon={'expand-more'}
                subtitleIconClass={'material'} />
          </TouchableOpacity>
          {usefulLinks}
          {categories}
        </ScrollView>
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
  socialMediaContainer: {
    backgroundColor: Constants.Colors.whiteComponentBackgroundColor,
    flexDirection: 'row',
  },
  socialMediaIcon: {
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 10,
    marginRight: 10,
  },
  scrollview: {
    flex: 1,
  },
  link: {
    color: Constants.Colors.primaryBlackText,
    margin: 10,
  },
  linkIcon: {
    marginLeft: 20,
    marginRight: 10,
    marginTop: 15,
    marginBottom: 15,
  },
  separator: {
    flex: 1,
    height: 1,
    backgroundColor: 'white',
  }
});

// Expose component to app
module.exports = LinkCategory;
