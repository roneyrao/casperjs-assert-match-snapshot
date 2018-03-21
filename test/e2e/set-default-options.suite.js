var fs = require('fs');
var init = require('../');

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

casper.test.begin('set default options, create new one', function begin(test) {
  casper.cli.options.updateSnapshot = true;

  casper.start()
    .then(function () {
      this.evaluate(function () {
        document.documentElement.style.background = 'green';
      });

      test.assertMatchSnapshot(filename);
    })
    .then(function () {
      test.assert(fs.exists(dir + filename + '.' + format));
      test.assert(fs.exists(dir + 'temp_' + filename + '.' + format));
    });
  casper.run(function () {
    test.done();
  });
});

casper.test.begin('set default options, pass compare', function begin(test) {
  casper.cli.options.updateSnapshot = false;

  casper.start()
    .then(function () {
      this.evaluate(function () {
        document.documentElement.style.background = 'green';
      });

      test.assertMatchSnapshot(filename);
    });
  casper.run(function () {
    test.done();
  });
});

casper.test.begin('set default options, fail compare', function begin(test) {
  casper.options.viewportSize = { width: 50, height: 24 };
  casper.cli.options.updateSnapshot = false;

  casper.start()
    .then(function () {
      this.evaluate(function () {
        document.documentElement.style.background = 'green';
      });

      // test.assertNotMatchSnapshot(filename);
    });
  casper.run(function () {
    fs.removeTree(dir);
    test.done();
  });
});
