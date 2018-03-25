# casperjs-assert-match-snapshot

[![NPM Version](https://img.shields.io/npm/v/casperjs-assert-match-snapshot.svg?style=flat)](https://www.npmjs.org/package/casperjs-assert-match-snapshot)
[![Build Status](https://travis-ci.org/roneyrao/casperjs-assert-match-snapshot.svg?branch=master)](https://travis-ci.org/roneyrao/casperjs-assert-match-snapshot)
[![codecov](https://codecov.io/gh/roneyrao/casperjs-assert-match-snapshot/branch/master/graph/badge.svg)](https://codecov.io/gh/roneyrao/casperjs-assert-match-snapshot)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/roneyrao/casperjs-assert-match-snapshot/master/LICENSE)

Extension to [CasperJS]() tester, with more lightweight, test-friendlier API than unmaintained [PhantomCSS](https://www.npmjs.com/package/phantomcss), to assert snapshots matched.

## Install

```
  npm i casperjs-assert-match-snapshot
```

## Usage

### Basic

In casper test suite:

```
  require('casperjs-assert-match-snapshot');


  casper.test.begin('Test case', function begin(test) {
    casper.start()
      .then(function () {
        test.assertMatchSnapshot('snapshot-file-name');
      })
      .then(function () {
        // other tests
      });
    casper.run(function () {
      test.done();
    });
  });
```

### Update snapshots

When run this first time, or when page is modified, to update snapshots, set this command option:

```
  casperjs test casper.suites.js --updateSnapshot
```

### Set default options

There are several options to further define its behaviour. All of them have predefined values. You can change them of course

```
  var init = require('casperjs-assert-match-snapshot');
  init(options);
```

### Override default options in specific call

To apply specific options for a certain call, instead of the global settings:

```
  test.assertMatchSnapshot('snapshot-file-name', selector, options);
```

## Options

- folder: **string**, '__snapshots__'

  Directory where snapshots being placed, relative to current working directory.

- format: **string**, 'png' (allowed formats based on your engine.)

  The snapshot file format

- keepTemp: **boolean**, `false`

  Whether to leave temporary snapshot files which are tested against the original one in file system. Removed by default. These files have a prefix of `temp_` in file name.

- maxDiff: **number**, 0 (0 - 100)

  How much the maximum difference being be tolerant of is allowed. None by default, e.g. they should be totally identical.

- quality: **number**, 75 (0 - 100)

  The quality of snapshot image for certain formats.


## API

```
  casper.test.assertMatchSnapshot(filename: string, selector: string | Object, options: Object): casper
```

#### Parameters

- filename: **string**, required

  The filename of this snapshot file, excluding extension.

- selector: **string** or **Object**, optional

  Specify the area of this snapshot. When undefined, implies the whole page. If string, it should be a valid selector. Or a json object defining the bounds (`{ left, top, width, height }`). Refer to this [doc](http://docs.casperjs.org/en/latest/modules/casper.html#capture).

- options: see above

#### returns

`casper`


## Caveat

- It calls `waitFor` internally, so if the next steps depends on that test, please execute in `then`.


## License

[MIT](LICENSE).
