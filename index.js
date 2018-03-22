'use strict';

var fs = require('fs');
var tester = global.require('tester');
// eslint-disable-next-line import/no-extraneous-dependencies
var resemble = require('resemblejs');
var optionsHelper = require('./options-helper');
var MatchSnapshotOptionsError = require('./option-error.js').MatchSnapshotOptionsError;

function check(filename, selector, options, cb) {
  if (filename === undefined) {
    throw new MatchSnapshotOptionsError('Snapshot filename should be a string');
  }
  var capture;
  var selectorType = typeof selector;
  if (selectorType === 'string') {
    capture = casper.captureSelector.bind(casper);
  } else if (selectorType === 'object' || selector == undefined) { // eslint-disable-line eqeqeq
    capture = casper.capture.bind(casper);
  } else {
    throw new MatchSnapshotOptionsError('Selector should be string or object or undefined');
  }
  filename += '.' + options.format;
  var filePathNormal = options.folder + filename;

  if (casper.cli.options.updateSnapshot) {
    // only specify format at the file name.
    capture(filePathNormal, selector, { quality: options.quality });
    cb(null, true);
  } else {
    var filePathTemp = options.folder + 'temp_' + filename;

    capture(filePathTemp, selector, { quality: options.quality });

    resemble.compare('file:///' + filePathTemp + '?' + (new Date().valueOf()), 'file:///' + filePathNormal, function compareCB(err, data) {
      try {
        if (!options.keepTemp) {
          fs.remove(filePathTemp);
        }
      } catch (err2) {
        console.warn('Warning: Fail to remove temporary snapshot, ' + err2.message);
      }
      if (err) { // this error has no information.
        cb(new tester.AssertionError('Fail to compare snapshot'));
      } else {
        cb(null, data);
      }
    });
  }
}

casper.test.assertMatchSnapshot = function matchSnapshot(filename, selector, options) {
  var match;
  var error;
  options = optionsHelper.validateOptions(options);

  function cb(err, data) {
    if (err) {
      console.log('Compare error occured');
      error = err;
    } else if (data === true) {
      console.log('Snapshot updated');
      match = true;
    } else {
      console.log('Expect snapshots mismatch percentage: ', data.rawMisMatchPercentage, ' <= ', options.maxDiff);
      match = data.rawMisMatchPercentage <= options.maxDiff;
    }
  }
  check(filename, selector, options, cb);

  function wait() {
    return match !== undefined || error !== undefined;
  }

  return casper.waitFor(wait).then(function waitMatch() {
    if (error) {
      casper.test.fail(error);
    } else {
      casper.test.assertEqual(match, true, 'Snapshots matching satifying allowed max difference');
    }
  });
};

module.exports = function init(options) {
  optionsHelper.initDefaultOptions(options);
};
