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
 * @file Home.js
 * @description Root view for info which help users become acquainted with the school.
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

// Redux imports
import {connect} from 'react-redux';
import {
  setDiscoverSections,
  switchDiscoverSection,
} from 'actions';

// Type imports
import type {
  DiscoverSection,
  Language,
  Icon,
  VoidFunction,
} from 'types';

// Imports
import Header from 'Header';
import * as Configuration from 'Configuration';
import * as Constants from 'Constants';
import * as DisplayUtils from 'DisplayUtils';
import * as TranslationUtils from 'TranslationUtils';

class DiscoverHome extends React.Component {

  /**
   * Properties this component expects to be provided by its parent.
   */
  props: {
    expandedSection: number,                                          // The current section to expand
    language: Language,                                               // The current language, selected by the user
    onSectionExpanded: (section: number) => void,                     // Updates the state when a building is selected
    onSectionSelected: (section: number) => void,                    // Displays contents of the section in a new view
    onSectionsLoaded: (sections: Array < DiscoverSection >) => void,  // Sets the sections in the view
    sections: Array < DiscoverSection >,                              // The sections in the view
  }

  /**
   * If the sections have not been loaded, then load them.
   */
  componentDidMount(): void {
    if (this.props.sections.length === 0) {
      Configuration.init()
          .then(() => Configuration.getConfig('/discover.json'))
          .then((discoverSections: Array < DiscoverSection >) => {
            this.props.onSectionExpanded(0);
            this.props.onSectionsLoaded(discoverSections);
          })
          .catch((err: any) => console.error('Configuration could not be initialized for discovery.', err));
    }
  }

  /**
   * Focuses a new section for the user, hides the old section's image and shows the new section's image.
   *
   * @param {number} section new section to focus.
   */
  _focusSection(section: number): void {
    if (this.props.expandedSection === section) {
      return;
    }

    LayoutAnimation.easeInEaseOut();
    this.props.onSectionExpanded(section);
  }

  /**
   * Returns a view for a section which displays the section name and icon, as well as an image if the section is
   * currently selected.
   *
   * @param {number}          index   index of section to render
   * @param {DiscoverSection} section section to render
   * @returns {ReactElement<any>} a view with an image and title which is clickable by the user
   */
  _getSectionView(index: number, section: DiscoverSection): ReactElement < any > {
    let onPress: VoidFunction;
    if (index === this.props.expandedSection) {
      onPress = () => this.props.onSectionSelected(index);
    } else {
      onPress = () => this._focusSection(index);
    }

    const icon: ?Icon = DisplayUtils.getPlatformIcon(Platform.OS, section);
    let sectionImage: ?ReactElement < any > = null;
    let touchableStyle: Object = {};
    let subtitleIconName: string = 'expand-more';

    if (index === this.props.expandedSection) {
      sectionImage = (
        <Image
            resizeMode={'cover'}
            source={{uri: Configuration.getImagePath(section.image)}}
            style={_styles.sectionImage} />
      );
      touchableStyle = {flex: 1, overflow: 'hidden'};
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
            subtitleIcon={{name: subtitleIconName, class: 'material'}}
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
          {this.props.sections.map((section: DiscoverSection, index: number) => (
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

// Map state to props
const select = (store) => {
  return {
    expandedSection: store.discover.expandedSection,
    language: store.config.language,
    sections: store.discover.sections,
  };
};

// Map dispatch to props
const actions = (dispatch) => {
  return {
    onSectionExpanded: (section: number) => {
      dispatch(switchDiscoverSection(section));
    },
    onSectionSelected: (section: number) => {
      console.log('Section selected: ' + section);
      // TODO: switchDiscoverView
    },
    onSectionsLoaded: (sections: Array < DiscoverSection >) => dispatch(setDiscoverSections(sections)),
  };
};

export default connect(select, actions)(DiscoverHome);
