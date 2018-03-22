var fs = require('fs');
var path = require('path');
var execFile = require('child_process').execFile;
var install = require('npm-install-package');
var rootPath = process.cwd();

process.chdir(__dirname);

function test(file, cb) {
  console.log('Run casper test ' + file);
  var args = ['test'];

  if (typeof file === 'string') {
    args.push(file);
  } else {
    args = args.concat(file);
  }

  var casperPath = 'node_modules/.bin/casperjs';
  if (process.platform === 'win32') {
    casperPath += '.cmd';
  }
  var child = execFile(path.resolve(rootPath, casperPath), args);

  child.stdout.on('data', function (data) {
    console.log(data);
  });
  child.stderr.on('data', function (data) {
    console.log(data);
  });
  child.on('error', function (data) {
    console.log(data);
  });
  child.on('exit', function (code) {
    console.log('capser ends.');
    code || (cb && cb());
  });
}


function runTests(fileArray, cb) {
  var i = 0;
  var len = fileArray.length;
  function invoke() {
    if (i < len) {
      test(fileArray[i], invoke);
      i++;
    } else {
      console.log('All casper tests done.');
      cb && cb();
    }
  }

  invoke();
}

function testPublish() {
  var dir = 'published';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  process.chdir(path.resolve(__dirname, dir));
  fs.writeFileSync('package.json', '{}');

  install(rootPath, function (err) {
    if (err) {
      throw err;
    } else {
      process.chdir(__dirname);
      test(['cli-arg.suite.js', '--updateSnapshot', '--fromPublish=./' + dir + '/node_modules/casperjs-assert-match-snapshot/']);
    }
  });
}

runTests([
  ['cli-arg.suite.js', '--updateSnapshot'],
  'default-options.suite.js',
  'set-default-options.suite.js',
  'override-options.suite.js'
], testPublish);
