(function() {
  var _ = require('underscore'),
    util = require('util'),
    createCustomError = require('custom-error-generator'),
    bunyan = require('bunyan'),
    azBunyan = require('az-bunyan');

  // define the target azure storage table name
  var tableName = 'developingapplogtable';

  // define the connection string to your azure storage account
  var connectionString = 'DefaultEndpointsProtocol=https;AccountName=commitstreamdev;AccountKey=PBr7JHysuTvIXJwljstuPLmBoVCao/UQvPVqiJQRrfXgAdXAw41hQpXKz1f+fSzQ3niJVMwgTU7fsSA+1esmIA==';

  // initialize the az-bunyan table storage stream
  var azureStreamInfo = azBunyan.createTableStorageStream('info', {
    connectionString: connectionString,
    tableName: tableName
  });
  var azureStreamError = azBunyan.createTableStorageStream('error', {
    connectionString: connectionString,
    tableName: tableName
  });

  var logger = bunyan.createLogger({
    name: "CSError-Logger", // logger name
    serializers: {
      req: bunyan.stdSerializers.req, // standard bunyan req serializer
      err: bunyan.stdSerializers.err // standard bunyan error serializer
    },
    streams: [{
        level: 'info', // loging level
        stream: process.stdout // log INFO and above to stdout
      }, {
        level: 'error', // loging level
        stream: process.stderr // log INFO and above to stdout
      },
      azureStreamInfo,
      azureStreamError
    ]
  });

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
    // logger.info("bunyan logger" + util.inspect(req.route, {
    //   showHidden: true,
    //   depth: null
    // }).substr(0, 5000));
    logger.info("bunyan logger" + req);
    var errorMessage = "\nEXCEPTION RAISED BY API ROUTE: " + util.inspect(req.route, {
      showHidden: true,
      depth: null
    }).substr(0, 5000)
    + "\nURL: " + util.inspect(req.originalUrl)
    + "\nHEADERS:\n" + util.inspect(req.headers, {
      showHidden: true,
      depth: null
    })
    + "\nBODY:\n" + util.inspect(req.body, {
      showHidden: true,
      depth: null
    })
    + "\nSTACK TRACE:\n"
    + err.stack
    + "\nCAUGHT ERROR DETAILS:\n"
    + util.inspect(err, {
      showHidden: true,
      depth: null
    }).substr(0, 5000);

    function sendError(error) {
      res.status(error.statusCode).json(error.errors);
    }

    if (err instanceof CSError) {
      sendError(err);
      if (err.internalMessage !== null) {
        errorMessage += "\nINTERNAL MESSAGE:\n" + err.internalMessage;
      }
      logger.error(errorMessage);
    } else {
      sendError(csError([UNEXPECTED_ERROR_MSG], 500));
      logger.error(errorMessage);
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
