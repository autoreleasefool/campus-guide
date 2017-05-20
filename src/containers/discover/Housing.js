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
  SectionList,
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
  BuildingProperty,
  HousingInfo,
  Language,
  Residence,
  ResidenceProperty,
  Route,
  Section,
  Tab,
} from 'types';

type ResidenceDisplayProperties = {
  header: Array < BuildingProperty >,                 // Header details about the residence
  residence: Array < Section < ResidenceProperty > >, // List of specific properties of the residence
}

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
} & ResidenceDisplayProperties;

// Imports
import BuildingHeader from 'BuildingHeader';
import Header from 'Header';
import ImageGrid from 'ImageGrid';
import Menu from 'Menu';
import PaddedIcon from 'PaddedIcon';
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
      headerProperties: [],
      residenceProperties: [],
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

    if (nextProps.residence != this.props.residence) {
      if (nextProps.residence) {
        const properties = this._buildResidenceProperties(nextProps.residence);
        if (properties) {
          this.setState({
            headerProperties: properties.header,
            residenceProperties: properties.residence,
          });
        }
      } else {
        this.setState({
          headerProperties: [],
          residenceProperties: [],
        });
      }
    }

    if (nextProps.filter != this.props.filter) {
      this._onSearch(nextProps,
          this.props.filter == null
          || this.props.filter.length === 0
          || (nextProps.filter && nextProps.filter.indexOf(this.props.filter) >= 0));
    }
  }

  /**
   * Builds arrays of properties when a new residence is selected.
   *
   * @param {Residence} residence residence to setup properties for
   * @returns {ResidenceDisplayProperties} properties to display a residence
   */
  _buildResidenceProperties(residence: Residence): ?ResidenceDisplayProperties {
    const housingInfo = this.state.housingInfo;
    if (housingInfo == null) {
      return null;
    }

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

    const residenceProperties = [];
    for (let i = 0; i < housingInfo.categories.length; i++) {
      const category: Object = Object.assign({}, housingInfo.categories[i]);
      category.data = [];
      category.props = null;
      for (let j = 0; j < housingInfo.categories[i].props.length; j++) {
        const property = Object.assign({}, housingInfo.categories[i].props[j]);
        property.value = residence.props[property.key];
        category.data.push(property);
      }
      residenceProperties.push(category);
    }

    return {
      header: headerProperties,
      residence: residenceProperties,
    };
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
        case Constants.Views.Housing.Menu:
          this.props.selectResidence(null);
          this.props.showSearch(false);
          break;
        case Constants.Views.Housing.Residences:
          this.props.selectResidence(null);
          this.props.showSearch(true);
          break;
        case Constants.Views.Housing.ResidenceDetails:
        case Constants.Views.Housing.ResidenceCompare:
          this.props.showSearch(true);
          break;
        case Constants.Views.Housing.Resources:
        case Constants.Views.Housing.ResidenceSelect:
          this.props.showSearch(false);
          break;
        default:
          // Does nothing
      }
    }
  }

  /**
   * Opens view to select residences to compare.
   */
  _onBeginCompare(): void {
    this.props.switchView(Constants.Views.Housing.ResidenceCompare);
  }

  /**
   * Filters properties being viewed by the user.
   *
   * @param {Props}   props         props to filter with
   * @param {boolean} narrowResults true to narrow current results, false to filter full results
   */
  _onSearch(props: Props, narrowResults: boolean): void {
    const filter = props.filter;
    switch (props.view) {
      case Constants.Views.Housing.ResidenceDetails: {
        // Start with either all of the properties for fresh searches,
        // or narrow down existing results for continued searches
        let unfilteredProperties = null;
        if (narrowResults) {
          unfilteredProperties = this.state.residenceProperties;
        } else if (props.residence) {
          const properties = this._buildResidenceProperties(props.residence);
          if (properties) {
            unfilteredProperties = properties.residence;
          }
        }

        if (unfilteredProperties == null) {
          return;
        }

        const filteredProperties = [];
        for (let i = 0; i < unfilteredProperties.length; i++) {
          let categoryAdded = false;

          // Add categories and all properties if their name matches the filter
          if (i === 0) {
            const category = unfilteredProperties[i];
            const categoryName = Translations.getName(props.language, category) || '';
            if (filter == null || categoryName.indexOf(filter) >= 0) {
              filteredProperties.push(category);
              continue;
            }
          }

          // Check each property in the category and add the category if any match
          // then, add only properties that match the filter
          for (let j = 0; j < unfilteredProperties[i].data.length; j++) {
            const property = unfilteredProperties[i].data[j];
            const propertyName = Translations.getName(props.language, property) || '';
            if (filter == null || propertyName.indexOf(filter) >= 0) {
              if (!categoryAdded) {
                filteredProperties.push(Object.assign({}, unfilteredProperties[i]));
                filteredProperties[filteredProperties.length - 1].data = [];
                categoryAdded = true;
              }
              filteredProperties[filteredProperties.length - 1].data.push(property);
            }
          }
        }

        this.setState({ residenceProperties: filteredProperties });
        break;
      }
      default:
        // Does nothing
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
   * Renders row separator.
   *
   * @returns {ReactElement<any>} a separator styled view
   */
  _renderSeparator(): ReactElement < any > {
    return <View style={_styles.separator} />;
  }

  /**
   * Displays a single item, representing a property and value.
   *
   * @param {ResidenceProperty} item property and value for the residence
   * @returns {ReactElement<any>} a checked or unchecked box depending on the property value,
   *                              and the property name
   */
  _renderSingleResidenceProperty({ item }: { item: ResidenceProperty }): ReactElement < any > {
    return (
      <View style={_styles.propertyContainer}>
        <PaddedIcon
            color={Constants.Colors.tertiaryBackground}
            icon={{ class: 'material', name: item.value ? 'check-box' : 'check-box-outline-blank' }}
            size={Constants.Sizes.Icons.Medium} />
        <Text
            ellipsizeMode={'tail'}
            numberOfLines={1}
            style={_styles.propertyText}>
          {Translations.getName(this.props.language, item)}
        </Text>
      </View>
    );
  }

  /**
   * Renders a heading for a section of properties.
   *
   * @param {Object} section section contents
   * @returns {ReactElement<any>} a {Header} with the name of the section
   */
  _renderResidencePropertyCategory({ section }: { section: Section < * > }): ReactElement < any > {
    const description = Translations.getVariant(this.props.language, 'description', section);

    return (
      <View style={_styles.category}>
        <Header title={Translations.getName(this.props.language, section) || ''} />
        {description == null
          ? null
          : <Text style={_styles.categoryDescription}>{description}</Text>}
        {description == null
          ? null
          : <View style={_styles.fullSeparator} />}
      </View>
    );
  }

  /**
   * Renders a set of details and image for a single residence.
   *
   * @param {Residence} residence the residence to render details for
   * @returns {ReactElement<any>} a building header and list of properties of the residence
   */
  _renderResidenceDetails(residence: Residence): ReactElement < any > {
    return (
      <View style={_styles.container}>
        <BuildingHeader
            hideTitle={true}
            image={residence.image}
            language={this.props.language}
            properties={this.state.headerProperties} />
        <TouchableOpacity onPress={this._onBeginCompare.bind(this)}>
          <Header
              backgroundColor={Constants.Colors.tertiaryBackground}
              icon={{ name: 'compare-arrows', class: 'material' }}
              title={Translations.get(this.props.language, 'compare_with')} />
        </TouchableOpacity>
        <SectionList
            ItemSeparatorComponent={this._renderSeparator}
            renderItem={this._renderSingleResidenceProperty.bind(this)}
            renderSectionHeader={this._renderResidencePropertyCategory.bind(this)}
            sections={this.state.residenceProperties}
            stickySectionHeadersEnabled={false} />
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
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Constants.Colors.tertiaryBackground,
    marginLeft: Constants.Sizes.Margins.Expanded,
  },
  fullSeparator: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Constants.Colors.tertiaryBackground,
  },
  category: {
    backgroundColor: Constants.Colors.primaryBackground,
  },
  categoryDescription: {
    flex: 1,
    margin: Constants.Sizes.Margins.Expanded,
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
    textAlign: 'center',
  },
  propertyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  propertyText: {
    marginTop: Constants.Sizes.Margins.Expanded,
    marginBottom: Constants.Sizes.Margins.Expanded,
    marginRight: Constants.Sizes.Margins.Expanded,
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
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
        case Constants.Views.Housing.ResidenceCompare:
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
