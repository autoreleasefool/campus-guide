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
  Dimensions,
  FlatList,
  Image,
  Platform,
  ScaledSize,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

// Types
import { Language } from '../util/Translations';
import { DoubleMenuSection, MenuSection, SingleMenuSection } from '../../typings/global';

interface Props {
  language: Language;                       // The user's currently selected language
  sections: MenuSection[];                  // List of sections to display
  sectionsOnScreen?: number;                // Max number of sections to display at a time. Default is 4.
  onSectionSelected(section: string): void; // Displays contents of the section in a new view
}

interface State {
  screenHeight: number; // Active height of the screen
  screenWidth: number;  // Active width of the screen
}

// Imports
import Header from './Header';
import * as Configuration from '../util/Configuration';
import * as Constants from '../constants';
import * as Display from '../util/Display';
import * as Translations from '../util/Translations';

/** Aspect ratio of cards. */
const CARD_ASPECT_RATIO = 0.75;

/** Default maximum number of cards on screen at a time. */
const DEFAULT_MAX_CARDS = 4;

/** Minimum card height so they do not appear too squished. */
const MIN_CARD_HEIGHT = 200;

/** Magnitude of margins on mini cards. */
const MINI_CARD_MARGINS = 3;

export default class Menu extends React.PureComponent<Props, State> {

  /**
   * Update the screen height, and rerender component.
   *
   * @param {ScaledSize} dims the new dimensions
   */
  _dimensionsHandler = (dims: { window: ScaledSize }): void =>
      this.setState({ screenHeight: dims.window.height })

  /**
   * Constructor.
   *
   * @param {props} props component props
   */
  constructor(props: Props) {
    super(props);
    const screenDimensions = Dimensions.get('window');
    this.state = {
      screenHeight: screenDimensions.height,
      screenWidth: screenDimensions.width,
    };
  }

  /**
   * Add listener to screen dimensions.
   */
  componentDidMount(): void {
    Dimensions.addEventListener('change', this._dimensionsHandler as any);
  }

  /**
   * Removes screen dimension listener.
   */
  componentWillUnmount(): void {
    Dimensions.removeEventListener('change', this._dimensionsHandler as any);
  }

  /**
   * Returns the height of a card, depending on the max number of cards on the screen
   * at a time.
   *
   * @returns {number} calculated height of a card
   */
  _getCardHeight(): number {
    const maxCardHeightRatio = this.props.sectionsOnScreen || DEFAULT_MAX_CARDS;
    const height = Math.min(
      this._getCardWidth() * CARD_ASPECT_RATIO,
      Math.max(MIN_CARD_HEIGHT, this.state.screenHeight / maxCardHeightRatio)
    );

    return height;
  }

  /**
   * Returns the width of a card, depending on the max number of cards on the screen
   * at a time.
   *
   * @returns {number} calculated width of a card
   */
  _getCardWidth(): number {
    return this.state.screenWidth - (Constants.Sizes.Margins.Expanded * 2);
  }

  /**
   * Returns the image to render for the section, if one exists.
   *
   * @param {SingleMenuSection} section the section to render image for
   * @returns {JSX.Element|undefined} the image for the section
   */
  _getSectionImage(section: SingleMenuSection): JSX.Element | undefined {
    let image: JSX.Element;
    const borderRadius = Platform.OS === 'android' ? { borderRadius: Constants.Sizes.Margins.Regular } : {};

    if (section.image) {
      if (typeof (section.image) === 'string') {
        image = (
          <Image
              resizeMode={'cover'}
              source={{ uri: Configuration.getImagePath(section.image) }}
              style={[ _styles.sectionImage, borderRadius ]} />
        );
      } else {
        image = (
          <Image
              resizeMode={'cover'}
              source={section.image}
              style={[ _styles.sectionImage, borderRadius ]} />
        );
      }
    }

    return image;
  }

