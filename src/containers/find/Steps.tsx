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
 * @file Steps.tsx
 * @description Displays steps to travel from one destination to another.
 */
'use strict';

// React imports
import React from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// Redux imports
import { connect } from 'react-redux';

// Imports
import ActionButton from 'react-native-action-button';
import AdView from '../../components/AdView';
import Header from '../../components/Header';
import PaddedIcon from '../../components/PaddedIcon';
import * as Constants from '../../constants';
import * as Display from '../../util/Display';
import * as TextUtils from '../../util/TextUtils';
import * as Translations from '../../util/Translations';
import * as Directions from '../../util/graph/Directions';

// Types
import { Language } from '../../util/Translations';
import { Destination } from '../../../typings/university';

interface Props {
  destination: Destination | undefined;   // The user's selected destination
  language: Language;                     // The current language, selected by the user
  startingPoint: Destination | undefined; // The user's selected starting point for navigation
}

interface State {
  steps: Directions.Step[];  // List of steps for the user to follow
}

class Steps extends React.PureComponent<Props, State> {

  /**
   * Constructor.
   *
   * @param {props} props component props
   */
  constructor(props: Props) {
    super(props);

    this.state = {
      steps: [],
    };
  }

  componentDidMount(): void {
    this._loadDirections();
  }

  async _loadDirections(): Promise<void> {
    const { startingPoint, destination, language }: Props = this.props;
    const steps = await Directions.getDirectionsBetween(startingPoint, destination, language);
    this.setState({ steps });
  }

  _toggleActionOptions(): void {
    console.log('Action options');
  }

  /**
   * Renders a title and text for the user's destination.
   *
   * @returns {JSX.Element|undefined} Header for the title and Text for the destination
   */
  _renderDestination(): JSX.Element | undefined {
    const destination = this.props.destination;
    if (destination == undefined) {
      return undefined;
    }

    return (
      <View>
        <Header
            backgroundColor={Constants.Colors.tertiaryBackground}
            icon={{ name: 'directions', class: 'material' }}
            title={Translations.get(this.props.language, 'navigating_to')} />
        <Text style={_styles.navigatingTo}>{TextUtils.destinationToString(destination)}</Text>
      </View>
    );
  }

  /**
   * Renders a separator line between rows.
   *
   * @returns {JSX.Element} a separator for the list of steps
   */
  _renderSeparator(): JSX.Element {
    // TODO: remove 'indentSeparator' for first and last items
    return <View style={[ _styles.separator, _styles.indentSeparator ]} />;
  }

  /**
   * Renders a single navigation step.
   *
   * @param {Directions.Step} item the navigation step
   * @returns {JSX.Element} the text and icon of the navigation step
   */
  _renderStep({ item }: { item: Directions.Step }): JSX.Element {
    const icon = Display.getPlatformIcon(Platform.OS, item);
    let iconView: JSX.Element | undefined;
    if (icon != undefined) {
      iconView = (
        <PaddedIcon
            color={Constants.Colors.primaryWhiteText}
            icon={icon} />
      );
    }

    return (
      <View>
        {iconView}
        <Text style={[ _styles.step, icon == undefined ? _styles.stepPadding : {} ]}>
          {Translations.getDescription(this.props.language, item)}
        </Text>
      </View>
    );
  }

  /**
   * Renders a title and a list of steps for the user to take to reach their destination.
   *
   * @returns {JSX.Element} Header for the title and FlatList for the steps
   */
  _renderSteps(): JSX.Element {
    return (
      <View style={_styles.container}>
        <Header
            backgroundColor={Constants.Colors.tertiaryBackground}
            icon={{ name: 'list', class: 'material' }}
            title={Translations.get(this.props.language, 'steps')} />
        <FlatList
            ItemSeparatorComponent={this._renderSeparator.bind(this)}
            data={this.state.steps}
            renderItem={this._renderStep.bind(this)} />
      </View>
    );
  }

  /**
   * Renders the steps to direct the user to their destination.
   *
   * @returns {JSX.Element} the hierarchy of views to render
   */
  render(): JSX.Element {
    return (
      <View style={_styles.container}>
        <AdView />
        {this._renderDestination()}
        {this._renderSteps()}
        <ActionButton
            buttonColor={Constants.Colors.darkGrey}
            offsetX={Constants.Sizes.Margins.Expanded}
            offsetY={Constants.Sizes.Margins.Regular}
            onPress={this._toggleActionOptions.bind(this)} />
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
  indentSeparator: {
    marginLeft: Constants.Sizes.Margins.Expanded,
  },
  navigatingTo: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Subtitle,
    margin: Constants.Sizes.Margins.Expanded,
  },
  separator: {
    backgroundColor: Constants.Colors.primaryWhiteText,
    height: StyleSheet.hairlineWidth,
  },
  step: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
    marginBottom: Constants.Sizes.Margins.Expanded,
    marginRight: Constants.Sizes.Margins.Expanded,
    marginTop: Constants.Sizes.Margins.Expanded,
  },
  stepPadding: {
    marginLeft: Constants.Sizes.Margins.Expanded,
  },
});

const mapStateToProps = (store: any): any => {
  return {
    destination: store.directions.destination,
    language: store.config.options.language,
    startingPoint: store.directions.startingPoint,
  };
};

export default connect(mapStateToProps)(Steps) as any;
