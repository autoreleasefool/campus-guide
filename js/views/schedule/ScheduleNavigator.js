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
 * @file ScheduleNavigator.js
 * @providesModule Schedule
 * @description Navigator for managing views for viewing and updating a schedule
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

// Type imports
import type {
  Route,
} from 'types';

// Type definition for component props.
type Props = {
  onChangeScene: (showBackButton: boolean) => void,
};

// Imports
const BaseNavigator = require('BaseNavigator');
const Constants = require('Constants');

// Screen imports
const ScheduleHome = require('ScheduleHome');

class ScheduleNavigator extends BaseNavigator {

  /**
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    onChangeScene: React.PropTypes.func.isRequired,
  };

  /**
   * Pass props and declares initial state.
   *
   * @param {Props} props properties passed from container to this component.
   */
  constructor(props: Props) {
    super(props, Constants.Views.Schedule.Home);

    (this:any).getSearchPlaceholder = this.getSearchPlaceholder.bind(this);
    (this:any)._handleNavigationEvent = this._handleNavigationEvent.bind(this);
  }

  /**
   * Returns placeholder text that should be used for the search bar.
   *
   * @returns {?string} the text to use as a placeholder, or null to use the default
   */
  getSearchPlaceholder(): ?string {
    return null;
  }

  /**
   * Handles navigation events.
   *
   * @param {any} event the event taking place
   */
  _handleNavigationEvent(event: any): void {
    this.props.onChangeScene(event.data.route.id !== Constants.Views.Schedule.Home, this.getSearchPlaceholder());
  }

  /**
   * Renders a view according to the current route of the navigator.
   *
   * @param {Route} route object with properties to identify the route to display.
   * @returns {ReactElement<any>} the view to render, based on {route}.
   */
  _renderScene(route: Route): ReactElement < any > {
    switch (route.id) {
      case Constants.Views.Schedule.Home:
        return (
          <ScheduleHome />
        );
      default:
        return (<View style={_styles.container} />);
    }
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

module.exports = ScheduleNavigator;
