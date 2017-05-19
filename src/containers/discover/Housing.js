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
 * @created 2017-05-17
 * @file Housing.js
 * @description Provides menu options for viewing information about housing near the university
 *

 */
'use strict';

// React imports
import React from 'react';
import {
  Alert,
  Clipboard,
  Linking,
  StyleSheet,
  View,
} from 'react-native';
import { Navigator } from 'react-native-deprecated-custom-components';

// Redux imports
import { connect } from 'react-redux';
import * as actions from 'actions';

// Types
import type { HousingInfo, Language, Residence, Route, Tab } from 'types';

// Type definition for component props.
type Props = {
  appTab: Tab,                                  // The current tab the app is showing
  backCount: number,                            // Number of times user has requested back navigation
  canNavigateBack: (can: boolean) => void,      // Indicate whether the app can navigate back
  filter: ?string,                              // Keywords to filter links by
  language: Language,                           // The current language, selected by the user
  onSectionSelected: (section: string) => void, // Display contents of the section in new view
  residence: ?Residence,                        // The currently selected residence
  selectResidence: (r: ?Residence) => void,     // Selects a residence
  showSearch: (show: boolean) => void,          // Shows or hides the search button
  switchView: (view: number) => void,           // Set the current housing view
  view: number,                                 // Current view to display
}

// Type definition for component state.
type State = {
  housingInfo: ?HousingInfo,  // Housing information about the university
};

// Imports
import BuildingHeader from 'BuildingHeader';
import ImageGrid from 'ImageGrid';
import Menu from 'Menu';
import * as Configuration from 'Configuration';
import * as Constants from 'Constants';
import * as ExternalUtils from 'ExternalUtils';
import * as TextUtils from 'TextUtils';
import * as Translations from 'Translations';

// Number of columns to show residences in
const RESIDENCE_COLUMNS = 2;

class Housing extends React.Component {

