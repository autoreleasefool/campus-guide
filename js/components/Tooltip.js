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
  AsyncStorage,
  Dimensions,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Type definition for component state.
type State = {
  active: boolean,
  backgroundColor: string,
  callback: ?() => any,
  hAlign: 'left' | 'right',
  text: ?string,
  textColor: string,
  vAlign: 'top' | 'bottom',
  x: number,
  y: number,
};

// Parameters that creating a tooltip accepts
type TooltipOptions = {
  backgroundColor?: string,
  callback?: () => any,
  hAlign: 'left' | 'right' | 'center',
  text: string,
  textColor?: string,
  vAlign: 'top' | 'bottom' | 'center',
  x?: number,
  y?: number,
};

// Imports
const Constants = require('Constants');
const Ionicon = require('react-native-vector-icons/Ionicons');

// For defining width, position of the tooltip
const {width, height} = Dimensions.get('window');
const TOOLTIP_WIDTH_PCT: number = 0.75;

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
let globalTooltip: any;

class Tooltip extends React.Component {

  /** Represents if the user has seen the tooltip indicating how to search all. */
  static HOW_TO_SEARCH_ALL: string = 'tooltip_search_all';

  /** Represents if the user has seen the tooltip to show building image. */
  static SHOW_BUILDING_IMAGE: string = 'tooltip_show_building_image';

  /**
   * Checks if a certain tooltip has already been acknowledged by a user.
   *
   * @param {string} id     tooltip id to check
   * @param {function} done callback to return result
   */
  static hasSeenTooltip(id: string, done: () => any): void {
    if (id == null || id.length === 0) {
      // If id is invalid, return false
      done(false);
      return;
    }

    AsyncStorage.getItem(id, (err, result) => {
      if (err) {
        // Output any errors, return false
        console.error('Error retrieving tooltip info: ' + id + '. ' + err);
        done(false);
        return;
      }

      // Only return true if the value is exactly equal to true
      done(result === 'true');
    });
  }

  /**
   * Tooltip has been acknowledged by a user.
   *
   * @param {string} id tooltip to acknowledge
   */
  static setHasSeenTooltip(id: string) {
    AsyncStorage.setItem(id, 'true');
  }

  /**
   * Returns true if and only if a tooltip is currently shown.
   *
   * @returns {boolean} false if the tooltip is null or not active, true otherwise.
   */
  static isTooltipActive(): boolean {
    return globalTooltip != null && globalTooltip.state.active;
  }

  /**
   * Shows the tooltip overlaying a certain position, with the text provided.
   *
   * @param {TooltipOptions} options configuration of tooltip
   */
  static showTooltip(options: TooltipOptions) {
    if (globalTooltip != null) {
      // Either center horizontally, or set to provided x value
      let x = 0;
      if (options.hAlign === 'center') {
        x = width / 2 - (width * TOOLTIP_WIDTH_PCT) / 2;
      } else {
        x = options.x ? options.x : 0;
      }

      // Either center vertically, or set to provided y value
      let y = 0;
      if (options.vAlign === 'center') {
        y = height / 2;
      } else {
        y = options.y ? options.y : 0;
      }

      LayoutAnimation.easeInEaseOut();
      globalTooltip.setState({
        active: true,
        backgroundColor: options.backgroundColor ? options.backgroundColor : Constants.Colors.charcoalGrey,
        callback: options.callback,
        hAlign: options.hAlign,
        text: options.text,
        textColor: options.textColor ? options.textColor : Constants.Colors.primaryWhiteText,
        vAlign: options.vAlign,
        x: x,
        y: y,
      });
    }
  }

  /** State of the component. */
  state: State;

  /**
   * Declares initial state.
   *
   * @param {{}} props props of the component
   */
  constructor(props: {}) {
    super(props);

    this.state = {
      active: false,
      backgroundColor: Constants.Colors.charcoalGrey,
      callback: null,
      hAlign: 'left',
      text: null,
      textColor: Constants.Colors.primaryWhiteText,
      vAlign: 'top',
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

    LayoutAnimation.easeInEaseOut();
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

    let hAlign: Object = {};
    if (this.state.hAlign === 'right') {
      hAlign = {
        right: this.state.x,
      };
    } else {
      hAlign = {
        left: this.state.x,
      };
    }

    let vAlign: Object = {};
    if (this.state.vAlign === 'bottom') {
      vAlign = {
        bottom: this.state.y,
      };
    } else {
      vAlign = {
        top: this.state.y,
      };
    }

    return (
      <TouchableOpacity
          style={[{position: 'absolute'}, hAlign, vAlign]}
          onPress={this._dismiss.bind(this)}>
        <View style={[_styles.tooltip, {backgroundColor: this.state.backgroundColor}]}>
          <Text style={[_styles.tooltipText, {color: this.state.textColor}]}>{this.state.text}</Text>
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
    width: width * TOOLTIP_WIDTH_PCT,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tooltipText: {
    flex: 1,
    margin: 10,
    fontSize: Constants.Text.Medium,
  },
  tooltipIcon: {
    marginRight: 10,
  },
});

module.exports = Tooltip;
