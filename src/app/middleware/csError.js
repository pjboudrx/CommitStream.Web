(function() {
  var _ = require('underscore'),
    util = require('util'),
    createCustomError = require('custom-error-generator'),
    logger = require('./logger');

  var UNEXPECTED_ERROR_MSG = 'There was an unexpected error when processing your request.';

  var CSError = createCustomError('CSError', null, function(errors, statusCode, internalMessage) {
    this.errors = {
      errors: errors || []
    };
    this.statusCode = statusCode || 400;
    this.internalMessage = internalMessage || null;
    if (this.internalMessage !== null) {
      this.errors = {
        errors: [UNEXPECTED_ERROR_MSG]
      };
    }
  });

  var csError = function(errors, status) {
    var status = status || 400;
    var _errors = [];

    if (_.isArray(errors)) {
      _errors = errors;
    } else if (_.isString(errors)) {
      _errors.push(errors);
    } else {
      _errors.push(UNEXPECTED_ERROR_MSG)
    }

    return new CSError(_errors, status);
  };

  csError.errorHandler = function(err, req, res, next) {
    var errorMessage = {
      level: 'error',
      route: req.route.path,
      url: util.inspect(req.originalUrl),
        headers: util.inspect(req.headers, {
        showHidden: true,
        depth: null
      }),
      body: req.body,
      stackTrace: err.stack,
      exception: util.inspect(err, {
        showHidden: true,
        depth: null
      }).substr(0, 5000),
      internalMessage: ''
    };

    "level", "status", "route", "url", "internalMessage", "exception", "body", "stackTrace"

    function sendError(error) {
      res.status(error.statusCode).json(error.errors);
    }

    if (err instanceof CSError) {
      sendError(err);
      if (err.internalMessage !== null) {
        errorMessage.internalMessage = err.internalMessage;
      }
      errorMessage.status = err.statusCode;
      logger.error(JSON.stringify(errorMessage));
    } else {
      sendError(csError([UNEXPECTED_ERROR_MSG], 500));
      errorMessage.status = 500;
      logger.error(JSON.stringify(errorMessage));
    }
  };

  csError.createCustomError = function(errorName, ctor, baseErrorCtor) {
    var customError = createCustomError(errorName, null, ctor);
    baseErrorCtor = baseErrorCtor || CSError;
    customError.prototype = Object.create(baseErrorCtor.prototype);
    return customError;
  };

  module.exports = csError;

})();
