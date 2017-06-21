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
 * @file Housing.tsx
 * @description Provides menu options for viewing information about housing near the university
 */
'use strict';

// React imports
import React from 'react';
import {
  Alert,
  Clipboard,
  Dimensions,
  Linking,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Navigator } from 'react-native-deprecated-custom-components';

// Redux imports
import { connect } from 'react-redux';
import * as actions from '../../actions';

// Imports
import BuildingHeader from '../../components/BuildingHeader';
import Header from '../../components/Header';
import ImageGrid from '../../components/ImageGrid';
import LinkCategoryView from '../../components/LinkCategoryView';
import Menu from '../../components/Menu';
import Snackbar from 'react-native-snackbar';
import * as Configuration from '../../util/Configuration';
import * as Constants from '../../constants';
import * as External from '../../util/External';
import * as TextUtils from '../../util/TextUtils';
import * as Translations from '../../util/Translations';
import { default as PaddedIcon, DefaultWidth as PaddedIconWidth } from '../../components/PaddedIcon';

// Types
import { Language } from '../../util/Translations';
import { Route, Section, Tab } from '../../../typings/global';
import { BuildingProperty, HousingInfo, Residence, ResidenceProperty } from '../../../typings/university';

interface Props {
  appTab: Tab;                                      // The current tab the app is showing
  backCount: number;                                // Number of times user has requested back navigation
  filter: string | undefined;                       // Keywords to filter links by
  language: Language;                               // The current language, selected by the user
  residence: Residence | undefined;                 // The currently selected residence
  view: number;                                     // Current view to display
  canNavigateBack(can: boolean): void;              // Indicate whether the app can navigate back
  onSectionSelected(section: string): void;         // Display contents of the section in new view
  selectResidence(r: Residence | undefined): void;  // Selects a residence
  showSearch(show: boolean): void;                  // Shows or hides the search button
  switchView(view: number): void;                   // Set the current housing view
}

interface State {
  header: BuildingProperty[];                     // Header details about the residence
  housingInfo: HousingInfo | undefined;           // Housing information about the university
  residenceDetails: Section<ResidenceProperty>[]; // List of specific properties of the residence
}

// Width of screen for consistent property alignment when comparing
const { width }: { width: number} = Dimensions.get('window');
const RESIDENCE_PROPERTY_WIDTH_RATIO = 0.4;

// Number of columns to show residences in
const RESIDENCE_COLUMNS = 2;

class Housing extends React.PureComponent<Props, State> {

  /** Residences to be compared. */
  _residencesToCompare: (Residence|undefined)[] = [];

  /** Width of properties for comparison screen. */
  _multiPropertyWidth: { width: number } = { width: 0 };

  /**
   * Constructor.
   *
   * @param {props} props component props
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      header: ([] as BuildingProperty[]),
      housingInfo: undefined,
      residenceDetails: ([] as Section<ResidenceProperty>[]),
    };
  }

  /**
   * If the sections have not been loaded, then load them.
   */
  componentDidMount(): void {
    (this.refs.Navigator as any).navigationContext.addListener('didfocus', this._handleNavigationEvent.bind(this));

    this._multiPropertyWidth.width = width * RESIDENCE_PROPERTY_WIDTH_RATIO;

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
    const currentRoutes = (this.refs.Navigator as any).getCurrentRoutes();
    if (nextProps.appTab === 'discover'
        && nextProps.backCount !== this.props.backCount
        && currentRoutes.length > 1) {
      this.props.switchView(currentRoutes[currentRoutes.length - 2].id);
    } else if (nextProps.view !== this.props.view) {
      let popped = false;
      for (const route of currentRoutes) {
        if (route.id === nextProps.view) {
          (this.refs.Navigator as any).popToRoute(route);
          popped = true;
          break;
        }
      }

      if (!popped) {
       (this.refs.Navigator as any).push({ id: nextProps.view });
      }
    }

    if (nextProps.residence !== this.props.residence) {
      if (nextProps.residence) {
        const properties = this._buildResidenceProperties(nextProps.residence);
        this.setState({ header: properties });
        this._onSearch(nextProps, false);
      } else {
        this.setState({ header: [], residenceDetails: [] });
      }
    }

    if (nextProps.filter !== this.props.filter) {
      this._onSearch(nextProps,
          this.props.filter == undefined
          || this.props.filter.length === 0
          || (nextProps.filter && nextProps.filter.indexOf(this.props.filter) >= 0));
    }
  }

