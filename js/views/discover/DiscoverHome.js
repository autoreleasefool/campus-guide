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
 * @file DiscoverHome.js
 * @providesModule DiscoverHome
 * @description Root view for links which help users become acquainted with the school.
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

// Type imports
import type {
  IconObject,
  DefaultFunction,
  DefaultIcon,
} from 'types';

// Type definition for headers with a 'name' property.
type DiscoverSectionWithDefaultName = {
  icon: IconObject,
  id: string,
  image: ReactClass<any>,
  name: string,
};

// Type definition for headers with 'name_en' and 'name_fr' properties.
type DiscoverSectionWithTranslatedName = {
  icon: IconObject,
  id: string,
  image: ReactClass<any>,
  name_en: string,
  name_fr: string,
};

// Type definition for headers.
type DiscoverSection =
    | DiscoverSectionWithDefaultName
    | DiscoverSectionWithTranslatedName;

// Type definition for component props.
type Props = {
  onScreenSelected: DefaultFunction,
};

// Type definition for component state.
type State = {
  sections: ?Array<DiscoverSection>,
  currentSection: string,
};

// Imports
const Constants = require('Constants');
const DisplayUtils = require('DisplayUtils');
const LanguageUtils = require('LanguageUtils');
const Preferences = require('Preferences');
const SectionHeader = require('SectionHeader');

class DiscoverHome extends React.Component {

  /**
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    onScreenSelected: React.PropTypes.func.isRequired,
  };

  /**
   * Define type for the component state.
   */
  state: State;

  /**
   * Pass props and declares initial state.
   *
   * @param {Props} props properties passed from container to this component.
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      sections: null,
      currentSection: 'none',
    };

    // Explicitly binding 'this' to all methods that need it
    (this:any)._focusSection = this._focusSection.bind(this);
    (this:any)._getSectionView = this._getSectionView.bind(this);
    (this:any)._loadDiscoverSections = this._loadDiscoverSections.bind(this);
  }

  /**
   * If the sections have not been loaded, then loads them.
   */
  componentDidMount(): void {
    if (this.state.sections == null) {
      this._loadDiscoverSections();
    }
  }

  /**
   * Focuses a new section for the user, hides the old section's image and shows the new section's image.
   *
   * @param {number} sectionId new section to focus.
   */
  _focusSection(sectionId: string): void {
    if (this.state.currentSection === sectionId) {
      return;
    }

    const currentSectionHeader: SectionHeader = this.refs['Header-' + this.state.currentSection];
    currentSectionHeader.updateSubtitle(
        currentSectionHeader.getSubtitleName(),
        'expand-more',
        currentSectionHeader.getSubtitleIconClass());

    const newSectionHeader: SectionHeader = this.refs['Header-' + sectionId];
    newSectionHeader.updateSubtitle(
        newSectionHeader.getSubtitleName(),
        'chevron-right',
        newSectionHeader.getSubtitleIconClass());

    LayoutAnimation.easeInEaseOut();
    this.setState({
      currentSection: sectionId,
    });
  }

  /**
   * Returns a view for a section which displays the section name and icon, as well as an image if the section is
   * currently selected.
   *
   * @param {DiscoverSection} section section to render.
   * @returns {ReactElement<any>} a view with an image and title which is clickable by the user.
   */
  _getSectionView(section: DiscoverSection): ReactElement<any> {
    let onPress: DefaultFunction;
    if (section.id === this.state.currentSection) {
      if (section.id === 'pop') {
        onPress = () => this.props.onScreenSelected(Constants.Views.Discover.HotSpots);
      } else if (section.id === 'stu') {
        onPress = () => this.props.onScreenSelected(0);
      } else if (section.id === 'use') {
        onPress = () => this.props.onScreenSelected(Constants.Views.Discover.LinksHome);
      } else if (section.id === 'bus') {
        onPress = () => this.props.onScreenSelected(Constants.Views.Discover.BusCampusList);
      } else if (section.id === 'shu') {
        onPress = () => this.props.onScreenSelected(Constants.Views.Discover.ShuttleCampusList);
      }
    } else {
      onPress = () => this._focusSection(section.id);
    }

    let sectionImage: ?ReactElement<any> = null;
    let touchableStyle: Object = {};
    let subtitleIcon: string = 'expand-more';
    if (section.id === this.state.currentSection) {
      sectionImage = (
        <Image
            resizeMode={'cover'}
            source={section.image}
            style={_styles.sectionImage} />
      );
      touchableStyle = {flex: 1, overflow: 'hidden'};
      subtitleIcon = 'chevron-right';
    }

    const sectionIcon: ?DefaultIcon = DisplayUtils.getPlatformIcon(Platform.OS, section);
    const iconName: ?string = sectionIcon == null
        ? null
        : sectionIcon.name;
    const iconClass: ?string = sectionIcon == null
        ? null
        : sectionIcon.class;

    return (
      <TouchableOpacity
          key={section.id}
          style={touchableStyle}
          onPress={onPress}>
        {sectionImage}
        <SectionHeader
            ref={'Header-' + section.id}
            sectionIcon={iconName}
            sectionIconClass={iconClass}
            sectionName={LanguageUtils.getTranslatedName(Preferences.getSelectedLanguage(), section)}
            subtitleIcon={subtitleIcon}
            subtitleIconClass={'material'} />
      </TouchableOpacity>
    );
  }

  /**
   * Retrieves information about the sections in the discover tab and refreshes the view.
   */
  _loadDiscoverSections(): void {
    const discoverSections: Array<DiscoverSection> = require('../../../assets/js/DiscoverSections');
    this.setState({
      sections: discoverSections,
      currentSection: discoverSections[0].id,
    });
  }

  /**
   * Renders each of the sections, with one of them focused and showing an image.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement<any> {
    if (this.state.sections == null) {
      return (
        <View style={_styles.container} />
      );
    } else {
      return (
        <View style={_styles.container}>
          {this.state.sections.map(section => (
            this._getSectionView(section)
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
    backgroundColor: Constants.Colors.darkGrey,
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

module.exports = DiscoverHome;
