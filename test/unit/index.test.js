var sinon = require('sinon');
var expect = require('chai').expect;
var rewire = require('rewire');
var mockRequire = require('mock-require');
var MatchSnapshotOptionsError = require('../../option-error').MatchSnapshotOptionsError;

describe('index', function () {
  var fs = {
    remove: sinon.spy()
  };
  var tester = {
    AssertionError: sinon.spy()
  };
  var resemblejs = {
    compare: sinon.spy()
  };
  var optionsHelper = {
    validateOptions: sinon.spy(),
    initDefaultOptions: sinon.spy()
  };
  var init;

  before(function () {
    global.casper = {
      test: {},
      cli: { options: { updateSnapshot: true } }
    };
    global.require = function () { return tester; };
    mockRequire('fs', fs);
    mockRequire('resemblejs', resemblejs);
    mockRequire('../../options-helper', optionsHelper);

    init = rewire('../../index');
  });
  after(function () {
    delete global.casper;
    delete global.require;
    mockRequire.stopAll();
  });

  describe('check', function () {
    var check;
    var filename = 'dafa';
    var opts = { folder: 'kfkposafp', format: 'kldlla', quality: 13 };

    before(function () {
      check = init.__get__('check');
    });

    afterEach(function () {
      delete casper.capture;
      delete casper.captureSelector;
    });

    it('filename undefined', function () {
      expect(check).throw(MatchSnapshotOptionsError, /.+filename.+string/);
    });

    it('correct filename, selector string, callback', function () {
      var selector = 'akalalal';
      var cb = sinon.spy();
      casper.captureSelector = sinon.spy();
      check(filename, selector, opts, cb);
      sinon.assert.calledWithExactly(
        casper.captureSelector,
        opts.folder + filename + '.' + opts.format,
        selector,
        sinon.match({ quality: opts.quality })
      );
      sinon.assert.calledWithExactly(cb, null, sinon.match({ rawMisMatchPercentage: 0 }));
    });

    it('selector object', function () {
      var selector = {};
      casper.capture = sinon.spy();
      check(filename, selector, opts, sinon.spy());
      sinon.assert.calledOnce(casper.capture);
    });

    it('selector undefined', function () {
      casper.capture = sinon.spy();
      check(filename, null, opts, sinon.spy());
      sinon.assert.calledOnce(casper.capture);
    });

    it('selector unknown', function () {
      var selector = 1234;
      casper.capture = sinon.spy();

      expect(function () { check(filename, selector, opts, sinon.spy()); }).throw(MatchSnapshotOptionsError, 'Selector should');
    });

    it('compare', function () {
      var selector = 'akalalal';
      var checkCB = sinon.spy();
      casper.cli.options.updateSnapshot = false;
      casper.captureSelector = sinon.spy();
      opts.keepTemp = false;
      check(filename, selector, opts, checkCB);

      var filePathTemp = opts.folder + 'temp_' + filename + '.' + opts.format;
      sinon.assert.calledWithExactly(
        casper.captureSelector,
        filePathTemp,
        selector,
        sinon.match({ quality: opts.quality })
      );

      sinon.assert.calledWithExactly(
        resemblejs.compare,
        'file:///' + filePathTemp,
        'file:///' + opts.folder + filename + '.' + opts.format,
        sinon.match.func
      );

      var compareCB = resemblejs.compare.getCall(0).args[2];

      describe('compare callback', function () {
        beforeEach(function () {
          checkCB.resetHistory();
          fs.remove.resetHistory();
          tester.AssertionError.resetHistory();
        });
        it('do not keep temporary snapshot', function () {
          compareCB();
          sinon.assert.calledWithExactly(fs.remove, filePathTemp);
        });
        it('keep temporary snapshot', function () {
          opts.keepTemp = true;
          compareCB();
          sinon.assert.notCalled(fs.remove);
        });
        it('remove error, no compare error', function () {
          opts.keepTemp = false;
          var err = new Error('afsaass');
          fs.remove = sinon.stub().throws(err);
          compareCB();
          sinon.assert.calledWithExactly(checkCB, sinon.match.instanceOf(tester.AssertionError));
          sinon.assert.calledWithExactly(tester.AssertionError, sinon.match(new RegExp('.+snapshot.+' + err.message)));
        });
        it('remove error with no compare error', function () {
          opts.keepTemp = false;
          var err = new Error('afsaass');
          var errComp = new Error('kkpopopoja');
          fs.remove.throws(err);
          compareCB(errComp);
          sinon.assert.calledWithExactly(checkCB, sinon.match.instanceOf(tester.AssertionError));
          sinon.assert.calledWithExactly(tester.AssertionError, sinon.match(new RegExp('.+snapshot.+' + err.message + '.+compare')));
        });
        it('no remove error, has compare error', function () {
          opts.keepTemp = false;
          var errComp = new Error('kkpopopoja');
          fs.remove = sinon.spy();
          compareCB(errComp);
          sinon.assert.calledWithExactly(checkCB, sinon.match.instanceOf(tester.AssertionError));
          sinon.assert.calledWithExactly(tester.AssertionError, sinon.match('Fail'));
        });
        it('no errors, returns data', function () {
          opts.keepTemp = false;
          var data = {};
          compareCB(null, data);
          sinon.assert.calledWithExactly(checkCB, null, data);
        });
      });
    });
  });
  describe('assertMatchSnapshot', function () {
    var assertMatchSnapshot;
    before(function () {
      assertMatchSnapshot = casper.test.assertMatchSnapshot;
      expect(typeof assertMatchSnapshot).equal('function');
    });
    it('bound to casper.test', function () {
      expect(typeof assertMatchSnapshot).equal('function');
    });
  });
});
