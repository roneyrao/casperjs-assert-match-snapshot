var execFile = require('child_process').execFile;

process.chdir('test/e2e');

var execPath;
if (process.platform === 'win32') {
  execPath = '..\\..\\node_modules\\.bin\\casperjs.cmd';
} else {
  execPath = '../../node_modules/.bin/casperjs';
}
var child = execFile(execPath, ['test', 'set-default-options.suite.js']);

child.stdout.on('data', function (data) {
  console.log(data);
});
child.stderr.on('data', function (data) {
  console.log(data);
});
child.on('error', function (data) {
  console.log(data);
});
