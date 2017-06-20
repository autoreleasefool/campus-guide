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
 * @created 2017-03-13
 * @file FilterDescriptions.tsx
 * @description List of places to study on campus, along with directions and filtering
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

// Imports
import PaddedIcon from '../../../components/PaddedIcon';
import * as Constants from '../../../constants';
import * as Display from '../../../util/Display';
import * as Translations from '../../../util/Translations';

// Types
import { Language } from '../../../util/Translations';

interface Props {
  filters: string[];  // List of filter IDs
  descriptions: any;  // Mapping of filter IDs to their descriptions
  language: Language; // The current language, selected by the user
}

interface State {}

export default class StudySpots extends React.PureComponent<Props, State> {

  /**
   * Renders a description of a filter.
   *
   * @param {string} filter the filter to render
   * @returns {JSX.Element} the filter icon, name and description
   */
  _renderItem({ item }: { item: string }): JSX.Element {
    const filter = this.props.descriptions[item];
    const name = Translations.getName(this.props.language, filter) || '';
    const description = Translations.getDescription(this.props.language, filter) || '';
    const icon = Display.getPlatformIcon(Platform.OS, filter);

    return (
      <View style={_styles.filter}>
        {icon == undefined
          ? undefined
          : <PaddedIcon
              color={Constants.Colors.primaryWhiteText}
              icon={icon} /> }
        <View style={_styles.filterDescription}>
          <Text style={_styles.filterName}>{name}</Text>
          <Text style={_styles.filterType}>{description}</Text>
        </View>
      </View>
    );
  }

  /**
   * Renders a separator line between rows.
   *
   * @returns {JSX.Element} a separator for the list of filters
   */
  _renderSeparator(): JSX.Element {
    return <View style={_styles.separator} />;
  }

  /**
   * Renders a list of descriptions for the filters.
   *
   * @returns {JSX.Element} the hierarchy of views to render
   */
  render(): JSX.Element {
    return (
      <View style={_styles.container}>
        <FlatList
            ItemSeparatorComponent={this._renderSeparator}
            data={this.props.filters}
            keyExtractor={(filterId) => filterId}
            renderItem={this._renderItem.bind(this)} />
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    backgroundColor: Constants.Colors.secondaryBackground,
    flex: 1,
  },
  filter: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: Constants.Sizes.Margins.Expanded,
    marginRight: Constants.Sizes.Margins.Expanded,
    marginTop: Constants.Sizes.Margins.Expanded,
  },
  filterDescription: {
    flex: 1,
  },
  filterName: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Title,
  },
  filterType: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
    marginTop: Constants.Sizes.Margins.Regular,
  },
  separator: {
    backgroundColor: Constants.Colors.tertiaryBackground,
    height: StyleSheet.hairlineWidth,
    marginLeft: Constants.Sizes.Margins.Expanded,
  },
});
