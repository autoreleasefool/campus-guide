/**
 *
 * @license
 * Copyright (C) 2016 Joseph Roque
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
import {
  StyleSheet,
  View,
} from 'react-native';

// Redux imports
import {connect} from 'react-redux';
import {
  setHeaderTitle,
  switchFindView,
  viewBuilding,
} from 'actions';

// Type imports
import type {
  Building,
  Language,
  Name,
  TranslatedName,
} from 'types';

// Imports
import BuildingGrid from 'BuildingGrid';
import Header from 'Header';
import * as Constants from 'Constants';
import * as TranslationUtils from 'TranslationUtils';

import {
  Views,
} from './Find';

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
  _onBuildingSelect(building: Building): void {
    const name = {
      name_en: TranslationUtils.getTranslatedName('en', building) || '',
      name_fr: TranslationUtils.getTranslatedName('fr', building) || '',
    };

    this.props.onBuildingSelect(building, name);
  }

  /**
   * Renders the user's upcoming classes for the day and a list of buildings on campus.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement < any > {
    // Get current language for translations
    const Translations: Object = TranslationUtils.getTranslations(this.props.language);

    return (
      <View style={_styles.container}>
        <Header
            icon={{name: 'store', class: 'material'}}
            title={Translations.building_directory} />
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
    backgroundColor: Constants.Colors.garnet,
  },
});

// Map state to props
const select = (store) => {
  return {
    filter: null,
    language: store.config.language,
  };
};

// Map dispatch to props
const actions = (dispatch) => {
  return {
    onBuildingSelect: (building: Building, buildingName: Name | TranslatedName) => {
      dispatch(setHeaderTitle(buildingName, 'find'));
      dispatch(viewBuilding(building));
      dispatch(switchFindView(Views.Building));
    },
  };
};

export default connect(select, actions)(FindHome);
