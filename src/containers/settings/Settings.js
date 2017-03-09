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
 * @created 2016-11-6
 * @file Settings.js
 * @description View to allow the user to see and update their settings and preferences.
 *
 * @flow
 */
'use strict';

// React imports
import React from 'react';
import {
  Alert,
  Clipboard,
  Linking,
  ListView,
  Modal,
  Platform,
  SectionList,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Redux imports
import { connect } from 'react-redux';
import * as actions from 'actions';

// Types
import type { ConfigurationOptions, Language, Section, Semester, Setting, TimeFormat } from 'types';

// Type definition for component props.
type Props = {
  currentSemester: number,                                // The current semester, selected by the user
  language: Language,                                     // The current language, selected by the user
  prefersWheelchair: boolean,                             // Whether the user prefers wheelchair accessible routes
  semesters: Array < Semester >,                          // Semesters available at the university
  timeFormat: TimeFormat,                                 // The user's preferred time format
  updateConfiguration: (o: ConfigurationOptions) => void, // Update the global configuration state
};

// Type definition for component state.
type State = {
  loaded: boolean,                          // Indicates if the settings have been loaded
  listModalDataSource: ListView.DataSource, // List of data to display in modal
  listModalTitle: string,                   // Title of the list view modal
  listModalVisible: boolean,                // Indicates if the list modal should be visible
};

// Imports
import DeviceInfo from 'react-native-device-info';
import Header from 'Header';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Separator from './components/Separator';
import * as Configuration from 'Configuration';
import * as Constants from 'Constants';
import * as DisplayUtils from 'DisplayUtils';
import * as ExternalUtils from 'ExternalUtils';
import * as TextUtils from 'TextUtils';
import * as TranslationUtils from 'TranslationUtils';

// Modal padding on iOS
const HEADER_PADDING_IOS: number = 25;

// Default opacity for tap when setting is not a boolean
const DEFAULT_OPACITY: number = 0.4;

class Settings extends React.Component {

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
    this.state = {
      loaded: false,
      listModalDataSource: new ListView.DataSource({
        rowHasChanged: (r1: any, r2: any) => r1 !== r2,
        sectionHeaderHasChanged: (s1: any, s2: any) => s1 !== s2,
      }),
      listModalTitle: '',
      listModalVisible: false,
    };
  }

  /**
   * Loads the settings once the view has been mounted.
   */
  componentDidMount(): void {
    Configuration.init()
        .then(() => TranslationUtils.loadTranslations('en'))
        .then(() => TranslationUtils.loadTranslations('fr'))
        .then(() => Configuration.getConfig('/settings.json'))
        .then((settingSections: Object) => {
          const totalSections = settingSections.length;
          for (let i = 0; i < totalSections; i++) {
            const section = settingSections[i];
            const totalRows = section.data.length;
            for (let j = 0; j < totalRows; j++) {
              const row = section.data[j];
              this._settingsCache[row.key] = this._getSetting(row.key);
            }
          }

          this._settingsSections = settingSections;
          this.setState({ loaded: true });
        })
        .catch((err: any) => console.error('Configuration could not be initialized for settings.', err));
  }

  /**
   * Unloads the unused language.
   */
  componentWillUnmount(): void {
    TranslationUtils.unloadTranslations(this.props.language === 'en' ? 'fr' : 'en');
  }

  /** List of sections of settings to render. */
  _settingSections: Array < Section < Setting > >;

  /** Cache of settings values to retrieve and update them quickly. */
  _settingsCache: Object = {};

  /**
   * Returns true if the current value of a setting does not match its cached value, and updates the cached value if so.
   *
   * @param {string} key identifier for the setting to check
   * @returns {boolean} true if the value in the cache was updated.
   */
  _checkChangedSetting(key: string): boolean {
    const settingValue = this._getSetting(key);
    const changed = this._settingsCache[key] !== settingValue;

    if (changed) {
      this._settingsCache[key] = settingValue;
    }

    return changed;
  }

  /**
   * Closes all modals.
   */
  _closeModal(): void {
    this.setState({
      listModalDataSource: this.state.listModalDataSource.cloneWithRowsAndSections({}),
      listModalVisible: false,
    });
  }

  /**
   * Returns the value of a setting based on the provided key. The returned value may be a string, boolean, integer,
   * or object, and should correspond to the type of the setting.
   *
   * @param {string} key the setting value to return.
   * @returns {any} the value of the setting corresponding to {key}, or null.
   */
  _getSetting(key: string): any {
    switch (key) {
      case 'pref_lang':
        return (this.props.language === 'en')
          ? 'English'
          : 'Français';
      case 'pref_wheel':
        return this.props.prefersWheelchair;
      case 'pref_semester': {
        const semester = this.props.semesters[this.props.currentSemester];
        return TranslationUtils.getTranslatedName(this.props.language, semester);
      }
      case 'pref_time_format':
        return this.props.timeFormat;
      case 'app_version':
        return DeviceInfo.getVersion();
      default:
        return null;
    }
  }

  /**
   * Checks if a setting has changed and if the item should update.
   *
   * @param {Object} prevProps old item properties
   * @param {Object} nextProps new item properties
   * @returns {boolean} true if the setting has changed and the item should be re-rendered
   */
  _shouldItemUpdate(prevProps: Object, nextProps: Object): boolean {
    return this._checkChangedSetting(nextProps.item.key);
  }

  /**
   * Updates the setting for the row pressed.
   *
   * @param {Object} setting   setting that was pressed
   * @param {Object} tappedRow indicates if the row was tapped, or another area
   */
  _onPressRow(setting: Object, tappedRow: boolean): void {
    if (setting.type === 'boolean' && tappedRow) {
      // Ignore boolean settings, they can only be manipulated by switch
      return;
    } else if (setting.type === 'link' && setting.key != 'app_open_source') {
      // Get current language for translations
      const Translations: Object = TranslationUtils.getTranslations(this.props.language);

      // Open the provided link
      const link = TranslationUtils.getTranslatedVariant(this.props.language, 'link', setting);
      ExternalUtils.openLink(
        link || ExternalUtils.getDefaultLink(),
        Translations,
        Linking,
        Alert,
        Clipboard,
        TextUtils,
      );
      return;
    }

    if (setting.key === 'pref_lang') {
      this.props.updateConfiguration({ language: this.props.language === 'en' ? 'fr' : 'en' });
    } else if (setting.key === 'pref_wheel') {
      this.props.updateConfiguration({ prefersWheelchair: !this.props.prefersWheelchair });
    } else if (setting.key === 'pref_semester') {
      let nextSemester = this.props.currentSemester + 1;
      if (nextSemester >= this.props.semesters.length) {
        nextSemester = 0;
      }
      this.props.updateConfiguration({ currentSemester: nextSemester });
    } else if (setting.key === 'pref_time_format') {
      this.props.updateConfiguration({ preferredTimeFormat: this.props.timeFormat === '12h' ? '24h' : '12h' });
    } else if (setting.key === 'app_open_source') {
      const licenses = require('../../../assets/json/licenses.json');
      this.setState({
        listModalDataSource: this.state.listModalDataSource.cloneWithRowsAndSections(licenses),
        listModalTitle: TranslationUtils.getTranslatedName(this.props.language, setting) || '',
        listModalVisible: true,
      });
    }
  }

  /**
   * Renders a button to close modals.
   *
   * @returns {ReactElement<any>} view to close modal
   */
  _renderCloseModalButton(): ReactElement < any > {
    // Get current language for translations
    const Translations: Object = TranslationUtils.getTranslations(this.props.language);

    return (
      <View style={_styles.modalCloseContainer}>
        <TouchableOpacity onPress={this._closeModal.bind(this)}>
          <Text style={_styles.modalCloseText}>{Translations.done}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /**
   * Renders content for the list view modal.
   *
   * @returns {ReactElement<any>} a list view with the rows and sections loaded
   */
  _renderListModal(): ReactElement < any > {
    let title = null;
    if (this.state.listModalTitle.length > 0) {
      title = (
        <View style={[ _styles.setting, _styles.modalListTitle ]}>
          <Text style={[ _styles.settingText, _styles.modalListTitleText ]}>{this.state.listModalTitle}</Text>
        </View>
      );
    }

    return (
      <View style={[ _styles.container, { backgroundColor: Constants.Colors.primaryBackground }]}>
        {title}
        <ListView
            dataSource={this.state.listModalDataSource}
            renderRow={this._renderListModalRow.bind(this)}
            renderSectionHeader={this._renderListModalSectionHeader.bind(this)}
            style={_styles.modalListView} />
        {this._renderCloseModalButton()}
      </View>
    );
  }

  /**
   * Displays a single row, representing an item in the list view.
   *
   * @param {string} item text to be rendered
   * @returns {ReactElement<any>} views to render the setting in the list
   */
  _renderListModalRow(item: string): ReactElement < any > {
    return (
      <Text style={_styles.modalListViewText}>{item}</Text>
    );
  }

  /**
   * Renders a heading for a section in the modal's list view.
   *
   * @param {Object} sectionData section contents
   * @param {string} sectionName index of the section
   * @returns {ReactElement<any>} a {SectionHeader} with the name of the section
   */
  _renderListModalSectionHeader(sectionData: Object, sectionName: string): ReactElement < any > {
    return (
      <View style={_styles.modalListViewHeader}>
        <Header title={sectionName} />
      </View>
    );
  }

  /**
   * Displays a single item, representing a setting which can be changed.
   *
   * @param {Object} setting defines the setting contents to render
   * @returns {ReactElement<any>} views to render the setting in the list
   */
  _renderItem({ item }: { item: Setting }): ReactElement < any > {
    let content = null;
    if (item.type === 'multi' || item.type === 'text') {
      content = (
        <View style={_styles.settingContent}>
          <Text style={_styles.settingValue}>{this._getSetting(item.key)}</Text>
        </View>
      );
    } else if (item.type === 'boolean') {
      content = (
        <View style={_styles.settingContent}>
          <Switch
              value={this._getSetting(item.key)}
              onValueChange={() => this._onPressRow(item, false)} />
        </View>
      );
    } else if (item.type === 'link') {
      const icon = DisplayUtils.getPlatformIcon(Platform.OS, item);
      if (icon != null) {
        content = (
          <View style={_styles.settingContent}>
            {icon.class === 'ionicon'
              ? <Ionicons
                  color={Constants.Colors.primaryBlackIcon}
                  name={icon.name}
                  size={Constants.Sizes.Icons.Medium} />
              : <MaterialIcons
                  color={Constants.Colors.primaryBlackIcon}
                  name={icon.name}
                  size={Constants.Sizes.Icons.Medium} />}
          </View>
        );
      }
    }

    return (
      <View style={_styles.settingContainer}>
        <TouchableOpacity
            activeOpacity={item.type === 'boolean' ? 1 : DEFAULT_OPACITY}
            onPress={this._onPressRow.bind(this, item, true)}>
          <View style={_styles.setting}>
            <Text style={_styles.settingText}>{TranslationUtils.getTranslatedName(this.props.language, item)}</Text>
            {content}
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  /**
   * Renders a heading for a section of settings.
   *
   * @param {Object} sectionData section contents
   * @param {string} sectionName index of the section
   * @returns {ReactElement<any>} a {SectionHeader} with the name of the section
   */
  _renderSectionHeader({ section }: { section: Section }): ReactElement < any > {
    const colonIndex: number = section.key.indexOf(':');
    let sectionNameTranslated = section.key;
    if (colonIndex > -1) {
      if (this.props.language === 'en') {
        sectionNameTranslated = section.key.substring(0, colonIndex);
      } else {
        sectionNameTranslated = section.key.substring(colonIndex + 1);
      }
    }

    return (
      <Header
          backgroundColor={Constants.Colors.lightGrey}
          title={sectionNameTranslated} />
    );
  }

  /**
   * Displays a list of settings.
   *
   * @returns {ReactElement<any>} the hierarchy of views to render
   */
  render(): ReactElement < any > {
    return (
      <View style={_styles.container}>
        <Modal
            animationType={'slide'}
            transparent={false}
            visible={this.state.listModalVisible}
            onRequestClose={this._closeModal.bind(this)}>
          {this._renderListModal()}
        </Modal>
        <SectionList
            SeparatorComponent={Separator}
            renderItem={this._renderItem.bind(this)}
            renderSectionHeader={this._renderSectionHeader.bind(this)}
            sections={this._settingSections} />
      </View>
    );
  }
}

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.Colors.polarGrey,
  },
  settingContainer: {
    backgroundColor: Constants.Colors.secondaryBackground,
  },
  setting: {
    flexDirection: 'row',
    height: 50,
    alignItems: 'center',
    backgroundColor: Constants.Colors.polarGrey,
  },
  settingContent: {
    position: 'absolute',
    right: 20,
    height: 50,
    justifyContent: 'center',
  },
  settingText: {
    marginLeft: Constants.Sizes.Margins.Expanded,
    color: Constants.Colors.primaryBlackText,
    fontSize: Constants.Sizes.Text.Body,
  },
  settingValue: {
    color: Constants.Colors.primaryBlackText,
    fontSize: Constants.Sizes.Text.Body,
  },
  modalListView: {
    backgroundColor: Constants.Colors.secondaryBackground,
  },
  modalListViewHeader: {
    backgroundColor: Constants.Colors.secondaryBackground,
  },
  modalListViewText: {
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Caption,
    margin: Constants.Sizes.Margins.Regular,
  },
  modalListTitle: {
    marginTop: Platform.OS === 'ios' ? HEADER_PADDING_IOS : 0,
    backgroundColor: Constants.Colors.primaryBackground,
  },
  modalListTitleText: {
    color: Constants.Colors.primaryWhiteText,
  },
  modalCloseContainer: {
    backgroundColor: Constants.Colors.secondaryBackground,
    borderTopColor: Constants.Colors.darkTransparentBackground,
    borderTopWidth: StyleSheet.hairlineWidth,
    justifyContent: 'flex-end',
  },
  modalCloseText: {
    margin: Constants.Sizes.Margins.Expanded,
    color: Constants.Colors.primaryWhiteText,
    fontSize: Constants.Sizes.Text.Body,
    textAlign: 'right',
  },
});

const mapStateToProps = (store) => {
  return {
    currentSemester: store.config.options.currentSemester,
    language: store.config.options.language,
    prefersWheelchair: store.config.options.prefersWheelchair,
    semesters: store.config.options.semesters,
    timeFormat: store.config.options.preferredTimeFormat,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateConfiguration: (options: ConfigurationOptions) => dispatch(actions.updateConfiguration(options)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
