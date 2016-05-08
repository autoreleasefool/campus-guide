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
 * @file ScheduleEditor.js
 * @module ScheduleEditor
 * @description Views and controls for the user to add or remove classes from their schedule.
 * @flow
 *
 */
'use strict';

// React Native imports
import React from 'react';
import {
  View,
} from 'react-native';

class ScheduleEditor extends React.Component {

  /**
   * Pass props and declares initial state.
   *
   * @param {{}} props properties passed from container to this component.
   */
  constructor(props: {}) {
    super(props);
  };

  /**
   * Renders components for the user to interact with to define their courses
   * for the semester.
   *
   * @return {ReactElement} the hierarchy of views to render.
   */
  render(): ReactElement {
    return (
      <View style={{flex: 1, backgroundColor: 'black'}} />
    );
  };
};

// Expose component to app
module.exports = ScheduleEditor;