  /**
   * Properties this component expects to be provided by its parent.
   */
  props: Props

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
      housingInfo: null,
    };
  }

  /**
   * If the sections have not been loaded, then load them.
   */
  componentDidMount(): void {
    this.refs.Navigator.navigationContext.addListener('didfocus', this._handleNavigationEvent.bind(this));

    if (!this.state.housingInfo) {
      Configuration.init()
          .then(() => Configuration.getConfig('/housing.json'))
          .then((housingInfo: HousingInfo) => this.setState({ housingInfo }))
          .catch((err: any) => console.error('Configuration could not be initialized for housing.', err));
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
      this.props.switchView(currentRoutes[currentRoutes.length - 2].id);
    } else if (nextProps.view != this.props.view) {
      let popped = false;
      for (let i = 0; i < currentRoutes.length; i++) {
        if (currentRoutes[i].id === nextProps.view) {
          this.refs.Navigator.popToRoute(currentRoutes[i]);
          popped = true;
          break;
        }
      }

      if (!popped) {
        this.refs.Navigator.push({ id: nextProps.view });
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
   * Handles navigation events.
   */
  _handleNavigationEvent(): void {
    const currentRoutes = this.refs.Navigator.getCurrentRoutes();
    this.props.canNavigateBack(currentRoutes.length > 1);
    if (currentRoutes.length >= 1) {
      switch (currentRoutes[currentRoutes.length - 1].id) {
        case Constants.Views.Housing.ResidenceDetails:
        case Constants.Views.Housing.Resources:
          this.props.showSearch(true);
          break;
        default:
          this.props.selectResidence(null);
          this.props.showSearch(false);
          break;
      }
    }
  }

  /**
   * Handler for when user selects a residence to view details for.
   *
   * @param {Residence} residence residence which was selected
   */
  _onSingleResidenceSelect(residence: ?Residence): void {
    this.props.selectResidence(residence);
  }

  /**
   * Opens the selected section.
   *
   * @param {string} section id of the selected section
   */
  _onSectionSelected(section: string): void {
    if (section === 'off') {
      const translatedLink = Translations.getVariant(
        this.props.language,
        'link',
        this.state.housingInfo.offCampusHousing) || ExternalUtils.getDefaultLink();
      ExternalUtils.openLink(translatedLink, this.props.language, Linking, Alert, Clipboard, TextUtils);
      return;
    }

    this.props.onSectionSelected(section);
  }

  /**
   * Renders a menu to navigate between housing info sections.
   *
   * @returns {ReactElement<any>} a menu
   */
  _renderHousingMenu(): ReactElement < any > {
    return (
      <Menu
          language={this.props.language}
          sections={this.state.housingInfo.sections}
          onSectionSelected={this._onSectionSelected.bind(this)} />
    );
  }

  /**
   * Renders a grid of residences.
   *
   * @returns {ReactElement<any>} an image grid for residences
   */
  _renderResidenceGrid(): ReactElement < any > {
    return (
      <ImageGrid
          columns={RESIDENCE_COLUMNS}
          filter={this.props.filter}
          images={this.state.housingInfo.residences}
          language={this.props.language}
          onSelect={this._onSingleResidenceSelect.bind(this)} />
    );
  }

  /**
   * Renders a set of details and image for a single residence.
   *
   * @param {Residence} residence the residence to render details for
   * @returns {ReactElement<any>} a building header and list of properties of the residence
   */
  _renderResidenceDetails(residence: Residence): ReactElement < any > {
    const headerProperties = [
      {
        name: Translations.get(this.props.language, 'address'),
        description: Translations.getVariant(this.props.language, 'address', residence),
      },
      {
        name: Translations.get(this.props.language, 'description'),
        description: Translations.getVariant(this.props.language, 'description', residence),
      },
    ];

    return (
      <BuildingHeader
          hideTitle={true}
          image={residence.image}
          language={this.props.language}
          properties={headerProperties} />
    );
  }

  /**
   * Renders a view according to the current route of the navigator.
   *
   * @param {Route} route object with properties to identify the route to display.
   * @returns {ReactElement<any>} the view to render, based on {route}.
   */
  _renderScene(route: Route): ReactElement < any > {
    let scene = null;

    if (this.state.housingInfo) {
      switch (route.id) {
        case Constants.Views.Housing.Menu:
          scene = this._renderHousingMenu();
          break;
        case Constants.Views.Housing.Residences:
          scene = this._renderResidenceGrid();
          break;
        case Constants.Views.Housing.ResidenceDetails:
          if (this.props.residence) {
            scene = this._renderResidenceDetails(this.props.residence);
          }
          break;
        case Constants.Views.Housing.ResidenceSelect:
        case Constants.Views.Housing.ResidenceCompare:
        case Constants.Views.Housing.Resources:
        default:
          // TODO: generic error view?
      }
    }

    return (
      <View style={_styles.container}>
        {scene}
      </View>
    );
  }

  /**
   * Renders each of the sections, with one of them focused and showing an image.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement < any > {
    const routeStack = [{ id: Constants.Views.Housing.Menu }];
    if (this.props.view != Constants.Views.Housing.Menu) {
      routeStack.push({ id: this.props.view });
    }

    return (
      <Navigator
          configureScene={this._configureScene}
          initialRouteStack={routeStack}
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
    residence: store.navigation.residence,
    view: store.navigation.housingView,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    canNavigateBack: (can: boolean) => dispatch(actions.canNavigateBack('housing', can)),
    switchView: (view: number) => {
      let title: string = 'housing';
      switch (view) {
        case Constants.Views.Housing.Residences:
          title = 'university_residences';
          break;
        default:
          // Does nothing
          // Return to default
          break;
      }

      dispatch(actions.setHeaderTitle(title, 'discover'));
      dispatch(actions.switchHousingView(view));
    },
    onSectionSelected: (section: ?string) => {
      let view: number = Constants.Views.Housing.Menu;
      let title: string = 'housing';

      switch (section) {
        case 'res':
          view = Constants.Views.Housing.Residences;
          title = 'university_residences';
          break;
        case 'oth':
          view = Constants.Views.Housing.Resources;
          title = 'housing';
          break;
        default:
          // Does nothing
          // Return to default view, MENU
      }

      dispatch(actions.setHeaderTitle(title, 'discover'));
      dispatch(actions.switchHousingView(view));
    },
    selectResidence: (residence: ?Residence) => {
      dispatch(actions.switchResidence(residence));

      if (residence != null) {
        const title = {
          name: residence.name,
          name_en: residence.name_en,
          name_fr: residence.name_fr,
        };

        dispatch(actions.setHeaderTitle(title, 'discover'));
        dispatch(actions.switchHousingView(Constants.Views.Housing.ResidenceDetails));
      }
    },
    showSearch: (show: boolean) => dispatch(actions.showSearch(show, 'discover')),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Housing);
