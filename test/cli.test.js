var assert = require('assert')
  , bin = require.resolve('../bin/jade-lint')
  , fs = require('fs')
  , package = require('../package.json')
  , spawn = require('child_process').spawn

  , fixturesPath = __dirname + '/fixtures/'
  , fixturesRelativePath = './test/fixtures/'

describe('cli', function () {

  function run(args, cb) {
    var command = [ bin ].concat(args)
      , stdout = ''
      , stderr = ''
      , node = process.execPath
      , child = spawn(node, command)

    if (child.stderr) {
      child.stderr.on('data', function (chunk) {
        stderr += chunk
      })
    }

    if (child.stdout) {
      child.stdout.on('data', function (chunk) {
        stdout += chunk
      })
    }

    child.on('error', cb)

    child.on('close', function (code) {
      cb(null, code, stdout, stderr)
    })

    return child
  }

  it('should output the current version number', function (done) {
    var args = [ '-V' ]

    run(args, function (err, code, stdout, stderr) {
      assert(!err, err)
      assert.equal(code, 0, code)
      assert.equal(stderr, '', stderr)
      assert.equal(stdout.indexOf(package.version) !== -1, true, stdout)
      done()
    })
  })

  it('should output help', function (done) {
    var args = [ '-h' ]
      , message = 'Usage: jade-lint [options] <file ...>'

    run(args, function (err, code, stdout, stderr) {
      assert(!err, err)
      assert.equal(code, 0, code)
      assert.equal(stderr, '', stderr)
      assert.equal(stdout.indexOf(message) !== -1, true, stdout)
      assert.equal(stdout.indexOf(package.description) !== -1, true, stdout)
      done()
    })
  })

  it('should output help if no file specified', function (done) {
    var args = []
      , message = 'Usage: jade-lint [options] <file ...>'

    run(args, function (err, code, stdout, stderr) {
      assert(!err, err)
      assert.equal(code, 0, code)
      assert.equal(stderr, '', stderr)
      assert.equal(stdout.indexOf(message) !== -1, true, stdout)
      assert.equal(stdout.indexOf(package.description) !== -1, true, stdout)
      done()
    })
  })

  it('should report errors for file path', function (done) {
    var args = [ fixturesRelativePath + 'invalid.jade' ]
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-invalid.txt', 'utf-8')

    run(args, function (err, code, stdout, stderr) {
      assert(!err, err)
      assert.equal(code, 2, code)
      assert.equal(stdout, '', stdout)
      assert.equal(stderr.trim(), expectedReport.replace(/%dirname%/g, fixturesRelativePath).trim(), stderr)
      done()
    })
  })

  it('should report errors for directory path', function (done) {
    var dirname = fixturesRelativePath + 'rules/'
      , args = [ dirname ]
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-invalid.txt', 'utf-8')

    run(args, function (err, code, stdout, stderr) {
      assert(!err, err)
      assert.equal(code, 2, code)
      assert.equal(stdout, '', stdout)
      assert.equal(stderr.trim(), expectedReport.replace(/%dirname%/g, dirname).trim(), stderr)
      done()
    })
  })

  it('should use config when it is supplied', function (done) {
    var dirname = fixturesRelativePath + 'rules/'
      , args = [ '-c', fixturesPath + 'config-file/dotfile/.jade-lintrc', dirname + 'disallow-block-expansion.jade' ]
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-disallow-block-expansion.txt', 'utf-8')

    run(args, function (err, code, stdout, stderr) {
      assert(!err, err)
      assert.equal(code, 2, code)
      assert.equal(stdout, '', stdout)
      assert.equal(stderr.trim(), expectedReport.replace(/%dirname%/g, dirname).trim(), stderr)
      done()
    })
  })

})
