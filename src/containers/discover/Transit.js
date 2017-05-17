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
 * @created 2016-11-2
 * @file Transit.js
 * @description Displays transit information for the city surrounding the university.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  Alert,
  Clipboard,
  Linking,
  StyleSheet,
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
  MenuSection,
  Name,
  Route,
  Tab,
  TimeFormat,
  TransitInfo,
  VoidFunction,
} from 'types';

// Type definition for component props.
type Props = {
  appTab: Tab,                                      // The current tab the app is showing
  backCount: number,                                // Number of times user has requested back navigation
  transitInfo: ?TransitInfo,                        // Information about the city transit system
  campus: ?MenuSection,                             // The current transit campus to display info for
  canNavigateBack: (can: boolean) => void,          // Indicate whether the app can navigate back
  filter: ?string,                                  // The current filter for transit routes
  language: Language,                               // The current language, selected by the user
  onCampusSelected: (campus: ?MenuSection) => void, // Displays details about a transit campus
  resetFilter: VoidFunction,                        // Clears the current search terms
  setHeaderTitle: (t: (Name | string)) => void,     // Sets the title in the app header
  showSearch: (show: boolean) => void,              // Shows or hides the search button
  timeFormat: TimeFormat,                           // Format to display times in
}

// Type definition for component state.
type State = {
  campuses: Array < MenuSection >,  // Array of transit campuses to display info for
}

// Imports
import TransitCampusMap from 'TransitCampusMap';
import Header from 'Header';
import Menu from 'Menu';
import * as ArrayUtils from 'ArrayUtils';
import * as Configuration from 'Configuration';
import * as Constants from 'Constants';
import * as ExternalUtils from 'ExternalUtils';
import * as TextUtils from 'TextUtils';
import * as Translations from 'Translations';

// Constant for navigation - show the campus selection screen
const MENU: number = 0;
// Constant for navigation - show a specific campus
const CAMPUS: number = 1;

class Transit extends React.Component {

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
      campuses: [],
    };
  }

  /**
   * Adds a listener for navigation events.
   */
  componentDidMount(): void {
    this.refs.Navigator.navigationContext.addListener('didfocus', this._handleNavigationEvent.bind(this));

    if (this.state.campuses.length === 0) {
      Configuration.init()
          .then(() => Configuration.getConfig('/transit_campuses.json'))
          .then((campuses: Array < MenuSection >) => this.setState({ campuses }))
          .catch((err: any) => console.error('Configuration could not be initialized for transit.', err));
    }
  }

  /**
   * Present the updated view.
   *
   * @param {Props} nextProps the new props being received
   */
  componentWillReceiveProps(nextProps: Props): void {
    if (nextProps.campus != this.props.campus) {
      if (nextProps.campus == null) {
        this.refs.Navigator.pop();
      } else {
        this.refs.Navigator.push({ id: CAMPUS });
      }
    }

    const currentRoutes = this.refs.Navigator.getCurrentRoutes();
    if (nextProps.appTab === 'discover'
        && nextProps.backCount != this.props.backCount
        && currentRoutes.length > 1) {
      this.props.onCampusSelected(null);
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
   * Handles navigation events.
   *
   * @param {any} event the event taking place
   */
  _handleNavigationEvent(): void {
    const currentRoutes = this.refs.Navigator.getCurrentRoutes();
    if (currentRoutes[currentRoutes.length - 1].id === MENU) {
      this.props.onCampusSelected(null);
      this.props.setHeaderTitle('transit_company');
    } else {
      const title = {
        name_en: Translations.getEnglishName(this.props.campus) || '',
        name_fr: Translations.getFrenchName(this.props.campus) || '',
      };
      this.props.setHeaderTitle(title);
    }

    this.props.canNavigateBack(currentRoutes.length > 1);
    this.props.showSearch(currentRoutes.length > 1);
  }

  /**
   * Opens the transit company website.
   */
  _openLink(): void {
    const link = this.props.transitInfo
        ? Translations.getVariant(this.props.language, 'link', this.props.transitInfo)
        : ExternalUtils.getDefaultLink();

    ExternalUtils.openLink(
        link,
        this.props.language,
        Linking,
        Alert,
        Clipboard,
        TextUtils
    );
  }

  /**
   * Sets the selected campus to render.
   *
   * @param {string} id id of the selected campus in this.state.campuses
   */
  _onCampusSelected(id: string): void {
    const index = ArrayUtils.linearSearchObjectArrayByKeyValue(this.state.campuses, 'id', id);
    this.props.onCampusSelected(this.state.campuses[index]);
  }

  /**
   * Returns a map and list of stops near a transit campus.
   *
   * @param {?MenuSection} campusInfo details of the campus to display
   * @returns {ReactElement<any>} a map and list of stops/routes
   */
  _renderCampus(campusInfo: ?MenuSection): ReactElement < any > {
    const campus = campusInfo;
    if (campus) {
      return (
        <TransitCampusMap
            campusId={campus.id}
            filter={this.props.filter}
            language={this.props.language}
            resetFilter={this.props.resetFilter}
            timeFormat={this.props.timeFormat} />
      );
    } else {
      // TODO: return generic error view?
      return (
        <View />
      );
    }
  }

  _renderGrid(): ReactElement < any > {
    return (
      <View style={_styles.container}>
        <Menu
            language={this.props.language}
            sections={this.state.campuses}
            onSectionSelected={this._onCampusSelected.bind(this)} />
        <View style={_styles.separator} />
        <TouchableOpacity onPress={() => this._openLink()}>
          <Header
              icon={{ name: 'md-open', class: 'ionicon' }}
              subtitleIcon={{ name: 'chevron-right', class: 'material' }}
              title={Translations.get(this.props.language, 'transit_company')} />
        </TouchableOpacity>
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
    switch (route.id) {
      case MENU:
        return this._renderGrid();
      case CAMPUS:
        return this._renderCampus(this.props.campus);
      default:
        // TODO: return generic error view?
        return (
          <View />
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
          initialRoute={{ id: MENU }}
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
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Constants.Colors.primaryWhiteText,
  },
});

const mapStateToProps = (store) => {
  return {
    appTab: store.navigation.tab,
    backCount: store.navigation.backNavigations,
    campus: store.navigation.campus,
    filter: store.search.terms,
    language: store.config.options.language,
    timeFormat: store.config.options.preferredTimeFormat,
    transitInfo: store.config.options.transitInfo,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    canNavigateBack: (can: boolean) => dispatch(actions.canNavigateBack('transit', can)),
    onCampusSelected: (campus: ?MenuSection) => dispatch(actions.switchTransitCampus(campus)),
    resetFilter: () => dispatch(actions.search(null)),
    setHeaderTitle: (title: (Name | string)) => dispatch(actions.setHeaderTitle(title, 'discover')),
    showSearch: (show: boolean) => dispatch(actions.showSearch(show, 'discover')),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Transit);
