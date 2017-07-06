# Campus Guide

[![Build status](https://travis-ci.org/josephroque/campus-guide.svg?branch=master)](https://travis-ci.org/josephroque/campus-guide)
[![Dependency Status](https://david-dm.org/josephroque/campus-guide.svg)](https://david-dm.org/josephroque/campus-guide)
[![devDependency Status](https://david-dm.org/josephroque/campus-guide/dev-status.svg)](https://david-dm.org/josephroque/campus-guide?type=dev)
[![codecov](https://codecov.io/gh/josephroque/campus-guide/branch/master/graph/badge.svg)](https://codecov.io/gh/josephroque/campus-guide)


A mobile app, developed with React Native, to help students of the University of Ottawa find their classes on campus.

## Contributing

### Setup

1. Clone the repository: `git clone https://github.com/josephroque/campus-guide``
2. Make your changes.
3. Ensure the following requirements for a contribution are met when running these commands:
    - `yarn run lint`: There should be no errors (warnings are OK).
    - `yarn test`: All tests should pass.
    - If you create any utility methods or files (src/util), ensure there are tests.

### Travis CI

Travis CI runs the following commands, which must succeed in order for your changes to be accepted:

- `yarn run lint`
- `yarn run test`

## Design

| Splash Screen | Finding a class | Your schedule |
|:-------------:|:---------------:|:-------------:|
| <img src='./screenshots/design_splash.png' width='220' alt='Splash design'/> | <img src='./screenshots/design_find.png' width='220' alt='Find design'/> | <img src='./screenshots/design_schedule.png' width='220' alt='Schedule design'/> |

| Discover | Search | Settings |
|:--------:|:------:|:--------:|
| <img src='./screenshots/design_discover.png' width='220' alt='Discover design'/> | <img src='./screenshots/design_search.png' width='220' alt='Search design'/> | <img src='./screenshots/design_settings.png' width='220' alt='Settings design'/> |

## Current screenshots

*As of March 21, 2017*

| Splash Screen | Finding a class | Your schedule |
|:-------------:|:---------------:|:-------------:|
| <img src='./screenshots/screen_pre_splash.png' width='220' alt='Prerelease splash'/> | <img src='./screenshots/screen_pre_find.png' width='220' alt='Prerelease find'/> | <img src='./screenshots/screen_pre_schedule.png' width='220' alt='Prerelease schedule'/> |

| Discover | Search | Settings |
|:--------:|:------:|:--------:|
| <img src='./screenshots/screen_pre_discover.png' width='220' alt='Prerelease discover'/> | <img src='./screenshots/screen_pre_search.png' width='220' alt='Prerelease search'/> | <img src='./screenshots/screen_pre_settings.png' width='220' alt='Prerelease settings'/> |

## License

```
Copyright 2016-2017 Joseph Roque

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
