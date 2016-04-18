/*************************************************************************
 *
 * @license
 *
 * Copyright 2016 Joseph Roque
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
 *************************************************************************
 *
 * @file
 * DiscoverHome.js
 *
 * @description
 * Root view for links which help users become acquainted with the school.
 *
 * @author
 * Joseph Roque
 *
 *************************************************************************
 *
 * @external
 * @flow
 *
 ************************************************************************/
'use strict';

// React Native imports
const React = require('react-native');
const {
  Component,
  Image,
  LayoutAnimation,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View
} = React;

// Imports
const Configuration = require('../../util/Configuration');
const Constants = require('../../Constants');
const DisplayUtils = require('../../util/DisplayUtils');
const LanguageUtils = require('../../util/LanguageUtils');
const Preferences = require('../../util/Preferences');
const SectionHeader = require('../../components/SectionHeader');
const Styles = require('../../Styles');

class DiscoverHome extends Component {

  /**
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    onScreenSelected: React.PropTypes.func.isRequired,
  };

  /**
   * Pass props and declares initial state.
   *
   * @param props properties passed from container to this component.
   */
  constructor(props) {
    super(props);
    this.state = {
      sections: null,
      currentSection: 0,
    };

    // Explicitly binding 'this' to all methods that need it
    this._focusSection = this._focusSection.bind(this);
    this._getSectionView = this._getSectionView.bind(this);
    this._loadDiscoverSections = this._loadDiscoverSections.bind(this);
  };

  /**
   * Focuses a new section for the user, hides the old section's image and
   * shows the new section's image.
   *
   * @param sectionId new section to focus.
   */
  _focusSection(sectionId) {
    if (this.state.currentSection === sectionId) {
      return;
    }

    let currentSectionHeader = this.refs['Header-' + this.state.currentSection];
    currentSectionHeader.updateSubtitle(
        currentSectionHeader.getSubtitleName(),
        'expand-more',
        currentSectionHeader.getSubtitleIconClass());

    let newSectionHeader = this.refs['Header-' + sectionId];
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
   * @param section section to render.
   * @return a view with an image and title which is clickable by the user.
   */
  _getSectionView(section) {
    let onPress = null;
    if (section.id === this.state.currentSection) {
      if (section.id === 'pop') {
        onPress = () => this.props.onScreenSelected(Constants.Views.Discover.BusCampuses);
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

    let sectionImage = null;
    let touchableStyle = {};
    let subtitleIcon = 'expand-more';
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

    let sectionIcon = DisplayUtils.getPlatformIcon(Platform.OS, section);

    return (
      <TouchableOpacity onPress={onPress} key={section.id} style={touchableStyle}>
        {sectionImage}
        <SectionHeader
            ref={'Header-' + section.id}
            sectionName={LanguageUtils.getTranslatedName(Preferences.getSelectedLanguage(), section)}
            sectionIcon={sectionIcon.icon}
            sectionIconClass={sectionIcon.iconClass}
            subtitleIcon={subtitleIcon}
            subtitleIconClass={'material'} />
      </TouchableOpacity>
    );
  };

  /**
   * Retrieves information about the sections in the discover tab and refreshes
   * the view.
   */
  _loadDiscoverSections() {
    let sections = require('../../../assets/static/js/DiscoverSections');
    this.setState({
      sections: sections,
      currentSection: sections[0].id,
    });
  };

  /**
   * If the sections have not been loaded, then loads them.
   */
  componentDidMount() {
    if (this.state.sections == null) {
      this._loadDiscoverSections();
    }
  };

  /**
   * Renders each of the sections, with one of them focused and showing an
   * image.
   *
   * @return the hierarchy of views to render.
   */
  render() {
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
