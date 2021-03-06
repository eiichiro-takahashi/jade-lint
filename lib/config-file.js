var fs = require('fs')
  , glob = require('glob')
  , path = require('path')

  , configs = [ 'package.json', '.jade-lintrc', '.jade-lint.json' ]

JSON.minify = JSON.minify || require('jsonminify')

exports.getContent = function (config, directory) {

  if (!config) {
    return
  }

  var configPath = path.resolve(directory, config)
    , ext
    , content

  config = path.basename(config)

  if (fs.existsSync(configPath)) {
    ext = path.extname(configPath)

    if (ext === '.js' || ext === '.json') {
      content = require(configPath)
    } else {
      content = JSON.parse(JSON.minify(fs.readFileSync(configPath, 'utf8')))
    }

    Object.defineProperty(content, 'configPath', {
      value: configPath
    })
  }

  return content && config === 'package.json' ? content.jadeLintConfig : content
}

exports.load = function (config, cwd) {

  var content
    , directory = cwd || process.cwd()

  if (config) {
    return this.getContent(config, directory)
  }

  content = this.getContent(
    findup(configs, { nocase: true, cwd: directory }, function (configPath) {
      if (path.basename(configPath) === 'package.json') {
        return !!this.getContent(configPath)
      }

      return true
    }.bind(this))
  )

  if (content) {
    return content
  }

  return this.loadFromHomeDirectory()

}

exports.loadFromHomeDirectory = function () {

  var content
    , directoryArr = [ process.env.USERPROFILE, process.env.HOMEPATH, process.env.HOME ]

  for (var i = 0, dirLen = directoryArr.length; i < dirLen; i++) {
    if (!directoryArr[i]) {
      continue
    }

    for (var j = 0, len = configs.length; j < len; j++) {
      content = this.getContent(configs[j], directoryArr[i])

      /* istanbul ignore next */
      if (content) {
        return content
      }
    }
  }

}

function findup(patterns, options, fn) {

  var lastpath
    , file

  options = Object.create(options)
  options.maxDepth = 1
  options.cwd = path.resolve(options.cwd)

  do {
    file = patterns.filter(filterPatterns)[0]

    if (file) {
      return path.join(options.cwd, file)
    }

    lastpath = options.cwd
    options.cwd = path.resolve(options.cwd, '..')
  } while (options.cwd !== lastpath)

  function filterPatterns(pattern) {

    var configPath = glob.sync(pattern, options)[0]

    if (configPath) {
      return fn(path.join(options.cwd, configPath))
    }

  }

}
