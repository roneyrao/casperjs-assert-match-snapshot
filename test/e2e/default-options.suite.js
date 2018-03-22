require('../../');
var fs = require('fs');

casper.options.onError = function onError(err) {
  casper.echo('environment error' + err);
};

casper.options.viewportSize = { width: 50, height: 50 };

var dir = fs.workingDirectory + '/__snapshots__/';
var filename = 'defaultOptions';
function initDom() {
  document.documentElement.style.background = 'green';
}

casper.test.begin('default options, create new one', function begin(test) {
  casper.cli.options.updateSnapshot = true;

  casper.start()
    .thenEvaluate(initDom)
    .then(function () {
      test.assertMatchSnapshot(filename);
    })
    .then(function () {
      test.assert(fs.exists(dir + filename + '.png'), 'Snapshot exists');
    });
  casper.run(function () {
    test.done();
  });
});

casper.test.begin('default options, compare', function begin(test) {
  casper.cli.options.updateSnapshot = false;

  casper.start()
    .thenEvaluate(initDom)
    .then(function () {
      test.assertMatchSnapshot(filename);
    })
    .then(function () {
      test.assertNot(fs.exists(dir + 'temp_' + filename + '.png'), 'Temporary snapshot does not exist.');
    });
  casper.run(function () {
    fs.removeTree(dir);
    test.done();
  });
});
