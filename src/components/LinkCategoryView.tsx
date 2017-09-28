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
  FlatList,
  Image,
  InteractionManager,
  Linking,
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
  filter: string;                           // Keywords to filter links by
  language: Language;                       // The current language, selected by the user
  section: LinkSection;                     // Section to display
  socialMedia?: NamedLink | undefined;      // List of links to social media sites in the current category
  onSubCategorySelected?(id: string): void; // Callback when subcategory in the category is selected by the user
}

interface State {
  iconColor: string;          // Icon color for links
  isBackgroundDark: boolean;  // Indicates if the category background is dark
  links: NamedLink[];         // List of filtered links
  secondaryTextColor: string; // Description text color for links
  textColor: string;          // Text color for link titles
}

export default class LinkCategoryView extends React.PureComponent<Props, State> {

  /**
   * Constructor.
   *
   * @param {props} props component props
   */
  constructor(props: Props) {
    super(props);

    const categoryBackgroundColor = Constants.Colors[props.section.id] || Constants.Colors.primaryBackground;
    const isBackgroundDark = Display.isColorDark(categoryBackgroundColor);

    const textColor = (isBackgroundDark)
        ? Constants.Colors.primaryWhiteText
        : Constants.Colors.primaryBlackText;
    const secondaryTextColor = (isBackgroundDark)
        ? Constants.Colors.secondaryWhiteText
        : Constants.Colors.secondaryBlackText;
    const iconColor = (isBackgroundDark)
        ? Constants.Colors.secondaryWhiteText
        : Constants.Colors.secondaryBlackText;

    this.state = {
      iconColor,
      isBackgroundDark,
      links: [],
      secondaryTextColor,
      textColor,
    };
  }

  /**
   * Loads the study spots once the view has been mounted.
   */
  componentDidMount(): void {
    InteractionManager.runAfterInteractions(() => this._filterLinks(this.props));
  }

  /**
   * If a new filter is provided, update the list of links.
   *
   * @param {Props} nextProps the new props being received
   */
  componentWillReceiveProps(nextProps: Props): void {
    if (nextProps.filter !== this.props.filter || nextProps.language !== this.props.language) {
      this._filterLinks(nextProps);
    }
  }

  /**
   * Filter to only show links which names contain the search terms.
   *
   * @param {Props} props the props to filter with
   */
  _filterLinks({ section, filter }: Props): void {
    // Ignore the case of the search terms
    const adjustedFilter = (filter.length === 0) ? undefined : filter.toUpperCase();

    // Create array for links
    const filteredLinks: NamedLink[] = [];

    if (section.links) {
      section.links.forEach((link: NamedLink) => {
        const translatedLink = Translations.getLink(link) || External.getDefaultLink();
        const translatedName = Translations.getName(link) || translatedLink;
        if (adjustedFilter == undefined || translatedName.toUpperCase().indexOf(adjustedFilter) >= 0) {
          filteredLinks.push(link);
        }
      });
    }

    // Update the state so the app reflects the changes made
    this.setState({ links: filteredLinks });
  }

  /**
   * Attempts to open a URL.
   *
   * @param {string|undefined} link the url to open
   */
  _openLink(link: string | undefined): void {
    External.openLink(link, Linking, Alert, Clipboard, TextUtils);
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
            {Translations.getName(this.props.section)}
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
   * Constructs a header with social media links and subcategories for the link category.
   *
   * @param {boolean} isBackgroundDark true if the category background color is dark, false otherwise
   * @returns {JSX.Element} a hierarchy of views
   */
  _renderHeader(isBackgroundDark: boolean): JSX.Element {
    return (
      <View>
        {this._renderSocialMedia()}
        {this._renderSubCategories(isBackgroundDark)}
        {this._renderLinkHeader()}
      </View>
    );
  }

  /**
   * Render a header for the list of links, or nothing if there are no links to render.
   *
   * @returns {JSX.Element|undefined} a <Header> element, or undefined
   */
  _renderLinkHeader(): JSX.Element | undefined {
    if (this.state.links.length === 0) {
      return undefined;
    }

    return (
      <Header
        icon={{ name: 'insert-link', class: 'material' }}
        title={Translations.get('uo_info')} />
    );
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

  _renderLink({ item }: { item: NamedLink }): JSX.Element {
    const translatedLink = Translations.getLink(item) || External.getDefaultLink();
    const translatedName = Translations.getName(item) || translatedLink;
    const translatedDescription = Translations.getDescription(item);

    const { textColor, secondaryTextColor, iconColor }: State = this.state;

    return (
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
              <Text style={[ _styles.linkDescription, { color: secondaryTextColor }]}>
                {translatedDescription}
              </Text>
            )}
        </View>
      </TouchableOpacity>
    );
  }

