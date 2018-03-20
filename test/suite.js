require('../');

casper.options.onError = function onError(err) {
  casper.echo('environment error' + err);
};

casper.test.begin('match', function begin(test) {
  casper.start()
    .then(function () {
      this.waitForSelector('.LoadingSignal__spinning');
    })
});
