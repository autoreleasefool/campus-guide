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
 * @created 2017-03-03
 * @file PaddedIcon.js
 * @providesModule PaddedIcon
 * @description Renders an icon, centered in a view for which the width can be defined, for consistent widths
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

// Types
import type { Icon } from 'types';

// Properties which the parent component should make available to this component.
type Props = {
  color?: ?string,  // Color of the icon, default is white
  icon: Icon,      // Large icon to represent the section
  size?: ?number,    // Size of the icon, or Constants.Sizes.Icons.Medium
  width?: number,    // Width of parent container, or DEFAULT_WIDTH
};

// Imports
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as Constants from 'Constants';

// 16 left padding + 16 right padding + 24 icon size
const DEFAULT_WIDTH = 56;

/**
 * Renders the icon, centered in the parent view
 *
 * @param {Props} props props to render component
 * @returns {ReactElement<any>} hierarchy of views to render
 */
export default function render(props: Props): ReactElement < any > {
  let icon: ?ReactElement < any > = null;
  if (props.icon.class === 'material') {
    icon = (
      <MaterialIcons
          {...props}
          color={props.color || Constants.Colors.primaryWhiteIcon}
          name={props.icon.name}
          size={props.size || Constants.Sizes.Icons.Medium} />
    );
  } else {
    icon = (
      <Ionicons
          {...props}
          color={props.color || Constants.Colors.primaryWhiteIcon}
          name={props.icon.name}
          size={props.size || Constants.Sizes.Icons.Medium} />
    );
  }

  return (
    <View style={[ _styles.iconContainer, { width: props.width || DEFAULT_WIDTH }]}>
      {icon}
    </View>
  );
}

// Private styles for component
const _styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
