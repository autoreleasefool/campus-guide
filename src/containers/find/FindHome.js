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

// Type imports
import type {
  Building,
  Language,
} from 'types';

// Imports
const BuildingGrid = require('BuildingGrid');
const Constants = require('Constants');
const Header = require('Header');
const TranslationUtils = require('TranslationUtils');

// Number of columns to display in building grid
const BUILDING_COLUMNS: number = 3;

class FindHome extends React.Component {

  /**
   * Properties this component expects to be provided by its parent.
   */
  props: {
    language: Language, // The current language, selected by the user
  }

  /**
   * Loads a view to display details about a building.
   *
   * @param {Building} building object describing the building
   */
  _onBuildingSelect(building: Building): void {
    this.props.onBuildingSelect(building);
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
    onBuildingSelect: (building: Building) => console.log('Building selected: ' + JSON.stringify(building)),
  };
};

module.exports = connect(select, actions)(FindHome);