  /**
   * Builds arrays of properties when a new residence is selected.
   *
   * @param {Residence} residence residence to setup properties for
   * @returns {BuildingProperty[]} properties to display a residence
   */
  _buildResidenceProperties(residence: Residence): BuildingProperty[] {
    return [
      {
        description: Translations.getVariant(this.props.language, 'address', residence),
        name: Translations.get(this.props.language, 'address'),
      },
      {
        description: Translations.getDescription(this.props.language, residence),
        name: Translations.get(this.props.language, 'description'),
      },
    ];
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
   */
  _handleNavigationEvent(): void {
    const currentRoutes = (this.refs.Navigator as any).getCurrentRoutes();
    this.props.canNavigateBack(currentRoutes.length > 1);
    if (currentRoutes.length >= 1) {
      switch (currentRoutes[currentRoutes.length - 1].id) {
        case Constants.Views.Housing.Menu:
          this.props.selectResidence(undefined);
          this.props.showSearch(false);
          break;
        case Constants.Views.Housing.Residences:
          this.props.selectResidence(undefined);
          this.props.showSearch(true);
          break;
        case Constants.Views.Housing.ResidenceCompare:
        case Constants.Views.Housing.ResidenceDetails:
        case Constants.Views.Housing.ResidenceSelect:
        case Constants.Views.Housing.Resources:
          this.props.showSearch(true);
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
    this.props.switchView(Constants.Views.Housing.ResidenceSelect);
  }

  /**
   * Handler for when user selects a set of residences to compare.
   *
   * @param {(Residence|undefined)[]} residences residences which were selected
   */
  _onMultiResidenceSelect(residences: (Residence|undefined)[]): void {
    if (residences.length < 2) {
      Snackbar.show({
        duration: Snackbar.LENGTH_LONG,
        title: Translations.get(this.props.language, 'select_at_least_two'),
      });

      return;
    }

    this._residencesToCompare = residences;
    this.props.switchView(Constants.Views.Housing.ResidenceCompare);
  }

  /**
   * Filters properties being viewed by the user.
   *
   * @param {Props}   props         props to filter with
   * @param {boolean} narrowResults true to narrow current results, false to filter full results
   */
  _onSearch(props: Props, narrowResults: boolean): void {
    const adjustedFilter = props.filter ? props.filter.toUpperCase() : undefined;
    switch (props.view) {
      case Constants.Views.Housing.ResidenceCompare:
      case Constants.Views.Housing.ResidenceDetails: {
        // Start with either all of the properties for fresh searches,
        // or narrow down existing results for continued searches
        let unfilteredProperties;
        if (narrowResults) {
          unfilteredProperties = this.state.residenceDetails;
        } else if (props.residence) {
          unfilteredProperties = this.state.housingInfo.categories;
        }

        if (unfilteredProperties == undefined) {
          return;
        }

        const filteredProperties = [];
        for (const unfilteredProperty of unfilteredProperties) {
          let categoryAdded = false;

          // Add categories and all properties if their name matches the filter
          const categoryName = Translations.getName(props.language, unfilteredProperty) || '';
          if (adjustedFilter == undefined || categoryName.toUpperCase().indexOf(adjustedFilter) >= 0) {
            filteredProperties.push(unfilteredProperty);
            continue;
          }

          // Check each property in the category and add the category if any match
          // then, add only properties that match the filter
          for (const property of unfilteredProperty.data) {
            const propertyName = Translations.getName(props.language, property) || '';
            if (adjustedFilter == undefined || propertyName.toUpperCase().indexOf(adjustedFilter) >= 0) {
              if (!categoryAdded) {
                filteredProperties.push({ ...unfilteredProperty });
                filteredProperties[filteredProperties.length - 1].data = [];
                categoryAdded = true;
              }
              filteredProperties[filteredProperties.length - 1].data.push(property);
            }
          }
        }

        this.setState({ residenceDetails: filteredProperties });
        break;
      }
      default:
        // Does nothing
    }
  }

  /**
   * Handler for when user selects a residence to view details for.
   *
   * @param {Residence|undefined} residence residence which was selected
   */
  _onSingleResidenceSelect(residence: Residence | undefined): void {
    this.props.selectResidence(residence);
  }

  /**
   * Opens the selected section.
   *
   * @param {string} section id of the selected section
   */
  _onSectionSelected(section: string): void {
    if (section === 'off') {
      const translatedLink = Translations.getLink(this.props.language, this.state.housingInfo.offCampusHousing)
          || External.getDefaultLink();
      External.openLink(translatedLink, this.props.language, Linking, Alert, Clipboard, TextUtils);

      return;
    }

    this.props.onSectionSelected(section);
  }

  /**
   * Renders a menu to navigate between housing info sections.
   *
   * @returns {JSX.Element} a menu
   */
  _renderHousingMenu(): JSX.Element {
    return (
      <Menu
          language={this.props.language}
          sections={this.state.housingInfo.sections}
          onSectionSelected={this._onSectionSelected.bind(this)} />
    );
  }

  /**
   * Renders a set of resources for more information on housing at the university.
   *
   * @returns {JSX.Element|undefined} A LinkCategoryView
   */
  _renderOtherResources(): JSX.Element | undefined {
    if (this.state.housingInfo == undefined) {
      return undefined;
    }

    return (
      <LinkCategoryView
          filter={this.props.filter}
          language={this.props.language}
          section={this.state.housingInfo.resources} />
    );
  }

  /**
   * Renders a grid of residences.
   *
   * @returns {JSX.Element} an image grid for residences
   */
  _renderResidenceGrid(): JSX.Element {
    return (
      <ImageGrid
          columns={RESIDENCE_COLUMNS}
          filter={this.props.filter}
          images={this.state.housingInfo.residences}
          initialSelection={[ this.props.residence ]}
          language={this.props.language}
          multiSelect={this.props.view === Constants.Views.Housing.ResidenceSelect}
          multiSelectText={Translations.get(this.props.language, 'compare_residences')}
          onMultiSelect={this._onMultiResidenceSelect.bind(this)}
          onSelect={this._onSingleResidenceSelect.bind(this)} />
    );
  }

  /**
   * Renders row separator.
   *
   * @returns {JSX.Element} a separator styled view
   */
  _renderSeparator(): JSX.Element {
    return <View style={_styles.separator} />;
  }

  /**
   * Displays a single item, representing a property and value.
   *
   * @param {ResidenceProperty} item property for the residence
   * @returns {JSX.Element|undefined} a checked or unchecked box depending on the property value,
   *                                  and the property name
   */
  _renderSingleResidenceProperty({ item }: { item: ResidenceProperty }): JSX.Element | undefined {
    if (item.key === 'none') {
      return undefined;
    }
    const value = this.props.residence.props[item.key];

    return (
      <View style={_styles.propertyContainer}>
        <PaddedIcon
            color={Constants.Colors.tertiaryBackground}
            icon={{ class: 'material', name: value ? 'check-box' : 'check-box-outline-blank' }}
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
   * Displays a single item, representing a property and values for multiple residences.
   *
   * @param {ResidenceProperty} item property for the residence
   * @returns {JSX.Element|undefined} the property name and checked or unchecked boxes for each residence
   *                                  being compared, depending on if the property pertains to it
   */
  _renderMultiResidenceProperty({ item }: { item: ResidenceProperty }): JSX.Element | undefined {
    if (item.key === 'none') {
      return undefined;
    }

    return (
      <View style={_styles.propertyContainer}>
        <Text style={[ _styles.propertyText, _styles.multiPropertyText, this._multiPropertyWidth ]}>
          {Translations.getName(this.props.language, item)}
        </Text>
        {this._residencesToCompare.map((residence: Residence) => (
          <PaddedIcon
              color={Constants.Colors.tertiaryBackground}
              icon={{ class: 'material', name: residence.props[item.key] ? 'check-box' : 'check-box-outline-blank' }}
              key={`${item.key}.${Translations.getName(this.props.language, residence)}`}
              size={Constants.Sizes.Icons.Medium} />
        ))}
      </View>
    );
  }

  /**
   * Renders a heading for a section of properties.
   *
   * @param {Section<any>} section section contents
   * @returns {JSX.Element} a {Header} with the name of the section
   */
  _renderResidencePropertyCategory({ section }: { section: Section < any > }): JSX.Element {
    const description = Translations.getDescription(this.props.language, section);

    return (
      <View style={_styles.category}>
        <Header title={Translations.getName(this.props.language, section) || ''} />
        {description == undefined
          ? undefined
          : <Text style={_styles.categoryDescription}>{description}</Text>}
        {description == undefined
          ? undefined
          : <View style={_styles.fullSeparator} />}
      </View>
    );
  }

  /**
   * Renders a set of details and image for a single residence.
   *
   * @param {Residence} residence the residence to render details for
   * @returns {JSX.Element} a building header and list of properties of the residence
   */
  _renderResidenceDetails(residence: Residence): JSX.Element {
    return (
      <View style={_styles.container}>
        <BuildingHeader
            hideTitle={true}
            image={residence.image}
            language={this.props.language}
            properties={this.state.header} />
        <TouchableOpacity onPress={this._onBeginCompare.bind(this)}>
          <Header
              backgroundColor={Constants.Colors.tertiaryBackground}
              icon={{ name: 'compare-arrows', class: 'material' }}
              title={Translations.get(this.props.language, 'compare_with')} />
        </TouchableOpacity>
        <SectionList
            ItemSeparatorComponent={this._renderSeparator.bind(this)}
            renderItem={this._renderSingleResidenceProperty.bind(this)}
            renderSectionHeader={this._renderResidencePropertyCategory.bind(this)}
            sections={this.state.residenceDetails}
            stickySectionHeadersEnabled={false} />
      </View>
    );
  }

  /**
   * Renders the set of residences being compared.
   *
   * @returns {JSX.Element} residence names
   */
  _renderResidenceCompareHeader(): JSX.Element {
    return (
      <View>
        <Header
            icon={{ class: 'material', name: 'hotel' }}
            title={Translations.get(this.props.language, 'residences')} />
        {this._residencesToCompare.map((residence: Residence, index: number) => (
          <Text
              key={`name.${Translations.getName(this.props.language, residence)}`}
              style={_styles.multiResidenceName}>
            {`${(index + 1)}: ${Translations.getName(this.props.language, residence)}`}
          </Text>
        ))}
        <View style={_styles.multiResidenceContainer}>
          <View style={[ this._multiPropertyWidth, _styles.multiResidenceColumnPadding ]} />
          {this._residencesToCompare.map((_: any, index: number) => (
            <Text
                key={`residenceIndex.${index}`}
                style={_styles.multiResidenceColumn}>
              {`${(index + 1)}`}
            </Text>
          ))}
        </View>
      </View>
    );
  }

  /**
   * Renders a set of details about multiple residences, for simple comparison.
   *
   * @returns {JSX.Element} a list of properties and columns indicating which residences they pertain to
   */
  _renderResidenceCompare(): JSX.Element {
    return (
      <ScrollView
          bounces={false}
          horizontal={true}
          style={_styles.container}>
        <View>
          {this._renderResidenceCompareHeader()}
          <View style={_styles.compareHeaderSeparator} />
          <SectionList
              ItemSeparatorComponent={this._renderSeparator.bind(this)}
              renderItem={this._renderMultiResidenceProperty.bind(this)}
              renderSectionHeader={this._renderResidencePropertyCategory.bind(this)}
              sections={this.state.residenceDetails}
              stickySectionHeadersEnabled={false} />
        </View>
      </ScrollView>
    );
  }

  /**
   * Renders a view according to the current route of the navigator.
   *
   * @param {Route} route object with properties to identify the route to display
   * @returns {JSX.Element} the view to render, based on {route}
   */
  _renderScene(route: Route): JSX.Element {
    let scene: JSX.Element;

    if (this.state.housingInfo) {
      switch (route.id) {
        case Constants.Views.Housing.Menu:
          scene = this._renderHousingMenu();
          break;
        case Constants.Views.Housing.Residences:
        case Constants.Views.Housing.ResidenceSelect:
          scene = this._renderResidenceGrid();
          break;
        case Constants.Views.Housing.ResidenceDetails:
          if (this.props.residence) {
            scene = this._renderResidenceDetails(this.props.residence);
          }
          break;
        case Constants.Views.Housing.ResidenceCompare:
          scene = this._renderResidenceCompare();
          break;
        case Constants.Views.Housing.Resources:
          scene = this._renderOtherResources();
          break;
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
   * @returns {JSX.Element} the hierarchy of views to render
   */
  render(): JSX.Element {
    const routeStack = [{ id: Constants.Views.Housing.Menu }];
    if (this.props.view !== Constants.Views.Housing.Menu) {
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
  category: {
    backgroundColor: Constants.Colors.primaryBackground,
  },
  categoryDescription: {
    color: Constants.Colors.primaryWhiteText,
    flex: 1,
    fontSize: Constants.Sizes.Text.Body,
    margin: Constants.Sizes.Margins.Expanded,
    maxWidth: width - Constants.Sizes.Margins.Expanded * 2,
    textAlign: 'center',
  },
  compareHeaderSeparator: {
    backgroundColor: Constants.Colors.tertiaryBackground,
    height: StyleSheet.hairlineWidth,
  },
  container: {
    backgroundColor: Constants.Colors.primaryBackground,
    flex: 1,
  },
  fullSeparator: {
    backgroundColor: Constants.Colors.tertiaryBackground,
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  multiPropertyText: {
    marginLeft: Constants.Sizes.Margins.Expanded,
    textAlign: 'right',
  },
  multiResidenceColumn: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
    fontWeight: 'bold',
    marginBottom: Constants.Sizes.Margins.Expanded,
    marginTop: Constants.Sizes.Margins.Expanded,
    textAlign: 'center',
    width: PaddedIconWidth,
  },
  multiResidenceColumnPadding: {
    marginRight: Constants.Sizes.Margins.Expanded * 2,
  },
  multiResidenceContainer: {
    flexDirection: 'row',
  },
  multiResidenceName: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Subtitle,
    marginBottom: 0,
    marginLeft: Constants.Sizes.Margins.Regular,
    marginTop: Constants.Sizes.Margins.Regular,
  },
  propertyContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  propertyText: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
    marginBottom: Constants.Sizes.Margins.Expanded,
    marginRight: Constants.Sizes.Margins.Expanded,
    marginTop: Constants.Sizes.Margins.Expanded,
  },
  separator: {
    backgroundColor: Constants.Colors.tertiaryBackground,
    height: StyleSheet.hairlineWidth,
    marginLeft: Constants.Sizes.Margins.Expanded,
  },
});

const mapStateToProps = (store: any): any => {
  return {
    appTab: store.navigation.tab,
    backCount: store.navigation.backNavigations,
    filter: store.search.terms,
    language: store.config.options.language,
    residence: store.navigation.residence,
    view: store.navigation.housingView,
  };
};

const mapDispatchToProps = (dispatch: any): any => {
  return {
    canNavigateBack: (can: boolean): void => dispatch(actions.canNavigateBack('housing', can)),
    onSectionSelected: (section: string | undefined): void => {
      let view = Constants.Views.Housing.Menu;
      let title = 'housing';

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
    selectResidence: (residence: Residence | undefined): void => {
      dispatch(actions.switchResidence(residence));

      if (residence != undefined) {
        const title = {
          name: residence.name,
          name_en: residence.name_en,
          name_fr: residence.name_fr,
        };

        dispatch(actions.setHeaderTitle(title, 'discover'));
        dispatch(actions.switchHousingView(Constants.Views.Housing.ResidenceDetails));
      }
    },
    showSearch: (show: boolean): void => dispatch(actions.showSearch(show, 'discover')),
    switchView: (view: number): void => {
      let title = 'housing';
      switch (view) {
        case Constants.Views.Housing.Residences:
        case Constants.Views.Housing.ResidenceCompare:
        case Constants.Views.Housing.ResidenceSelect:
          title = 'university_residences';
          break;
        default:
          // Does nothing
          // Return to default
      }

      dispatch(actions.setHeaderTitle(title, 'discover'));
      dispatch(actions.switchHousingView(view));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Housing) as any;
