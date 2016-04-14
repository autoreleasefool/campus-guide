/*
 * Displays a title, an image, and text to the user. These details can be provided so the component can be used
 * multiple times.
 */
'use strict';

const React = require('react-native');
const {
  Component,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} = React;

const Constants = require('../Constants');
const DisplayUtils = require('../util/DisplayUtils');
const SectionHeader = require('./SectionHeader');
const Styles = require('../Styles');

class DetailsScreen extends Component {

  /*
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    title: React.PropTypes.string,
    image: React.PropTypes.any,
    text: React.PropTypes.array,
    backgroundColor: React.PropTypes.string,
  };

  /*
   * Pass props and declares initial state.
   */
  constructor(props) {
    super(props);
  };

  render() {
    let backgroundColor = this.props.backgroundColor || Constants.Colors.garnet;

    let banner = null;
    if (this.props.image) {
      if (this.props.title) {
        banner = (
          <View style={_styles.banner}>
            <Image
                resizeMode={'cover'}
                source={this.props.image}
                style={_styles.bannerImage} />
            <View style={_styles.bannerTextContainer}>
              <Text style={[_styles.bannerText, Styles.titleText]}>
                {this.props.title}
              </Text>
            </View>
          </View>
        );
      } else {
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
      banner = (
        <SectionHeader sectionName={this.props.title} />
      );
    }

    let details = null;
    if (this.props.text) {
      let textColor = DisplayUtils.isColorDark(backgroundColor)
          ? Constants.Colors.primaryWhiteText
          : Constants.Colors.primaryBlackText;
      details = (
        <ScrollView style={_styles.scrollview}>
          {this.props.text.map((text, index) => (
            <Text key={index} style={[Styles.mediumText, _styles.text, {color: textColor}]}>
              {text}
            </Text>
          ))}
        </ScrollView>
      );
    }

    return (
      <View style={{flex: 1, backgroundColor: backgroundColor}}>
        {banner}
        {details}
      </View>
    );
  }
};

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
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 20,
    marginRight: 20,
    color: Constants.Colors.primaryWhiteText,
  },
  scrollview: {
    flex: 1,
  },
  text: {
    margin: 10,
  },
});

// Expose module to app
module.exports = DetailsScreen;
