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
 * @file Links.tsx
 * @description Root view for info which help users become acquainted with the school.
 */
'use strict';

// React imports
import React from 'react';
import { InteractionManager, StyleSheet, View } from 'react-native';
import { Navigator } from 'react-native-deprecated-custom-components';

// Redux imports
import { connect } from 'react-redux';
import * as actions from '../../actions';

// Imports
import LinkCategoryView from '../../components/LinkCategoryView';
import Menu from '../../components/Menu';
import * as Configuration from '../../util/Configuration';
import * as Constants from '../../constants';
import * as Translations from '../../util/Translations';

// Types
import { Language } from '../../util/Translations';
import { LinkSection, Name, Tab, Route } from '../../../typings/global';

interface Props {
  appTab: Tab;                                          // The current tab the app is showing
  backCount: number;                                    // Number of times user has requested back navigation
  filter: string;                                       // Keywords to filter links by
  language: Language;                                   // The current language, selected by the user
  linkId: string | undefined;                           // The selected link category
  canNavigateBack(can: boolean): void;                  // Indicate whether the app can navigate back
  pushHeaderTitle(t: Name | string): void;              // Sets the title in the app header
  showCategory(id: string | number | undefined): void;  // Shows a link category
  showSearch(show: boolean): void;                      // Shows or hides the search button
}

interface State {
  links: LinkSection[]; // Sections of links
}

class Links extends React.PureComponent<Props, State> {

  /**
   * Constructor.
   *
   * @param {props} props component props
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      links: [],
    };
  }

  /**
   * If the sections have not been loaded, then load them. Adds a listener to navigation events.
   */
  componentDidMount(): void {
    (this.refs.Navigator as any).navigationContext.addListener('didfocus', this._handleNavigationEvent.bind(this));

    if (this.state.links.length === 0) {
      InteractionManager.runAfterInteractions(() => this.loadConfiguration());
    }
  }

  /**
   * Present the updated view.
   *
   * @param {Props} nextProps the new props being received
   */
  componentWillReceiveProps(nextProps: Props): void {
    const currentRoutes = (this.refs.Navigator as any).getCurrentRoutes();
    if (nextProps.appTab === 'discover'
        && nextProps.backCount !== this.props.backCount
        && currentRoutes.length > 1) {
      const linkId = this.props.linkId;
      if (linkId != undefined && typeof (linkId) === 'string') {
        const dashIndex = linkId.lastIndexOf('-');
        if (dashIndex >= 0) {
          this.props.showCategory(linkId.substr(0, linkId.lastIndexOf('-')));
        } else {
          this.props.showCategory(0);
        }
      }
    } else if (nextProps.linkId !== this.props.linkId) {
      let popped = false;
      for (const route of currentRoutes) {
        if (route.id === nextProps.linkId) {
          (this.refs.Navigator as any).popToRoute(route);
          popped = true;
          break;
        }
      }

      if (!popped) {
        (this.refs.Navigator as any).push({ id: nextProps.linkId });
      }
    }
  }

  /**
   * Asynchronously load relevant configuration files and cache the results.
   */
  async loadConfiguration(): Promise<void> {
    try {
      const links = await Configuration.getConfig('/useful_links.json');
      this.setState({ links });
    } catch (err) {
      console.error('Configuration could not be initialized for useful links.', err);
    }
  }

  /**
   * Sets the transition between two views in the navigator.
   *
   * @returns {any} a configuration for the transition between scenes
   */
  _configureScene(): any {
    return Navigator.SceneConfigs.PushFromRight;
  }

  /**
   * Gets the LinkSection from the set of useful links.
   *
   * @param {string} id identifiers for category and subcategories, delimited by dashes
   * @returns {LinkSection|undefined} the LinkSection found, or undefined
   */
  _getSection(id: string): LinkSection | undefined {
    const ids = id.split('-');
    let categoryList = this.state.links;
    let depth = 0;

    let currentSection: LinkSection | undefined;
    let sectionImage: string | undefined;

    while (currentSection == undefined && categoryList != undefined && categoryList.length > 0 && depth < ids.length) {
      for (const category of categoryList) {
        if (category.id === ids[depth]) {
          if (depth === 0) {
            sectionImage = category.image;
          }

          if (depth === ids.length - 1) {
            currentSection = category;
          } else if (category.categories != undefined) {
            categoryList = category.categories;
            depth += 1;
          }
          break;
        }
      }
    }

    if (sectionImage != undefined && currentSection != undefined) {
      currentSection.image = sectionImage;
    }

    return currentSection;
  }

  /**
   * Handles navigation events.
   */
  _handleNavigationEvent(): void {
    const currentRoutes = (this.refs.Navigator as any).getCurrentRoutes();
    if (currentRoutes.length > 1 && this.state.links.length > 0) {
      this.props.showCategory(currentRoutes[currentRoutes.length - 1].id);
    } else {
      this.props.showCategory(0);
    }

    this.props.canNavigateBack(currentRoutes.length > 1);
    this.props.showSearch(currentRoutes.length > 1);
  }

  /**
   * Push a new route onto the stack.
   *
   * @param {string} id the id of the category to display
   */
  _onCategorySelected(id: string): void {
    const currentRoutes = (this.refs.Navigator as any).getCurrentRoutes();
    let sectionId = id;
    if (currentRoutes != undefined && currentRoutes.length > 1) {
      sectionId = `${currentRoutes[currentRoutes.length - 1].id}-${id}`;
    }

    const newSection = this._getSection(sectionId);
    const title = {
      name_en: Translations.getEnglishName(newSection) || '',
      name_fr: Translations.getFrenchName(newSection) || '',
    };
    this.props.pushHeaderTitle(title);
    this.props.showCategory(sectionId);
  }

  /**
   * Renders a set of views to display details about a link section.
   *
   * @param {string} id identifier of the section to render. If it is a subsection, ids are separated by dashes
   * @returns {JSX.Element} the set of views to render
   */
  _renderSection(id: string): JSX.Element {
    const section = this._getSection(id);
    if (section == undefined) {
      // TODO: return generic error view?
      return (
        <View style={_styles.container} />
      );
    }

    return (
      <LinkCategoryView
          filter={this.props.filter}
          language={this.props.language}
          section={section}
          onSubCategorySelected={this._onCategorySelected.bind(this)} />
    );
  }

  /**
   * Renders a view according to the current route of the navigator.
   *
   * @param {Route} route object with properties to identify the route to display
   * @returns {JSX.Element} the view to render, based on {route}
   */
  _renderScene(route: Route): JSX.Element {
    if (typeof (route.id) === 'string' && this.state.links.length > 0) {
      return this._renderSection(route.id);
    } else if (this.state.links.length === 0) {
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
   * @returns {JSX.Element} the hierarchy of views to render
   */
  render(): JSX.Element {
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
    backgroundColor: Constants.Colors.primaryBackground,
    flex: 1,
  },
});

const mapStateToProps = (store: any): any => {
  return {
    appTab: store.navigation.tab,
    backCount: store.navigation.backNavigations,
    filter: store.search.tabTerms.discover,
    language: store.config.options.language,
    linkId: store.navigation.linkId,
  };
};

const mapDispatchToProps = (dispatch: any): any => {
  return {
    canNavigateBack: (can: boolean): void => dispatch(actions.canNavigateBack('links', can)),
    pushHeaderTitle: (title: Name | string): void => dispatch(actions.pushHeaderTitle(title, 'discover')),
    showCategory: (id: string | number | undefined): void => dispatch(actions.switchLinkCategory(id)),
    showSearch: (show: boolean): void => dispatch(actions.showSearch(show, 'discover')),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Links) as any;
