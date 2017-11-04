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
  ScaledSize,
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

interface State {
  screenWidth: number;  // Active width of the screen
}

// Height of the modal header
const MODAL_HEADER_HEIGHT = 50;

// Default opacity when touching a left or right action
const DEFAULT_TOUCH_OPACITY = 0.4;

export default class ModalHeader extends React.PureComponent<Props, State> {

  /**
   * Update the screen width, and rerender component.
   *
   * @param {ScaledSize} dims the new dimensions
   */
  _dimensionsHandler = (dims: { window: ScaledSize }): void =>
      this.setState({ screenWidth: dims.window.width })

  /**
   * Constructor.
   *
   * @param {props} props component props
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      screenWidth: Dimensions.get('window').width,
    };
  }

  /**
   * Add listener to screen dimensions.
   */
  componentDidMount(): void {
    Dimensions.addEventListener('change', this._dimensionsHandler as any);
  }

  /**
   * Removes screen dimension listener.
   */
  componentWillUnmount(): void {
    Dimensions.removeEventListener('change', this._dimensionsHandler as any);
  }

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
      <View style={[ _styles.container, { backgroundColor: headerBackground, width: this.state.screenWidth }]}>
        <Text style={[ _styles.title, { width: this.state.screenWidth }]}>{this.props.title}</Text>
        {this.props.leftActionText == undefined
          ? undefined
          : (
            <View style={_styles.leftActionWrapper}>
              <TouchableOpacity
                  activeOpacity={this.props.leftActionEnabled ? DEFAULT_TOUCH_OPACITY : 1}
                  onPress={this._onLeftAction.bind(this)}>
                <Text style={[ _styles.action, _styles.actionLeft, leftActionStyle ]}>
                  {this.props.leftActionText}
                </Text>
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
                <Text style={[ _styles.action, _styles.actionRight, rightActionStyle ]}>
                  {this.props.rightActionText}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        <View style={[ _styles.separator, { width: this.state.screenWidth }]} />
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  action: {
    fontSize: Constants.Sizes.Text.Body,
    padding: Constants.Sizes.Margins.Regular + Constants.Sizes.Margins.Condensed,
    paddingBottom: Constants.Sizes.Margins.Regular,
  },
  actionLeft: {
    paddingLeft: Constants.Sizes.Margins.Regular,
  },
  actionRight: {
    paddingRight: Constants.Sizes.Margins.Regular,
  },
  container: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    height: MODAL_HEADER_HEIGHT + Constants.Sizes.HeaderPadding[Platform.OS],
    paddingBottom: Constants.Sizes.Margins.Regular,
    paddingTop: Constants.Sizes.HeaderPadding[Platform.OS],
  },
  leftActionWrapper: {
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  rightActionWrapper: {
    bottom: 0,
    position: 'absolute',
    right: 0,
  },
  separator: {
    backgroundColor: Constants.Colors.tertiaryBackground,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  title: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Title,
    textAlign: 'center',
  },
});
