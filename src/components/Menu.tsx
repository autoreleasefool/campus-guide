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
 * @file Menu.tsx
 * @description Provides a set of categories for a user to select between
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
import { Language } from '../util/Translations';
import { MenuSection } from '../../typings/global';

interface Props {
  language: Language;                       // The user's currently selected language
  sections: MenuSection[];                 // List of sections to display
  onSectionSelected(section: string): void; // Displays contents of the section in a new view
}

interface State {
  expandedSection: number;  // Currently expanded section
}

// Imports
import Header from './Header';
import * as Configuration from '../util/Configuration';
import * as Constants from '../constants';
import * as Display from '../util/Display';
import * as Translations from '../util/Translations';

export default class Menu extends React.PureComponent<Props, State> {

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
   * @param {number} sectionIdx index of new section to focus
   */
  _focusSection(sectionIdx: number): void {
    if (this.state.expandedSection === sectionIdx || sectionIdx < 0 || sectionIdx >= this.props.sections.length) {
      return;
    }

    LayoutAnimation.easeInEaseOut(undefined, undefined);
    this.setState({ expandedSection: sectionIdx });
  }

  /**
   * Returns a view for a section which displays the section name and icon, as well as an image if the section is
   * currently selected.
   *
   * @param {number} index   index of section to render
   * @param {MenuSection} section section to render
   * @returns {JSX.Element} a view with an image and title which can be clicked by the user
   */
  _getSectionView(index: number, section: MenuSection): JSX.Element {
    const onPress = index === this.state.expandedSection
        ? (): void => this.props.onSectionSelected(section.id)
        : (): void => this._focusSection(index);

    const icon = Display.getPlatformIcon(Platform.OS, section);
    let touchableStyle: any = { flexShrink: 1 };
    let subtitleIconName = 'expand-more';
    let sectionImage: JSX.Element | undefined;

    if (index === this.state.expandedSection && section.image) {
      if (typeof (section.image) === 'string') {
        sectionImage = (
          <Image
              resizeMode={'cover'}
              source={{ uri: Configuration.getImagePath(section.image) }}
              style={_styles.sectionImage} />
        );
      } else {
        sectionImage = (
          <Image
              resizeMode={'cover'}
              source={section.image}
              style={_styles.sectionImage} />
        );
      }
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
            title={Translations.getName(this.props.language, section) || ''} />
        {index < this.props.sections.length - 1 ? <View style={_styles.separator} /> : undefined}
      </TouchableOpacity>
    );
  }

  /**
   * Renders each of the sections, with one of them focused and showing an image.
   *
   * @returns {JSX.Element} the hierarchy of views to render
   */
  render(): JSX.Element {
    return (
      <View style={_styles.container}>
        {this.props.sections.map((section: MenuSection, index: number) => (
          this._getSectionView(index, section)
        ))}
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionImage: {
    bottom: 0,
    flex: 1,
    height: undefined,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    width: undefined,
  },
  separator: {
    backgroundColor: Constants.Colors.primaryWhiteText,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    left: 0,
    position: 'absolute',
    right: 0,
  },
});
