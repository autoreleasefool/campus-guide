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
 * @created 2016-10-29
 * @file Links.js
 * @description Root view for info which help users become acquainted with the school.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  Alert,
  Clipboard,
  Dimensions,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Navigator } from 'react-native-deprecated-custom-components';

// Redux imports
import { connect } from 'react-redux';
import * as actions from 'actions';

// Types
import type {
  Language,
  LinkSection,
  Name,
  NamedLink,
  Route,
  Tab,
} from 'types';

// Type definition for component props.
type Props = {
  appTab: Tab,                                  // The current tab the app is showing
  backCount: number,                            // Number of times user has requested back navigation
  canNavigateBack: (can: boolean) => void,      // Indicate whether the app can navigate back
  filter: ?string,                              // Keywords to filter links by
  language: Language,                           // The current language, selected by the user
  linkId: ?string,                              // The selected link category
  setHeaderTitle: (t: (Name | string)) => void, // Sets the title in the app header
  showCategory: (id: ?string | number) => void, // Shows a link category
  showSearch: (show: boolean) => void,          // Shows or hides the search button
}

// Type definition for component state.
type State = {
  links: ?Array < LinkSection >,  // Sections of links
};

// Imports
import Header from 'Header';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Menu from 'Menu';
import PaddedIcon from 'PaddedIcon';
import * as Configuration from 'Configuration';
import * as Constants from 'Constants';
import * as DisplayUtils from 'DisplayUtils';
import * as ExternalUtils from 'ExternalUtils';
import * as TextUtils from 'TextUtils';
import * as Translations from 'Translations';

// Used to determine maximum length of link titles
const TEXT_PADDING = 100;
const screenWidth = Dimensions.get('window').width;

class Links extends React.Component {

  /**
   * Properties this component expects to be provided by its parent.
   */
  props: Props;

  /**
   * Current state of the component.
   */
  state: State;

  /**
   * Constructor.
   *
   * @param {props} props component props
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      links: null,
    };
  }

  /**
   * If the sections have not been loaded, then load them. Adds a listener to navigation events.
   */
  componentDidMount(): void {
    this.refs.Navigator.navigationContext.addListener('didfocus', this._handleNavigationEvent.bind(this));

    if (this.state.links == null) {
      Configuration.init()
          .then(() => Configuration.getConfig('/useful_links.json'))
          .then((links: Array < LinkSection >) => this.setState({ links }))
          .catch((err: any) => console.error('Configuration could not be initialized for useful links.', err));
    }
  }

  /**
   * Present the updated view.
   *
   * @param {Props} nextProps the new props being received
   */
  componentWillReceiveProps(nextProps: Props): void {
    const currentRoutes = this.refs.Navigator.getCurrentRoutes();
    if (nextProps.appTab === 'discover'
        && nextProps.backCount != this.props.backCount
        && currentRoutes.length > 1) {
      const linkId = this.props.linkId;
      if (linkId != null && typeof (linkId) === 'string') {
        const dashIndex = linkId.lastIndexOf('-');
        if (dashIndex >= 0) {
          this.props.showCategory(linkId.substr(0, linkId.lastIndexOf('-')));
        } else {
          this.props.showCategory(0);
        }
      }
    } else if (nextProps.linkId != this.props.linkId) {
      let popped = false;
      for (let i = 0; i < currentRoutes.length; i++) {
        if (currentRoutes[i].id === nextProps.linkId) {
          this.refs.Navigator.popToRoute(currentRoutes[i]);
          popped = true;
          break;
        }
      }

      if (!popped) {
        this.refs.Navigator.push({ id: nextProps.linkId });
      }
    }
  }

  /**
   * Sets the transition between two views in the navigator.
   *
   * @returns {Object} a configuration for the transition between scenes.
   */
  _configureScene(): Object {
    return Navigator.SceneConfigs.PushFromRight;
  }

  /**
   * Constructs a view to display a formatted link, if the link does not begin with "http".
   *
   * @param {string} link      the link to format
   * @param {string} textColor color of the text to display link in.
   * @returns {?ReactElement<any>} a formatted link in a text view.
   */
  _getFormattedLink(link: string, textColor: string): ?ReactElement < any > {
    if (link.indexOf('http') === 0) {
      return null;
    } else {
      return (
        <Text style={[ _styles.linkSubtitle, { color: textColor }]}>{TextUtils.formatLink(link)}</Text>
      );
    }
  }

