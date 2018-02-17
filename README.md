# Campus Guide

[![Build status](https://travis-ci.org/josephroqueca/campus-guide.svg?branch=master)](https://travis-ci.org/josephroqueca/campus-guide)
[![Dependency Status](https://david-dm.org/josephroqueca/campus-guide.svg)](https://david-dm.org/josephroqueca/campus-guide)
[![devDependency Status](https://david-dm.org/josephroqueca/campus-guide/dev-status.svg)](https://david-dm.org/josephroqueca/campus-guide?type=dev)
[![codecov](https://codecov.io/gh/josephroqueca/campus-guide/branch/master/graph/badge.svg)](https://codecov.io/gh/josephroqueca/campus-guide)


A mobile app, developed with React Native, to help students of the University of Ottawa find their classes on campus.

## Contributing

### Setup

1. Clone the repository: `git clone https://github.com/josephroqueca/campus-guide``
2. Make your changes.
3. Ensure the following requirements for a contribution are met when running these commands:
    - `yarn run lint`: There should be no errors (warnings are OK).
    - `yarn test`: All tests should pass.
    - If you create any utility methods or files (src/util), ensure there are tests.

### Travis CI

Travis CI runs the following commands, which must succeed in order for your changes to be accepted:

- `yarn run lint`
- `yarn run test`

## Screenshots

*As of January 20, 2018*

### Android

| Splash Screen | Finding a class | Your schedule |
|:-------------:|:---------------:|:-------------:|
| <img src='./screenshots/android/language.png' width='220' alt='Android language selection'/> | <img src='./screenshots/android/find.png' width='220' alt='Android find screen'/> | <img src='./screenshots/android/schedule.png' width='220' alt='Android schedule screen'/> |

| Discover | Search | Settings |
|:--------:|:------:|:--------:|
| <img src='./screenshots/android/discover.png' width='220' alt='Android discover screen'/> | <img src='./screenshots/android/search.png' width='220' alt='Android search screen'/> | <img src='./screenshots/android/settings.png' width='220' alt='Android settings screen'/> |

### iOS


| Splash Screen | Finding a class | Your schedule |
|:-------------:|:---------------:|:-------------:|
| <img src='./screenshots/ios/language.png' width='220' alt='iOS language selection'/> | <img src='./screenshots/ios/find.png' width='220' alt='iOS find screen'/> | <img src='./screenshots/ios/schedule.png' width='220' alt='iOS schedule screen'/> |

| Discover | Search | Settings |
|:--------:|:------:|:--------:|
| <img src='./screenshots/ios/discover.png' width='220' alt='iOS discover screen'/> | <img src='./screenshots/ios/search.png' width='220' alt='iOS search screen'/> | <img src='./screenshots/ios/settings.png' width='220' alt='iOS settings screen'/> |

## License

```
Copyright 2016-2018 Joseph Roque

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
