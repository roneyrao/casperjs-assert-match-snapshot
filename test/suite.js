require('../');

casper.options.onError = function onError(err) {
  casper.echo('environment error' + err);
};

casper.options.viewportSize = { width: 50, height: 50 };

casper.test.begin('match', function begin(test) {
  casper.start()
    .then(function () {
      this.evaluate(function () {
        document.body.style = 'background: green;';
      });
      test.assertMatchSnapshot('match');
    });
  casper.run(function () {
    test.done();
  });
});
