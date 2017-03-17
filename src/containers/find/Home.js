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
 * @created 2016-10-19
 * @file FindHome.js
 * @description Provides the user with details on navigating the campus.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import { StyleSheet, View } from 'react-native';

// Redux imports
import { connect } from 'react-redux';
import * as actions from 'actions';

// Types
import type { Building, Language, Name, TranslatedName } from 'types';

// Imports
import BuildingGrid from 'BuildingGrid';
import Header from 'Header';
import * as Constants from 'Constants';
import * as Translations from 'Translations';

// Number of columns to display in building grid
const BUILDING_COLUMNS: number = 3;

class FindHome extends React.Component {

  /**
   * Properties this component expects to be provided by its parent.
   */
  props: {
    filter: ?string,                                                    // The current filter for buildings
    language: Language,                                                 // The current language, selected by the user
    onBuildingSelect: (b: Building, n: Name | TranslatedName) => void,  // Updates the state when a building is selected
  }

  /**
   * Loads a view to display details about a building.
   *
   * @param {Building} building object describing the building
   */
  _onBuildingSelect(building: ?Building): void {
    if (building != null) {
      const name = {
        name_en: Translations.getEnglishName(building) || '',
        name_fr: Translations.getFrenchName(building) || '',
      };

      this.props.onBuildingSelect(building, name);
    }
  }

  /**
   * Renders the user's upcoming classes for the day and a list of buildings on campus.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement < any > {
    return (
      <View style={_styles.container}>
        <Header
            icon={{ name: 'store', class: 'material' }}
            title={Translations.get(this.props.language, 'building_directory')} />
        <View style={_styles.container}>
          <BuildingGrid
              columns={BUILDING_COLUMNS}
              filter={this.props.filter}
              language={this.props.language}
              onSelect={this._onBuildingSelect.bind(this)} />
        </View>
      </View>
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
    filter: store.search.terms,
    language: store.config.options.language,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onBuildingSelect: (building: Building, buildingName: Name | TranslatedName) => {
      dispatch(actions.setHeaderTitle(buildingName, 'find'));
      dispatch(actions.viewBuilding(building));
      dispatch(actions.switchFindView(Constants.Views.Find.Building));
      dispatch(actions.search(null));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FindHome);
