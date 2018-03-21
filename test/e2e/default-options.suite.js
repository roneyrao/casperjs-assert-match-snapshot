require('../');
var fs = require('fs');

casper.options.onError = function onError(err) {
  casper.echo('environment error' + err);
};

casper.options.viewportSize = { width: 50, height: 50 };

var dir = fs.workingDirectory + '/__snapshots__/';
var filename = 'defaultOptions';

casper.test.begin('default options, create new one', function begin(test) {
  casper.cli.options.updateSnapshot = true;

  casper.start()
    .then(function () {
      this.evaluate(function () {
        document.documentElement.style.background = 'green';
      });

      test.assertMatchSnapshot(filename);
    })
    .then(function () {
      test.assert(fs.exists(dir + filename + '.png'));
      test.assertNot(fs.exists(dir + 'temp_' + filename + '.png'));
    });
  casper.run(function () {
    test.done();
  });
});

casper.test.begin('default options, compare', function begin(test) {
  casper.cli.options.updateSnapshot = false;

  casper.start()
    .then(function () {
      this.evaluate(function () {
        document.documentElement.style.background = 'green';
      });

      test.assertMatchSnapshot(filename);
    });
  casper.run(function () {
    fs.removeTree(dir);
    test.done();
  });
});
