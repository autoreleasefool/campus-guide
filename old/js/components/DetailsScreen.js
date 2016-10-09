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
 * @file DetailsScreen.js
 * @description Displays a title, an image, and text to the user. These details can be
 *              provided so the component can be used multiple times.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// Type definition for component props.
type Props = {
  backgroundColor: string,      // Background color of the details screen
  image: ReactElement < any >,  // Header image representing the details
  text: Array < string >,       // Array of strings (paragraphs) to present
  title: string,                // Title of the details
};

// Type definition for component state.
type State = {
  backgroundColor: string,  // Current background color of the screen
};

// Imports
const Constants = require('../Constants');
const DisplayUtils = require('../util/DisplayUtils');
const SectionHeader = require('./SectionHeader');

class DetailsScreen extends React.Component {

  /**
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    backgroundColor: React.PropTypes.string,
    image: React.PropTypes.any,
    text: React.PropTypes.array,
    title: React.PropTypes.string,
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
      backgroundColor: this.props.backgroundColor || Constants.Colors.garnet,
    };
  }

  /**
   * Constructs a banner to display at the top of the view. The type of banner changes depending on whether the
   * instance has image and/or title props defined.
   *
   * @returns {?ReactElement<any>} a banner for the view
   */
  _renderBanner(): ?ReactElement < any > {
    let banner: ?ReactElement < any > = null;

    if (this.props.image) {
      if (this.props.title) {
        // Create a banner out of the image and the text
        banner = (
          <View style={_styles.banner}>
            <Image
                resizeMode={'cover'}
                source={this.props.image}
                style={_styles.bannerImage} />
            <View style={_styles.bannerTextContainer}>
              <Text style={_styles.bannerText}>
                {this.props.title}
              </Text>
            </View>
          </View>
        );
      } else {
        // Create a banner with only the image
        banner = (
          <View style={_styles.banner}>
            <Image
                resizeMode={'cover'}
                source={this.props.image}
                style={_styles.bannerImage} />
          </View>
        );
      }
    } else if (this.props.title) {
      // Create a banner with only the text
      banner = (
        <SectionHeader sectionName={this.props.title} />
      );
    }

    return banner;
  }

  /**
   * Constructs a scrollable text view containing the text props.
   *
   * @returns {?ReactElement<any>} details for the view
   */
  _renderDetails(): ?ReactElement < any > {
    let details: ?ReactElement < any > = null;

    // Only create a details view if there is any text defined.
    if (this.props.text) {
      // Change color of the body text depending on the darkness of the background color
      const textColor = DisplayUtils.isColorDark(this.state.backgroundColor)
          ? Constants.Colors.primaryWhiteText
          : Constants.Colors.primaryBlackText;

      details = (
        <ScrollView style={_styles.scrollview}>
          {this.props.text.map((text, index) => (
            <Text
                key={index}
                style={[_styles.text, {color: textColor}]}>
              {text}
            </Text>
          ))}
        </ScrollView>
      );
    }

    return details;
  }

  /**
   * Renders an image, a title, and a set of paragraphs of text (the details).
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement < any > {
    return (
      <View style={{flex: 1, backgroundColor: this.state.backgroundColor}}>
        {this._renderBanner.call(this)}
        {this._renderDetails.call(this)}
      </View>
    );
  }
}

// Private styles for the component
const _styles = StyleSheet.create({
  banner: {
    height: 175,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  bannerImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: null,
    height: null,
  },
  bannerTextContainer: {
    backgroundColor: Constants.Colors.defaultComponentBackgroundColor,
  },
  bannerText: {
    marginTop: Constants.Margins.Regular,
    marginBottom: Constants.Margins.Regular,
    marginLeft: Constants.Margins.Expanded,
    marginRight: Constants.Margins.Expanded,
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Text.Title,
  },
  scrollview: {
    flex: 1,
  },
  text: {
    margin: Constants.Margins.Regular,
    fontSize: Constants.Text.Medium,
  },
});

module.exports = DetailsScreen;
