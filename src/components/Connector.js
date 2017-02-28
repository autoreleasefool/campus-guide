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
 * @file Connector.js
 * @providesModule Connector
 * @description Connects rows and headers to one another.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import { StyleSheet, View } from 'react-native';

// Types
type ConnectorOptions = {
  top?: boolean,        // True to render a connection to the row above
  bottom?: boolean,     // True to render a connection to the row below
  large?: boolean,      // True to render a larger connection for a header
  circleColor?: string, // Default background is white
  lineColor?: string,   // Default background is transparent white
}

// Imports
import * as Constants from 'Constants';

/**
 * Renders a view which connects rows and headers to one another.
 *
 * @param {ConnectorOptions} options set of options to determine how to render the connector
 * @returns {ReactElement<any>} view which visually connects rows and headers
 */
export function renderConnector(options: ConnectorOptions): ReactElement < any > {
  const circleSize = options.large ? _styles.largeCircle : _styles.smallCircle;
  const background = {
    backgroundColor: options.circleColor ? options.circleColor : Constants.Colors.primaryWhiteIcon,
  };

  const connectorSize = options.large ? _styles.largeConnector : _styles.smallConnector;
  const connectorColor = {
    backgroundColor: options.lineColor ? options.lineColor : Constants.Colors.secondaryWhiteIcon,
  };

  const topConnector = options.top ? {} : _styles.invisible;
  const bottomConnector = options.bottom ? {} : _styles.invisible;

  return (
    <View style={_styles.container}>
      <View style={[ _styles.connectorContainer, connectorSize ]}>
        <View style={[ _styles.connector, _styles.top, connectorColor, topConnector ]} />
        <View style={[ _styles.connector, _styles.bottom, connectorColor, bottomConnector ]} />
      </View>
      <View style={[ circleSize, background ]} />
    </View>
  );
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

/* eslint-disable react-native/no-unused-styles */
// Styles are used conditionally above so they appear unused

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: getConnectorWidth(),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  largeCircle: {
    width: Constants.Sizes.Margins.Expanded,
    height: Constants.Sizes.Margins.Expanded,
    borderRadius: Constants.Sizes.Margins.Expanded / 2,
  },
  smallCircle: {
    width: Constants.Sizes.Margins.Regular,
    height: Constants.Sizes.Margins.Regular,
    borderRadius: Constants.Sizes.Margins.Regular / 2,
  },
  connector: {
    width: Constants.Sizes.Margins.Condensed / 2,
  },
  invisible: {
    backgroundColor: 'rgba(0,0,0,0)',
  },
  connectorContainer: {
    width: getConnectorWidth(),
    alignItems: 'center',
    flexDirection: 'column',
    flex: 1,
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  top: {
    flex: 1,
  },
  bottom: {
    flex: 1,
  },
});
