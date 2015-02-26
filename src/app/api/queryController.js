(function(controller) {
  var config = require('../config'),
    gitHubEventsToApiResponse = require('./translators/gitHubEventsToApiResponse'),
    es = require('./helpers/eventStoreClient'),
    _ = require('underscore'),
    uuid = require('uuid-v4'),
    Cache = require('ttl-cache');

  function buildUri(protocol, host, instanceId, guid, parms) {
    return protocol + '://' + host + '/api/' + instanceId + '/query?key=' + parms.key + '&workitem=' + parms.workitem + '&page=' + guid;
  }


  controller.init = function(app) {
    var cache = new Cache({
      ttl: 120, // Number of seconds to keep entries
      interval: 60 // Cleaning interval
    });

    app.get("/api/:instanceId/query", function(req, res) {

      // NOTE: Was going to pull the usage of protocol and host out of here
      //       and use our urls module, but we have been talking about pulling this
      //       controller apart and placing the resposibilities into other controllers
      //       so rather than refactor it, I decided to just wait until that work happens.
      var protocol = config.protocol || req.protocol;
      var host = req.get('host');

      if (req.query.workitem) {

        var stream;
        if (req.query.workitem.toLowerCase() === 'all') {
          stream = 'digestCommits-' + req.query.digestId;
        } else {
          // Good times. The pattern is like this:
          // versionOne_CommitsWithWorkitems-<instanceId>_<workitem>
          stream = 'versionOne_CommitsWithWorkitems-' + req.instance.instanceId + '_' + req.query.workitem;
        }

        var hasPageSize = function(query) {
          return _.has(query, "pageSize");
        };

        var getPageSize = function(query) {
          return query.pageSize;
        };

        var convertToInt = function(stringVal) {
          if (!isNaN(stringVal)) {
            return parseInt(stringVal, 10);
          }          
          return NaN;
        };

        var getDefaultWhenNaN = function(value, defaultValue) {
          if (_.isNaN(value)) {
            return defaultValue;
          } 
          return value;
        };

        var getConvertedPageSizeOrDefault = function(query) {
          var defaultSize = 25;
          if (!hasPageSize(query)) {
            return defaultSize;
          }
          var convertedSize = convertToInt(getPageSize(query));
          return getDefaultWhenNaN(convertedSize, defaultSize);
        };

        var pageSize = getConvertedPageSizeOrDefault(req.query);
        var page = cache.get(req.query.page);

        es.streams.get({
          name: stream,
          count: pageSize,
          pageUrl: page
        }, function(error, response) {
          var result = {
            commits: [],
            _links: {}
          };

          if (response.body) {
            var obj = JSON.parse(response.body);
            var links = obj.links;
            var guid = uuid();
            result = gitHubEventsToApiResponse(obj.entries);
            //TODO: check all of them, not just the third one
            if (links[3].relation === 'next') {
              cache.set(guid, links[3].uri);
              var next = buildUri(protocol, host, req.instance.instanceId, guid, req.query);
              var previous = buildUri(protocol, host, req.instance.instanceId, req.query.page, req.query);
              result._links = {
                next: next
              };
            }
          }

          res.set("Content-Type", "application/json");
          res.send(result);
        });
      } else {
        res.set("Content-Type", "application/json");
        res.status(400).send({
          error: 'Parameter workitem is required'
        });
      }
    });
  };
}(module.exports));