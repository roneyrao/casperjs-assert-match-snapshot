'use strict';

var fs = require('fs');


var builtinOptions = {
  folder: '/__snapshots__/',
  maxDiff: 0,
  extension: '.png',
  keepTemp: false
};

var defaultOptions;

function MatchSnapshotOptionsError(msg) {
  Error.call(this);
  this.message = msg;
  this.name = 'MatchSnapshotOptionsError';
}
MatchSnapshotOptionsError.prototype = new Error();

function validateFolder(dir) {
  if (typeof dir !== 'string') {
    throw new MatchSnapshotOptionsError('You should passed in a string to specify where snapshots reside.');
  } else {
    if (dir[0] !== '/') {
      dir = '/' + dir;
    }
    return fs.workingDirectory + dir;
  }
}
function validateDiff(diff) {
  if (typeof diff !== 'number') {
    throw new MatchSnapshotOptionsError('"maxDiff" only accepts number to specify the max difference allowed.');
  } else if (diff < 0 || diff > 1) {
    throw new MatchSnapshotOptionsError('"maxDiff" only accepts number between 0 and 100.');
  } else {
    return diff;
  }
}

function validateExtension(ext) {
  if (typeof ext !== 'string') {
    throw new MatchSnapshotOptionsError('"extension" only accepts string to specify the image file extension.');
  } else {
    if (ext[0] !== '.') {
      ext = '.' + ext;
    }
    return ext;
  }
}

function validateOptions(options) {
  options.folder = options.folder !== undefined
    ?
    validateFolder(options.folder)
    :
    defaultOptions.folder;

  options.maxDiff = options.maxDiff !== undefined
    ?
    validateDiff(options.maxDiff)
    :
    defaultOptions.maxDiff;

  options.extension = options.extension !== undefined
    ?
    validateExtension(options.extension)
    :
    defaultOptions.extension;

  options.keepTemp = options.keepTemp !== undefined
    ?
    !!options.keepTemp
    :
    defaultOptions.keepTemp;
}

exports.initDefaultOptions = function initDefaultOptions(options) {
  defaultOptions = {};
  var keys = Object.getOwnPropertyNames(builtinOptions);
  for (var i = 0, len = keys.length; i < len; i++) {
    defaultOptions[i] = builtinOptions[keys[i]];
  }
  defaultOptions.folder = fs.workingDirectory + defaultOptions.folder;

  return validateOptions(options);
};
exports.validateOptions = validateOptions;
exports.MatchSnapshotOptionsError = MatchSnapshotOptionsError;
