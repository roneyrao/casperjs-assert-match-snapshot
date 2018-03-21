var expect = require('chai').expect;

var MatchSnapshotOptionsError = require('../../option-error').MatchSnapshotOptionsError;

describe('option error', function () {
  it('correct error type', function () {
    var msg = 'afadafsf';
    var err = new MatchSnapshotOptionsError(msg);

    expect(err instanceof Error).ok;
    expect(err.name).equal('MatchSnapshotOptionsError');
    expect(err.message).equal(msg);
  });
});