  /**
   * Returns a list of touchable views which open links in the web browser.
   *
   * @returns {JSX.Element|undefined} for each index in links, a TouchableOpacity with an icon representing
   *                                  the social media site, or undefined if there are no links
   */
  _renderSocialMedia(): JSX.Element | undefined {
    const links = this.props.section.social;
    if (links == undefined) {
      return undefined;
    }

    return (
      <View style={_styles.socialMediaContainer}>
        {links.map((link: NamedLink) => {
          const url = Translations.getLink(link) || External.getDefaultLink();
          const name = Translations.getName(link);

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
   * @param {boolean} isBackgroundDark indicates if the background color of the category is dark
   * @returns {JSX.Element|undefined} for each index in categories, a TouchableOpacity with the name of the category,
   *                                  or undefined if there are no categories
   */
  _renderSubCategories(isBackgroundDark: boolean): JSX.Element | undefined {
    const categories = this.props.section.categories;
    if (categories == undefined) {
      return undefined;
    }

    const dividerColor: string = (isBackgroundDark)
        ? Constants.Colors.primaryWhiteText
        : Constants.Colors.primaryBlackText;

    return (
      <View>
        <View style={[ _styles.divider, { backgroundColor: dividerColor }]} />
        {categories.map((category: LinkSection) => {
          const categoryName = Translations.getName(category);
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
   * Renders a separator line between rows.
   *
   * @returns {JSX.Element} a separator for the list of links
   */
  _renderSeparator(): JSX.Element {
    const { textColor }: State = this.state;

    return <View style={[ _styles.separator, { backgroundColor: textColor }]} />;
  }

  /**
   * Renders a set of views detailing a set of related links.
   *
   * @returns {JSX.Element} the hierarchy of views to render
   */
  render(): JSX.Element {
    const categoryBackgroundColor = Constants.Colors[this.props.section.id] || Constants.Colors.primaryBackground;

    return (
      <View style={[ _styles.container, { backgroundColor: categoryBackgroundColor }]}>
        {this._renderBanner()}
        <FlatList
            ItemSeparatorComponent={this._renderSeparator.bind(this)}
            ListHeaderComponent={this._renderHeader.bind(this, this.state.isBackgroundDark)}
            data={this.state.links}
            keyExtractor={(link: NamedLink): string => Translations.getLink(link) || External.getDefaultLink()}
            renderItem={this._renderLink.bind(this)} />
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
    fontSize: Constants.Sizes.Text.Subtitle,
  },
  linkContainer: {
    flex: 1,
    marginBottom: Constants.Sizes.Margins.Regular,
    marginRight: Constants.Sizes.Margins.Regular,
    marginTop: Constants.Sizes.Margins.Regular,
  },
  linkDescription: {
    flex: 1,
    fontSize: Constants.Sizes.Text.Body,
    marginTop: Constants.Sizes.Margins.Condensed,
  },
  linkIcon: {
    margin: Constants.Sizes.Margins.Regular,
  },
  linkSubtitle: {
    fontSize: Constants.Sizes.Text.Caption,
  },
  scrollView: {
    flex: 1,
  },
  separator: {
    backgroundColor: Constants.Colors.tertiaryBackground,
    height: StyleSheet.hairlineWidth,
    marginLeft: Constants.Sizes.Margins.Expanded,
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
