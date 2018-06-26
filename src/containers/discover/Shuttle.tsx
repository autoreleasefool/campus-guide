/**
 *
 * @license
 * Copyright (C) 2017 Joseph Roque
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
 * @file Shuttle.tsx
 * @description Displays shuttle bus information for the university.
 */
'use strict';

// React imports
import React from 'react';
import {
  InteractionManager,
  Platform,
  StyleSheet,
  View,
} from 'react-native';

// Redux imports
import { connect } from 'react-redux';

// Imports
import Header from '../../components/Header';
import moment from 'moment';
import ShuttleTable from '../../components/ShuttleTable';
import * as Configuration from '../../util/Configuration';
import * as Constants from '../../constants';
import * as Display from '../../util/Display';
import * as Translations from '../../util/Translations';

// Types
import { Store } from '../../store/configureStore';
import { Language } from '../../util/Translations';
import { TimeFormat } from '../../../typings/global';
import { ShuttleInfo } from '../../../typings/transit';

interface Props {
  language: Language;               // The current language, selected by the user
  timeFormat: TimeFormat;           // Format to display times in
  showSearch(show: boolean): void;  // Shows or hides the search button
}

interface State {
  direction: number;                // Current direction for the schedule being viewed
  initialPage: number;              // Initial schedule to display
  schedule: number;                 // Current schedule being viewed
  shuttle: ShuttleInfo | undefined; // Information about the university shuttle
}

class Shuttle extends React.PureComponent<Props, State> {

  /**
   * Switches direction being rendered.
   */
  _toggleDirection = (): void => {
    const nextDirection = (this.state.direction + 1) % 2;
    this.setState({ direction: nextDirection });
  }

  /**
   * Switches schedule being rendered.
   */
  _toggleSchedule = (): void => {
    const nextSchedule = (this.state.schedule + 1) % this.state.shuttle.schedules.length;
    this.setState({ schedule: nextSchedule });
  }

  /**
   * Constructor.
   *
   * @param {props} props component props
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      direction: 0,
      initialPage: 0,
      schedule: 0,
      shuttle: undefined,
    };
  }

  /**
   * If the shuttle info has not been loaded, then load it.
   */
  componentDidMount(): void {
    if (this.state.shuttle == undefined) {
      InteractionManager.runAfterInteractions(() => this.loadConfiguration());
    }
  }

  /**
   * Asynchronously load relevant configuration files and cache the results.
   */
  async loadConfiguration(): Promise<void> {
    try {
      const shuttle = await Configuration.getConfig('/shuttle.json');
      let schedule = 0;
      for (let i = 0; i < shuttle.schedules.length; i++) {
        const startDate = moment(shuttle.schedules[i].start_date, 'YYYY-MM-DD');
        const endDate = moment(shuttle.schedules[i].end_date, 'YYYY-MM-DD');
        const currentDate = moment();
        if (currentDate.isBetween(startDate, endDate, 'days', '[]')) {
          schedule = i;
          break;
        }
      }

      this.setState({ shuttle, schedule });
    } catch (err) {
      console.error('Configuration could not be initialized for shuttle.', err);
    }
  }

  /**
   * Renders the shuttle info.
   *
   * @returns {JSX.Element} the hierarchy of views to render
   */
  render(): JSX.Element {
    const shuttle = this.state.shuttle;
    if (shuttle == undefined) {
      return (
        <View style={_styles.container} />
      );
    }

    const currentSchedule = shuttle.schedules[this.state.schedule];
    const currentScheduleName = Translations.getName(currentSchedule);
    const direction = currentSchedule.directions[this.state.direction % currentSchedule.directions.length];
    const directionName = Translations.getName(direction) || '';
    const arrow = this.state.direction === 0 ? 'md-arrow-forward' : 'md-arrow-back';

    return (
      <View style={_styles.container}>
        <Header
            icon={{ name: arrow, class: 'ionicon' }}
            subtitleCallback={this._toggleDirection}
            subtitleIcon={{ name: 'compare-arrows', class: 'material' }}
            title={directionName} />
        <View style={_styles.separator} />
        <Header
            icon={Display.getPlatformIcon(Platform.OS, currentSchedule)}
            subtitleCallback={this._toggleSchedule}
            subtitleIcon={{ name: 'compare-arrows', class: 'material' }}
            title={currentScheduleName} />
        <View style={_styles.separator} />
        <ShuttleTable
            direction={this.state.direction}
            language={this.props.language}
            schedule={currentSchedule}
            stops={shuttle.stops}
            timeFormat={this.props.timeFormat} />
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    backgroundColor: Constants.Colors.primaryBackground,
    flex: 1,
  },
  separator: {
    backgroundColor: Constants.Colors.tertiaryBackground,
    height: StyleSheet.hairlineWidth,
  },
});

const mapStateToProps = (store: Store): any => {
  return {
    language: store.config.options.language,
    timeFormat: store.config.options.preferredTimeFormat,
  };
};

export default connect(mapStateToProps)(Shuttle) as any;
