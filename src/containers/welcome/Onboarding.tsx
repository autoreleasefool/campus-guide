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
 * @created 2017-11-19
 * @file Onboarding.tsx
 * @description Introduces the user to various features of the app
 */
'use strict';

// React imports
import React from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScaledSize,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Redux imports
import { connect } from 'react-redux';

// Imports
import * as Constants from '../../constants';
import * as Translations from '../../util/Translations';

// Types
import { Store } from '../../store/configureStore';
import { Language } from '../../util/Translations';

interface Props {
  language: Language; // Language currently selected by user
  navigator: any;     // Parent navigator
}

interface State {
  currentPage: number;  // Active onboarding page
  screenHeight: number; // Active width of the screen
  screenWidth: number;  // Active width of the screen
}

// A page for onboarding
interface OnboardingPage {
  description: string;  // Description of the onboarding page, to be translated
  title: string;        // Title of the onboarding page, to be translated
  view(): JSX.Element;  // Main view for the page
}

// Active opacity for onboarding pages
const activePageOpacity = 1;

// Inactive opacity for onboarding pages
const inactivePageOpacity = 0.4;

class Onboarding extends React.PureComponent<Props, State> {

  /** When true, Prev and Next button presses should be ignored. */
  _ignoreButtons: boolean = false;

  /** The set of pages for onboarding */
  _onboardingPages: OnboardingPage[] = [
    {
      description: 'onboarding_general_description',
      title: 'onboarding_general_title',
      view: (): JSX.Element => (
        <View style={{ backgroundColor: Constants.Colors.law, flex: 1 }} />
      ),
    },
    {
      description: 'onboarding_navigation_description',
      title: 'onboarding_navigation_title',
      view: (): JSX.Element => (
        <View style={{ backgroundColor: Constants.Colors.engineering, flex: 1 }} />
      ),
    },
    {
      description: 'onboarding_discover_description',
      title: 'onboarding_discover_title',
      view: (): JSX.Element => (
        <View style={{ backgroundColor: Constants.Colors.arts, flex: 1 }} />
      ),
    },
    {
      description: 'onboarding_settings_description',
      title: 'onboarding_settings_title',
      view: (): JSX.Element => (
        <View style={{ backgroundColor: Constants.Colors.socialSciences, flex: 1 }} />
      ),
    },
  ];

  /**
   * Update the screen width and height, and rerender component.
   *
   * @param {ScaledSize} dims the new dimensions
   */
  _dimensionsHandler = (dims: { window: ScaledSize }): void =>
      this.setState({ screenHeight: dims.window.height, screenWidth: dims.window.width })

  /** Scroll to previous screen. */
  _previousScreen = (): void => {
    if (this._ignoreButtons) {
      return;
    }

    const prevPage = Math.max(this.state.currentPage - 1, 0);
    if (prevPage !== this.state.currentPage) {
      this._animateScrollViewToPage(prevPage);
      this.setState({ currentPage: prevPage });
      this._ignoreButtons = true;
    }
  }

  /** Scroll to next screen. */
  _nextScreen = (): void => {
    if (this.state.currentPage === this._onboardingPages.length - 1) {
      this._popOrPushToMain();
    } else {
      if (this._ignoreButtons) {
        return;
      }

      const nextPage = Math.min(this.state.currentPage + 1, this._onboardingPages.length - 1);
      if (nextPage !== this.state.currentPage) {
        this._animateScrollViewToPage(nextPage);
        this.setState({ currentPage: nextPage });
        this._ignoreButtons = true;
      }
    }
  }

  /** End onboarding prematurely. */
  _skipOnboarding = (): void => this._popOrPushToMain();

  /** When user manually changes the page, or when page change finishes. */
  _handlePageChange = (scrollEvent: NativeSyntheticEvent<NativeScrollEvent>): void => {
    this._ignoreButtons = false;

    const offset = scrollEvent.nativeEvent.contentOffset;
    if (offset) {
      const page = Math.round(offset.x / this.state.screenWidth);
      if (this.state.currentPage !== page) {
        this._animateScrollViewToPage(page);
        this.setState({ currentPage: page });
      }
    }
  }

  /**
   * Constructor.
   *
   * @param {props} props component props
   */
  constructor(props: Props) {
    super(props);

    const screenDimensions = Dimensions.get('window');
    this.state = {
      currentPage: 0,
      screenHeight: screenDimensions.height,
      screenWidth: screenDimensions.width,
    };
  }

  /**
   * Scroll the scroll view to a given page.
   *
   * @param {number} page the page to scroll to
   */
  _animateScrollViewToPage(page: number): void {
    (this.refs.ScrollView as any).scrollTo({ y: 0, x: page * this.state.screenWidth, animated: true });
  }

