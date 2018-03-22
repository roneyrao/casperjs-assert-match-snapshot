var fs = require('fs');
var init = require('../../');

var dir = '/snapshots/';
var format = 'jpg';

init({
  folder: dir,
  format: format,
  keepTemp: true,
  maxDiff: 50
});

dir = fs.workingDirectory + dir;

casper.options.onError = function onError(err) {
  casper.echo('environment error' + err);
};

casper.options.viewportSize = { width: 50, height: 50 };

var filename = 'setDefaultOptions';
function initDom() {
  document.documentElement.style.background = 'green';
}

casper.test.begin('set default options, create new one', function begin(test) {
  casper.cli.options.updateSnapshot = true;

  casper.start()
    .thenEvaluate(initDom)
    .then(function () {
      test.assertMatchSnapshot(filename);
    })
    .then(function () {
      test.assert(fs.exists(dir + filename + '.' + format), 'New snapshot created');
    });
  casper.run(function () {
    test.done();
  });
});

casper.test.begin('set default options, pass compare', function begin(test) {
  casper.options.viewportSize = { width: 25, height: 50 };
  casper.cli.options.updateSnapshot = false;

  casper.start()
    .thenEvaluate(initDom)
    .then(function () {
      test.assertMatchSnapshot(filename);
      test.assert(fs.exists(dir + 'temp_' + filename + '.' + format), 'Temporary snapshot is not removed');
    });
  casper.run(function () {
    test.done();
  });
});

casper.test.begin('set default options, fail compare', function begin(test) {
  casper.options.viewportSize = { width: 24, height: 50 };
  casper.cli.options.updateSnapshot = false;

  var assertEqual = test.assertEqual;
  test.assertEqual = function (val1, val2) {
    if (val1 === val2) test.fail('Should not satisfy maxDiff');
  };

  casper.start()
    .thenEvaluate(initDom)
    .then(function () {
      test.assertMatchSnapshot(filename);
    })
    .then(function () {
      test.assertEqual = assertEqual;
    });
  casper.run(function () {
    fs.removeTree(dir);
    test.done();
  });
});
