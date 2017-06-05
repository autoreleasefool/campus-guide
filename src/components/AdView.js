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
 * @created 2017-06-02
 * @file AdView.js
 * @providesModule AdView
 * @description Wrapper for ad network views to display ads in the application
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import { Image, StyleSheet } from 'react-native';

export default class AdView extends React.PureComponent {

  render() {
    return (
      <Image
          resizeMode={'cover'}
          source={require('../../assets/images/university/tbt.jpg')}
          style={[ _styles.image ]} />
    );
  }

}

// Private styles for component
const _styles = StyleSheet.create({
  image: {
    height: 50,
  },
});
