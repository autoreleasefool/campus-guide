/*
 * Root entry view for application.
 */
'use strict';

// React imports
const React = require('react-native');
const {
  Component,
  Navigator,
  View,
} = React;

const Constants = require('./Constants');
const MainScreen = require('./views/Main');
const Orientation = require('react-native-orientation');
const SplashScreen = require('./views/Splash');

class CampusGuide extends Component {

  /*
   * Pass props.
   */
  constructor(props) {
    super(props);

    // Explicitly binding 'this' to all methods that need it
    // TODO: remove if binding not needed
    // this._configureScene = this._configureScene.bind(this);
    // this._renderScene = this._renderScene.bind(this);
  };

  /*
   * Defines the transition between views.
   */
  _configureScene() {
    return ({
      ...Navigator.SceneConfigs.HorizontalSwipeJump,
      gestures: false,
    });
  };

  /*
   * Renders a different view based on the current navigator route.
   */
  _renderScene(route, navigator) {
    if (route.id === Constants.Views.Splash) {
      return <SplashScreen navigator={navigator} />
    } else if (route.id === Constants.Views.Main) {
      return <MainScreen navigator={navigator} />
    }
  };

  /*
   * Locks the application to portrait orientation.
   */
  componentDidMount() {
    Orientation.lockToPortrait();
  };

  /*
   * Renders the root navigator of the app to switch between the splash screen and main screen.
   */
  render() {
    return (
      <Navigator
          configureScene={this._configureScene}
          initialRoute={{id: 1}}
          renderScene={this._renderScene} />
    );
  };
};

// Expose component to app
module.exports = CampusGuide;
