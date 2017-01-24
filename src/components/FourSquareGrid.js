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
 * @file FourSquareGrid.js
 * @providesModule FourSquareGrid
 * @description Displays and image and title for 4 options in a large grid
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

// Types
import type {
  Language,
} from 'types';

type Square = {
  background: string, // Background color for the grid square
  image: any,         // Image for the grid square
  title: string,      // Title for the grid square
};

// Imports
import Header from 'Header';
import * as Constants from 'Constants';
import {getTranslatedName} from 'TranslationUtils';

// Index for top left square in grid
const TOP_LEFT: number = 0;
// Index for top right square in grid
const TOP_RIGHT: number = 1;
// Index for bottom left square in grid
const BOTTOM_LEFT: number = 2;
// Index for bottom right square in grid
const BOTTOM_RIGHT: number = 3;
// Maximum number of values in the grid
const MAX_SQUARES: number = 4;

export default class FourSquareGrid extends React.Component {

  props: {
    onSelect: (index: number) => void,  // Callback for when user selects a section
    language: Language,                 // The user's currently selected language
    squares: Array < Object >,          // 4 items to list in each square
  }

  /**
   * Invokes callback when a square is selected.
   *
   * @param {number} index index of square selected, either TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT
   */
  _onSelect(index: number): void {
    this.props.onSelect(index);
  }

  render(): ReactElement < any > {
    if (this.props.squares == null || this.props.squares.length > MAX_SQUARES) {
      console.error(`Too many squares for FourSquareGrid: ${this.props.squares.length}`);
      return (
        <View />
      );
    }

    // Default background color when one is not provided
    const defaultBackground = Constants.Colors.darkTransparentBackground;

    const squares: Array < Square > = [];
    for (let i = 0; i < this.props.squares.length; i++) {
      squares.push({
        background: this.props.squares[i].background || defaultBackground,
        image: this.props.squares[i].image,
        title: getTranslatedName(this.props.language, this.props.squares[i]) || '',
      });
    }

    return (
      <View style={_styles.container}>
        <View style={_styles.rowContainer}>
          <TouchableOpacity
              style={{flex: 1}}
              onPress={this._onSelect.bind(this, TOP_LEFT)}>
            <View style={_styles.square}>
              <Image
                  resizeMode={'cover'}
                  source={squares[TOP_LEFT].image}
                  style={_styles.image} />
              <Header
                  backgroundColor={squares[TOP_LEFT].background}
                  title={squares[TOP_LEFT].title} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
              style={{flex: 1}}
              onPress={this._onSelect.bind(this, TOP_RIGHT)}>
            <View style={_styles.square}>
              <Image
                  resizeMode={'cover'}
                  source={squares[TOP_RIGHT].image}
                  style={_styles.image} />
              <Header
                  backgroundColor={squares[TOP_RIGHT].background}
                  title={squares[TOP_RIGHT].title} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={_styles.rowContainer}>
          <TouchableOpacity
              style={{flex: 1}}
              onPress={this._onSelect.bind(this, BOTTOM_LEFT)}>
            <View style={_styles.square}>
              <Image
                  resizeMode={'cover'}
                  source={squares[BOTTOM_LEFT].image}
                  style={_styles.image} />
              <Header
                  backgroundColor={squares[BOTTOM_LEFT].background}
                  title={squares[BOTTOM_LEFT].title} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
              style={{flex: 1}}
              onPress={this._onSelect.bind(this, BOTTOM_RIGHT)}>
            <View style={_styles.square}>
              <Image
                  resizeMode={'cover'}
                  source={squares[BOTTOM_RIGHT].image}
                  style={_styles.image} />
              <Header
                  backgroundColor={squares[BOTTOM_RIGHT].background}
                  title={squares[BOTTOM_RIGHT].title} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

// Private styles for the component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  rowContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  square: {
    flex: 1,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: null,
    height: null,
  },
});
