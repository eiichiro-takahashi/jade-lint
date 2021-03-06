var jadeLexer = require('jade-lexer')
  , utils = require('./utils')

  , JadeFile = function (filename, source) {

      this._parseErrors = []
      this._filename = filename
      this._source = source
      this._lines = this._source.split(/\r\n|\r|\n/)
      this._lineBreaks = this._source.match(/\r\n|\r|\n/g)

      try {
        this._tokens = jadeLexer(this._source, this._filename)
      } catch (e) {
        this._parseErrors.push(e)
      }

    }

JadeFile.prototype =
  { addErrorForAllLinesByFilter: function (filter, regex, isMatch, errors, message) {

      var _this = this

      _this.iterateTokensByFilter(filter, function (token) {
        _this.addErrorForLine(token.line, regex, isMatch, errors, message)
      })

    }

  , addErrorForAllLinesByType: function (type, regex, isMatch, errors, message) {

      type = utils.createTypeArray(type)

      this.addErrorForAllLinesByFilter(function (token) {
        return type.indexOf(token.type) !== -1
      }, regex, isMatch, errors, message)

    }

  , addErrorForAllTokensByFilter: function (filter, errors, message) {

      this.iterateTokensByFilter(filter, function (token) {
        errors.add(message, token.line)
      })

    }

  , addErrorForAllTokensByType: function (type, errors, message) {

      this.iterateTokensByType(type, function (token) {
        errors.add(message, token.line)
      })

    }

  , addErrorForIncorrectTokenTypeOrder: function (typeA, typeB, errors, message) {

      typeA = utils.createTypeArray(typeA)
      typeB = utils.createTypeArray(typeB)

      var tokens = this.getTokens()
        , lineNumbers = []
        , _this = this

      _this.iterateTokensByFilter(function (token) {
        var lineNumber = token.line

        if (typeA.indexOf(token.type) !== -1 && lineNumbers.indexOf(lineNumber) === -1) {
          lineNumbers.push(lineNumber)

          return true
        }

        return false
      }, function (token) {
        var lineNumber = token.line
          , typeAIndex = tokens.indexOf(token)

        _this.iterateTokensByFilter(function (token) {
          return typeB.indexOf(token.type) !== -1 && token.line === lineNumber
        }, function (token) {
          var typeBIndex = tokens.indexOf(token)

          if (typeAIndex > typeBIndex) {
            errors.add(message, lineNumber)
          }
        })
      })

    }

  , addErrorForLine: function (lineNumber, regex, isMatch, errors, message) {

      var line = this.getLine(lineNumber)

      if (regex.test(line) === isMatch) {
        errors.add(message, lineNumber)
      }

    }

  , getFilename: function () {

      return this._filename

    }

  , getFirstToken: function () {

      return this.getToken(0)

    }

  , getLastToken: function () {

      var tokens = this.getTokens()

      return tokens[tokens.length - 1]

    }

  , getLine: function (line) {

      return this.getLines()[line - 1]

    }

  , getLineBreaks: function () {

      return this._lineBreaks

    }

  , getLines: function () {

      return this._lines

  }

  , getParseErrors: function () {

      return this._parseErrors

    }

  , getPreviousToken: function (token, ignore) {

      var tokens = this.getTokens()
        , index = tokens.indexOf(token) - 1

      do {
        var previousToken = tokens[index]

        if (!ignore || ignore.indexOf(previousToken.type) === -1) {
          return previousToken
        }
      } while (--index >= 0)

    }

  , getSource: function () {

      return this._source

    }

  , getToken: function (index) {

      var tokens = this.getTokens()

      return (tokens && tokens.length > index) ? tokens[index] : null

    }

  , getTokens: function () {

      return this._tokens

    }

  , getTokensByFilter: function (filter) {

      return this.getTokens().filter(filter)

    }

  , iterateTokensByFilter: function (filter, cb) {

      this.getTokensByFilter(filter).forEach(function (token) {
        cb(token)
      })

    }

  , iterateTokensByType: function (type, cb) {

      type = utils.createTypeArray(type)

      this.iterateTokensByFilter(function (token) {
        return type.indexOf(token.type) !== -1
      }, cb)

    }
  }

module.exports = JadeFile
