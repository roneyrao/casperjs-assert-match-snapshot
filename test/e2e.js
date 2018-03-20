var execFile = require('child_process').execFile;

var child = execFile('node_modules/.bin/casperjs', ['test', 'test/suite.js']);

child.stdout.on('data', function (data) {
  console.log(data);
});
child.stderr.on('data', function (data) {
  console.log(data);
});
