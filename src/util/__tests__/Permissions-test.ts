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
 * @created 2018-06-20
 * @file Permissions-test.ts
 * @description Test the permissions manager for the application.
 *
 */

// Imports
import * as Permissions from '../Permissions';

// Type imports
import { PermissionStatus } from 'react-native';

// PermissionsAndroid mock
const PermissionsAndroidMock: any = {
  PERMISSIONS: {
    ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
  },
  RESULTS: {
    DENIED: 'denied',
    GRANTED: 'granted',
    NEVER_ASK_AGAIN: 'never_ask_again',
  },
  request: jest.fn(async(): Promise<PermissionStatus> => {
    return permissionGranted;
  }),
};

// Indicates if the permission has been granted. Change to alter test expectations.
let permissionGranted: PermissionStatus = PermissionsAndroidMock.RESULTS.GRANTED;

describe('Permissions-test', () => {
  beforeEach(() => {
    permissionGranted = PermissionsAndroidMock.RESULTS.GRANTED;
  });

  it('tests that requesting permissions on iOS returns true', async() => {
    const permissionResult = await Permissions.requestLocationPermission('ios', PermissionsAndroidMock);
    expect(permissionResult).toBeTruthy();
    expect(PermissionsAndroidMock.request).not.toHaveBeenCalled();
  });

  it('tests that requesting permissions on Android performs request', async() => {
    const permissionResult = await Permissions.requestLocationPermission('android', PermissionsAndroidMock);
    expect(permissionResult).toBeTruthy();
    expect(PermissionsAndroidMock.request).toHaveBeenCalled();
  });

  it('tests that failed permissions requests return false', async() => {
    permissionGranted = PermissionsAndroidMock.RESULTS.DENIED;
    const permissionResult = await Permissions.requestLocationPermission('android', PermissionsAndroidMock);
    expect(permissionResult).toBeFalsy();
    expect(PermissionsAndroidMock.request).toHaveBeenCalled();
  });

  it('tests that invalid PermissionsAndroid is handled', async() => {
    (await expect(async() => await Permissions.requestLocationPermission('android', undefined))).rejects.toThrow();
  });
});