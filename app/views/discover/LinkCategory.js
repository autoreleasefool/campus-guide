/**
 *
 * @license
 * Copyright (C) 2016 Joseph Roque
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @file
 * LinkCategory.js
 *
 * @description
 * Displays the links and subcategories belonging to a category of useful
 * links.
 *
 * @author
 * Joseph Roque
 *
 * @external
 * @flow
 *
 */
'use strict';

// React Native imports
const React = require('react-native');
const {
  Alert,
  Clipboard,
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

// Import type definitions.
import type {
  LanguageString,
  Link,
  LinkCategoryType,
} from '../../Types';

// Imports
const Configuration = require('../../util/Configuration');
const Constants = require('../../Constants');
const DisplayUtils = require('../../util/DisplayUtils');
const ExternalUtils = require('../../util/ExternalUtils');
const Icon = require('react-native-vector-icons/Ionicons');
const LanguageUtils = require('../../util/LanguageUtils');
const Preferences = require('../../util/Preferences');
const SectionHeader = require('../../components/SectionHeader');
const Styles = require('../../Styles');
const TextUtils = require('../../util/TextUtils');

// Type definition for component props.
type Props = {
  category: LinkCategoryType,
  categoryImage: ReactClass,
  showLinkCategory: () => any;
};

// Type definition for component state.
type State = {
  showLinks: boolean,
};

class LinkCategory extends Component {
  state: State;

  /**
   * Properties which the parent component should make available to this
   * component.
   */
  static propTypes = {
    category: React.PropTypes.object.isRequired,
    categoryImage: React.PropTypes.any.isRequired,
    showLinkCategory: React.PropTypes.func.isRequired,
  };

  /**
   * Pass props and declares initial state.
   *
   * @param {Props} props properties passed from container to this component.
   */
  constructor(props: Props) {
    super(props);

    let shouldShowLinks: boolean = this.props.category.categories == null;
    this.state = {
      showLinks: shouldShowLinks,
    };

    // Explicitly bind 'this' to those methods that require it.
    (this:any)._getCategories = this._getCategories.bind(this);
    (this:any)._getLinks = this._getLinks.bind(this);
    (this:any)._getSocialMediaLinks = this._getSocialMediaLinks.bind(this);
  };

  /**
   * Returns a list of touchable views which lead to new pages of categories
   * of links.
   *
   * @param {Array<LinkCategoryType>} categories categories of links.
   * @param {boolean} isBackgroundDark indicates if the background color of the category is dark.
   * @return {ReactElement} for each index in {categories}, a {TouchableOpacity} with the name
   *         of the category.
   */
  _getCategories(categories: Array<LinkCategoryType>, isBackgroundDark: boolean): ReactElement {
    let language: LanguageString = Preferences.getSelectedLanguage();
    let dividerColor: string = (isBackgroundDark)
        ? Constants.Colors.primaryWhiteText
        : Constants.Colors.primaryBlackText;

    return (
      <View>
        {categories.map((category: LinkCategoryType, index: number) => (
          <TouchableOpacity
              onPress={() => this.props.showLinkCategory(category)}
              key={LanguageUtils.getEnglishName(category)}>
            <SectionHeader
                sectionName={LanguageUtils.getTranslatedName(language, category)}
                subtitleIcon={'chevron-right'}
                subtitleIconClass={'material'} />
            {(index != categories.length - 1) ?
                <View style={[_styles.divider, {backgroundColor: dividerColor}]} />
                : null
            }
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  /**
   * Returns a list of touchable views which open links in the web browser.
   *
   * @param {Array<Link>} links list of links in the current category.
   * @param {Object} Translations translations in the current language of certain text.
   * @param {boolean} isBackgroundDark indicates if the background color of the category is dark.
   * @return {ReactElement} for each index in {links}, a {TouchableOpacity} with the name
   *         of the link.
   */
  _getLinks(links: Array<Link>, Translations: Object, isBackgroundDark: boolean): ReactElement {
    let language: LanguageString = Preferences.getSelectedLanguage();
    let textColor: string = (isBackgroundDark)
        ? Constants.Colors.primaryWhiteText
        : Constants.Colors.primaryBlackText;
    let iconColor: string = (isBackgroundDark)
        ? Constants.Colors.secondaryWhiteText
        : Constants.Colors.secondaryBlackText;

    let getLinkIcon = function(link: ?string): ?ReactElement {
      if (link == null) {
        return null;
      }

      if (link.indexOf('tel:') === 0) {
        return (
          <Icon
              color={iconColor}
              name={'android-call'}
              size={24}
              style={_styles.linkIcon} />
        );
      } else if (link.indexOf('mailto:') === 0) {
        return (
          <Icon
              color={iconColor}
              name={'android-mail'}
              size={24}
              style={_styles.linkIcon} />
        );
      } else {
        return (
          <Icon
              color={iconColor}
              name={'android-open'}
              size={24}
              style={_styles.linkIcon} />
        );
      }
    };

    let listOfLinks: ?ReactElement = null;
    if (this.state.showLinks) {
      listOfLinks = (
        <View style={_styles.linksContainer}>
          {links.map((link, index) => {
              let translatedLink: string = LanguageUtils.getTranslatedLink(language, link)
                  || Configuration.getDefaultLink();
              let translatedName: string = LanguageUtils.getTranslatedName(language, link)
                  || translatedLink;

              return (
                <View key={translatedLink}>
                  <TouchableOpacity
                      onPress={() => this._openLink(translatedLink, Translations)}
                      style={{flexDirection: 'row', alignItems: 'center'}}>
                    {getLinkIcon(translatedLink)}
                    <View>
                      <Text style={[_styles.link, Styles.largeText, {color: textColor}]}>
                        {translatedName}
                      </Text>
                      {(translatedLink.indexOf('http') !== 0)
                          ? <Text style={[_styles.linkSubtitle, Styles.smallText, {color: textColor}]}>
                              {TextUtils.formatLink(translatedLink)}
                            </Text>
                          : null
                      }
                    </View>
                  </TouchableOpacity>
                  {(index != links.length - 1) ?
                      <View style={[_styles.divider, {backgroundColor: textColor}]} />
                      : null
                  }
                </View>
              );
            }
          )}
        </View>
      );
    }

    let linksIcon: ?string = 'expand-more';
    if (this.props.category.categories == null) {
      linksIcon = null;
    }

    return (
      <View>
        <TouchableOpacity onPress={this._toggleLinks.bind(this)}>
          <SectionHeader
              ref='UsefulLinks'
              sectionName={Translations['useful_links']}
              sectionIcon={'insert-link'}
              sectionIconClass={'material'}
              subtitleIcon={linksIcon}
              subtitleIconClass={'material'}
              useBlackText={!isBackgroundDark} />
        </TouchableOpacity>
        {listOfLinks}
      </View>
    );
  };

  /**
   * Returns a list of touchable views which open links in the web browser.
   *
   * @param {Array<Link>} socialMediaLinks list of links to social media sites in the current
   *                         category.
   * @param {Object} Translations     translations in the current language of certain text.
   * @return {ReactElement} for each index in {socialMediaLinks}, a {TouchableOpacity} with
   *         an icon representing the social media site.
   */
  _getSocialMediaLinks(socialMediaLinks: Array<Link>, Translations: Object): ReactElement {
    let language: LanguageString = Preferences.getSelectedLanguage();

    return (
      <View style={_styles.socialMediaContainer}>
        {socialMediaLinks.map(socialLink => {
          let translatedLink: string = LanguageUtils.getTranslatedLink(language, socialLink)
              || Configuration.getDefaultLink();
          let translatedLinkName: ?string = LanguageUtils.getTranslatedName(language, socialLink);

          if (translatedLinkName != null) {
            return (
              <TouchableOpacity
                  onPress={() => this._openLink(translatedLink, Translations)}
                  key={translatedLink}>
                <Icon
                    color={DisplayUtils.getSocialMediaIconColor(translatedLinkName)}
                    name={DisplayUtils.getSocialMediaIconName(translatedLinkName)}
                    size={30}
                    style={_styles.socialMediaIcon} />
              </TouchableOpacity>
            );
          } else {
            return null;
          }
        })}
      </View>
    )
  };

  /**
   * Attempts to open a URL.
   *
   * @param {?string} link the url to open.
   * @param {Object} Translations language translations.
   */
  _openLink(link: ?string, Translations: Object): void {
    ExternalUtils.openLink(link, Translations, Linking, Alert, Clipboard);
  }

  /**
   * Hides or shows the list of links in the category.
   */
  _toggleLinks(): void {
    if (this.props.category.categories == null) {
      return;
    }

    let linksHeader: SectionHeader = this.refs.UsefulLinks;
    let linksIcon: string = 'expand-less';
    if (this.state.showLinks) {
      linksIcon = 'expand-more';
    }

    linksHeader.updateSubtitle(linksHeader.getSubtitleName(), linksIcon, linksHeader.getSubtitleIconClass());

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    this.setState({
      showLinks: !this.state.showLinks,
    });
  };

  /**
   * Renders an image, category title, and list of useful links.
   *
   * @return {ReactElement} the hierarchy of views to render.
   */
  render(): ReactElement {
    // Get current language for translations
    let Translations: Object = {};
    if (Preferences.getSelectedLanguage() === 'fr') {
      Translations = require('../../../assets/static/js/Translations.fr.js');
    } else {
      Translations = require('../../../assets/static/js/Translations.en.js');
    }

    let backgroundColor: string =  Constants.Colors.darkGrey;
    if (Constants.Colors[this.props.category.id] != null) {
      backgroundColor = Constants.Colors[this.props.category.id];
    }
    let isBackgroundDark: boolean = DisplayUtils.isColorDark(backgroundColor);

    let social: ?ReactElement = null;
    if (this.props.category.social) {
      social = this._getSocialMediaLinks(this.props.category.social, Translations);
    }

    let usefulLinks: ?ReactElement = null;
    if (this.props.category.links) {
      usefulLinks = this._getLinks(this.props.category.links, Translations, isBackgroundDark);
    }

    let categories: ?ReactElement = null;
    if (this.props.category.categories) {
      categories = this._getCategories(this.props.category.categories, isBackgroundDark);
    }

    return (
      <View style={[_styles.container, {backgroundColor: backgroundColor}]}>
        <View style={_styles.banner}>
          <Image
              resizeMode={'cover'}
              source={this.props.categoryImage}
              style={_styles.bannerImage} />
          <View style={_styles.bannerTextContainer}>
            <Text style={[_styles.bannerText, Styles.titleText]}>
              {LanguageUtils.getTranslatedName(Preferences.getSelectedLanguage(), this.props.category)}
            </Text>
          </View>
        </View>
        <ScrollView style={_styles.scrollview}>
          {social}
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
    justifyContent: 'space-around',
  },
  socialMediaIcon: {
    margin: 20,
  },
  scrollview: {
    flex: 1,
  },
  link: {
    margin: 10,
  },
  linkSubtitle: {
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  linkIcon: {
    marginLeft: 20,
    marginRight: 10,
    marginTop: 15,
    marginBottom: 15,
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  }
});

// Expose component to app
module.exports = LinkCategory;
