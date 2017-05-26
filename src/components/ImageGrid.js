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
 * @created 2016-10-19
 * @file ImageGrid.js
 * @providesModule ImageGrid
 * @description Displays the list of images in a grid, with a name if available.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Types
import type { Language, Name } from 'types';

// Describes an image displayed in the grid.
export type GridImage = {
  shorthand?: string,                 // Optional short version of name
  image: string | ReactClass < any >, // Image for the grid
} & Name;

// Type definition for component props
type Props = {
  images: Array < GridImage >,                // List of images to display
  initialSelection?: Array < GridImage >,     // Images which are selected when the view is initially rendered
  columns: number,                            // Number of columns to show images in
  disableImages?: boolean,                    // If true, grid should only show a list of names, with no images
  includeClear?: boolean,                     // If true, an empty cell should be available to clear the choice
  filter: ?string,                            // Filter the list of images
  language: Language,                         // Language to display image names in
  multiSelect?: boolean,                      // Enable selecting two or more images in the grid
  multiSelectText?: string,                   // Text to display on button for confirming multi select
  onSelect?: (i: any) => void,                // Callback for when an image is selected
  onMultiSelect?: (i: Array < any >) => void, // Callback for when multiple images are selected
}

// Type definition for component state
type State = {
  images: Array < ?GridImage >, // List of images
  selected: Set < ?GridImage >, // Indicates which images are selected, for multi select
};

// Imports
import Header from 'Header';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as Configuration from 'Configuration';
import * as Constants from 'Constants';
import * as Translations from 'Translations';

// Determining size of building icons based on the screen size.
const { width } = Dimensions.get('window');

export default class ImageGrid extends React.Component {

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

    // FIXME: Better way to throw this error?
    if (props.multiSelect && !props.multiSelectText) {
      throw new Error('props.multiSelectText must be provided for multiSelect mode');
    }

    const selected = new Set();
    if (props.multiSelect && props.initialSelection) {
      props.initialSelection.forEach((selection) => {
        selected.add(selection);
      });
    }

