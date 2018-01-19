/**
 *
 * @license
 * Copyright (C) 2017 Joseph Roque
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
  Platform,
  ScaledSize,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Redux imports
import { connect } from 'react-redux';
import * as actions from '../../actions';

// Imports
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import TabBar from '../../components/TabBar';
import * as Constants from '../../constants';
import * as Translations from '../../util/Translations';

// Types
import { Store } from '../../store/configureStore';
import { Language } from '../../util/Translations';

interface Props {
  language: Language;                       // Language currently selected by user
  navigator: any;                           // Parent navigator
  finishIntroTour(skipped: boolean): void;  // Finished showing the intro tour, so it can be shown again
}

interface State {
  animationFrame: number; // Frame of the animation
  currentPage: number;    // Active onboarding page
  screenHeight: number;   // Active width of the screen
  screenWidth: number;    // Active width of the screen
}

// A page for onboarding
interface OnboardingPage {
  description: string;  // Description of the onboarding page, to be translated
  title: string;        // Title of the onboarding page, to be translated
  view(): JSX.Element;  // Main view for the page
}

// Active opacity for onboarding pages
const ACTIVE_PAGE_OPACITY = 1;

// Inactive opacity for onboarding pages
const INACTIVE_PAGE_OPACITY = 0.4;

// Onboarding navigation row details
const NAVIGATION_ROWS = [
  {
    icon: 'my-location',
    text: 'onboarding_start_here',
  },
  {
    icon: 'directions',
    text: 'onboarding_follow_the_directions',
  },
  {
    icon: 'place',
    text: 'onboarding_arrive',
  },
];

// Discover icons
const DISCOVER_ICON_ROWS = [
  [ 'book', 'hotel', 'computer' ],
  [ 'link', 'local-library', 'error' ],
  [ 'directions-bus', 'store', 'group'],
];
const totalDiscoverIcons = DISCOVER_ICON_ROWS.length * DISCOVER_ICON_ROWS[0].length;

// Settings
const SETTING_ROWS = [
  'onboarding_bilingual',
  'onboarding_accessible',
  'onboarding_support',
];

// Stop the animation from running indefinitely
const MAX_ANIMATION_FRAMES = NAVIGATION_ROWS.length * totalDiscoverIcons * SETTING_ROWS.length;

class Onboarding extends React.PureComponent<Props, State> {

  /** ID of animation timer. */
  _animationTimer: number = 0;

  /** When true, Prev and Next button presses should be ignored. */
  _ignoreButtons: boolean = false;

  /** The set of pages for onboarding */
  _onboardingPages: OnboardingPage[] = [
    {
      description: 'onboarding_general_description',
      title: 'onboarding_general_title',
      view: (): JSX.Element => (
        <TabBar activeTab={this.state.animationFrame % Constants.Tabs.length} />
      ),
    },
    {
      description: 'onboarding_navigation_description',
      title: 'onboarding_navigation_title',
      view: (): JSX.Element => {
        const textWidth = { width: this.state.screenWidth };

        return (
          <View>
            {NAVIGATION_ROWS.map((row: { icon: string; text: string}, index: number) => (
              <View key={row.text}>
                <View style={[
                    _styles.navigationRow,
                    textWidth,
                    this.state.animationFrame % NAVIGATION_ROWS.length === index ? _styles.highlightedRow : {},
                  ]}>
                  <MaterialIcons
                      color={Constants.Colors.primaryWhiteIcon}
                      name={row.icon}
                      size={Constants.Sizes.Icons.Medium} />
                  <Text style={_styles.navigationText}>{Translations.get(row.text)}</Text>
                </View>
                { index !== NAVIGATION_ROWS.length - 1 ? <View style={_styles.navigationDivider} /> : undefined}
              </View>
            ))}
          </View>
        );
      },
    },
    {
      description: 'onboarding_discover_description',
      title: 'onboarding_discover_title',
      view: (): JSX.Element => (
        <View>
          {DISCOVER_ICON_ROWS.map((row: string[], rowIndex: number) => (
            <View key={row.join()} style={_styles.discoverRow}>
              {row.map((icon: string, iconIndex: number) => (
                <MaterialIcons
                    color={this.state.animationFrame % totalDiscoverIcons === rowIndex * row.length + iconIndex
                        ? Constants.Colors.primaryWhiteIcon
                        : Constants.Colors.secondaryWhiteIcon}
                    key={icon}
                    name={icon}
                    size={Constants.Sizes.Icons.Large}
                    style={_styles.discoverIcon} />
              ))}
            </View>
          ))}
        </View>
      ),
    },
    {
      description: 'onboarding_settings_description',
      title: 'onboarding_settings_title',
      view: (): JSX.Element => {
        const rowWidth = { width: this.state.screenWidth };

        return (
          <View>
            {SETTING_ROWS.map((setting: string, index: number) => {

              return (
                <View key={setting}>
                  <View style={[
                      _styles.settingRow,
                      rowWidth,
                      this.state.animationFrame % SETTING_ROWS.length === index ? _styles.highlightedRow : {},
                    ]}>
                    <Text style={_styles.settingText}>{Translations.get(setting)}</Text>
                    <Switch
                        disabled={true}
                        value={true} />
                  </View>
                  { index !== SETTING_ROWS.length - 1 ? <View style={_styles.settingDivider} /> : undefined}
                </View>
              );
            })}
          </View>
        );
      },
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
      this._ignoreButtons = Platform.OS !== 'android'; // TODO: only works for iOS
    }
  }

  /** Scroll to next screen. */
  _nextScreen = (): void => {
    if (this.state.currentPage === this._onboardingPages.length - 1) {
      this._popOrPushToMain(false);
    } else {
      if (this._ignoreButtons) {
        return;
      }

      const nextPage = Math.min(this.state.currentPage + 1, this._onboardingPages.length - 1);
      if (nextPage !== this.state.currentPage) {
        this._animateScrollViewToPage(nextPage);
        this.setState({ currentPage: nextPage });
        this._ignoreButtons = Platform.OS !== 'android'; // TODO: only works for iOS
      }
    }
  }

  /** End onboarding prematurely. */
  _skipOnboarding = (): void => this._popOrPushToMain(true);

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
   * Advance the animation.
   */
  _nextAnimationFrame = (): void => {
    const nextFrame = this.state.animationFrame + 1;
    if (nextFrame <= MAX_ANIMATION_FRAMES) {
      this.setState({ animationFrame: this.state.animationFrame + 1 });
      this._animationTimer = setTimeout(this._nextAnimationFrame, Constants.Time.MILLISECONDS_IN_SECOND / 2);
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
      animationFrame: 0,
      currentPage: 0,
      screenHeight: screenDimensions.height,
      screenWidth: screenDimensions.width,
    };
  }

  /**
   * Start an animation timer.
   */
  componentDidMount(): void {
    this._animationTimer = setTimeout(this._nextAnimationFrame, Constants.Time.MILLISECONDS_IN_SECOND / 2);
  }

  /**
   * Clear the animation timer.
   */
  componentWillUnmount(): void {
    clearTimeout(this._animationTimer);
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
   *
   * @param {boolean} skipped true if the user skipped the tour, false otherwise
   */
  _popOrPushToMain(skipped: boolean): void {
    this.props.finishIntroTour(skipped);

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
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
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
                    { opacity: index === this.state.currentPage ? ACTIVE_PAGE_OPACITY : INACTIVE_PAGE_OPACITY },
                  ]} />
            ))}
          </View>
        </View>
        <View style={_styles.buttonContainer}>
          <TouchableOpacity onPress={this._previousScreen}>
            <Text style={[ _styles.button, { opacity: this.state.currentPage !== 0 ? 1 : 0 }]}>
              {Translations.get('prev')}
            </Text>
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
    backgroundColor: 'transparent',
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
    margin: Constants.Sizes.Margins.Expanded,
  },
  buttonContainer: {
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
    margin: Constants.Sizes.Margins.Regular,
  },
  controlContainer: {
    flexDirection: 'column',
  },
  discoverIcon: {
    margin: Constants.Sizes.Margins.Expanded,
  },
  discoverRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
  },
  highlightedRow: {
    backgroundColor: Constants.Colors.darkMoreTransparentBackground,
  },
  navigationDivider: {
    backgroundColor: Constants.Colors.tertiaryBackground,
    height: StyleSheet.hairlineWidth,
    marginLeft: Constants.Sizes.Margins.Expanded,
  },
  navigationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingLeft: Constants.Sizes.Margins.Expanded,
    paddingRight: Constants.Sizes.Margins.Expanded,
  },
  navigationText: {
    backgroundColor: 'transparent',
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Subtitle,
    marginBottom: Constants.Sizes.Margins.Expanded,
    marginLeft: Constants.Sizes.Margins.Regular,
    marginTop: Constants.Sizes.Margins.Expanded,
  },
  pageDescription: {
    backgroundColor: 'transparent',
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
    marginLeft: Constants.Sizes.Margins.Regular,
    marginRight: Constants.Sizes.Margins.Regular,
    textAlign: 'center',
  },
  pageTitle: {
    backgroundColor: 'transparent',
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Subtitle,
    marginBottom: Constants.Sizes.Margins.Regular,
    marginLeft: Constants.Sizes.Margins.Regular,
    marginRight: Constants.Sizes.Margins.Regular,
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
  settingDivider: {
    backgroundColor: Constants.Colors.tertiaryBackground,
    height: StyleSheet.hairlineWidth,
    marginLeft: Constants.Sizes.Margins.Expanded,
  },
  settingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: Constants.Sizes.Margins.Expanded,
    paddingRight: Constants.Sizes.Margins.Expanded,
  },
  settingSwitch: {
    marginBottom: Constants.Sizes.Margins.Expanded,
    marginTop: Constants.Sizes.Margins.Expanded,
  },
  settingText: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Subtitle,
    marginBottom: Constants.Sizes.Margins.Expanded,
    marginTop: Constants.Sizes.Margins.Expanded,
  },
  tipSpace: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    margin: Constants.Sizes.Margins.Regular,
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

const mapDispatchToProps = (dispatch: any): any => {
  return {
    finishIntroTour: (skipped: boolean): any => dispatch(actions.showIntroTour(false, skipped)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Onboarding) as any;
