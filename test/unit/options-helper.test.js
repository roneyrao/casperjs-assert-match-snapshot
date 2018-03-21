var fs = require('fs');
var sinon = require('sinon');
var expect = require('chai').expect;
var rewire = require('rewire');

var MatchSnapshotOptionsError = require('../../option-error.js').MatchSnapshotOptionsError;
var mod = rewire('../../options-helper');

describe('options helper', function () {
  var key = 'keyafasf';

  describe('validateFolder', function () {
    var validateFolder = mod.__get__('validateFolder');

    it('non-string throws error', function () {
      expect(function () { validateFolder(key, 1234); }).throw(MatchSnapshotOptionsError, new RegExp(key + '.+where'));
    });

    it('missing leading slash', function () {
      var dir = 'afasff';
      expect(validateFolder(key, dir).indexOf('/' + dir) > -1).ok;
    });

    it('missing trailing slash', function () {
      var dir = 'afasff';
      expect(validateFolder(key, dir).indexOf(dir + '/') > -1).ok;
    });

    it('cwd is prepended', function () {
      var dir = '/afasff/';
      fs.workingDirectory = 'fasdfafaf';
      expect(validateFolder(key, dir)).equal(fs.workingDirectory + dir);
      delete fs.workingDirectory;
    });
  });

  describe('validateFormat', function () {
    var validateFormat = mod.__get__('validateFormat');

    it('non-string throws error', function () {
      expect(function () { validateFormat(key, 1234); }).throw(MatchSnapshotOptionsError, new RegExp(key + '.+format'));
    });

    it('invalid string', function () {
      var fmt = 'afa+a=*sff';
      expect(function () { validateFormat(key, fmt); }).throw(MatchSnapshotOptionsError, 'invalid');
    });

    it('correct', function () {
      var fmt = 'afasff';
      expect(validateFormat(key, fmt)).equal(fmt);
    });
  });

  describe('validateKeep', function () {
    var validateKeep = mod.__get__('validateKeep');

    it('non-boolean throws error', function () {
      expect(function () { validateKeep(key, 1234); }).throw(MatchSnapshotOptionsError, new RegExp(key + '.+persist'));
    });

    it('correct', function () {
      var input = true;
      expect(validateKeep(key, input)).equal(input);
    });
  });

  describe('validateDiff', function () {
    var validateDiff = mod.__get__('validateDiff');

    it('non-number throws error', function () {
      expect(function () { validateDiff(key, 'aa'); }).throw(MatchSnapshotOptionsError, new RegExp(key + '.+difference'));
    });

    it('minus throws error', function () {
      expect(function () { validateDiff(key, -2); }).throw(MatchSnapshotOptionsError, 'between');
    });

    it('bigger than 100 throws error', function () {
      expect(function () { validateDiff(key, 222); }).throw(MatchSnapshotOptionsError, 'between');
    });

    it('min', function () {
      var input = 0;
      expect(validateDiff(key, input)).equal(input);
    });

    it('max', function () {
      var input = 100;
      expect(validateDiff(key, input)).equal(input);
    });

    it('between', function () {
      var input = 22;
      expect(validateDiff(key, input)).equal(input);
    });
  });

  describe('validateQuality', function () {
    var validateQuality = mod.__get__('validateQuality');

    it('non-number throws error', function () {
      expect(function () { validateQuality(key, 'aa'); }).throw(MatchSnapshotOptionsError, new RegExp(key + '.+quality'));
    });

    it('minus throws error', function () {
      expect(function () { validateQuality(key, -2); }).throw(MatchSnapshotOptionsError, 'between');
    });

    it('bigger than 100 throws error', function () {
      expect(function () { validateQuality(key, 222); }).throw(MatchSnapshotOptionsError, 'between');
    });

    it('min', function () {
      var input = 0;
      expect(validateQuality(key, input)).equal(input);
    });

    it('max', function () {
      var input = 100;
      expect(validateQuality(key, input)).equal(input);
    });

    it('between', function () {
      var input = 22;
      expect(validateQuality(key, input)).equal(input);
    });
  });

  describe('createValidator', function () {
    var createValidator = mod.__get__('createValidator');

    var validate = sinon.spy();
    var validator = createValidator(key, validate);

    var defaultValue = 'fafaoookf';
    var revert;

    before(function () {
      var defaultOptions = {};
      defaultOptions[key] = defaultValue;
      revert = mod.__set__('defaultOptions', defaultOptions);
    });
    after(function () {
      revert();
    });

    it('undefined returns default', function () {
      expect(validator()).equal(defaultValue);
    });

    it('correct', function () {
      var value = 'doodjfapif';
      validator(value);
      sinon.assert.calledWithExactly(validate, key, value);
    });
  });

  describe('global variables', function () {
    describe('builtinOptions', function () {
      var builtinOptions = mod.__get__('builtinOptions');
      var optionsKeys = mod.__get__('optionsKeys');

      var initValues = {
        folder: '/__snapshots__/',
        format: 'png',
        keepTemp: false,
        maxDiff: 0,
        quality: 75
      };

      function createTester(k, value) {
        return function () {
          expect(builtinOptions[k]).ok;
          expect(builtinOptions[k].value).equal(value);
          expect(typeof builtinOptions[k].validator).equal('function');
        };
      }

      var keys = Object.getOwnPropertyNames(initValues);

      it('optionsKeys', function () {
        expect(optionsKeys).eql(keys);
      });

      for (var i = 0, len = keys.length; i < len; i++) {
        var k = keys[i];
        it(k, createTester(k, initValues[k]));
      }
    });
  });

  describe('validateOptions', function () {
    var validateOptions = mod.__get__('validateOptions');
    var defaultOptions = {
      folder: '/__snapshots__/',
      format: 'png',
      keepTemp: false,
      maxDiff: 0,
      quality: 75
    };

    var revert;

    before(function () {
      revert = mod.__set__('defaultOptions', defaultOptions);
    });
    after(function () {
      revert();
    });

    it('undefined returns default', function () {
      expect(validateOptions()).equal(defaultOptions);
    });

    it('output diff with input', function () {
      var input = {};
      expect(validateOptions(input)).not.equal(input);
    });

    it('extant is untouched, missed is supplemented', function () {
      fs.workingDirectory = 'fasdfafaf';
      var input = { folder: 'doaa' };
      var fullFolder = fs.workingDirectory + '/' + input.folder + '/';

      var output = validateOptions(input);
      expect(output.folder).equal(fullFolder);
      output.folder = defaultOptions.folder;
      expect(output).eql(defaultOptions);

      delete fs.workingDirectory;
    });
  });

  describe('initDefaultOptions', function () {
    var options = { maxDiff: 80 };
    var defaultOptions;

    before(function () {
      fs.workingDirectory = 'fasdfafaf';
      mod.initDefaultOptions(options);
      defaultOptions = mod.__get__('defaultOptions');
      mod.__set__('defaultOptions', null);
    });
    after(function () {
      delete fs.workingDirectory;
    });

    it('correct', function () {
      var output = {
        folder: fs.workingDirectory + '/__snapshots__/',
        format: 'png',
        keepTemp: false,
        maxDiff: options.maxDiff,
        quality: 75
      };
      expect(defaultOptions).eql(output);
    });
  });
});