    this.state = {
      images: [],
      selected,
    };
  }

  /**
   * Loads the images once the view has been mounted.
   */
  componentDidMount(): void {
    this._filterImages(this.props);
  }

  /**
   * If a new filter is provided, update the list of images.
   *
   * @param {Props} nextProps the new props being received
   */
  componentWillReceiveProps(nextProps: Props): void {
    if (nextProps.filter != this.props.filter || nextProps.language != this.props.language) {
      this._filterImages(nextProps);
    }
  }

  /**
   * Gets a unique key for the image.
   *
   * @param {?GridImage} image the image to get a key for
   * @param {number}    index index of the image
   * @returns {string} the key
   */
  _imageNameExtractor(image: ?GridImage, index: number): string {
    return image
        ? image.shorthand || Translations.getName(this.props.language, image) || index.toString()
        : index.toString();
  }

  /**
   * Filter to only show images which names or shorthand contain the search terms.
   *
   * @param {Props} props the props to filter with
   */
  _filterImages({ images, filter, includeClear }: Props): void {
    // Ignore the case of the search terms
    const adjustedSearchTerms: ?string = (filter == null || filter.length === 0)
        ? null
        : filter.toUpperCase();

    // Create array for buildings
    const filteredImages: Array < ?GridImage > = [];

    if (includeClear) {
      filteredImages.push(null);
    }

    images.forEach((image: GridImage) => {
      // If the search terms are empty, or the image name contains the terms, add it to the list
      if (adjustedSearchTerms == null
          || this.state.selected.has(image)
          || (image.shorthand && image.shorthand.toUpperCase().indexOf(adjustedSearchTerms) >= 0)
          || (image.name && image.name.toUpperCase().indexOf(adjustedSearchTerms) >= 0)
          || (image.name_en && image.name_en.toUpperCase().indexOf(adjustedSearchTerms) >= 0)
          || (image.name_fr && image.name_fr.toUpperCase().indexOf(adjustedSearchTerms) >= 0)) {
        filteredImages.push(image);
      }
    });

    // Update the state so the app reflects the changes made
    this.setState({ images: filteredImages });
  }

  /**
   * Handles event when an image in the grid is selected.
   *
   * @param {?GridImage} image the selected image
   */
  _onImageSelected(image: ?GridImage): void {
    if (this.props.multiSelect) {
      const selected = new Set(this.state.selected);
      if (selected.has(image)) {
        selected.delete(image);
      } else {
        selected.add(image);
      }

      this.setState({ selected });
    } else {
      this.props.onSelect && this.props.onSelect(image);
    }
  }

  /**
   * Handles event when user confirms multi select choices.
   */
  _onMultiSelectConfirm(): void {
    const selected = [];
    this.props.images.forEach((image) => {
      if (this.state.selected.has(image)) {
        selected.push(image);
      }
    });

    this.props.onMultiSelect && this.props.onMultiSelect(selected);
  }

  /**
   * Displays an image and its name.
   *
   * @param {GridImage} item  information about the image
   * @param {number}    index index of the image in the list
   * @returns {ReactElement<any>} an image (if enabled) and name for the image
   */
  _renderItem({ item, index }: { item: GridImage, index: number }): ReactElement < any > {
    const gridImageSize: number = Math.floor(width / this.props.columns);

    let gridImageStyle = { height: gridImageSize, width: gridImageSize };
    let textStyle = { backgroundColor: Constants.Colors.darkTransparentBackground };
    if (this.props.disableImages) {
      gridImageStyle = { margin: 1, width: gridImageSize - 2 };
      textStyle = {
        backgroundColor: Constants.Colors.darkMoreTransparentBackground,
        paddingTop: Constants.Sizes.Margins.Expanded,
        paddingBottom: Constants.Sizes.Margins.Expanded,
      };
    }

    const imageStyle = {
      width: width / this.props.columns,
      height: width / this.props.columns,
    };

    if (index % this.props.columns === this.props.columns - 1) {
      const leftover = width - (Math.floor(width / this.props.columns) * this.props.columns);
      imageStyle.width += leftover;
    }

    let check = null;
    if (this.props.multiSelect) {
      if (this.state.selected.has(item)) {
        check = (
          <View style={_styles.checkContainer}>
            <View style={_styles.container} />
            <MaterialIcons
                color={Constants.Colors.tertiaryBackground}
                name={'check-box'}
                size={Constants.Sizes.Icons.Jumbo}
                style={_styles.check} />
            <View style={_styles.container} />
          </View>
        );
      }
    }

    let image = null;
    if (!this.props.disableImages && item != null) {
      if (typeof (item.image) === 'string') {
        image = (
          <Image
              resizeMode={'cover'}
              source={{ uri: Configuration.getImagePath(item.image) }}
              style={[ _styles.image, imageStyle ]} />
        );
      } else {
        image = (
          <Image
              resizeMode={'cover'}
              source={item.image}
              style={[ _styles.image, imageStyle ]} />
        );
      }
    }

    return (
      <TouchableOpacity onPress={() => this._onImageSelected(item)}>
        <View style={[ _styles.gridImage, gridImageStyle ]}>
          {image}
          {check}
          <Text
              ellipsizeMode={'tail'}
              numberOfLines={1}
              style={[ _styles.shorthand, textStyle ]}>
            {this._imageNameExtractor(item, index)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  /**
   * Renders a list of the images and names.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement < any > {
    let style = {};
    if (this.props.disableImages) {
      style = {
        marginTop: 1,
        marginBottom: 1,
      };
    }

    return (
      <View style={_styles.container}>
        <FlatList
            data={this.state.images}
            keyExtractor={this._imageNameExtractor.bind(this)}
            numColumns={this.props.columns}
            renderItem={this._renderItem.bind(this)}
            style={style} />
        {this.props.multiSelect && this.props.multiSelectText
            ? (
              <TouchableOpacity onPress={this._onMultiSelectConfirm.bind(this)}>
                <Header
                    backgroundColor={Constants.Colors.secondaryBackground}
                    subtitleIcon={{ class: 'material', name: 'chevron-right' }}
                    title={this.props.multiSelectText} />
              </TouchableOpacity>
            )
            : null}

      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  checkContainer: {
    flex: 1,
    backgroundColor: Constants.Colors.transparentCharcoalGrey,
  },
  gridImage: {
    justifyContent: 'flex-end',
  },
  shorthand: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
    textAlign: 'center',
    paddingTop: 5,
    paddingBottom: 5,
  },
  check: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  image: {
    position: 'absolute',
    bottom: 0,
    top: 0,
    right: 0,
    left: 0,
  },
});
