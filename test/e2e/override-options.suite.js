var fs = require('fs');
require('../../');

var dir = '/snapshots/';
var format = 'bmp';

var offset = 100;
var dimen = 50;

var options = {
  folder: dir,
  format: format,
  keepTemp: true,
  maxDiff: 50,
  quality: 100
};

dir = fs.workingDirectory + dir;

casper.options.onError = function onError(err) {
  casper.echo('environment error' + err);
};

var filename = 'overrideOptions';
function initDom(_dimen, _offset) {
  document.documentElement.style.background = 'red';
  document.body.innerHTML = '<div id="box" style="background: green; width: ' + _dimen + 'px; height: ' + _dimen + 'px; position: absolute; left:' + _offset + 'px; top: ' + _offset + 'px;"></div>';
}

casper.test.begin('override default options, create new one', function begin(test) {
  casper.cli.options.updateSnapshot = true;
  casper.start()
    .thenEvaluate(initDom, dimen, offset)
    .then(function () {
      this.waitForSelector('#box');
    })
    .then(function () {
      test.assertMatchSnapshot(filename, '#box', options);
    })
    .then(function () {
      var filepath = dir + filename + '.' + format;
      test.assert(fs.exists(filepath), 'new snapshot created');

      this.evaluate(function (_dimen, _filepath) {
        var img = new Image();
        img.id = 'img1';
        img.onload = function () {
          img.MATCH = img.width === _dimen && img.height === _dimen;
          img.LOADED = true;
        };
        img.onerror = function (err) {
          img.MATCH = err.message;
          img.LOADED = true;
        };
        img.src = 'file://' + _filepath;
        document.body.appendChild(img);
      }, dimen, filepath);
      this.waitFor(function () {
        return this.evaluate(function () {
          return __utils__.findOne('#img1').LOADED;
        });
      });
    })
    .then(function () {
      var match = this.evaluate(function () {
        return __utils__.findOne('#img1').MATCH;
      });
      var msg;
      switch (match) {
        case true:
          msg = 'Image dimension is correct';
          break;
        case false:
          msg = 'Image dimension is incorrect';
          break;
        case undefined:
          msg = 'Image load error';
          break;
        default:
          msg = 'Image load error, ' + msg.message;
      }
      test.assert(match === true, msg);
    });
  casper.run(function () {
    test.done();
  });
});

casper.test.begin('override default options, pass compare', function begin(test) {
  casper.cli.options.updateSnapshot = false;

  casper.start()
    .thenEvaluate(initDom, dimen, offset)
    .then(function () {
      test.assertMatchSnapshot(
        filename,
        {
          left: offset, top: offset - (dimen / 2), width: dimen, height: dimen
        },
        options
      );
    });
  casper.run(function () {
    test.done();
  });
});

casper.test.begin('override default options, fail compare', function begin(test) {
  casper.cli.options.updateSnapshot = false;

  var assertEqual = test.assertEqual;
  test.assertEqual = function (val1, val2) {
    if (val1 === val2) test.fail('Should not satisfy maxDiff');
  };

  casper.start()
    .thenEvaluate(initDom, dimen, offset)
    .then(function () {
      test.assertMatchSnapshot(
        filename,
        {
          left: offset, top: offset - (dimen / 2) - 1, width: dimen, height: dimen
        },
        options
      );
    })
    .then(function () {
      test.assertEqual = assertEqual;
    });
  casper.run(function () {
    fs.removeTree(dir);
    test.done();
  });
});

casper.test.begin('override default options, default is not modified', function begin(test) {
  casper.cli.options.updateSnapshot = true;

  var dir2 = fs.workingDirectory + '/__snapshots__/';
  var filename2 = 'defaultOptions';
  casper.start()
    .then(function () {
      test.assertMatchSnapshot(filename2);
    })
    .then(function () {
      test.assert(fs.exists(dir2 + filename2 + '.png'), 'snapshot exists');
    });
  casper.run(function () {
    fs.removeTree(dir2);
    test.done();
  });
});
