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
 * @file Transit.tsx
 * @description Displays transit information for the city surrounding the university.
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
import * as actions from '../../actions';

// Imports
import TransitCampusMap from '../../components/TransitCampusMap';
import Header from '../../components/Header';
import Menu from '../../components/Menu';
import * as Arrays from '../../util/Arrays';
import * as Configuration from '../../util/Configuration';
import * as Constants from '../../constants';
import * as External from '../../util/External';
import * as TextUtils from '../../util/TextUtils';
import * as Translations from '../../util/Translations';

// Types
import { Language } from '../../util/Translations';
import { MenuSection, Name, Route, Tab, TimeFormat } from '../../../typings/global';
import { TransitInfo } from '../../../typings/transit';

interface Props {
  appTab: Tab;                                              // The current tab the app is showing
  backCount: number;                                        // Number of times user has requested back navigation
  transitInfo: TransitInfo | undefined;                     // Information about the city transit system
  campus: MenuSection | undefined;                          // The current transit campus to display info for
  filter: string | undefined;                               // The current filter for transit routes
  language: Language;                                       // The current language, selected by the user
  timeFormat: TimeFormat;                                   // Format to display times in
  canNavigateBack(can: boolean): void;                      // Indicate whether the app can navigate back
  onCampusSelected(campus?: MenuSection | undefined): void;  // Displays details about a transit campus
  resetFilter(): void;                                      // Clears the current search terms
  setHeaderTitle(t: Name | string): void;                   // Sets the title in the app header
  showSearch(show: boolean): void;                          // Shows or hides the search button
}

interface State {
  campuses: MenuSection[];  // Array of transit campuses to display info for
}

// Constant for navigation - show the campus selection screen
const MENU = 0;
// Constant for navigation - show a specific campus
const CAMPUS = 1;

class Transit extends React.PureComponent<Props, State> {

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
    (this.refs.Navigator as any).navigationContext.addListener('didfocus', this._handleNavigationEvent.bind(this));

    if (this.state.campuses.length === 0) {
      this.loadConfiguration();
    }
  }

  /**
   * Asynchronously load relevant configuration files and cache the results.
   */
  async loadConfiguration(): Promise<void> {
    try {
      const campuses = await Configuration.getConfig('/transit_campuses.json');
      this.setState({ campuses });
    } catch (err) {
      console.error('Configuration could not be initialized for transit.', err);
    }
  }

  /**
   * Present the updated view.
   *
   * @param {Props} nextProps the new props being received
   */
  componentWillReceiveProps(nextProps: Props): void {
    if (nextProps.campus !== this.props.campus) {
      if (nextProps.campus == undefined) {
        (this.refs.Navigator as any).pop();
      } else {
        (this.refs.Navigator as any).push({ id: CAMPUS });
      }
    }

    const currentRoutes = (this.refs.Navigator as any).getCurrentRoutes();
    if (nextProps.appTab === 'discover'
        && nextProps.backCount !== this.props.backCount
        && currentRoutes.length > 1) {
      this.props.onCampusSelected();
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
   * Handles navigation events.
   *
   * @param {any} event the event taking place
   */
  _handleNavigationEvent(): void {
    const currentRoutes = (this.refs.Navigator as any).getCurrentRoutes();
    if (currentRoutes[currentRoutes.length - 1].id === MENU) {
      this.props.onCampusSelected();
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
        ? Translations.getLink(this.props.language, this.props.transitInfo)
        : External.getDefaultLink();

    External.openLink(
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
    const index = Arrays.linearSearchObjectArrayByKeyValue(this.state.campuses, 'id', id);
    this.props.onCampusSelected(this.state.campuses[index]);
  }

  /**
   * Returns a map and list of stops near a transit campus.
   *
   * @param {MenuSection|undefined} campusInfo details of the campus to display
   * @returns {JSX.Element} a map and list of stops/routes
   */
  _renderCampus(campusInfo: MenuSection | undefined): JSX.Element {
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

  _renderGrid(): JSX.Element {
    return (
      <View style={_styles.container}>
        <Menu
            language={this.props.language}
            sections={this.state.campuses}
            onSectionSelected={this._onCampusSelected.bind(this)} />
        <View style={_styles.separator} />
        <TouchableOpacity onPress={(): void => this._openLink()}>
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
   * @param {Route} route object with properties to identify the route to display
   * @returns {JSX.Element} the view to render, based on {route}
   */
  _renderScene(route: Route): JSX.Element {
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
   * @returns {JSX.Element} the hierarchy of views to render
   */
  render(): JSX.Element {
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
    backgroundColor: Constants.Colors.primaryBackground,
    flex: 1,
  },
  separator: {
    backgroundColor: Constants.Colors.primaryWhiteText,
    height: StyleSheet.hairlineWidth,
  },
});

const mapStateToProps = (store: any): any => {
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

const mapDispatchToProps = (dispatch: any): any => {
  return {
    canNavigateBack: (can: boolean): void => dispatch(actions.canNavigateBack('transit', can)),
    onCampusSelected: (campus?: MenuSection | undefined): void => dispatch(actions.switchTransitCampus(campus)),
    resetFilter: (): void => dispatch(actions.search()),
    setHeaderTitle: (title: Name | string): void => dispatch(actions.setHeaderTitle(title, 'discover')),
    showSearch: (show: boolean): void => dispatch(actions.showSearch(show, 'discover')),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Transit) as any;
