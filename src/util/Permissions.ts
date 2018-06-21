/**
 *
 * @license
 * Copyright (C) 2018 Joseph Roque
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
 * @created 2018-01-25
 * @file Permissions.ts
 * @description Manage Android and iOS permissions.
 */
'use strict';

// Imports
import {
  PermissionsAndroidStatic,
  PlatformOSType,
} from 'react-native';

import * as Translations from './Translations';

/**
 * Request the user's location.
 *
 * @param {PlatformOSType} os the user's OS
 * @returns {Promise<boolean>} true if the permission was granted, false otherwise
 */
export async function requestLocationPermission(
    os: PlatformOSType,
    PermissionsAndroid: PermissionsAndroidStatic | undefined): Promise<boolean> {
  if (os === 'ios') {
    return true;
  }

  try {
    if (PermissionsAndroid !== undefined) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          message: Translations.get('location_permission_msg'),
          title: Translations.get('location_permission_title'),
        }
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      throw new Error('PermissionsAndroid not available.');
    }
  } catch (err) {
    throw err;
  }
}
