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
 * @created 2016-10-29
 * @file Menu.js
 * @providesModule Menu
 * @description Provides a set of categories for a user to select between
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  Image,
  LayoutAnimation,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

// Types
import type { Icon, Language, VoidFunction } from 'types';

// Type definition for component props.
type Props = {
  language: Language,                           // The user's currently selected language
  onSectionSelected: (section: string) => void, // Displays contents of the section in a new view
  sections: Array < Object >,                   // List of sections to display
};

// Type definition for component state.
type State = {
  expandedSection: number,
};

// Imports
import Header from 'Header';
import * as Configuration from 'Configuration';
import * as DisplayUtils from 'DisplayUtils';
import * as TranslationUtils from 'TranslationUtils';

export default class Menu extends React.Component {

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
      expandedSection: 0,
    };
  }

  /**
   * Focuses a new section for the user, hides the old section's image and shows the new section's image.
   *
   * @param {number} section new section to focus.
   */
  _focusSection(section: number): void {
    if (this.state.expandedSection === section || section < 0 || section >= this.props.sections.length) {
      return;
    }

    LayoutAnimation.easeInEaseOut();
    this.setState({
      expandedSection: section,
    });
  }

  /**
   * Returns a view for a section which displays the section name and icon, as well as an image if the section is
   * currently selected.
   *
   * @param {number} index   index of section to render
   * @param {Object} section section to render
   * @returns {ReactElement<any>} a view with an image and title which can be clicked by the user
   */
  _getSectionView(index: number, section: Object): ReactElement < any > {
    let onPress: VoidFunction;
    if (index === this.state.expandedSection) {
      onPress = () => this.props.onSectionSelected(section.id);
    } else {
      onPress = () => this._focusSection(index);
    }

    const icon: ?Icon = DisplayUtils.getPlatformIcon(Platform.OS, section);
    let sectionImage: ?ReactElement < any > = null;
    let touchableStyle: Object = { flexShrink: 1 };
    let subtitleIconName: string = 'expand-more';

    if (index === this.state.expandedSection && section.image != null) {
      sectionImage = (
        <Image
            resizeMode={'cover'}
            source={{ uri: Configuration.getImagePath(section.image) }}
            style={_styles.sectionImage} />
      );
      touchableStyle = { flexGrow: 1 };
      subtitleIconName = 'chevron-right';
    }

    return (
      <TouchableOpacity
          key={section.id}
          style={touchableStyle}
          onPress={onPress}>
        {sectionImage}
        <Header
            icon={icon}
            subtitleIcon={{ name: subtitleIconName, class: 'material' }}
            title={TranslationUtils.getTranslatedName(this.props.language, section) || ''} />
      </TouchableOpacity>
    );
  }

  /**
   * Renders each of the sections, with one of them focused and showing an image.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement < any > {
    if (this.props.sections == null) {
      return (
        <View style={_styles.container} />
      );
    } else {
      return (
        <View style={_styles.container}>
          {this.props.sections.map((section: Object, index: number) => (
            this._getSectionView(index, section)
          ))}
        </View>
      );
    }
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionImage: {
    flex: 1,
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: null,
    height: null,
  },
});
