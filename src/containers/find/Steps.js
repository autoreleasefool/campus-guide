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
 * @file Steps.js
 * @description Displays steps to travel from one destination to another.
 *
 * @flow
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
// import * as actions from 'actions';

// Types
import type { Destination, Language, Step } from 'types';

// Type definition for component props.
type Props = {
  destination: ?Destination,  // The user's selected destination
  language: Language,         // The current language, selected by the user
}

// Type definition for component state.
type State = {
  steps: Array < Step >,  // List of steps for the user to follow
}

// Imports
import ActionButton from 'react-native-action-button';
import AdView from 'AdView';
import Header from 'Header';
import PaddedIcon from 'PaddedIcon';
import * as Constants from 'Constants';
import * as DisplayUtils from 'DisplayUtils';
import * as TextUtils from 'TextUtils';
import * as Translations from 'Translations';

class Steps extends React.PureComponent {

  /**
   * Properties this component expects to be provided by its parent.
   */
  props: Props;

  /**
   * Current state of the component.
   */
  state: State;

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

  _toggleActionOptions() {
    console.log('Action options');
  }

  /**
   * Renders a title and text for the user's destination.
   *
   * @returns {?ReactElement<any>} Header for the title and Text for the destination
   */
  _renderDestination(): ?ReactElement < any > {
    const destination = this.props.destination;
    if (destination == null) {
      return null;
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
   * @returns {ReactElement<any>} a separator for the list of steps
   */
  _renderSeparator(): ReactElement < any > {
    // TODO: remove 'indentSeparator' for first and last items
    return <View style={[ _styles.separator, _styles.indentSeparator ]} />;
  }

  /**
   * Renders a single navigation step.
   *
   * @param {Step} item the navigation step
   * @returns {ReactElement<any>} the text and icon of the navigation step
   */
  _renderStep({ item }: { item: Step }): ReactElement < any > {
    const icon = DisplayUtils.getPlatformIcon(Platform.OS, item);
    let iconView = null;
    if (icon != null) {
      iconView = (
        <PaddedIcon
            color={Constants.Colors.primaryWhiteText}
            icon={icon} />
      );
    }

    return (
      <View>
        {iconView}
        <Text style={[ _styles.step, icon == null ? _styles.stepPadding : {} ]}>
          {Translations.getDescription(this.props.language, item)}
        </Text>
      </View>
    );
  }

  /**
   * Renders a title and a list of steps for the user to take to reach their destination.
   *
   * @returns {ReactElement<any>} Header for the title and FlatList for the steps
   */
  _renderSteps(): ReactElement < any > {
    return (
      <View style={_styles.container}>
        <Header
            backgroundColor={Constants.Colors.tertiaryBackground}
            icon={{ name: 'list', class: 'material' }}
            title={Translations.get(this.props.language, 'steps')} />
        <FlatList
            ItemSeparatorComponent={this._renderSeparator}
            data={this.state.steps}
            renderItem={this._renderStep.bind(this)} />
      </View>
    );
  }

  /**
   * Renders the steps to direct the user to their destination.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render
   */
  render(): ReactElement < any > {
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
    flex: 1,
    backgroundColor: Constants.Colors.primaryBackground,
  },
  navigatingTo: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Subtitle,
    margin: Constants.Sizes.Margins.Expanded,
  },
  step: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
    marginTop: Constants.Sizes.Margins.Expanded,
    marginRight: Constants.Sizes.Margins.Expanded,
    marginBottom: Constants.Sizes.Margins.Expanded,
  },
  stepPadding: {
    marginLeft: Constants.Sizes.Margins.Expanded,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Constants.Colors.primaryWhiteText,
  },
  indentSeparator: {
    marginLeft: Constants.Sizes.Margins.Expanded,
  },
});

const mapStateToProps = (store) => {
  return {
    destination: store.directions.destination,
    language: store.config.options.language,
  };
};

// const mapDispatchToProps = (dispatch) => {
//   return {};
// };

// export default connect(mapStateToProps, mapDispatchToProps)(Steps);
export default connect(mapStateToProps)(Steps);
