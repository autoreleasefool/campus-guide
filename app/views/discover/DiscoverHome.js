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
 * @module DiscoverHome
 * @description Root view for links which help users become acquainted with the school.
 * @flow
 *
 */
'use strict';

// React Native imports
import React from 'react';
import {
  Image,
  LayoutAnimation,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

// Import type definitions.
import type {
  IconObject,
  DefaultIcon,
} from '../../Types';

// Imports
const Constants = require('../../Constants');
const DisplayUtils = require('../../util/DisplayUtils');
const LanguageUtils = require('../../util/LanguageUtils');
const Preferences = require('../../util/Preferences');
const SectionHeader = require('../../components/SectionHeader');

// Type definition for headers with a 'name' property.
type DiscoverSectionWithDefaultName = {
  icon: IconObject,
  id: string,
  image: ReactClass,
  name: string,
};

// Type definition for headers with 'name_en' and 'name_fr' properties.
type DiscoverSectionWithTranslatedName = {
  icon: IconObject,
  id: string,
  image: ReactClass,
  name_en: string,
  name_fr: string,
};

// Type definition for headers.
type DiscoverSection =
    | DiscoverSectionWithDefaultName
    | DiscoverSectionWithTranslatedName;

// Type definition for component props.
type Props = {
  onScreenSelected: () => any,
};

// Type definition for component state.
type State = {
  sections: ?Array<DiscoverSection>,
  currentSection: string,
};

class DiscoverHome extends React.Component {
  state: State;

  /**
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    onScreenSelected: React.PropTypes.func.isRequired,
  };

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
  };

  /**
   * Focuses a new section for the user, hides the old section's image and
   * shows the new section's image.
   *
   * @param {number} sectionId new section to focus.
   */
  _focusSection(sectionId: string): void {
    if (this.state.currentSection === sectionId) {
      return;
    }

    let currentSectionHeader: SectionHeader = this.refs['Header-' + this.state.currentSection];
    currentSectionHeader.updateSubtitle(
        currentSectionHeader.getSubtitleName(),
        'expand-more',
        currentSectionHeader.getSubtitleIconClass());

    let newSectionHeader: SectionHeader = this.refs['Header-' + sectionId];
    newSectionHeader.updateSubtitle(
        newSectionHeader.getSubtitleName(),
        'chevron-right',
        newSectionHeader.getSubtitleIconClass());

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    this.setState({
      currentSection: sectionId,
    });
  };

  /**
   * Returns a view for a section which displays the section name and icon, as
   * well as an image if the section is currently selected.
   *
   * @param {DiscoverSection} section section to render.
   * @return {ReactElement} a view with an image and title which is clickable by the user.
   */
  _getSectionView(section: DiscoverSection): ReactElement {
    let onPress: () => any;
    if (section.id === this.state.currentSection) {
      if (section.id === 'pop') {
        onPress = () => this.props.onScreenSelected(Constants.Views.Discover.HotSpots);
      } else if (section.id === 'stu') {
        onPress = () => this.props.onScreenSelected(Constants.Views.Discover.BusCampuses);
      } else if (section.id === 'use') {
        onPress = () => this.props.onScreenSelected(Constants.Views.Discover.LinksHome);
      } else if (section.id === 'bus') {
        onPress = () => this.props.onScreenSelected(Constants.Views.Discover.BusCampuses);
      } else if (section.id === 'shu') {
        onPress = () => this.props.onScreenSelected(Constants.Views.Discover.ShuttleInfo);
      }
    } else {
      onPress = () => this._focusSection(section.id);
    }

    let sectionImage: ?ReactElement = null;
    let touchableStyle: Object = {};
    let subtitleIcon: string = 'expand-more';
    if (section.id === this.state.currentSection) {
      sectionImage = (
        <Image
            style={_styles.sectionImage}
            resizeMode={'cover'}
            source={section.image} />
      );
      touchableStyle = {flex: 1, overflow: 'hidden'};
      subtitleIcon = 'chevron-right';
    }

    let sectionIcon: ?DefaultIcon = DisplayUtils.getPlatformIcon(Platform.OS, section);
    let iconName: ?string = sectionIcon != null
        ? sectionIcon.name
        : null;
    let iconClass: ?string = sectionIcon != null
        ? sectionIcon.class
        : null;

    return (
      <TouchableOpacity onPress={onPress} key={section.id} style={touchableStyle}>
        {sectionImage}
        <SectionHeader
            ref={'Header-' + section.id}
            sectionName={LanguageUtils.getTranslatedName(Preferences.getSelectedLanguage(), section)}
            sectionIcon={iconName}
            sectionIconClass={iconClass}
            subtitleIcon={subtitleIcon}
            subtitleIconClass={'material'} />
      </TouchableOpacity>
    );
  };

  /**
   * Retrieves information about the sections in the discover tab and refreshes
   * the view.
   */
  _loadDiscoverSections(): void {
    let sections: Array<DiscoverSection> = require('../../../assets/static/js/DiscoverSections');
    this.setState({
      sections: sections,
      currentSection: sections[0].id,
    });
  };

  /**
   * If the sections have not been loaded, then loads them.
   */
  componentDidMount(): void {
    if (this.state.sections == null) {
      this._loadDiscoverSections();
    }
  };

  /**
   * Renders each of the sections, with one of them focused and showing an
   * image.
   *
   * @return {ReactElement} the hierarchy of views to render.
   */
  render(): ReactElement {
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
  };
};

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.Colors.darkGrey
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

// Expose component to app
module.exports = DiscoverHome;
