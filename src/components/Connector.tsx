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
 * @created 2016-11-24
 * @file Connector.tsx
 * @description Connects rows and headers to one another.
 */
'use strict';

// React imports
import React from 'react';
import { StyleSheet, View } from 'react-native';

// Types
interface ConnectorOptions {
  top?: boolean;        // True to render a connection to the row above
  bottom?: boolean;     // True to render a connection to the row below
  cap?: boolean;        // True to render a cap to the row before. Overrides top/bottom. Uses line color.
  large?: boolean;      // True to render a larger connection for a header
  circleColor?: string; // Default background is white
  lineColor?: string;   // Default background is transparent white
}

// Imports
import * as Constants from '../constants';

/**
 * Renders a view which connects rows and headers to one another.
 *
 * @param {ConnectorOptions} options set of options to determine how to render the connector
 * @returns {JSX.Element} view which visually connects rows and headers
 */
export function renderConnector(options: ConnectorOptions): JSX.Element {
  const connectorColor = {
    backgroundColor: options.lineColor ? options.lineColor : Constants.Colors.secondaryWhiteIcon,
  };

  if (options.cap) {
    return (
      <View style={_styles.container}>
        <View style={[ _styles.connectorContainer ]}>
          <View style={[ _styles.connector, _styles.cap, connectorColor]} />
        </View>
      </View>
    );
  } else {
    const circleSize = options.large ? _styles.largeCircle : _styles.smallCircle;
    const background = {
      backgroundColor: options.circleColor ? options.circleColor : Constants.Colors.primaryWhiteIcon,
    };

    const topConnector = options.top ? {} : _styles.invisible;
    const bottomConnector = options.bottom ? {} : _styles.invisible;

    return (
      <View style={_styles.container}>
        <View style={[ _styles.connectorContainer ]}>
          <View style={[ _styles.connector, _styles.top, connectorColor, topConnector ]} />
          <View style={[ _styles.connector, _styles.bottom, connectorColor, bottomConnector ]} />
        </View>
        <View style={[ circleSize, background ]} />
      </View>
    );
  }
}

/**
 * Calculates the expected width of a small or large connector.
 *
 * @param {boolean} large size of the connector
 * @returns {number} width of the connector
 */
export function getConnectorWidth(): number {
  // Padding * 2 + width
  return Constants.Sizes.Margins.Expanded * 2 + Constants.Sizes.Margins.Expanded;
}

// Private styles for component
const _styles = StyleSheet.create({
  bottom: {
    flex: 1,
  },
  cap: {
    borderRadius: Constants.Sizes.Margins.Condensed / 2,
    height: Constants.Sizes.Margins.Condensed,
    position: 'absolute',
    top: -Constants.Sizes.Margins.Condensed / 2,
    width: Constants.Sizes.Margins.Condensed,
  },
  connector: {
    width: Constants.Sizes.Margins.Condensed / 2,
  },
  connectorContainer: {
    alignItems: 'center',
    bottom: 0,
    flex: 1,
    flexDirection: 'column',
    position: 'absolute',
    top: 0,
    width: getConnectorWidth(),
  },
  container: {
    alignItems: 'center',
    bottom: 0,
    flexDirection: 'column',
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    top: 0,
    width: getConnectorWidth(),
  },
  invisible: {
    backgroundColor: 'rgba(0,0,0,0)',
  },
  largeCircle: {
    borderRadius: Constants.Sizes.Margins.Expanded / 2,
    height: Constants.Sizes.Margins.Expanded,
    width: Constants.Sizes.Margins.Expanded,
  },
  smallCircle: {
    borderRadius: Constants.Sizes.Margins.Regular / 2,
    height: Constants.Sizes.Margins.Regular,
    width: Constants.Sizes.Margins.Regular,
  },
  top: {
    flex: 1,
  },
});