  /**
   * Check if a 'main' route already exists on the navigator and pop to it if so.
   * Otherwise, push a new one.
   */
  _popOrPushToMain(): void {
    const routes = this.props.navigator.getCurrentRoutes();
    for (const route of routes) {
      if (route.id === 'main') {
        this.props.navigator.popToRoute(route);

        return;
      }
    }
    this.props.navigator.push({ id: 'main' });
  }

  /**
   * Display onboarding pages in a scrollable view.
   *
   * @returns {JSX.Element} the set of pages
   */
  _renderOnboardingPages(): JSX.Element {
    return (
      <ScrollView
          horizontal={true}
          pagingEnabled={true}
          onMomentumScrollEnd={this._handlePageChange}
          ref='ScrollView'
          style={_styles.fullScreen}>
        {this._onboardingPages.map((page: OnboardingPage) => (
          <View key={page.title} style={{ height: this.state.screenHeight, width: this.state.screenWidth }}>
            <View style={_styles.contentSpace}>
              {page.view()}
            </View>
            <View style={_styles.tipSpace}>
              <Text style={_styles.pageTitle}>{Translations.get(page.title)}</Text>
              <Text style={_styles.pageDescription}>{Translations.get(page.description)}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    );
  }

  /**
   * Display onboarding controls to progress through content.
   *
   * @returns {JSX.Element} a prev button, a next button, a skip button, and a position indicator
   */
  _renderControls(): JSX.Element {
    return (
      <View style={_styles.controlContainer}>
        <View style={_styles.positionIndicatorContainer}>
          <View style={_styles.positionIndicator}>
            {this._onboardingPages.map((page: OnboardingPage, index: number) => (
              <View
                  key={page.title}
                  style={[
                    _styles.positionIndicatorDot,
                    { opacity: index === this.state.currentPage ? activePageOpacity : inactivePageOpacity },
                  ]} />
            ))}
          </View>
        </View>
        <View style={_styles.buttonContainer}>
          <TouchableOpacity onPress={this._previousScreen}>
            <Text style={_styles.button}>{Translations.get('prev')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this._skipOnboarding}>
            <Text style={[ _styles.button, _styles.transparent ]}>{Translations.get('skip')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this._nextScreen}>
            <Text style={_styles.button}>{Translations.get('next')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /**
   * Displays onboarding details for the user to get introduced to the app.
   *
   * @returns {JSX.Element} the hierarchy of views to render
   */
  render(): JSX.Element {
    return (
      <View style={_styles.container}>
        <View style={_styles.fullScreen}>
          <View style={_styles.backgroundContent} />
          <View style={_styles.backgroundTip} />
        </View>
        {this._renderOnboardingPages()}
        {this._renderControls()}
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  backgroundContent: {
    flex: 2,
  },
  backgroundTip: {
    backgroundColor: Constants.Colors.darkMoreTransparentBackground,
    flex: 1,
  },
  button: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
    margin: Constants.Sizes.Margins.Expanded,
  },
  buttonContainer: {
    backgroundColor: Constants.Colors.black,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  container: {
    backgroundColor: Constants.Colors.primaryBackground,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  contentSpace: {
    alignItems: 'center',
    flex: 2,
    justifyContent: 'center',
  },
  controlContainer: {
    flexDirection: 'column',
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
  },
  pageDescription: {
    backgroundColor: 'transparent',
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
    marginBottom: Constants.Sizes.Margins.Regular,
    marginLeft: Constants.Sizes.Margins.Regular,
    marginRight: Constants.Sizes.Margins.Regular,
    textAlign: 'center',
  },
  pageTitle: {
    backgroundColor: 'transparent',
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Subtitle,
    margin: Constants.Sizes.Margins.Regular,
    textAlign: 'center',
  },
  positionIndicator: {
    flexDirection: 'row',
  },
  positionIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    margin: Constants.Sizes.Margins.Regular,
  },
  positionIndicatorDot: {
    backgroundColor: Constants.Colors.tertiaryBackground,
    borderRadius: Constants.Sizes.Margins.Regular,
    height: Constants.Sizes.Margins.Regular,
    margin: Constants.Sizes.Margins.Regular,
    width: Constants.Sizes.Margins.Regular,
  },
  tipSpace: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  transparent: {
    color: Constants.Colors.secondaryWhiteText,
  },
});

const mapStateToProps = (store: Store): any => {
  return {
    language: store.config.options.language,
  };
};

export default connect(mapStateToProps)(Onboarding) as any;
