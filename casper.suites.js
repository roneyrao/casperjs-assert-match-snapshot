require('babel-polyfill');

const fs = require('fs');
const resemble = require('resemblejs');
const matchSnapshots = require('./snapshots-matcher');

const pfx = 'file:///' + fs.workingDirectory + '/e2e/index.html?dir=' + casper.cli.options.dir + '&entry=';
const snapshotDir = fs.workingDirectory + '/e2e/snapshots/';

casper.options.remoteScripts = ['../node_modules/babel-polyfill/dist/polyfill.js'];

casper.options.onError = function(err) {
  casper.echo('environment error' + err);
}

function testSnapshots(test, file, selector, diff) {
  const result = matchSnapshots(file, selector, diff);
  casper.waitFor(result.wait).then(function () {
    if (result.error) {
      test.fail(result.error);
    } else {
      test.assertEqual(result.match, true);
    }
  });
}

casper.test.begin('global', function (test) {
  casper.start(pfx + 'global')
    .then(function () {
      // this.page.onError = function(err) {
      //   casper.echo('page error: ' + err);
      // }
      this.waitForSelector('.LoadingSignal__spinning');
    })
    .then(function () {
      test.assertNotVisible('.LoadingSignal__spinning');
      this.click('#load');
      this.waitForSelector('.LoadingSignal__messageList');
    })
    .then(function () {
      test.assertVisible('.LoadingSignal__spinning');
      test.assertSelectorHasText('.LoadingSignal__messageList', 'file1');

      testSnapshots(test, 'global');
    })
    .then(function () {
      this.click('#change');
      this.waitWhileSelector('.LoadingSignal__spinning');
    })
    .then(function () {
      test.assertVisible('.LoadingSignal__circling');
      test.assertVisible('.LoadingSignal__masked');

      testSnapshots(test, 'global_masked');
    })
    .then(function () {
      this.click('#stop');
      this.waitWhileSelector('.LoadingSignal__messageList');
    })
    .then(function () {
      test.assertNotVisible('.LoadingSignal__masked');
    });
  casper.run(function () {
    test.done();
  });
});

casper.test.begin('local', function (test) {
  casper.start(pfx + 'local')
    .then(function () {
      this.waitForSelector('.LoadingSignal__spinning');
    })
    .then(function () {
      test.assertNotVisible('.LoadingSignal__blobs');

      this.click('#load');
      this.waitUntilVisible('.LoadingSignal__blobs');
    })
    .then(function () {
      test.assertEqual(this.getElementAttribute('#load', 'class'), 'disabled');
      test.assertEqual(this.getElementAttribute('#load', 'disabled'), 'disabled');

      testSnapshots(test, 'local', '#box');
    })
    .then(function () {
      this.click('#stop');
      this.waitWhileVisible('.LoadingSignal__blobs');
    })
    .then(function () {
      test.assertEqual(this.getElementAttribute('#load', 'class'), '');
      test.assertEqual(this.getElementAttribute('#load', 'disabled'), '');
    });
  casper.run(function () {
    test.done();
  });
});

casper.test.begin('container', function (test) {
  casper.start(pfx + 'container')
    .then(function () {
      this.waitForSelector('.LoadingSignal__spinning');
    })
    .then(function () {
      test.assertElementCount('#box > .LoadingSignal__loading', 0);

      this.click('#load');
      this.waitFor(function () {
        return this.evaluate(function () {
          return __utils__.findOne('#box > .LoadingSignal__loading');
        });
      });
    })
    .then(function () {
      test.assertElementCount('.LoadingSignal__local', 1);

      this.click('#removeContainer');
      this.waitWhileSelector('.LoadingSignal__blobs');
    })
    .then(function () {
      test.assertEqual(this.getElementAttribute('#load', 'class'), 'disabled');

      this.click('#restoreContainer');
      this.waitUntilVisible('.LoadingSignal__blobs');
    })
    .then(function () {
      test.assertEval(function () {
        return __utils__.findOne('.LoadingSignal__local').parentNode === __utils__.findOne('#load').parentNode;
      });
    });
  casper.run(function () {
    test.done();
  });
});

