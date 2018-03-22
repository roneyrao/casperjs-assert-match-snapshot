if (casper.cli.options.fromPublish) {
  require(casper.cli.options.fromPublish);
} else {
  require('../../');
}
var fs = require('fs');

casper.options.onError = function onError(err) {
  casper.echo('environment error' + err);
};

casper.options.viewportSize = { width: 50, height: 50 };

var dir = fs.workingDirectory + '/__snapshots__/';
var filename = 'defaultOptions';

casper.test.begin('Command argument, update correctly', function begin(test) {
  casper.start()
    .then(function () {
      test.assertMatchSnapshot(filename);
    })
    .then(function () {
      test.assert(fs.exists(dir + filename + '.png'), 'Snapshot exists');
      test.assertNot(fs.exists(dir + 'temp_' + filename + '.png'), 'Temporary snapshot does not exist');
    });
  casper.run(function () {
    test.done();
  });
});
