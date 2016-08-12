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
 * @author Joseph Roque
 * @file LinkCategory.js
 * @providesModule LinkCategory
 * @description Displays the links and subcategories belonging to a category of useful links.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  Alert,
  Clipboard,
  Image,
  LayoutAnimation,
  Linking,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Type imports
import type {
  DefaultFunction,
  Language,
  Link,
  LinkCategoryType,
} from 'types';

// Type definition for component props.
type Props = {
  category: LinkCategoryType,
  categoryImage: string,
  showLinkCategory: DefaultFunction;
};

// Type definition for component state.
type State = {
  showLinks: boolean,
};

// Imports
const Configuration = require('Configuration');
const Constants = require('Constants');
const DisplayUtils = require('DisplayUtils');
const ExternalUtils = require('ExternalUtils');
const Ionicons = require('react-native-vector-icons/Ionicons');
const Preferences = require('Preferences');
const SectionHeader = require('SectionHeader');
const TextUtils = require('TextUtils');
const TranslationUtils = require('TranslationUtils');

class LinkCategory extends React.Component {

  /**
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    category: React.PropTypes.object.isRequired,
    categoryImage: React.PropTypes.string.isRequired,
    showLinkCategory: React.PropTypes.func.isRequired,
  };

  /**
   * Define type for the component state.
   */
  state: State;

  /**
   * Pass props and declares initial state.
   *
   * @param {Props} props properties passed from container to this component.
   */
  constructor(props: Props) {
    super(props);

    const shouldShowLinks: boolean = this.props.category.categories == null;
    this.state = {
      showLinks: shouldShowLinks,
    };

    // Explicitly bind 'this' to those methods that require it.
    (this:any)._getCategories = this._getCategories.bind(this);
    (this:any)._getLinks = this._getLinks.bind(this);
    (this:any)._getSocialMediaLinks = this._getSocialMediaLinks.bind(this);
  }

