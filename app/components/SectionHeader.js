/*
 * Predefined style for section separating headers in the app.
 */
'use strict';

// React imports
var React = require('react-native');
var {
  Component,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} = React;

const Constants = require('../Constants');
const Ionicons = require('react-native-vector-icons/Ionicons');
const MaterialIcons = require('react-native-vector-icons/MaterialIcons');
const Styles = require('../Styles');
const TextUtils = require('../util/TextUtils');

// Represents a value in the subtitle which should not be used.
const NULL_SUBTITLE_VALUE = 'value_null';
// List of icon families that the subtitle icon can belong to.
const VALID_ICON_CLASSES = ['material', 'ionicon'];

class SectionHeader extends Component {

  /*
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    sectionName: React.PropTypes.string.isRequired,
    sectionIcon: React.PropTypes.string,
    sectionIconClass: React.PropTypes.oneOf(VALID_ICON_CLASSES),
    sectionIconOnClick: React.PropTypes.func,
    subtitleOnClick: React.PropTypes.func,
    subtitleName: React.PropTypes.string,
    subtitleIcon: React.PropTypes.string,
    subtitleIconClass: React.PropTypes.oneOf(VALID_ICON_CLASSES),
    backgroundOverride: React.PropTypes.string,
  };

  /*
   * Pass props and declares initial state.
   */
  constructor(props) {
    super(props);

    let sectIcon = this.props.sectionIcon || NULL_SUBTITLE_VALUE;
    let sectIconClass = this.props.sectionIconClass || NULL_SUBTITLE_VALUE;
    let subName = this.props.subtitleName || NULL_SUBTITLE_VALUE;
    let subIcon = this.props.subtitleIcon || NULL_SUBTITLE_VALUE;
    let subIconClass = this.props.subtitleIconClass || NULL_SUBTITLE_VALUE;

    this.state = {
      sectionIcon: sectIcon,
      sectionIconClass: sectIconClass,
      subtitleName: subName,
      subtitleIcon: subIcon,
      subtitleIconClass: subIconClass,
    };

    // Explicitly binding 'this' to all methods that need it
    this.getSubtitleName = this.getSubtitleName.bind(this);
    this.getSubtitleIcon = this.getSubtitleIcon.bind(this);
    this.getSubtitleIconClass = this.getSubtitleIconClass.bind(this);
    this.updateSubtitle = this.updateSubtitle.bind(this);
  };

  /*
   * Gets the subtitle of the header.
   */
  getSubtitleName() {
    return this.state.subtitleName;
  };

  /*
   * Gets the name of the icon on the subtitle.
   */
  getSubtitleIcon() {
    return this.state.subtitleIcon;
  };

  /*
   * Gets the string representation of the icon class.
   */
  getSubtitleIconClass() {
    return this.state.subtitleIconClass;
  };

  /*
   * Returns a value which can be used in updateSubtitle(name, icon, iconClass) to remove a subtitle value.
   */
  getEmptySubtitleValue() {
    return NULL_SUBTITLE_VALUE;
  };

  /*
   * Update properties of the subtitle in the header.
   */
  updateSubtitle(name, icon, iconClass) {
    if (VALID_ICON_CLASSES.indexOf(iconClass) < 0) {
      icon = iconClass = NULL_SUBTITLE_VALUE;
    }

    this.setState({
      subtitleName: name,
      subtitleIcon: icon,
      subtitleIconClass: iconClass,
    });
  };

  /*
   * Builds the components of the section header, including the title, icon, subtitle, and subtitle icon.
   */
  render() {
    let icon = null;
    let subtitleName = null;
    let subtitleIcon = null;

    // Build the icon for the section
    if (this.state.sectionIcon !== NULL_SUBTITLE_VALUE && this.state.sectionIconClass !== NULL_SUBTITLE_VALUE) {
      if (this.state.sectionIconClass === 'material') {
        icon = (
          <MaterialIcons
              name={this.state.sectionIcon}
              size={24}
              color={'white'}
              style={_styles.headerIcon} />
        );
      } else {
        icon = (
          <Ionicons
              name={this.state.sectionIcon}
              size={24}
              color={'white'}
              style={_styles.headerIcon} />
        );
      }

      if (this.props.sectionIconOnClick) {
        icon = (
          <TouchableOpacity onPress={this.props.sectionIconOnClick}>
            {icon}
          </TouchableOpacity>
        );
      }
    }

    // Build the subtitle for the section
    if (this.state.subtitleName !== NULL_SUBTITLE_VALUE) {
      subtitleName = (
        <Text style={[Styles.smallText, {color: 'white', marginTop: 17, marginBottom: 16, marginLeft: 20, marginRight: 20}]}>
          {this.state.subtitleName.toUpperCase()}
        </Text>
      );
    }

    // Build the icon for the subtitle
    if (this.state.subtitleIcon !== NULL_SUBTITLE_VALUE && this.state.subtitleIconClass !== NULL_SUBTITLE_VALUE) {
      if (this.state.subtitleIconClass === 'material') {
        subtitleIcon = (
          <MaterialIcons
              name={this.state.subtitleIcon}
              size={18}
              color={'white'}
              style={{marginTop: 15, marginBottom: 15, marginRight: 20}} />
        );
      } else {
        subtitleIcon = (
          <Ionicons
              name={this.state.subtitleIcon}
              size={18}
              color={'white'}
              style={{marginTop: 15, marginBottom: 15, marginRight: 20}} />
        );
      }
    }

    // Combine the subtitle name and icon
    let iconAndSubtitle = null;
    if (subtitleName !== null || subtitleIcon !== null) {
      if (this.props.subtitleOnClick) {
        iconAndSubtitle = (
          <TouchableOpacity
              onPress={this.props.subtitleOnClick}
              activeOpacity={0.4}
              style={_styles.iconAndSubtitle}>
            {subtitleName}
            {subtitleIcon}
          </TouchableOpacity>
        )
      } else {
        iconAndSubtitle = (
          <View style={_styles.iconAndSubtitle}>
            {subtitleName}
            {subtitleIcon}
          </View>
        )
      }
    }

    // Set the background color of the header to a default value if not provided
    let headerBackground = this.props.backgroundOverride || Constants.Colors.defaultComponentBackgroundColor;

    return (
      <View style={[_styles.header, {backgroundColor: headerBackground}]}>
        {icon}
        <Text style={[Styles.largeText, {color: 'white', marginLeft: 20}]}>
          {TextUtils.getTextWithEllipses(this.props.sectionName, 21)}
        </Text>
        {iconAndSubtitle}
      </View>
    );
  };
};

// Private styles for component
const _styles = StyleSheet.create({
  header: {
    height: 50,
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerIcon: {
    marginLeft: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  iconAndSubtitle: {
    position: 'absolute',
    right: 0,
    flex: 1,
    flexDirection: 'row',
  },
});

// Expose component to app
module.exports = SectionHeader;
