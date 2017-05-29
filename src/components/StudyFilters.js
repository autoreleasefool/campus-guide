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
 * @created 2017-03-09
 * @file StudyFilters.js
 * @providesModule StudyFilters
 * @description Provides options to filter study spots
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Types
import type { Icon, Language } from 'types';

// Type definition for component props.
type Props = {
  activeFilters?: Set < string >,           // Set of filters actively being used
  filters: Array < string >,                // List of available filter IDs
  filterDescriptions: Object,               // Mapping from filter IDs to their descriptions
  fullSize: boolean,                        // True to make full size, false for shrunken
  language: Language,                       // The current language, selected by the user
  onFilterSelected: (id: ?string) => void,  // Callback for when a filter is selected
}

// Imports
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as Constants from 'Constants';
import * as DisplayUtils from 'DisplayUtils';
import * as Translations from 'Translations';

/** Size of icons in full size filter view. */
const FULL_ICON_SIZE = Constants.Sizes.Icons.Medium * 2;

/** Size of icons in mini filter view. */
const MINI_ICON_SIZE = Constants.Sizes.Icons.Medium;

export default class StudyFilters extends React.Component {

  /**
   * Properties this component expects to be provided by its parent.
   */
  props: Props;

  /**
   * Callback for when a filter is selected
   *
   * @param {?string} id the identifier of the filter selected
   */
  _onSelectFilter(id: ?string): void {
    this.props.onFilterSelected && this.props.onFilterSelected(id);
  }

  /**
   * Renders an icon of a specific size for the small or large filter style.
   *
   * @param {?Icon}    icon     icon name and class
   * @param {number}  size     size of the icon
   * @param {boolean} isActive true to render a full color icon, false for inactive color
   * @returns {?ReactElement<any>} the icon
   */
  _renderIcon(icon: ?Icon, size: number, isActive: boolean): ?ReactElement < any > {
    if (icon == null) {
      return null;
    } else if (icon.class === 'material') {
      return (
        <MaterialIcons
            color={isActive ? Constants.Colors.primaryWhiteIcon : Constants.Colors.tertiaryWhiteIcon}
            name={icon.name}
            size={size} />
      );
    } else {
      return (
        <Ionicons
            color={isActive ? Constants.Colors.primaryWhiteIcon : Constants.Colors.tertiaryWhiteIcon}
            name={icon.name}
            size={size} />
      );
    }
  }

  /**
   * Draws an icon and name for a filter, at full size.
   *
   * @param {string}  filterId       the ID of the filter to draw
   * @param {boolean} withBackground true to include a dark background
   * @returns {ReactElement<any>} a name and an icon
   */
  _renderFullFilter(filterId: string, withBackground: boolean): ReactElement < any > {
    const filter = this.props.filterDescriptions[filterId];
    return (
      <TouchableOpacity
          style={_styles.touchableContainer}
          onPress={() => this._onSelectFilter(filterId)}>
        <View style={[ _styles.filterContainer, withBackground ? _styles.filterBackground : {} ]}>
          {this._renderIcon(DisplayUtils.getPlatformIcon(Platform.OS, filter), FULL_ICON_SIZE, true)}
          <Text style={_styles.fullSizeText}>{Translations.getName(this.props.language, filter)}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  /**
   * Draws an icon and name for a filter, minimized.
   *
   * @param {string}  filterId       the ID of the filter to draw
   * @param {boolean} withBackground true to include a dark background
   * @returns {ReactElement<any>} a name and an icon
   */
  _renderMiniFilter(filterId: string, withBackground: boolean): ReactElement < any > {
    const isActive = this.props.activeFilters != null && this.props.activeFilters.has(filterId);
    const filter = this.props.filterDescriptions[filterId];
    return (
      <TouchableOpacity
          style={_styles.touchableContainer}
          onPress={() => this._onSelectFilter(filterId)}>
        <View style={[ _styles.filterContainer, withBackground ? _styles.filterBackground : {} ]}>
          {this._renderIcon(DisplayUtils.getPlatformIcon(Platform.OS, filter), MINI_ICON_SIZE, isActive)}
        </View>
      </TouchableOpacity>
    );
  }

  /**
   * Renders a large view, with large icons and text for each filter.
   *
   * @returns {ReactElement<any>} large icons and text for each filter
   */
  _renderFullSize(): ReactElement < any > {
    const filters = [];
    const numberOfFilters = this.props.filters.length;
    for (let i = 0; i < numberOfFilters; i += 2) {
      const evenBackground = Math.floor(i / 2) % 2 === 0;
      filters.push(
        <View
            key={`fullPair-${Math.floor(i / 2)}`}
            style={_styles.filterSet}>
          {this._renderFullFilter(this.props.filters[i], evenBackground)}
          {i + 1 < numberOfFilters ? this._renderFullFilter(this.props.filters[i + 1], !evenBackground) : null}
        </View>
      );
    }

    return (
      <View style={_styles.fullContainer}>
        {filters.map((filter) => filter)}
      </View>
    );
  }

  /**
   * Renders a miniature view, with small icons for each filter.
   *
   * @returns {ReactElement<any>} a header and an icon for each filter
   */
  _renderMini(): ReactElement < any > {
    /* eslint-disable no-magic-numbers */
    // Constant row size of 4

    const filters = [];
    const numberOfFilters = this.props.filters.length;
    for (let i = 0; i < numberOfFilters; i += 4) {
      filters.push(
        <View
            key={`miniQuad-${Math.floor(i / 4)}`}
            style={_styles.filterSet}>
          {this._renderMiniFilter(this.props.filters[i], false)}
          {i + 1 < numberOfFilters ? this._renderMiniFilter(this.props.filters[i + 1], false) : null}
          {i + 2 < numberOfFilters ? this._renderMiniFilter(this.props.filters[i + 2], false) : null}
          {i + 3 < numberOfFilters ? this._renderMiniFilter(this.props.filters[i + 3], false) : null}
        </View>
      );
    }

    /* eslint-enable no-magic-numbers */

    return (
      <View style={_styles.miniContainer}>
        {filters.map((filter) => filter)}
      </View>
    );
  }

  /**
   * Renders each of the filters, in a large or small view.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement < any > {
    if (this.props.fullSize) {
      return this._renderFullSize();
    } else {
      return this._renderMini();
    }
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: Constants.Colors.primaryBackground,
  },
  fullSizeText: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Title,
    paddingTop: Constants.Sizes.Margins.Regular,
    textAlign: 'center',
  },
  miniContainer: {
    height: 100,
    backgroundColor: Constants.Colors.secondaryBackground,
  },
  touchableContainer: {
    flex: 1,
  },
  filterContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Constants.Sizes.Margins.Expanded,
  },
  filterSet: {
    flex: 1,
    flexDirection: 'row',
  },
  filterBackground: {
    backgroundColor: Constants.Colors.darkTransparentBackground,
  },
});
