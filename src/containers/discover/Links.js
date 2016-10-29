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
  StyleSheet,
  View,
} from 'react-native';

// Redux imports
import {connect} from 'react-redux';
import {
  setDiscoverLinks,
} from 'actions';

// Type imports
import type {
  Language,
  LinkSection,
} from 'types';

// Imports
import Menu from 'Menu';
import * as Configuration from 'Configuration';
import * as Constants from 'Constants';

class Links extends React.Component {

  /**
   * Properties this component expects to be provided by its parent.
   */
  props: {
    language: Language,                                        // The current language, selected by the user
    onSectionSelected: (section: string) => void,              // Displays contents of the section in a new view
    onSectionsLoaded: (links: Array < LinkSection >) => void,  // Sets the sections in the view
    links: Array < LinkSection >,                              // The sections in the view
  }

  /**
   * If the sections have not been loaded, then load them.
   */
  componentDidMount(): void {
    if (this.props.links == null || this.props.links.length === 0) {
      Configuration.init()
          .then(() => Configuration.getConfig('/useful_links.json'))
          .then((linkSections: Array < LinkSection >) => {
            this.props.onSectionsLoaded(linkSections);
          })
          .catch((err: any) => console.error('Configuration could not be initialized for useful links.', err));
    }
  }

  /**
   * Renders each of the sections, with one of them focused and showing an image.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement < any > {
    if (this.props.links == null || this.props.links.length === 0) {
      return (
        <View style={_styles.container} />
      );
    } else {
      return (
        <Menu
            language={this.props.language}
            sections={this.props.links}
            onSectionSelected={this.props.onSectionSelected} />
      );
    }
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.Colors.primaryBackground,
  },
});

// Map state to props
const select = (store) => {
  return {
    language: store.config.language,
    links: store.discover.links,
  };
};

// Map dispatch to props
const actions = (dispatch) => {
  return {
    onSectionSelected: (section: string) => {
      console.log('Section selected: ' + section);
      // let view: number = Views.Home;

      // switch (section) {
      //   case 'use':
      //     view = Views.Links;
      //     break;
      //   case 'stu':
      //   case 'bus':
      //   case 'shu':
      //   default:
      //     // Does nothing
      //     // Return to default view, Views.Home
      // }

      // dispatch(switchDiscoverView(view));
    },
    onSectionsLoaded: (links: Array < LinkSection >) => dispatch(setDiscoverLinks(links)),
  };
};

export default connect(select, actions)(Links);
