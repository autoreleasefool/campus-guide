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
 * @file BuildingPage.js
 * @module BuildingPage
 * @description View for the root navigation for finding a room on campus.
 * @flow
 *
 */
'use strict';

// React Native imports
import React from 'react';
import {
  View,
} from 'react-native';

// Type definition for component props.
type Props = {
  buildingCode: string,
};

class BuildingPage extends React.Component {

  /**
   * Properties which the parent component should make available to this
   * component.
   */
  static propTypes = {
    buildingCode: React.PropTypes.string.isRequired,
  };

  /**
   * Pass props and declares initial state.
   *
   * @param {Props} props properties passed from container to this component.
   */
  constructor(props: Props) {
    super(props);
  }

  /**
   * TODO: Add description of method
   *
   * @returns {ReactElement} an empty view.
   */
  render(): ReactElement {
    return (
      <View />
    );
  }
}

// Expose component to app
module.exports = BuildingPage;
