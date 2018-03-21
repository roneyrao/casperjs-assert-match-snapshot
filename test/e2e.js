var execFile = require('child_process').execFile;

var child;
if (process.platform === 'win32') {
  child = execFile('node_modules\\.bin\\casperjs.cmd', ['test', 'test/suite.js']);
} else {
  child = execFile('node_modules/.bin/casperjs', ['test', 'test/suite.js']);
}

child.stdout.on('data', function (data) {
  console.log(data);
});
child.stderr.on('data', function (data) {
  console.log(data);
});
child.on('error', function (data) {
  console.log(data);
});
