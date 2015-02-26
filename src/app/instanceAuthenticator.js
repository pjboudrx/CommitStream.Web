(function() {
  var config = require('./config'),
  csError = require('./csError'),
  eventStore = require('./api/helpers/eventStoreClient');

  module.exports = function(req, res, next, instanceId) {
    eventStore.projection.getState({
      name: 'instance',
      partition: 'instance-' + instanceId
    }, function(err, resp) {
      if (err) {
        csError.errorHandler(err, req, res);
      } else if (!resp.body || resp.body.length < 1 || resp.statusCode === 404) { // TODO: we should handle 404 from EventStore consistently
        csError.errorHandler(csError('Could not find an instance with id ' + req.params.instanceId, 404), req, res);
        //throw csError('Could not find an instance with id ' + req.params.instanceId, 404);
      } else { // all good
        var data = JSON.parse(resp.body);
        if (data.apiKey === req.query.apiKey) {
          req.instance = data;
          next();
        } else {
          csError.errorHandler(csError('Invalid apiKey for instance ' + instanceId, 401), req, res);
        }
      }
    });
  };
}());