  /**
   * Gets an icon based on the link type.
   *
   * @param {?string} link     the link to represent with an icon.
   * @param {string} iconColor color for the icon.
   * @returns {?ReactElement<any>} an icon for the link.
   */
  _getLinkIcon(link: ?string, iconColor: string): ?ReactElement < any > {
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
   * Gets the LinkSection from the set of useful links.
   *
   * @param {string} id identifiers for category and subcategories, delimited by dashes
   * @returns {?LinkSection} the LinkSection found, or null
   */
  _getSection(id: string): ?LinkSection {
    const ids: Array < string > = id.split('-');
    let categoryList: Array < LinkSection > = this.state.links || [];
    let depth: number = 0;

    let currentSection: ?LinkSection = null;
    let sectionImage: ?string = null;

    while (currentSection == null && categoryList != null && depth < ids.length) {
      for (let i = 0; i < categoryList.length; i++) {
        if (categoryList[i].id == ids[depth]) {
          if (depth == 0) {
            sectionImage = categoryList[i].image;
          }

          if (depth === ids.length - 1) {
            currentSection = categoryList[i];
          } else if (categoryList[i].categories != null) {
            categoryList = categoryList[i].categories;
            depth += 1;
          }
          break;
        }
      }
    }

    if (sectionImage != null && currentSection != null) {
      currentSection.image = sectionImage;
    }

    return currentSection;
  }

  /**
   * Handles navigation events.
   */
  _handleNavigationEvent(): void {
    const currentRoutes = this.refs.Navigator.getCurrentRoutes();
    if (currentRoutes.length > 1 && this.state.links != null) {
      const section = this._getSection(currentRoutes[currentRoutes.length - 1].id);
      const title = {
        name_en: Translations.getEnglishName(section) || '',
        name_fr: Translations.getFrenchName(section) || '',
      };
      this.props.setHeaderTitle(title);
      this.props.showCategory(currentRoutes[currentRoutes.length - 1].id);
    } else {
      this.props.setHeaderTitle('useful_links');
    }

    this.props.canNavigateBack(currentRoutes.length > 1);
    this.props.showSearch(currentRoutes.length > 1);
  }

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
   * Push a new route onto the stack.
   *
   * @param {string} id the id of the category to display
   */
  _onCategorySelected(id: string): void {
    const currentRoutes = this.refs.Navigator.getCurrentRoutes();
    if (currentRoutes != null && currentRoutes.length > 1) {
      this.props.showCategory(`${currentRoutes[currentRoutes.length - 1].id}-${id}`);
    } else {
      this.props.showCategory(id);
    }
  }

  /**
   * Renders a header image for the section links.
   *
   * @param {LinkSection} section category to display
   * @returns {ReactElement<any>} an image and title for the section
   */
  _renderSectionBanner(section: LinkSection): ReactElement < any > {
    return (
      <View style={_styles.banner}>
        <Image
            resizeMode={'cover'}
            source={{ uri: Configuration.getImagePath(section.image) }}
            style={_styles.bannerImage} />
        <View style={_styles.bannerTextContainer}>
          <Text style={_styles.bannerText}>
            {Translations.getName(this.props.language, section)}
          </Text>
        </View>
      </View>
    );
  }

  /**
   * Returns a list of touchable views which lead to new pages of categories of links.
   *
   * @param {?Array<LinkSection>} categoryList     subcategories of links
   * @param {boolean}             isBackgroundDark indicates if the background color of the category is dark
   * @returns {?ReactElement<any>} for each index in categories, a TouchableOpacity with the name of the category,
   *                               or null if there are no categories
   */
  _renderSectionCategories(categoryList: ?Array < LinkSection >, isBackgroundDark: boolean): ?ReactElement < any > {
    const categories = categoryList;
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
                onPress={() => this._onCategorySelected(category.id)}>
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
   * Returns a list of touchable views which open links in the web browser.
   *
   * @param {?Array<NamedLink>} linkList         list of links in the current category.
   * @param {boolean}           isBackgroundDark indicates if the background color of the category is dark.
   * @returns {?ReactElement<any>} for each index in {links}, a {TouchableOpacity} with the name of the link
   *                               or null if there are no links
   */
  _renderSectionLinks(linkList: ?Array < NamedLink >, isBackgroundDark: boolean): ?ReactElement < any > {
    const links = linkList;
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
            title={Translations.get(language, 'useful_links')} />
        {links.map((link, index) => {
          const translatedLink: string = Translations.getVariant(language, 'link', link)
              || ExternalUtils.getDefaultLink();
          const translatedName: string = Translations.getName(language, link)
              || translatedLink;

          // Compare name to search terms and do not render if they don't match
          if (filter != null && translatedName.toUpperCase().indexOf(filter) < 0) {
            return null;
          }

          return (
            <View key={translatedLink}>
              <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                  onPress={() => this._openLink(translatedLink)}>
                {this._getLinkIcon(translatedLink, iconColor)}
                <View style={_styles.linkContainer}>
                  <Text style={[ _styles.link, { color: textColor }]}>
                    {translatedName}
                  </Text>
                  {this._getFormattedLink(translatedLink, textColor)}
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
   * @param {?Array<NamedLink>} linkList list of links to social media sites in the current category
   * @returns {?ReactElement<any>} for each index in links, a TouchableOpacity with an icon representing
   *                              the social media site, or null if there are no links
   */
  _renderSectionSocialMedia(linkList: ?Array < NamedLink >): ?ReactElement < any > {
    const links = linkList;
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
   * Renders a set of views to display details about a link section.
   *
   * @param {string} id identifier of the section to render. If it is a subsection, ids are separated by dashes
   * @returns {ReactElement<any>} the set of views to render
   */
  _renderSection(id: string): ReactElement < any > {
    const section = this._getSection(id);
    if (section == null) {
      // TODO: return generic error view?
      return (
        <View style={_styles.container} />
      );
    }

    let categoryBackgroundColor: string = Constants.Colors.primaryBackground;
    if (Constants.Colors[section.id] != null) {
      categoryBackgroundColor = Constants.Colors[section.id];
    }

    const isBackgroundDark: boolean = DisplayUtils.isColorDark(categoryBackgroundColor);

    return (
      <View style={[ _styles.container, { backgroundColor: categoryBackgroundColor }]}>
        <ScrollView style={_styles.scrollView}>
          {this._renderSectionBanner(section)}
          {this._renderSectionSocialMedia(section.social)}
          {this._renderSectionCategories(section.categories, isBackgroundDark)}
          {this._renderSectionLinks(section.links, isBackgroundDark)}
        </ScrollView>
      </View>
    );
  }

  /**
   * Renders a view according to the current route of the navigator.
   *
   * @param {Route} route object with properties to identify the route to display.
   * @returns {ReactElement<any>} the view to render, based on {route}.
   */
  _renderScene(route: Route): ReactElement < any > {
    if (typeof (route.id) == 'string' && this.state.links != null) {
      return this._renderSection(route.id);
    } else if (this.state.links == null) {
      return (
        <View style={_styles.container} />
      );
    } else {
      return (
        <Menu
            language={this.props.language}
            sections={this.state.links}
            onSectionSelected={this._onCategorySelected.bind(this)} />
      );
    }
  }

  /**
   * Renders each of the sections, with one of them focused and showing an image.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement < any > {
    return (
      <Navigator
          configureScene={this._configureScene}
          initialRoute={{ id: this.props.linkId || 0 }}
          ref='Navigator'
          renderScene={this._renderScene.bind(this)}
          style={_styles.container} />
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
    marginTop: Constants.Sizes.Margins.Expanded,
    marginBottom: Constants.Sizes.Margins.Expanded,
    marginRight: Constants.Sizes.Margins.Expanded,
  },
  link: {
    fontSize: Constants.Sizes.Text.Body,
    width: screenWidth - TEXT_PADDING,
  },
  linkSubtitle: {
    fontSize: Constants.Sizes.Text.Caption,
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

const mapStateToProps = (store) => {
  return {
    appTab: store.navigation.tab,
    backCount: store.navigation.backNavigations,
    filter: store.search.terms,
    language: store.config.options.language,
    linkId: store.navigation.linkId,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    canNavigateBack: (can: boolean) => dispatch(actions.canNavigateBack('links', can)),
    setHeaderTitle: (title: (Name | string)) => dispatch(actions.setHeaderTitle(title, 'discover')),
    showCategory: (id: ?string | number) => dispatch(actions.switchLinkCategory(id)),
    showSearch: (show: boolean) => dispatch(actions.showSearch(show, 'discover')),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Links);
