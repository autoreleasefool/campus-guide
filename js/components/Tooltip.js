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
 * @file Tooltip.js
 * @providesModule Tooltip
 * @description Displays a text overlay on the screen at a specified position, to be dismissed by the user
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Type definition for component alignment.
type Alignment = 'left' | 'right';

// Type definition for component state.
type State = {
  active: boolean,
  alignment: Alignment,
  callback: ?() => any,
  text: ?string,
  x: number,
  y: number,
};

// Imports
const Constants = require('Constants');
const Ionicon = require('react-native-vector-icons/Ionicons');

// For defining width of the tooltip
const {width} = Dimensions.get('window');
const TOOLTIP_WIDTH: number = 0.75;

// Size of the dismiss icon
const DISMISS_ICON_SIZE: number = 24;

// Name of the close icon to display
let dismissIcon: string;
if (Platform.OS === 'ios') {
  dismissIcon = 'ios-close';
} else {
  dismissIcon = 'md-close';
}

/** Instance of the tooltip. */
let globalTooltip: ?ReactElement< any >;

class Tooltip extends React.Component {

  /** State of the component. */
  state: State;

  /**
   * Declares initial state.
   *
   * @param {{}} props props of the component
   */
  constructor(props) {
    super(props);

    this.state = {
      active: false,
      alignment: 'left',
      callback: null,
      text: null,
      x: 0,
      y: 0,
    };
  }

  /**
   * Stores a reference to this Tooltip instance in a variable.
   */
  componentDidMount(): void {

    /* eslint-disable consistent-this */

    globalTooltip = this;

    /* eslint-disable consistent-this */

  }

  /**
   * Clears the reference to this Tooltip.
   */
  componentWillUnmount(): void {
    globalTooltip = null;
  }

  /**
   * Hides the tooltip when clicked.
   */
  _dismiss(): void {
    if (this.state.callback) {
      this.state.callback();
    }

    this.setState({
      active: false,
    });
  }

  /**
   * Displays the Tooltip if it is active.
   *
   * @returns {?ReactElement<any>} the tooltip, if this.state.active is true, null otherwise.
   */
  render(): ?ReactElement< any > {
    if (!this.state.active) {
      return null;
    }

    let alignment: Object = {};
    if (this.state.alignment === 'right') {
      alignment = {
        right: this.state.x,
      };
    } else {
      alignment = {
        left: this.state.x,
      };
    }

    return (
      <TouchableOpacity
          style={[{position: 'absolute', top: this.state.y}, alignment]}
          onPress={this._dismiss.bind(this)}>
        <View style={_styles.tooltip}>
          <Text style={_styles.tooltipText}>{this.state.text}</Text>
          <Ionicon
              color={Constants.Colors.secondaryWhiteText}
              name={dismissIcon}
              size={DISMISS_ICON_SIZE}
              style={_styles.tooltipIcon} />
        </View>
      </TouchableOpacity>
    );
  }
}

// Private styles for the component
const _styles = StyleSheet.create({
  tooltip: {
    width: width * TOOLTIP_WIDTH,
    backgroundColor: Constants.Colors.charcoalGrey,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tooltipText: {
    flex: 1,
    margin: 10,
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Text.Medium,
  },
  tooltipIcon: {
    marginRight: 10,
  },
});

module.exports = Tooltip;

/**
 * Shows the tooltip overlaying a certain position, with the text provided.
 *
 * @param {string} text         text to display in tooltip
 * @param {Alignment} alignment 'left' to set the left of the tooltip to x, 'right' to set the right to x
 * @param {number} x            horizontal position of the tooltip
 * @param {number} y            vertical position of the tooltip
 * @param {?function} callback   callback function for when tooltip is dismissed
 */
module.exports.showTooltip = (text: string, alignment: Alignment, x: number, y: number, callback: ?() => any) => {
  if (globalTooltip != null) {
    globalTooltip.setState({
      active: true,
      alignment: alignment,
      callback: callback,
      text: text,
      x: x,
      y: y,
    });
  }
};

/**
 * Returns true if and only if a tooltip is currently shown.
 *
 * @returns {boolean} false if the tooltip is null or not active, true otherwise.
 */
module.exports.isTooltipActive = () => globalTooltip != null && globalTooltip.state.active;
