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
import { StyleSheet, View } from 'react-native';
import { Navigator } from 'react-native-deprecated-custom-components';

// Redux imports
import { connect } from 'react-redux';
import * as actions from 'actions';

// Types
import type {
  Language,
  LinkSection,
  Name,
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
  links: Array < LinkSection >,  // Sections of links
};

// Imports
import LinkCategoryView from 'LinkCategoryView';
import Menu from 'Menu';
import * as Configuration from 'Configuration';
import * as Constants from 'Constants';
import * as Translations from 'Translations';

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
      links: [],
    };
  }

  /**
   * If the sections have not been loaded, then load them. Adds a listener to navigation events.
   */
  componentDidMount(): void {
    this.refs.Navigator.navigationContext.addListener('didfocus', this._handleNavigationEvent.bind(this));

    if (this.state.links.length === 0) {
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
   * Gets the LinkSection from the set of useful links.
   *
   * @param {string} id identifiers for category and subcategories, delimited by dashes
   * @returns {?LinkSection} the LinkSection found, or null
   */
  _getSection(id: string): ?LinkSection {
    const ids: Array < string > = id.split('-');
    let categoryList: Array < LinkSection > = this.state.links;
    let depth: number = 0;

    let currentSection: ?LinkSection = null;
    let sectionImage: ?string = null;

    while (currentSection == null && categoryList && categoryList.length > 0 && depth < ids.length) {
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
    if (currentRoutes.length > 1 && this.state.links.length > 0) {
      const section = this._getSection(currentRoutes[currentRoutes.length - 1].id);
      const title = {
        name_en: Translations.getEnglishName(section) || '',
        name_fr: Translations.getFrenchName(section) || '',
      };
      this.props.setHeaderTitle(title);
      this.props.showCategory(currentRoutes[currentRoutes.length - 1].id);
    } else {
      this.props.setHeaderTitle('uo_info');
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
    const currentRoutes = this.refs.Navigator.getCurrentRoutes();
    if (currentRoutes != null && currentRoutes.length > 1) {
      this.props.showCategory(`${currentRoutes[currentRoutes.length - 1].id}-${id}`);
    } else {
      this.props.showCategory(id);
    }
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
   * @param {Route} route object with properties to identify the route to display.
   * @returns {ReactElement<any>} the view to render, based on {route}.
   */
  _renderScene(route: Route): ReactElement < any > {
    if (typeof (route.id) == 'string' && this.state.links.length > 0) {
      return this._renderSection(route.id);
    } else if (this.state.links === 0) {
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
