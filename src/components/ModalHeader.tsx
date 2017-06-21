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
 * @created 2017-01-29
 * @file ModalHeader.tsx
 * @description Header for top level modal actions
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

// Imports
import * as Constants from '../constants';

// Types
interface Props {
  backgroundColor?: string;     // Background color for the view
  title: string;                // Title for the header
  leftActionEnabled?: boolean;  // Indicates if the left action should be clickable
  leftActionText?: string;      // Left action text
  rightActionEnabled?: boolean; // Indicates if the right action should be clickable
  rightActionText?: string;     // Right action text
  onLeftAction?(): void;        // Callback for when the left action is pressed
  onRightAction?(): void;       // Callback for when the right action is pressed
}

interface State {}

// Height of the modal header
const MODAL_HEADER_HEIGHT = 50;
const screenWidth = Dimensions.get('window').width;

// Default opacity when touching a left or right action
const DEFAULT_TOUCH_OPACITY = 0.4;

export default class ModalHeader extends React.PureComponent<Props, State> {

  /**
   * Invokes the right action callback.
   */
  _onRightAction(): void {
    if (this.props.onRightAction) {
      this.props.onRightAction();
    }
  }

  /**
   * Invokes the left action callback.
   */
  _onLeftAction(): void {
    if (this.props.onLeftAction) {
      this.props.onLeftAction();
    }
  }

  /**
   * Renders a header with left and right interactions and a title.
   *
   * @returns {JSX.Element} the hierarchy of views to render
   */
  render(): JSX.Element {
    const headerBackground = this.props.backgroundColor || Constants.Colors.primaryBackground;
    const leftActionStyle = {
      color: this.props.leftActionEnabled ? Constants.Colors.primaryWhiteText : Constants.Colors.secondaryWhiteText,
    };
    const rightActionStyle = {
      color: this.props.rightActionEnabled ? Constants.Colors.primaryWhiteText : Constants.Colors.secondaryWhiteText,
    };

    return (
      <View style={[ _styles.container, { backgroundColor: headerBackground }]}>
        <View style={_styles.separator} />
        <Text style={_styles.title}>{this.props.title}</Text>
        {this.props.leftActionText == undefined
          ? undefined
          : (
            <View style={_styles.leftActionWrapper}>
              <TouchableOpacity
                  activeOpacity={this.props.leftActionEnabled ? DEFAULT_TOUCH_OPACITY : 1}
                  onPress={this._onLeftAction.bind(this)}>
                <Text style={[ _styles.action, leftActionStyle ]}>{this.props.leftActionText}</Text>
              </TouchableOpacity>
            </View>
          )}
        {this.props.rightActionText == undefined
          ? undefined
          : (
            <View style={_styles.rightActionWrapper}>
              <TouchableOpacity
                  activeOpacity={this.props.rightActionEnabled ? DEFAULT_TOUCH_OPACITY : 1}
                  onPress={this._onRightAction.bind(this)}>
                <Text style={[ _styles.action, rightActionStyle ]}>{this.props.rightActionText}</Text>
              </TouchableOpacity>
            </View>
          )}
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  action: {
    fontSize: Constants.Sizes.Text.Body,
  },
  container: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    height: MODAL_HEADER_HEIGHT + Constants.Sizes.HeaderPadding[Platform.OS],
    paddingBottom: Constants.Sizes.Margins.Regular,
    paddingTop: Constants.Sizes.HeaderPadding[Platform.OS],
    width: screenWidth,
  },
  leftActionWrapper: {
    bottom: Constants.Sizes.Margins.Regular,
    left: Constants.Sizes.Margins.Regular,
    position: 'absolute',
  },
  rightActionWrapper: {
    bottom: Constants.Sizes.Margins.Regular,
    position: 'absolute',
    right: Constants.Sizes.Margins.Regular,
  },
  separator: {
    backgroundColor: Constants.Colors.tertiaryBackground,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    position: 'absolute',
    width: screenWidth,
  },
  title: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Title,
    textAlign: 'center',
    width: screenWidth,
  },
});
