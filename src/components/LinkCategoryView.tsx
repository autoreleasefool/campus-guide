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
 * @file LinkCategoryView.tsx
 * @description Organizes a set of links and categories.
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

// Imports
import Header from './Header';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PaddedIcon from './PaddedIcon';
import * as Configuration from '../util/Configuration';
import * as Constants from '../constants';
import * as Display from '../util/Display';
import * as External from '../util/External';
import * as TextUtils from '../util/TextUtils';
import * as Translations from '../util/Translations';

// Types
import { Language } from '../util/Translations';
import { LinkSection, NamedLink } from '../../typings/global';

interface Props {
  filter: string | undefined;               // Keywords to filter links by
  language: Language;                       // The current language, selected by the user
  section: LinkSection;                     // Section to display
  socialMedia?: NamedLink | undefined;      // List of links to social media sites in the current category
  onSubCategorySelected?(id: string): void; // Callback when subcategory in the category is selected by the user
}

interface State {}

export default class LinkCategoryView extends React.PureComponent<Props, State> {

  /**
   * Attempts to open a URL.
   *
   * @param {string|undefined} link the url to open
   */
  _openLink(link: string | undefined): void {
    External.openLink(link, this.props.language, Linking, Alert, Clipboard, TextUtils);
  }

  /**
   * Renders a header image for the section links.
   *
   * @returns {JSX.Element} an image and title for the section
   */
  _renderBanner(): JSX.Element {
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
   * @param {string} textColor color of the text to display link in
   * @returns {JSX.Element|undefined} a formatted link in a text view
   */
  _renderFormattedLink(link: string, textColor: string): JSX.Element | undefined {
    if (link.indexOf('http') === 0) {
      return undefined;
    } else {
      return (
        <Text style={[ _styles.linkSubtitle, { color: textColor }]}>{TextUtils.formatLink(link)}</Text>
      );
    }
  }

  /**
   * Renders an icon based on the link type.
   *
   * @param {string|undefined} link     the link to represent with an icon
   * @param {string}           iconColor color for the icon
   * @returns {JSX.Element | undefined} an icon for the link
   */
  _renderLinkIcon(link: string | undefined, iconColor: string): JSX.Element | undefined {
    if (link == undefined) {
      return undefined;
    }

    const iconName = link.indexOf('tel:') === 0
        ? 'md-call'
        : (link.indexOf('mailto:') === 0
            ? 'md-mail'
            : 'md-open');

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
   * @param {boolean}           isBackgroundDark indicates if the background color of the category is dark
   * @returns {JSX.Element|undefined} for each index in {links}, a {TouchableOpacity} with the name of the link
   *                                  or null if there are no links
   */
  _renderLinks(isBackgroundDark: boolean): JSX.Element | undefined {
    const links = this.props.section.links;
    if (links == undefined) {
      return undefined;
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
    const filter = this.props.filter ? this.props.filter.toUpperCase() : undefined;

    return (
      <View>
        <Header
            icon={{ name: 'insert-link', class: 'material' }}
            title={Translations.get(language, 'uo_info')} />
        {links.map((link: NamedLink, index: number) => {
          const translatedLink = Translations.getLink(language, link) || External.getDefaultLink();
          const translatedName = Translations.getName(language, link) || translatedLink;
          const translatedDescription = Translations.getDescription(language, link);

          // Compare name to search terms and do not render if they don't match
          if (filter != undefined && translatedName.toUpperCase().indexOf(filter) < 0) {
            return undefined;
          }

          return (
            <View key={translatedLink}>
              <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                  onPress={(): void => this._openLink(translatedLink)}>
                {this._renderLinkIcon(translatedLink, iconColor)}
                <View style={_styles.linkContainer}>
                  <Text style={[ _styles.link, { color: textColor }]}>
                    {translatedName}
                  </Text>
                  {this._renderFormattedLink(translatedLink, textColor)}
                  {translatedDescription == undefined
                    ? undefined
                    : (
                      <Text style={[ _styles.linkDescription, { color: textColor }]}>
                        {translatedDescription}
                      </Text>
                    )}
                </View>
              </TouchableOpacity>
              {(index < links.length - 1)
                ? <View style={[ _styles.divider, _styles.inset, { backgroundColor: textColor }]} />
                : undefined
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
   * @returns {JSX.Element|undefined} for each index in links, a TouchableOpacity with an icon representing
   *                                  the social media site, or null if there are no links
   */
  _renderSocialMedia(): JSX.Element | undefined {
    const links = this.props.section.social;
    if (links == undefined) {
      return undefined;
    }

    // Get current language for translations
    const language: Language = this.props.language;

    return (
      <View style={_styles.socialMediaContainer}>
        {links.map((link: NamedLink) => {
          const url = Translations.getLink(language, link) || External.getDefaultLink();
          const name = Translations.getName(language, link);

          if (name == undefined) {
            return undefined;
          } else {
            return (
              <TouchableOpacity
                  key={url}
                  onPress={(): void => this._openLink(url)}>
                <Ionicons
                    color={Display.getSocialMediaIconColor(name)}
                    name={Display.getSocialMediaIconName(name)}
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
   * @returns {JSX.Element|undefined} for each index in categories, a TouchableOpacity with the name of the category,
   *                                  or null if there are no categories
   */
  _renderSubCategories(isBackgroundDark: boolean): JSX.Element | undefined {
    const categories = this.props.section.categories;
    if (categories == undefined) {
      return undefined;
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
          if (categoryName == undefined) {
            return undefined;
          }

          return (
            <TouchableOpacity
                key={categoryName}
                onPress={(): void => this.props.onSubCategorySelected && this.props.onSubCategorySelected(category.id)}>
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
   * @returns {JSX.Element} the hierarchy of views to render
   */
  render(): JSX.Element {
    let categoryBackgroundColor: string = Constants.Colors.primaryBackground;
    if (Constants.Colors[this.props.section.id] != undefined) {
      categoryBackgroundColor = Constants.Colors[this.props.section.id];
    }

    const isBackgroundDark: boolean = Display.isColorDark(categoryBackgroundColor);

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
  banner: {
    alignItems: 'flex-end',
    height: 175,
    justifyContent: 'flex-end',
  },
  bannerImage: {
    bottom: 0,
    height: undefined,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    width: undefined,
  },
  bannerText: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Title,
    marginBottom: Constants.Sizes.Margins.Regular,
    marginLeft: Constants.Sizes.Margins.Expanded,
    marginRight: Constants.Sizes.Margins.Expanded,
    marginTop: Constants.Sizes.Margins.Regular,
  },
  bannerTextContainer: {
    backgroundColor: Constants.Colors.darkTransparentBackground,
  },
  container: {
    backgroundColor: Constants.Colors.primaryBackground,
    flex: 1,
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  inset: {
    marginLeft: Constants.Sizes.Margins.Expanded,
  },
  link: {
    fontSize: Constants.Sizes.Text.Body,
  },
  linkContainer: {
    flex: 1,
    marginBottom: Constants.Sizes.Margins.Expanded,
    marginRight: Constants.Sizes.Margins.Expanded,
    marginTop: Constants.Sizes.Margins.Expanded,
  },
  linkDescription: {
    flex: 1,
    fontSize: Constants.Sizes.Text.Body,
    marginTop: Constants.Sizes.Margins.Condensed,
  },
  linkIcon: {
    margin: Constants.Sizes.Margins.Expanded,
  },
  linkSubtitle: {
    fontSize: Constants.Sizes.Text.Caption,
  },
  scrollView: {
    flex: 1,
  },
  socialMediaContainer: {
    backgroundColor: Constants.Colors.tertiaryBackground,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  socialMediaIcon: {
    margin: Constants.Sizes.Margins.Regular,
  },
});
