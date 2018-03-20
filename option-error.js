'use strict';

function MatchSnapshotOptionsError(msg) {
  Error.call(this);
  this.message = msg;
  this.name = 'MatchSnapshotOptionsError';
}
MatchSnapshotOptionsError.prototype = new Error();

exports.MatchSnapshotOptionsError = MatchSnapshotOptionsError;
