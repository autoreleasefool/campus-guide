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
 * @file LinksHome.js
 * @module LinksHome
 * @description Presents a list of defined, useful links for the user regarding the university.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  Image,
  ListView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Type imports
import type {
  DefaultFunction,
  LinkCategoryType,
} from '../../types';

// Type definition for component props.
type Props = {
  showLinkCategory: DefaultFunction,
};

// Type definition for component state.
type State = {
  dataSource: ListView.DataSource,
  loaded: boolean,
};

// Imports
const Constants = require('../../Constants');
const LanguageUtils = require('../../util/LanguageUtils');
const Preferences = require('../../util/Preferences');

class LinksHome extends React.Component {

  /**
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    showLinkCategory: React.PropTypes.func.isRequired,
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
      dataSource: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
      }),
      loaded: false,
    };

    // Explicitly binding 'this' to all methods that need it
    (this:any)._loadLinkCategories = this._loadLinkCategories.bind(this);
  }

  /**
   * Loads the links to display.
   */
  componentDidMount(): void {
    if (!this.state.loaded) {
      this._loadLinkCategories();
    }
  }

  /**
   * Retrieves the set of categories that the various useful links in the app belong to.
   */
  _loadLinkCategories(): void {
    const linkCategories: Array<LinkCategoryType> = require('../../../assets/js/UsefulLinks');

    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(linkCategories),
      loaded: true,
    });
  }

  /**
   * Displays a single category name and an image which represents it.
   *
   * @param {LinkCategoryType} category object with properties describing the category.
   * @returns {ReactElement<any>} an image and text describing the category.
   */
  _renderRow(category: LinkCategoryType): ReactElement<any> {
    return (
      <TouchableOpacity
          style={_styles.categoryContainer}
          onPress={() => this.props.showLinkCategory(category)}>
        <Image
            resizeMode={'cover'}
            source={category.image}
            style={_styles.categoryImage} />
        <View style={_styles.categoryTextContainer}>
          <Text style={_styles.categoryText}>
            {LanguageUtils.getTranslatedName(Preferences.getSelectedLanguage(), category)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  /**
   * Renders a list of images and titles for the user to select, opening a screen with a list of useful links.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement<any> {
    if (this.state.loaded) {
      return (
        <View style={_styles.container}>
          <ListView
              dataSource={this.state.dataSource}
              renderRow={this._renderRow.bind(this)} />
        </View>
      );
    } else {
      return (
        <View style={_styles.container} />
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
  categoryContainer: {
    height: 175,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  categoryImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: null,
    height: null,
  },
  categoryTextContainer: {
    backgroundColor: Constants.Colors.defaultComponentBackgroundColor,
  },
  categoryText: {
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 20,
    marginRight: 20,
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Text.Title,
  },
});

module.exports = LinksHome;