casper.test.begin('multiple', function (test) {
  const file2 = 'loading file2 with long name loading file2 with long name'
  casper.start(pfx + 'multiple')
    .then(function () {
      this.waitForSelector('.LoadingSignal__spinning');
    })
    .then(function () {
      this.click('#load');
      this.waitForSelector('.LoadingSignal__blobs');
    })
    .then(function () {
      test.assertVisible('.LoadingSignal__spinning');
      test.assertVisible('.LoadingSignal__blobs');
      test.assertSelectorHasText('.LoadingSignal__messageList', 'loading file1 ...' + file2);
    })
    .then(function () {
      testSnapshots(test, 'multiple');
    })
    .then(function () {
      this.click('#stop1');
      this.waitForSelectorTextChange('.LoadingSignal__messageList');
    })
    .then(function () {
      test.assertVisible('.LoadingSignal__spinning');
      test.assertVisible('.LoadingSignal__blobs');
      test.assertSelectorHasText('.LoadingSignal__messageList', file2);

      this.click('#stop2');
      this.waitWhileVisible('.LoadingSignal__blobs');
    })
    .then(function () {
      test.assertVisible('.LoadingSignal__spinning');
      test.assertSelectorHasText('.LoadingSignal__messageList', file2);
      this.click('#stop3');
      this.waitWhileVisible('.LoadingSignal__spinning');
    })
    .then(function () {
      test.assertDoesntExist('.LoadingSignal__messageList');
    })
  casper.run(function () {
    test.done();
  });
});

casper.test.begin('progress', function (test) {
  casper.start(pfx + 'progress')
    .then(function () {
      this.waitForSelector('.LoadingSignal__spinning');
    })
    .then(function () {
      this.click('#load');
      this.waitUntilVisible('.LoadingSignal__progressBar');
    })
    .then(function () {
      testSnapshots(test, 'progress', '#box', 10);
    })
    .then(function () {
      test.assertVisible('.LoadingSignal__progressBar > div');
      var boxWidth = this.getElementBounds('.LoadingSignal__progressBar').width;
      this.waitFor(function () {
        return this.getElementBounds('.LoadingSignal__progressBar > div').width / boxWidth > 0.1;
      });
      this.waitFor(function () {
        return this.getElementBounds('.LoadingSignal__progressBar > div').width / boxWidth > 0.5;
      });
      this.waitFor(function () {
        return this.getElementBounds('.LoadingSignal__progressBar > div').width / boxWidth > 0.7;
      });

      this.waitWhileVisible('.LoadingSignal__progressBar');
    })
  casper.run(function () {
    test.done();
  });
});

casper.test.begin('both global and local', function (test) {
  casper.start(pfx + 'both')
    .then(function () {
      this.waitForSelector('.LoadingSignal__spinning');
    })
    .then(function () {
      test.assertNotVisible('.LoadingSignal__spinning');
      test.assertNotVisible('.LoadingSignal__blobs');

      this.click('#load');
      this.waitUntilVisible('.LoadingSignal__spinning');
    })
    .then(function () {
      this.waitUntilVisible('.LoadingSignal__blobs');
    })
    .then(function () {
      test.assertSelectorHasText('.LoadingSignal__messageList', 'file1');
    })
    .then(function () {
      testSnapshots(test, 'both');
    })
    .then(function () {
      this.click('#stop');
      this.waitWhileSelector('.LoadingSignal__messageList');
    })
    .then(function () {
      test.assertNotVisible('.LoadingSignal__spinning');
      test.assertNotVisible('.LoadingSignal__blobs');
    });
  casper.run(function () {
    test.done();
  });
});
