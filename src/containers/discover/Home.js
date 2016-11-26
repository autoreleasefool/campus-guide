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
 * @created 2016-10-27
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
  setDiscoverSections,
  setHeaderTitle,
  showLinkCategory,
  switchDiscoverView,
} from 'actions';

// Type imports
import type {
  DiscoverSection,
  Language,
} from 'types';

// Imports
import Menu from 'Menu';
import * as Configuration from 'Configuration';
import * as Constants from 'Constants';

class DiscoverHome extends React.Component {

  /**
   * Properties this component expects to be provided by its parent.
   */
  props: {
    language: Language,                                               // The current language, selected by the user
    onSectionSelected: (section: string) => void,                     // Display contents of the section in new view
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
            this.props.onSectionsLoaded(discoverSections);
          })
          .catch((err: any) => console.error('Configuration could not be initialized for discovery.', err));
    }
  }

  /**
   * Renders each of the sections, with one of them focused and showing an image.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render.
   */
  render(): ReactElement < any > {
    if (this.props.sections == null || this.props.sections.length === 0) {
      return (
        <View style={_styles.container} />
      );
    } else {
      return (
        <View style={_styles.container}>
          <Menu
              language={this.props.language}
              sections={this.props.sections}
              onSectionSelected={this.props.onSectionSelected} />
        </View>
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
    sections: store.discover.sections,
  };
};

// Map dispatch to props
const actions = (dispatch) => {
  return {
    onSectionSelected: (section: string) => {
      let view: number = Constants.Views.Discover.Home;
      let title: ?string = null;

      switch (section) {
        case 'use':
          view = Constants.Views.Discover.Links;
          title = 'useful_links';
          dispatch(showLinkCategory(0));
          break;
        case 'trn':
          view = Constants.Views.Discover.Transit;
          title = 'transit_company';
          break;
        case 'stu':
        case 'shu':
        default:
          // Does nothing
          // Return to default view, Views.Home
      }

      dispatch(setHeaderTitle(title, 'discover'));
      dispatch(switchDiscoverView(view));
    },
    onSectionsLoaded: (sections: Array < DiscoverSection >) => dispatch(setDiscoverSections(sections)),
  };
};

export default connect(select, actions)(DiscoverHome);
