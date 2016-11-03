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
 * @created 2016-11-2
 * @file Buses.js
 * @description Displays bus information for the city surrounding the university.
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
  showBusCampus,
} from 'actions';

// Type imports
import type {
  BusCampus,
  Language,
} from 'types';

// Type definition for component props.
type Props = {
  campus: ?BusCampus,                             // The currently selected bus campus to display info for
  language: Language,                             // The current language, selected by the user
  onCampuSelected: (campus: ?BusCampus) => void,  // Displays details about a bus campus
}

// Type definition for component state.
type State = {
  campuses: Array < BusCampus >,
}

// Imports
import FourSquare from 'FourSquareGrid';
import * as Constants from 'Constants';

class Buses extends React.Component {

  /**
   * Properties this component expects to be provided by its parent.
   */
  props: Props;

  /**
   * Current state of the component.
   */
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      campuses: [],
    };
  }

  /**
   * If the bus campus info has not been loaded, then load it.
   */
  componentWillMount(): void {
    if (this.state.campuses.length === 0) {
      this.setState({
        campuses: require('../../../assets/js/BusCampuses'),
      });
    }
  }

  /**
   * Sets the selected campus to render.
   *
   * @param {number} index the index of the selected campus in this.state.campuses
   */
  _onCampusSelected(index: number): void {
    this.props.onCampuSelected(this.state.campuses[index]);
  }

  /**
   * Renders each of the sections, with one of them focused and showing an image.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement < any > {
    if (this.state.campuses.length == 0) {
      return (
        <View style={_styles.container} />
      );
    } else {
      return (
        <View style={_styles.container}>
          <FourSquare
              language={this.props.language}
              squares={this.state.campuses}
              onSelect={this._onCampusSelected.bind(this)} />
        </View>
      );
    }
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.Colors.primaryBackground,
  },
});

// Map state to props
const select = (store) => {
  return {
    language: store.config.language,
    campus: store.discover.campus,
  };
};

// Map dispatch to props
const actions = (dispatch) => {
  return {
    onCampuSelected: (campus: ?BusCampus) => dispatch(showBusCampus(campus)),
  };
};

export default connect(select, actions)(Buses);
