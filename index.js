var fs = require('fs');
var tester = require('tester');
var resemble = require('resemblejs');
var optionsHelper = require('./options-helper');

function check(filename, selector, options, cb) {
  if (filename === undefined) {
    throw new optionsHelper.MatchSnapshotOptionsError('You should passed in a string to specify where snapshots reside.');
  }

  var filePathNormal = options.folder + filename + options.extension;
  if (casper.cli.options.updateSnapshot) {
    casper[selector ? 'captureSelector' : 'capture'](filePathNormal, selector);
    cb(null, { rawMisMatchPercentage: 0 });
  } else {
    var filePathTemp = options.folder + 'temp_' + filename + options.extension;

    casper[selector ? 'captureSelector' : 'capture'](filePathTemp, selector);

    resemble.compare('file:///' + filePathTemp, 'file:///' + filePathNormal, function compareCB(err, data) {
      try {
        if (!options.keepTemp) {
          fs.remove(filePathTemp);
        }
        if (err) {
          cb(new tester.AssertionError('Fail to compare snapshot'));
        } else {
          cb(null, data);
        }
      } catch (err2) {
        if (err) {
          cb(new tester.AssertionError('Fail to compare snapshot' + err.message));
        } else {
          cb(err2);
        }
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
    } else {
      console.log('Expect mismatch percentage: ', data.rawMisMatchPercentage, ' < ', options.maxDiff);
      match = data.rawMisMatchPercentage < options.maxDiff;
    }
  }
  check(filename, selector, options, cb);

  function wait() {
    return match !== undefined || error !== undefined;
  }

  casper.waitFor(wait).then(function waitMatch() {
    if (error) {
      casper.test.fail(error);
    } else {
      casper.test.assertEqual(match, true);
    }
  });
};

module.exports = function init(options) {
  optionsHelper.initDefaultOptions(options);
};
