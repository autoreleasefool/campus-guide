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
 * @file ImageGrid.tsx
 * @description Displays the list of images in a grid, with a name if available.
 */
'use strict';

// React imports
import React from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  InteractionManager,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Imports
import Header from './Header';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as Configuration from '../util/Configuration';
import * as Constants from '../constants';
import * as Translations from '../util/Translations';
import { filterGridImage } from '../util/Search';

// Types
import { Language } from '../util/Translations';
import { GridImage } from '../../typings/global';

interface Props {
  images: GridImage[];                  // List of images to display
  initialSelection?: GridImage[];       // Images which are selected when the view is initially rendered
  columns: number;                      // Number of columns to show images in
  disableImages?: boolean;              // If true, grid should only show a list of names, with no images
  filter: string;                       // Filter the list of images
  language: Language;                   // Language to display image names in
  multiSelect?: boolean;                // Enable selecting two or more images in the grid
  multiSelectText?: string;             // Text to display on button for confirming multi select
  onSelect?(i: any): void;              // Callback for when an image is selected
  onMultiSelect?(i: GridImage[]): void; // Callback for when multiple images are selected
}

interface State {
  images: (GridImage | undefined)[];  // List of images
  selected: Set<GridImage|undefined>; // Indicates which images are selected, for multi select
}

// Determining size of building icons based on the screen size.
const screenWidth = Dimensions.get('window').width;

export default class ImageGrid extends React.PureComponent<Props, State> {

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
      props.initialSelection.forEach((selection: GridImage | undefined) => {
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
    InteractionManager.runAfterInteractions(() => this._filterImages(this.props));
  }

  /**
   * If a new filter is provided, update the list of images.
   *
   * @param {Props} nextProps the new props being received
   */
  componentWillReceiveProps(nextProps: Props): void {
    if (nextProps.filter !== this.props.filter || nextProps.language !== this.props.language) {
      this._filterImages(nextProps);
    }
  }

  /**
   * Gets a unique key for the image.
   *
   * @param {GridImage} image the image to get a key for
   * @param {number}              index index of the image
   * @returns {string} the key
   */
  _imageNameExtractor(image: GridImage, index: number): string {
    return image.shorthand || Translations.getName(this.props.language, image) || index.toString();
  }

  /**
   * Filter to only show images which names or shorthand contain the search terms.
   *
   * @param {Props} props the props to filter with
   */
  _filterImages({ language, images, filter }: Props): void {
    // Ignore the case of the search terms
    const adjustedFilter = (filter.length === 0) ? undefined : filter.toUpperCase();

    // Create array for buildings
    const filteredImages: (GridImage|undefined)[] = [];

    // If the search terms are empty, or the image name contains the terms, add it to the list
    images.forEach((image: GridImage) => {
      let matches = false;
      if (!adjustedFilter || this.state.selected.has(image)) {
        matches = true;
      } else {
        const result = filterGridImage(language, adjustedFilter, image);
        matches = result.success;
      }

      if (matches) {
        filteredImages.push(image);
      }
    });

    // Update the state so the app reflects the changes made
    this.setState({ images: filteredImages });
  }

  /**
   * Handles event when an image in the grid is selected.
   *
   * @param {GridImage|undefined} image the selected image
   */
  _onImageSelected(image: GridImage | undefined): void {
    if (this.props.multiSelect) {
      const selected = new Set(this.state.selected);
      if (selected.has(image)) {
        selected.delete(image);
      } else {
        selected.add(image);
      }

      this.setState({ selected });
    } else {
      if (this.props.onSelect) {
        this.props.onSelect(image);
      }
    }
  }

  /**
   * Handles event when user confirms multi select choices.
   */
  _onMultiSelectConfirm(): void {
    const selected = [];
    this.props.images.forEach((image: GridImage) => {
      if (this.state.selected.has(image)) {
        selected.push(image);
      }
    });

    if (this.state.selected.has(undefined)) {
      selected.push(undefined);
    }

    if (this.props.onMultiSelect) {
      this.props.onMultiSelect(selected);
    }
  }

  /**
   * Displays an image and its name.
   *
   * @param {GridImage} item  information about the image
   * @param {number}    index index of the image in the list
   * @returns {JSX.Element} an image (if enabled) and name for the image
   */
  _renderItem({ item, index }: { item: GridImage; index: number }): JSX.Element {
    const gridImageSize: number = Math.floor(screenWidth / this.props.columns);

    let gridImageStyle: any = { height: gridImageSize, width: gridImageSize };
    let textStyle: any = { backgroundColor: Constants.Colors.darkTransparentBackground };
    if (this.props.disableImages) {
      gridImageStyle = { margin: 1, width: gridImageSize - 2 };
      textStyle = {
        backgroundColor: Constants.Colors.darkMoreTransparentBackground,
        paddingBottom: Constants.Sizes.Margins.Expanded,
        paddingTop: Constants.Sizes.Margins.Expanded,
      };
    }

    const imageStyle = {
      height: screenWidth / this.props.columns,
      width: screenWidth / this.props.columns,
    };

    if (index % this.props.columns === this.props.columns - 1) {
      const leftover = screenWidth - (Math.floor(screenWidth / this.props.columns) * this.props.columns);
      imageStyle.width += leftover;
    }

    let check: JSX.Element;
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

    let image: JSX.Element;
    if (!this.props.disableImages) {
      const displayImage: any = item.thumbnail ? item.thumbnail : item.image;

      if (typeof (displayImage) === 'string') {
        image = (
          <Image
              resizeMode={'cover'}
              source={{ uri: Configuration.getImagePath(displayImage) }}
              style={[ _styles.image, imageStyle ]} />
        );
      } else {
        image = (
          <Image
              resizeMode={'cover'}
              source={displayImage}
              style={[ _styles.image, imageStyle ]} />
        );
      }
    }

    return (
      <TouchableOpacity onPress={(): void => this._onImageSelected(item)}>
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
   * @returns {JSX.Element} the hierarchy of views to render
   */
  render(): JSX.Element {
    let style = {};
    if (this.props.disableImages) {
      style = {
        marginBottom: 1,
        marginTop: 1,
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
            : undefined}
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  check: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  checkContainer: {
    backgroundColor: Constants.Colors.transparentCharcoalGrey,
    flex: 1,
  },
  container: {
    flex: 1,
  },
  gridImage: {
    justifyContent: 'flex-end',
  },
  image: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  shorthand: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
    paddingBottom: 5,
    paddingTop: 5,
    textAlign: 'center',
  },
});
