'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

(function (githubTranslator) {
  var _ = require('underscore'),
      util = require('util'),
      uuid = require('uuid-v4'),
      CSError = require('../../middleware/csError');

  //TODO: do we want this kind of library to know about status codes?

  var GitHubCommitMalformedError = (function (_CSError) {
    _inherits(GitHubCommitMalformedError, _CSError);

    function GitHubCommitMalformedError(error, pushEvent) {
      _classCallCheck(this, GitHubCommitMalformedError);

      _get(Object.getPrototypeOf(GitHubCommitMalformedError.prototype), 'constructor', this).call(this, [error.toString()]);
      this.originalError = error;
      this.pushEvent = pushEvent;
    }

    return GitHubCommitMalformedError;
  })(CSError);

  githubTranslator.translatePush = function (pushEvent, instanceId, digestId, inboxId) {
    try {
      var branch = pushEvent.ref.split('/').pop();
      var repository = {
        id: pushEvent.repository.id,
        name: pushEvent.repository.name
      };

      var events = _.map(pushEvent.commits, function (aCommit) {
        var commit = {
          sha: aCommit.id,
          commit: {
            author: aCommit.author,
            committer: {
              name: aCommit.committer.name,
              email: aCommit.committer.email,
              date: aCommit.timestamp
            },
            message: aCommit.message
          },
          html_url: aCommit.url,
          repository: repository,
          branch: branch,
          originalMessage: aCommit
        };
        return {
          eventId: uuid(),
          eventType: 'GitHubCommitReceived',
          data: commit,
          metadata: {
            instanceId: instanceId,
            digestId: digestId,
            inboxId: inboxId
          }
        };
      });
      return events;
    } catch (ex) {
      var otherEx = new GitHubCommitMalformedError(ex, pushEvent);
      //console.log(otherEx, otherEx.originalError.stack);
      throw otherEx;
    }
  };

  githubTranslator.canTranslate = function (request) {
    var headers = request.headers;
    if (headers.hasOwnProperty('x-github-event') && headers['x-github-event'] === 'push') {
      return true;
    }
    return false;
  };
})(module.exports);