  /**
   * Renders a view for a section.
   *
   * @param {MenuSection} item the section to render
   * @param {boolean}     mini true to render a card at half size
   * @returns {JSX.Element} a view with the section image and title
   */
  _renderSection({ item, mini }: { item: MenuSection; mini?: boolean }): JSX.Element {
    if ('left' in item) {
      return (
        <View style={_styles.doubleCard}>
          {this._renderSection({ item: (item as DoubleMenuSection).left, mini: true })}
          <View style={[ _styles.splitSeparator, { height: this._getCardHeight() }]} />
          {this._renderSection({ item: (item as DoubleMenuSection).right, mini: true })}
        </View>
      );
    }

    const section = (item as SingleMenuSection);

    const icon = Display.getPlatformIcon(Platform.OS, section);
    const width = mini ? this.state.screenWidth / 2 : this.state.screenWidth;
    const cardDimensions = { height: this._getCardHeight(), width };
    const sectionImage = this._getSectionImage(section);

    return (
      <TouchableOpacity
          style={[ _styles.cardIOS, cardDimensions ]}
          onPress={(): void => this.props.onSectionSelected(section.id)}>
        {sectionImage}
        <Header
            icon={icon}
            title={Translations.getName(section) || ''} />
        <View style={_styles.separator} />
      </TouchableOpacity>
    );
  }

  /**
   * Renders a card for a section.
   *
   * @param {MenuSection} item  the section to render
   * @param {number}      index index of the section
   * @param {boolean}
   * @param {boolean}     mini  true to render a c ard at half size
   * @returns {JSX.Element} a card with the section image and title
   */
  _renderSectionCard(
      { item, index, left, mini }: { item: MenuSection; index: number; left?: boolean; mini?: boolean }): JSX.Element {
    if ('left' in item) {
      return (
        <View style={_styles.doubleCard}>
          {this._renderSectionCard({ item: (item as DoubleMenuSection).left, index, mini: true, left: true })}
          {this._renderSectionCard({ item: (item as DoubleMenuSection).right, index, mini: true, left: false })}
        </View>
      );
    }

    const section = (item as SingleMenuSection);

    const icon = Display.getPlatformIcon(Platform.OS, section);
    const viewMargins: object = index === 0 ? {} : { marginTop: 0 };
    const width = mini
        ? (this.state.screenWidth - Constants.Sizes.Margins.Expanded * MINI_CARD_MARGINS) / 2
        : this.state.screenWidth - (Constants.Sizes.Margins.Expanded * 2);
    const cardMargins = mini
        ? left
            ? { marginLeft: Constants.Sizes.Margins.Expanded, marginRight: Constants.Sizes.Margins.Regular }
            : { marginLeft: Constants.Sizes.Margins.Regular, marginRight: Constants.Sizes.Margins.Expanded }
        : {};
    const cardDimensions = { height: this._getCardHeight(), width };
    const sectionImage = this._getSectionImage(section);

    return (
      <TouchableOpacity
          style={[ _styles.cardShadow, _styles.rounded, cardMargins, viewMargins ]}
          onPress={(): void => this.props.onSectionSelected(section.id)}>
        <View style={[ _styles.cardAndroid, _styles.rounded, cardDimensions ]}>
          {sectionImage}
          <Header
              icon={icon}
              style={[ _styles.rounded, { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 } ]}
              title={Translations.getName(section) || ''} />
        </View>
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
      <FlatList
          data={this.props.sections}
          keyExtractor={(section: MenuSection): string =>
              ('id' in section) ? (section as SingleMenuSection).id : (section as DoubleMenuSection).left.id}
          renderItem={Platform.OS === 'android' ? this._renderSectionCard.bind(this) : this._renderSection.bind(this)}
          style={_styles.container} />
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  cardAndroid: {
    flex: 1,
    overflow: 'hidden',
  },
  cardIOS: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardShadow: {
    elevation: Constants.Sizes.Margins.Regular,
    margin: Constants.Sizes.Margins.Expanded,
    shadowOffset: {
      height: Constants.Sizes.Margins.Condensed,
      width: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: Constants.Sizes.Margins.Regular,
  },
  container: {
    flex: 1,
  },
  doubleCard: {
    flexDirection: 'row',
  },
  rounded: {
    borderRadius: Constants.Sizes.Margins.Regular,
  },
  sectionImage: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    height: undefined,
    width: undefined,
  },
  separator: {
    backgroundColor: Constants.Colors.tertiaryBackground,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  splitSeparator: {
    backgroundColor: Constants.Colors.tertiaryBackground,
    width: StyleSheet.hairlineWidth,
  },
});
