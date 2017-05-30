/**
 *
 * @license
 * Copyright (C) 2016-2017 Joseph Roque
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
 * @created 2017-05-27
 * @file LinkCategoryView.js
 * @providesModule LinkCategoryView
 * @description Organizes a set of links and categories.
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
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Types
import type { Language, LinkSection, NamedLink } from 'types';

// Type definition for component props.
type Props = {
  filter: ?string,                              // Keywords to filter links by
  language: Language,                           // The current language, selected by the user
  section: LinkSection,                         // Section to display
  socialMedia?: ?Array < NamedLink >,           // list of links to social media sites in the current category
  onSubCategorySelected?: (id: string) => void, // Callback when subcategory in the category is selected by the user
}

// Imports
import Header from 'Header';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PaddedIcon from 'PaddedIcon';
import * as Configuration from 'Configuration';
import * as Constants from 'Constants';
import * as DisplayUtils from 'DisplayUtils';
import * as ExternalUtils from 'ExternalUtils';
import * as TextUtils from 'TextUtils';
import * as Translations from 'Translations';

export default class LinkCategoryView extends React.Component {

  /**
   * Properties this component expects to be provided by its parent.
   */
  props: Props;

  /**
   * Attempts to open a URL.
   *
   * @param {?string} link        the url to open.
   * @param {Object} Translations language translations.
   */
  _openLink(link: ?string): void {
    ExternalUtils.openLink(link, this.props.language, Linking, Alert, Clipboard, TextUtils);
  }

  /**
   * Renders a header image for the section links.
   *
   * @returns {ReactElement<any>} an image and title for the section
   */
  _renderBanner(): ReactElement < any > {
    return (
      <View style={_styles.banner}>
        <Image
            resizeMode={'cover'}
            source={{ uri: Configuration.getImagePath(this.props.section.image) }}
            style={_styles.bannerImage} />
        <View style={_styles.bannerTextContainer}>
          <Text style={_styles.bannerText}>
            {Translations.getName(this.props.language, this.props.section)}
          </Text>
        </View>
      </View>
    );
  }

  /**
   * Constructs a view to display a formatted link, if the link does not begin with "http".
   *
   * @param {string} link      the link to format
   * @param {string} textColor color of the text to display link in.
   * @returns {?ReactElement<any>} a formatted link in a text view.
   */
  _renderFormattedLink(link: string, textColor: string): ?ReactElement < any > {
    if (link.indexOf('http') === 0) {
      return null;
    } else {
      return (
        <Text style={[ _styles.linkSubtitle, { color: textColor }]}>{TextUtils.formatLink(link)}</Text>
      );
    }
  }

  /**
   * Renders an icon based on the link type.
   *
   * @param {?string} link     the link to represent with an icon.
   * @param {string} iconColor color for the icon.
   * @returns {?ReactElement<any>} an icon for the link.
   */
  _renderLinkIcon(link: ?string, iconColor: string): ?ReactElement < any > {
    if (link == null) {
      return null;
    }

    let iconName: string;
    if (link.indexOf('tel:') === 0) {
      iconName = 'md-call';
    } else if (link.indexOf('mailto:') === 0) {
      iconName = 'md-mail';
    } else {
      iconName = 'md-open';
    }

    return (
      <PaddedIcon
          color={iconColor}
          icon={{ class: 'ionicon', name: iconName }}
          style={_styles.linkIcon} />
    );
  }

  /**
   * Returns a list of touchable views which open links in the web browser.
   *
   * @param {boolean}           isBackgroundDark indicates if the background color of the category is dark.
   * @returns {?ReactElement<any>} for each index in {links}, a {TouchableOpacity} with the name of the link
   *                               or null if there are no links
   */
  _renderLinks(isBackgroundDark: boolean): ?ReactElement < any > {
    const links = this.props.section.links;
    if (links == null) {
      return null;
    }

    const textColor: string = (isBackgroundDark)
        ? Constants.Colors.primaryWhiteText
        : Constants.Colors.primaryBlackText;
    const iconColor: string = (isBackgroundDark)
        ? Constants.Colors.secondaryWhiteText
        : Constants.Colors.secondaryBlackText;

    // Get current language for translations
    const language: Language = this.props.language;

    // Search terms to filter links by
    const filter = this.props.filter ? this.props.filter.toUpperCase() : null;

    return (
      <View>
        <Header
            icon={{ name: 'insert-link', class: 'material' }}
            title={Translations.get(language, 'uo_info')} />
        {links.map((link, index) => {
          const translatedLink: string = Translations.getVariant(language, 'link', link)
              || ExternalUtils.getDefaultLink();
          const translatedName: string = Translations.getName(language, link)
              || translatedLink;
          const translatedDescription: ?string = Translations.getVariant(language, 'description', link);

          // Compare name to search terms and do not render if they don't match
          if (filter != null && translatedName.toUpperCase().indexOf(filter) < 0) {
            return null;
          }

          return (
            <View key={translatedLink}>
              <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                  onPress={() => this._openLink(translatedLink)}>
                {this._renderLinkIcon(translatedLink, iconColor)}
                <View style={_styles.linkContainer}>
                  <Text style={[ _styles.link, { color: textColor }]}>
                    {translatedName}
                  </Text>
                  {this._renderFormattedLink(translatedLink, textColor)}
                  {translatedDescription == null
                    ? null
                    : (
                      <Text style={[ _styles.linkDescription, { color: textColor }]}>
                        {translatedDescription}
                      </Text>
                    )}
                </View>
              </TouchableOpacity>
              {(index < links.length - 1)
                ? <View style={[ _styles.divider, _styles.inset, { backgroundColor: textColor }]} />
                : null
              }
            </View>
          );
        })}
      </View>
    );
  }

  /**
   * Returns a list of touchable views which open links in the web browser.
   *
   * @returns {?ReactElement<any>} for each index in links, a TouchableOpacity with an icon representing
   *                               the social media site, or null if there are no links
   */
  _renderSocialMedia(): ?ReactElement < any > {
    const links = this.props.section.social;
    if (links == null) {
      return null;
    }

    // Get current language for translations
    const language: Language = this.props.language;

    return (
      <View style={_styles.socialMediaContainer}>
        {links.map((link: NamedLink) => {
          const url: string = Translations.getVariant(language, 'link', link)
              || ExternalUtils.getDefaultLink();
          const name: ?string = Translations.getName(language, link);

          if (name == null) {
            return null;
          } else {
            return (
              <TouchableOpacity
                  key={url}
                  onPress={() => this._openLink(url)}>
                <Ionicons
                    color={DisplayUtils.getSocialMediaIconColor(name)}
                    name={DisplayUtils.getSocialMediaIconName(name)}
                    size={Constants.Sizes.Icons.Large}
                    style={_styles.socialMediaIcon} />
              </TouchableOpacity>
            );
          }
        })}
      </View>
    );
  }

  /**
   * Returns a list of touchable views which lead to new pages of categories of links.
   *
   * @param {boolean}             isBackgroundDark indicates if the background color of the category is dark
   * @returns {?ReactElement<any>} for each index in categories, a TouchableOpacity with the name of the category,
   *                               or null if there are no categories
   */
  _renderSubCategories(isBackgroundDark: boolean): ?ReactElement < any > {
    const categories = this.props.section.categories;
    if (categories == null) {
      return null;
    }

    const language: Language = this.props.language;
    const dividerColor: string = (isBackgroundDark)
        ? Constants.Colors.primaryWhiteText
        : Constants.Colors.primaryBlackText;

    return (
      <View>
        <View style={[ _styles.divider, { backgroundColor: dividerColor }]} />
        {categories.map((category: LinkSection) => {
          const categoryName = Translations.getName(language, category);
          if (categoryName == null) {
            return null;
          }

          return (
            <TouchableOpacity
                key={categoryName}
                onPress={() => this.props.onSubCategorySelected && this.props.onSubCategorySelected(category.id)}>
              <Header
                  subtitleIcon={{ name: 'chevron-right', class: 'material' }}
                  title={categoryName} />
              <View style={[ _styles.divider, { backgroundColor: dividerColor }]} />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  /**
   * Renders a set of views detailing a set of related links.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render
   */
  render(): ReactElement < any > {
    let categoryBackgroundColor: string = Constants.Colors.primaryBackground;
    if (Constants.Colors[this.props.section.id] != null) {
      categoryBackgroundColor = Constants.Colors[this.props.section.id];
    }

    const isBackgroundDark: boolean = DisplayUtils.isColorDark(categoryBackgroundColor);

    return (
      <View style={[ _styles.container, { backgroundColor: categoryBackgroundColor }]}>
        <ScrollView style={_styles.scrollView}>
          {this._renderBanner()}
          {this._renderSocialMedia()}
          {this._renderSubCategories(isBackgroundDark)}
          {this._renderLinks(isBackgroundDark)}
        </ScrollView>
      </View>
    );
  }

}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.Colors.primaryBackground,
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
    backgroundColor: Constants.Colors.darkTransparentBackground,
  },
  bannerText: {
    marginTop: Constants.Sizes.Margins.Regular,
    marginBottom: Constants.Sizes.Margins.Regular,
    marginLeft: Constants.Sizes.Margins.Expanded,
    marginRight: Constants.Sizes.Margins.Expanded,
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Title,
  },
  socialMediaContainer: {
    backgroundColor: Constants.Colors.tertiaryBackground,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  socialMediaIcon: {
    margin: Constants.Sizes.Margins.Regular,
  },
  scrollView: {
    flex: 1,
  },
  linkContainer: {
    flex: 1,
    marginTop: Constants.Sizes.Margins.Expanded,
    marginBottom: Constants.Sizes.Margins.Expanded,
    marginRight: Constants.Sizes.Margins.Expanded,
  },
  link: {
    fontSize: Constants.Sizes.Text.Body,
  },
  linkSubtitle: {
    fontSize: Constants.Sizes.Text.Caption,
  },
  linkDescription: {
    flex: 1,
    marginTop: Constants.Sizes.Margins.Condensed,
    fontSize: Constants.Sizes.Text.Body,
  },
  linkIcon: {
    margin: Constants.Sizes.Margins.Expanded,
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  inset: {
    marginLeft: Constants.Sizes.Margins.Expanded,
  },
});
