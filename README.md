# Campus Guide

[![Build status](https://travis-ci.org/joseph-roque/campus-guide.svg?branch=master)](https://travis-ci.org/joseph-roque/campus-guide)
[![Dependency Status](https://david-dm.org/joseph-roque/campus-guide.svg)](https://david-dm.org/joseph-roque/campus-guide)
[![devDependency Status](https://david-dm.org/joseph-roque/campus-guide/dev-status.svg)](https://david-dm.org/joseph-roque/campus-guide#info=devDependencies)
[![codecov](https://codecov.io/gh/joseph-roque/campus-guide/branch/master/graph/badge.svg)](https://codecov.io/gh/joseph-roque/campus-guide)


A mobile app, developed with React Native, to help students of the University of Ottawa find their classes on campus.

This app is currently in progress. You can follow its progress here, view some screenshots below, or look in `design` for some Illustrator files where many designs of the app exist.

While the app is in development, all of the data collected about the University of Ottawa, the courses, and the buildings, will be kept in a separate repository. When the app is released, expect that data to be documented and open sourced alongside this application.

## Contributing

### Setup

1. Clone the repository: `git clone https://github.com/joseph-roque/campus-guide`
2. The recommended development environment is [Nuclide](https://nuclide.io/). With this IDE, you can utilize live updates of the Flow type checker.
3. Make your changes.
4. Ensure the following requirements for a contribution are met when running these commands:
    - `npm run flow`: There should be no issues within the project.
    - `npm run lint`: There should be no errors (warnings are OK).
    - `npm test`: All tests should pass.
    - `npm run build:ios`: The build should succeed.
    - `npm run build:android`: The build should succeed.

### Travis CI

Currently, the Travis CI build will run the following commands:

- `npm run flow`
- `npm run lint`
- `npm test`

Additional tests and checks will be run in the future, when the resources for the app have been released. For now, these commands fail due to the missing resources and have been disabled for the time being:

- `npm run build:ios`
- `npm run build:android`

## Screenshots

| Splash Screen | Finding a class | Your schedule |
|:-------------:|:---------------:|:-------------:|
| <img src='/screenshots/design_splash.png' width='220' alt='Splash design'/> | <img src='/screenshots/design_find_home.png' width='220' alt='Find design'/> | <img src='/screenshots/design_schedule_home.png' width='220' alt='Schedule design'/> |

| **Discover campus** | **Settings**|
|:-------------------:|:-----------:|
| <img src='/screenshots/design_discover_home.png' width='220' alt='Discover design'/> | <img src='/screenshots/design_settings_home.png' width='220' alt='Settings design'/> |

## License

```
Copyright 2016 Joseph Roque

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
