'use strict';

var fs = require('fs');
var MatchSnapshotOptionsError = require('./option-error.js');

var builtinOptions = {};
var defaultOptions;

function validateFolder(dir) {
  if (typeof dir !== 'string') {
    throw new MatchSnapshotOptionsError('You should passed in a string to specify where snapshots reside.');
  }
  if (dir[0] !== '/') {
    dir = '/' + dir;
  }
  return fs.workingDirectory + dir;
}
function validateFormat(format) {
  if (typeof format !== 'string') {
    throw new MatchSnapshotOptionsError('"format" only accepts string to specify the image file format.');
  }
  if (!(/^\w+$/.test(format))) {
    throw new MatchSnapshotOptionsError('"format" string is invalid.');
  }
  return format;
}
function validateKeep(keepTemp) {
  if (typeof format !== 'boolean') {
    throw new MatchSnapshotOptionsError('"keepTemp" only accepts boolean to specify whether to persist the temporary snapshot image being tested against.');
  }
  return !!keepTemp;
}
function validateDiff(diff) {
  if (typeof diff !== 'number') {
    throw new MatchSnapshotOptionsError('"maxDiff" only accepts number to specify the max difference allowed.');
  } else if (diff < 0 || diff > 1) {
    throw new MatchSnapshotOptionsError('"maxDiff" only accepts number between 0 and 100.');
  }
  return diff;
}

function validateQuality(quality) {
  if (typeof quality !== 'number') {
    throw new MatchSnapshotOptionsError('"quality" only accepts number to specify the quality of image.');
  } else if (quality < 0 || quality > 1) {
    throw new MatchSnapshotOptionsError('"quality" only accepts number between 0 and 100.');
  }
  return quality;
}


function createValidator(key, validate) {
  return function ValidateWrapper(value) {
    if (value === undefined) return defaultOptions[key];
    return validate(value);
  };
}

var builtinOptionsMap = [
  ['folder', '/__snapshots__/', validateFolder],
  ['format', 'png', validateFormat],
  ['keepTemp', false, validateKeep],
  ['maxDiff', 0, validateDiff],
  ['quality', 75, validateQuality]
];

var optionsKeys = [];

(function initBuiltinOptions() {
  for (var i = 0, len = builtinOptionsMap.length; i < len; i++) {
    var item = builtinOptionsMap[i];
    var key = item[0];
    optionsKeys.push(key);
    builtinOptions[key] = {
      value: item[1]
    };
    var validator = item[2];
    if (validator) {
      builtinOptions[key].validator = createValidator(key, validator);
    }
  }
}());

function validateOptions(options) {
  if (!options) return defaultOptions;

  var newOpts = {};

  for (var i = 0, len = optionsKeys.length; i < len; i++) {
    var key = optionsKeys[i];
    newOpts[key] = builtinOptions[key].validator(options.key);
  }
  return newOpts;
}

exports.initDefaultOptions = function initDefaultOptions(options) {
  defaultOptions = {};
  for (var i = 0, len = optionsKeys.length; i < len; i++) {
    defaultOptions[i] = builtinOptions[optionsKeys[i]].value;
  }
  defaultOptions.folder = fs.workingDirectory + defaultOptions.folder;

  return validateOptions(options);
};
exports.validateOptions = validateOptions;