  /**
   * Returns a list of touchable views which lead to new pages of categories of links.
   *
   * @param {Array<LinkCategoryType>} categories categories of links.
   * @param {boolean} isBackgroundDark           indicates if the background color of the category is dark.
   * @returns {ReactElement<any>} for each index in {categories}, a {TouchableOpacity} with the name of the category.
   */
  _getCategories(categories: Array<LinkCategoryType>, isBackgroundDark: boolean): ReactElement<any> {
    const language: Language = Preferences.getSelectedLanguage();
    const dividerColor: string = (isBackgroundDark)
        ? Constants.Colors.primaryWhiteText
        : Constants.Colors.primaryBlackText;

    return (
      <View>
        {categories.map((category: LinkCategoryType, index: number) => (
          <TouchableOpacity
              key={TranslationUtils.getEnglishName(category)}
              onPress={() => this.props.showLinkCategory(category)}>
            <SectionHeader
                sectionName={TranslationUtils.getTranslatedName(language, category)}
                subtitleIcon={'chevron-right'}
                subtitleIconClass={'material'} />
            {(index < categories.length - 1) ?
              <View style={[_styles.divider, {backgroundColor: dividerColor}]} />
              : null
            }
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  /**
   * Gets an icon based on the link type.
   *
   * @param {?string} link     the link to represent with an icon.
   * @param {string} iconColor color for the icon.
   * @returns {?ReactElement<any>} an icon for the link.
   */
  _getLinkIcon(link: ?string, iconColor: string): ?ReactElement<any> {
    if (link == null) {
      return null;
    }

    if (link.indexOf('tel:') === 0) {
      return (
        <Ionicons
            color={iconColor}
            name={'md-call'}
            size={24}
            style={_styles.linkIcon} />
      );
    } else if (link.indexOf('mailto:') === 0) {
      return (
        <Ionicons
            color={iconColor}
            name={'md-mail'}
            size={24}
            style={_styles.linkIcon} />
      );
    } else {
      return (
        <Ionicons
            color={iconColor}
            name={'md-open'}
            size={24}
            style={_styles.linkIcon} />
      );
    }
  }

  /**
   * Constructs a view to display a formatted link, if the link does not begin with "http".
   *
   * @param {string} link      the link to format
   * @param {string} textColor color of the text to display link in.
   * @returns {?ReactElement<any>} a formatted link in a text view.
   */
  _getFormattedLink(link: string, textColor: string): ?ReactElement<any> {
    if (link.indexOf('http') === 0) {
      return null;
    } else {
      return (
        <Text style={[_styles.linkSubtitle, {color: textColor}]}>
          {TextUtils.formatLink(link)}
        </Text>
      );
    }
  }

  /**
   * Returns a list of touchable views which open links in the web browser.
   *
   * @param {Array<Link>} links        list of links in the current category.
   * @param {Object} Translations      translations in the current language of certain text.
   * @param {boolean} isBackgroundDark indicates if the background color of the category is dark.
   * @returns {ReactElement<any>} for each index in {links}, a {TouchableOpacity} with the name of the link.
   */
  _getLinks(links: Array<Link>, Translations: Object, isBackgroundDark: boolean): ReactElement<any> {
    const language: Language = Preferences.getSelectedLanguage();
    const textColor: string = (isBackgroundDark)
        ? Constants.Colors.primaryWhiteText
        : Constants.Colors.primaryBlackText;
    const iconColor: string = (isBackgroundDark)
        ? Constants.Colors.secondaryWhiteText
        : Constants.Colors.secondaryBlackText;

    let listOfLinks: ?ReactElement<any> = null;
    if (this.state.showLinks) {
      listOfLinks = (
        <View style={_styles.linksContainer}>
          {links.map((link, index) => {
            let translatedLink: string = TranslationUtils.getTranslatedVariant(language, 'link', link)
                || Configuration.getDefaultLink();
            let translatedName: string = TranslationUtils.getTranslatedName(language, link)
                || translatedLink;

            return (
              <View key={translatedLink}>
                <TouchableOpacity
                    style={{flexDirection: 'row', alignItems: 'center'}}
                    onPress={() => this._openLink(translatedLink, Translations)}>
                  {this._getLinkIcon(translatedLink, iconColor)}
                  <View>
                    <Text style={[_styles.link, {color: textColor}]}>
                      {translatedName}
                    </Text>
                    {this._getFormattedLink(translatedLink, textColor)}
                  </View>
                </TouchableOpacity>
                {(index < links.length - 1) ?
                  <View style={[_styles.divider, {backgroundColor: textColor}]} />
                  : null
                }
              </View>
            );
          })}
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
              sectionIcon={'insert-link'}
              sectionIconClass={'material'}
              sectionName={Translations.useful_links}
              subtitleIcon={linksIcon}
              subtitleIconClass={'material'}
              useBlackText={!isBackgroundDark} />
        </TouchableOpacity>
        {listOfLinks}
      </View>
    );
  }

  /**
   * Returns a list of touchable views which open links in the web browser.
   *
   * @param {Array<Link>} socialMediaLinks list of links to social media sites in the current category.
   * @param {Object} Translations          translations in the current language of certain text.
   * @returns {ReactElement<any>} for each index in {socialMediaLinks}, a {TouchableOpacity} with an icon representing
   *                              the social media site.
   */
  _getSocialMediaLinks(socialMediaLinks: Array<Link>, Translations: Object): ReactElement<any> {
    const language: Language = Preferences.getSelectedLanguage();

    return (
      <View style={_styles.socialMediaContainer}>
        {socialMediaLinks.map(socialLink => {
          const translatedLink: string = TranslationUtils.getTranslatedVariant(language, 'link', socialLink)
              || Configuration.getDefaultLink();
          const translatedLinkName: ?string = TranslationUtils.getTranslatedName(language, socialLink);

          if (translatedLinkName == null) {
            return null;
          } else {
            return (
              <TouchableOpacity
                  key={translatedLink}
                  onPress={() => this._openLink(translatedLink, Translations)}>
                <Ionicons
                    color={DisplayUtils.getSocialMediaIconColor(translatedLinkName)}
                    name={DisplayUtils.getSocialMediaIconName(translatedLinkName)}
                    size={30}
                    style={_styles.socialMediaIcon} />
              </TouchableOpacity>
            );
          }
        })}
      </View>
    );
  }

  /**
   * Attempts to open a URL.
   *
   * @param {?string} link        the url to open.
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

    const linksHeader: SectionHeader = this.refs.UsefulLinks;
    let linksIcon: string = 'expand-less';
    if (this.state.showLinks) {
      linksIcon = 'expand-more';
    }

    linksHeader.updateSubtitle(linksHeader.getSubtitleName(), linksIcon, linksHeader.getSubtitleIconClass());

    LayoutAnimation.easeInEaseOut();
    this.setState({
      showLinks: !this.state.showLinks,
    });
  }

  /**
   * Renders an image, category title, and list of useful links.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement<any> {
    // Get current language for translations
    const Translations: Object = TranslationUtils.getTranslations(Preferences.getSelectedLanguage());

    let categoryBackgroundColor: string = Constants.Colors.darkGrey;
    if (Constants.Colors[this.props.category.id] != null) {
      categoryBackgroundColor = Constants.Colors[this.props.category.id];
    }
    const isBackgroundDark: boolean = DisplayUtils.isColorDark(categoryBackgroundColor);

    let social: ?ReactElement<any> = null;
    if (this.props.category.social) {
      social = this._getSocialMediaLinks(this.props.category.social, Translations);
    }

    let usefulLinks: ?ReactElement<any> = null;
    if (this.props.category.links) {
      usefulLinks = this._getLinks(this.props.category.links, Translations, isBackgroundDark);
    }

    let categories: ?ReactElement<any> = null;
    if (this.props.category.categories) {
      categories = this._getCategories(this.props.category.categories, isBackgroundDark);
    }

    return (
      <View style={[_styles.container, {backgroundColor: categoryBackgroundColor}]}>
        <View style={_styles.banner}>
          <Image
              resizeMode={'cover'}
              source={{uri: Configuration.getImagePath(this.props.categoryImage)}}
              style={_styles.bannerImage} />
          <View style={_styles.bannerTextContainer}>
            <Text style={_styles.bannerText}>
              {TranslationUtils.getTranslatedName(Preferences.getSelectedLanguage(), this.props.category)}
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
  }
}

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
    fontSize: Constants.Text.Title,
  },
  socialMediaContainer: {
    backgroundColor: Constants.Colors.whiteComponentBackgroundColor,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  socialMediaIcon: {
    margin: 10,
  },
  scrollview: {
    flex: 1,
  },
  link: {
    margin: 10,
    fontSize: Constants.Text.Large,
  },
  linkSubtitle: {
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
    fontSize: Constants.Text.Small,
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
  },
});

module.exports = LinkCategory;
