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
 * @created 2016-10-20
 * @file Building.tsx
 * @description Provides details on a single building on campus.
 */
'use strict';

// React imports
import React from 'react';
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

// Redux imports
import { connect } from 'react-redux';
import * as actions from '../../actions';

// Imports
import BuildingHeader from '../../components/BuildingHeader';
import Header from '../../components/Header';
import RoomGrid from '../../components/RoomGrid';
import * as Constants from '../../constants';
import * as Translations from '../../util/Translations';

// Types
import { Language } from '../../util/Translations';
import { Building, BuildingProperty } from '../../../typings/university';

interface Props {
  building: Building;         // Building to display details for
  filter: string;             // The current filter for rooms
  language: Language;         // The current language, selected by the user
  onDestinationSelected(shorthand: string, room: string | undefined): void;
                              // Callback for when a room is selected
}

interface State {
  properties: BuildingProperty[];
}

class BuildingComponent extends React.PureComponent<Props, State> {

  /**
   * Constructor.
   *
   * @param {props} props component props
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      properties: this._getBuildingProperties(props.building),
    };
  }

  /**
   *  Update building properties if a new building is set.
   *
   * @param {Props} nextProps the new building properties
   */
  componentWillReceiveProps(nextProps: Props): void {
    if (this.props.building !== nextProps.building) {
      this.setState({ properties: this._getBuildingProperties(nextProps.building) });
    }
  }

  /**
   * Get the properties of a building.
   *
   * @param {Building} building the building to get properties for
   * @returns {BuildingProperty[]} properties from the building
   */
  _getBuildingProperties(building: Building): BuildingProperty[] {
    return [
      {
        description_en: Translations.getEnglishName(building),
        description_fr: Translations.getFrenchName(building),
        name: 'name',
      },
      {
        description_en: Translations.getEnglishVariant('address', building),
        description_fr: Translations.getFrenchVariant('address', building),
        name: 'address',
      },
    ];
  }

  /**
   * Informs parent that the user has selected a destination.
   *
   * @param {string} shorthand shorthand code of the building that has been selected
   * @param {string|undefined} roomName name of the room selected, or undefined if a building was selected
   */
  _onDestinationSelected(shorthand: string, roomName?: string): void {
    this.props.onDestinationSelected(shorthand, roomName);
  }

  /**
   * Returns a view which allows the user to navigate to the building depicted.
   *
   * @returns {JSX.Element} a touchable view
   */
  _renderBuildingDirections(): JSX.Element {
    const navigateToBuilding =
        `${Translations.get('navigate_to')} `
        + `${(Translations.getName(this.props.building) || '')}`;

    return (
      <TouchableOpacity onPress={(): void => this._onDestinationSelected(this.props.building.shorthand)}>
        <Header
            backgroundColor={Constants.Colors.tertiaryBackground}
            icon={{ name: Platform.OS === 'ios' ? 'ios-navigate' : 'md-navigate', class: 'ionicon' }}
            subtitleIcon={{ name: 'chevron-right', class: 'material' }}
            title={navigateToBuilding} />
      </TouchableOpacity>
    );
  }

  /**
   * Renders a view with various specifics of the building, as well as an image.
   *
   * @returns {JSX.Element} the hierarchy of views to render
   */
  _renderHeader(): JSX.Element {
    const building: Building = this.props.building;

    return (
      <View>
        <BuildingHeader
            facilities={building.facilities}
            hideTitle={true}
            image={building.image}
            language={this.props.language}
            properties={this.state.properties}
            shorthand={building.shorthand} />
        {this._renderBuildingDirections()}
      </View>
    );
  }

  /**
   * Renders a view containing an image of the building, it's name, and a list of its rooms and facilities.
   *
   * @returns {JSX.Element} a view describing a building
   */
  render(): JSX.Element {
    const building: Building = this.props.building;

    return (
      <View style={_styles.container}>
        {this._renderHeader()}
        <RoomGrid
            filter={this.props.filter}
            language={this.props.language}
            rooms={building.rooms}
            shorthand={building.shorthand}
            onSelect={this._onDestinationSelected.bind(this)} />
      </View>
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
    building: store.directions.building,
    filter: store.search.tabTerms.find,
    language: store.config.options.language,
  };
};

const mapDispatchToProps = (dispatch: any): any => {
  return {
    onDestinationSelected: (shorthand: string, room: string | undefined): any => {
      dispatch(actions.setDestination({ shorthand, room }));
      dispatch(actions.setHeaderTitle('directions', 'find', Constants.Views.Find.StartingPoint));
      dispatch(actions.switchFindView(Constants.Views.Find.StartingPoint));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(BuildingComponent) as any;
