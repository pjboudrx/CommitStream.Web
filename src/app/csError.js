(function() {
  var _ = require('underscore');
  
  var UNEXPECTED_ERROR_MSG = 'There was an unexpected error when processing your request!';

  function CSError(errors, status) {
    this.status = status || 400;
    this.errors = { errors: errors };
  }

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

  csError.errorHandler = function(err, req, res, next){
    console.error("\nEXCEPTION RAISED BY API ROUTE: " + JSON.stringify(req.route));
    console.error("Full error:");
    console.error(JSON.stringify(err));

    function sendError(error) {
      res.status(error.status).json(error.errors);
    }

    if (err.constructor.name === 'CSError') {
      sendError(err);
    } else {
      sendError(csError([UNEXPECTED_ERROR_MSG], 500));
    }
  };

  module.exports = csError;

})();