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
 * @created 2017-06-02
 * @file Steps.tsx
 * @description Displays steps to travel from one destination to another.
 */
'use strict';

// React imports
import React from 'react';
import {
  Alert,
  Clipboard,
  FlatList,
  InteractionManager,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Redux imports
import { connect } from 'react-redux';

// Imports
// import ActionButton from 'react-native-action-button';
import Header from '../../components/Header';
import PaddedIcon from '../../components/PaddedIcon';
import * as Analytics from '../../util/Analytics';
import * as Constants from '../../constants';
import * as Display from '../../util/Display';
import * as External from '../../util/External';
import * as TextUtils from '../../util/TextUtils';
import * as Translations from '../../util/Translations';
import * as Directions from '../../util/graph/Directions';

// Types
import { Store } from '../../store/configureStore';
import { Language } from '../../util/Translations';
import { Destination } from '../../../typings/university';

interface Props {
  accessible: boolean;                    // Indicates if the user wants wheelchair accessible routes only
  destination: Destination | undefined;   // The user's selected destination
  language: Language;                     // The current language, selected by the user
  shortestRoute: boolean;                 // Indicates if the user wants the shortest available route
  startingPoint: Destination | undefined; // The user's selected starting point for navigation
}

interface State {
  showReport: boolean;       // True to show a report button for errors, false to hide
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
      showReport: false,
      steps: [],
    };
  }

  componentDidMount(): void {
    InteractionManager.runAfterInteractions(() => this._loadDirections());
  }

  /**
   * Get directions between the starting point and destination.
   */
  async _loadDirections(): Promise<void> {
    const { accessible, destination, shortestRoute, startingPoint }: Props = this.props;
    const directionResults = await Directions.getDirectionsBetween(
        startingPoint,
        destination,
        accessible,
        shortestRoute);

    if (directionResults.showReport) {
      Analytics.failedNavigation(startingPoint, destination, accessible, shortestRoute);
    }

    this.setState({
      showReport: directionResults.showReport,
      steps: directionResults.steps,
    });
  }

  /**
   * Provides prompt so user can report an error.
   */
  _reportError(): void {
    External.openLink(
      'mailto:contact@josephroque.ca?subject=Nav%20Error:%20Ottawa%20Campus%20Guide',
      Linking,
      Alert,
      Clipboard,
      TextUtils
    );
  }

  // _toggleActionOptions(): void {
  //   console.log('Action options');
  // }

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
            title={Translations.get('navigating_to')} />
        <Text style={_styles.navigatingTo}>{TextUtils.destinationToString(destination)}</Text>
      </View>
    );
  }

  /**
   * Renders a report button.
   *
   * @returns {JSX.Element} a button
   */
  _renderReportButton(): JSX.Element {
    return (
      <TouchableOpacity onPress={(): void => this._reportError()}>
        <View style={_styles.reportButton}>
          <Text style={_styles.reportButtonText}>
            {Translations.get('report_problem')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  /**
   * Renders a separator line between rows.
   *
   * @returns {JSX.Element} a separator for the list of steps
   */
  _renderSeparator(): JSX.Element {
    if (this.state.showReport) {
      return <View />;
    } else {
      return <View style={[ _styles.separator, _styles.indentSeparator ]} />;
    }
  }

  /**
   * Renders a single navigation step.
   *
   * @param {Directions.Step} item the navigation step
   * @returns {JSX.Element} the text and icon of the navigation step
   */
  _renderStep({ item }: { item: Directions.Step }): JSX.Element {
    if (item.key === Directions.REPORT_STEP_KEY) {
      return this._renderReportButton();
    }

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
      <View style={_styles.stepContainer}>
        {iconView}
        <Text style={[ _styles.step, icon == undefined ? _styles.stepPadding : {} ]}>
          {Translations.getDescription(item)}
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
            title={Translations.get('steps')} />
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
        {this._renderDestination()}
        {this._renderSteps()}
        {/* <ActionButton
            buttonColor={Constants.Colors.darkGrey}
            offsetX={Constants.Sizes.Margins.Expanded}
            offsetY={Constants.Sizes.Margins.Expanded}
            onPress={this._toggleActionOptions.bind(this)} /> */}
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
  reportButton: {
    alignSelf: 'center',
    backgroundColor: Constants.Colors.darkTransparentBackground,
    margin: Constants.Sizes.Margins.Regular,
  },
  reportButtonText: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Subtitle,
    margin: Constants.Sizes.Margins.Regular,
    textAlign: 'center',
  },
  separator: {
    backgroundColor: Constants.Colors.primaryWhiteText,
    height: StyleSheet.hairlineWidth,
  },
  step: {
    color: Constants.Colors.primaryWhiteText,
    flex: 1,
    fontSize: Constants.Sizes.Text.Body,
    marginBottom: Constants.Sizes.Margins.Expanded,
    marginRight: Constants.Sizes.Margins.Expanded,
    marginTop: Constants.Sizes.Margins.Expanded,
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    marginBottom: Constants.Sizes.Margins.Regular,
    marginRight: Constants.Sizes.Margins.Regular,
    marginTop: Constants.Sizes.Margins.Regular,
  },
  stepPadding: {
    marginLeft: Constants.Sizes.Margins.Expanded,
  },
});

const mapStateToProps = (store: Store): any => {
  return {
    accessible: store.config.options.prefersWheelchair,
    destination: store.directions.destination,
    language: store.config.options.language,
    shortestRoute: store.config.options.prefersShortestRoute,
    startingPoint: store.directions.startingPoint,
  };
};

export default connect(mapStateToProps)(Steps) as any;
