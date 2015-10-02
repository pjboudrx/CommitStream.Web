(function(bootstrapper) {
  bootstrapper.boot = function(config) {
    var _ = require('underscore'),
      path = require('path'),
      fs = require('fs'),
      EventStore = require('eventstore-client'),
      logger = require('./middleware/logger');

    var es = new EventStore({
      baseUrl: config.eventStoreBaseUrl,
      username: config.eventStoreUser,
      password: config.eventStorePassword
    });

    logger.info('Enabling system projections...');
    es.projection.enableSystemAll(function() {});

    logger.info('Looking for already existing projections...');
    es.projections.get(function(error, response) {
      initProjections(JSON.parse(response.body));
    });

    function initProjections(existingProjections) {
      logger.info('Looking for new projections...');
      getLocalProjections(function(item) {
        if (!_.findWhere(existingProjections.projections, {
          effectiveName: item.name
        })) {
          createProjection(item)
        } else {
          logger.info('OK found ' + item.name);
        }
      });
    };

    function getLocalProjections(cb) {
      var projections = [];
      var dir = path.join(__dirname, 'projections');
      fs.readdir(dir, function(err, files) {
        files.forEach(function(name) {
          var fullPath = path.join(dir, name);
          fs.readFile(fullPath, 'utf-8', function(err, script) {
            cb({
              name: name.slice(0, -3),
              projection: script
            });
          });
        });
      });
    };

    function createProjection(projectionObject) {
      es.projections.post(projectionObject, function(error, response) {
        if (error) {
          logger.error('ERROR could not create projection ' + projectionObject.name + ':');
          logger.error(error);
        } else {
          logger.info('OK created projection ' + projectionObject.name);
          logger.info(response.body);
        }
      });
    };
  }
})(module.exports);