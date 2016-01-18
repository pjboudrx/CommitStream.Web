'use strict';

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _Map = require('babel-runtime/core-js/map')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _this = this;

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _libCsApiClient = require('./lib/cs-api-client');

var _libCsApiClient2 = _interopRequireDefault(_libCsApiClient);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

_commander2['default'].version('0.0.0').option('-u, --url [url]', 'The base URL for the CommitStream Service API, default: http://localhost:6565/api', 'http://localhost:6565/api').option('-i, --instances [number]', 'Number of instances to create, default: 1', 1).option('-r, --repos [number]', 'Number of repos creation iterations to run (creates one repo per family type during each iteration), default 1', 1).option('-m, --mentions [number]', 'Number of times to post a commit with each mention (one story, 5 tasks, 5 tests in each group of workitems), default 1', 1).option('-d, --debug', 'Show results of each commit, not just summary information').option('-j, --json', 'Log only the JSON output with all the query URLs needed for the performance client').option('-s, --sample', 'Create the commits with sample data that exists in the PR builds', 0).parse(process.argv);

var number_of_instances = parseInt(_commander2['default'].instances);
var number_of_repo_iterations = parseInt(_commander2['default'].repos);
var number_of_mentions_per_workitem_per_repo = parseInt(_commander2['default'].mentions);

var client = new _libCsApiClient2['default'](_commander2['default'].url);

if (!_commander2['default'].json) console.log('Operating against this CommitStream Service API: ' + client.baseUrl);

var createInstanceAndDigest = function createInstanceAndDigest(iteration) {
  var instance, digest;
  return _regeneratorRuntime.async(function createInstanceAndDigest$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return _regeneratorRuntime.awrap(client.instanceCreate());

      case 2:
        instance = context$1$0.sent;
        context$1$0.next = 5;
        return _regeneratorRuntime.awrap(instance.digestCreate({
          description: 'Digest for ' + iteration
        }));

      case 5:
        digest = context$1$0.sent;

        if (!_commander2['default'].json) {
          console.log('The digest: ' + digest._links['teamroom-view'].href + '&apiKey=' + client.apiKey);
          console.log('#' + iteration + ': Populating instance ' + client.instanceId + ' (apiKey = ' + client.apiKey + ')');
        }
        return context$1$0.abrupt('return', digest);

      case 8:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this);
};

var createInbox = _ramda2['default'].curry(function callee$0$0(iteration, digest) {
  var inboxToCreate;
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        inboxToCreate = {
          name: 'GitHub Repo ' + iteration,
          family: 'GitHub'
        };
        context$1$0.next = 3;
        return _regeneratorRuntime.awrap(digest.inboxCreate(inboxToCreate));

      case 3:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 4:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this);
});

var createMessage = function createMessage(mention, inbox) {
  var message = mention + ' in  ' + inbox.inboxId + ' of family = ' + inbox.family;
};

var createCommits = _ramda2['default'].curry(function callee$0$0(mentions, inbox) {
  return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    var _this3 = this;

    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        mentions.forEach(function callee$1$0(v, k, map) {
          var message, commitAddResponse;
          return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
            var _this2 = this;

            while (1) switch (context$2$0.prev = context$2$0.next) {
              case 0:
                message = createMessage(k, inbox);
                context$2$0.next = 3;
                return _regeneratorRuntime.awrap(inbox.commitCreate(message));

              case 3:
                commitAddResponse = context$2$0.sent;

                if (_commander2['default'].debug) {
                  console.log(commitAddResponse.message);
                }

                v.forEach(function callee$2$0(v, i, array) {
                  var message, commitAddResponse;
                  return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
                    while (1) switch (context$3$0.prev = context$3$0.next) {
                      case 0:
                        message = k + ' ' + v + ' in  ' + inbox.inboxId + ' of family = ' + inbox.family;
                        context$3$0.next = 3;
                        return _regeneratorRuntime.awrap(inbox.commitCreate(message));

                      case 3:
                        commitAddResponse = context$3$0.sent;

                        if (_commander2['default'].debug) {
                          console.log(commitAddResponse.message);
                        }

                      case 5:
                      case 'end':
                        return context$3$0.stop();
                    }
                  }, null, _this2);
                });

              case 6:
              case 'end':
                return context$2$0.stop();
            }
          }, null, _this3);
        });

      case 1:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this);
});

//  console.log('Creating instance with sample data');

var realMentions = new _Map();
realMentions.set('S-01041', ['AT-01075', 'AT-01076', 'AT-01077', 'AT-01085', 'TK-01078', 'TK-01079', 'TK-01080', 'TK-01098', 'TK-01100']);
realMentions.set('S-01042', ['AT-01078', 'AT-01079', 'AT-01080', 'AT-01081', 'AT-01082', 'TK-01081', 'TK-01082', 'TK-01083', 'TK-01084']);
realMentions.set('S-01043', ['AT-01083', 'AT-01084', 'AT-01086', 'AT-01087', 'TK-01086', 'TK-01087', 'TK-01088', 'TK-01089']);
realMentions.set('S-01064', ['AT-01097', 'TK-01113', 'TK-01114']);

var createInstanceWithFakeData = function createInstanceWithFakeData(iteration) {
  var inboxesToCreate, workItemsToMention, instance, digest, n, inboxNum, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, inboxToCreate, inbox, workItemGroupNum, workItemsGroup, comma, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, workItem, mentionNum, message, commitAddResponse;

  return _regeneratorRuntime.async(function createInstanceWithFakeData$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        inboxesToCreate = [{
          name: 'GitHub Repo ' + iteration,
          family: 'GitHub'
        }, {
          name: 'GitLab Repo ' + iteration,
          family: 'GitLab'
        }, {
          name: 'Bitbucket Repo ' + iteration,
          family: 'Bitbucket'
        }, {
          name: 'VsoGit Repo ' + iteration,
          family: 'VsoGit'
        }];
        workItemsToMention = [['S-00001', 'T-00001', 'T-00002', 'T-00003', 'T-00004', 'T-00005', 'AT-00001', 'AT-00002', 'AT-00003', 'AT-00004', 'AT-00005'], ['S-00002', 'T-00011', 'T-00012', 'T-00013', 'T-00014', 'T-00015', 'AT-00011', 'AT-00012', 'AT-00013', 'AT-00014', 'AT-00015'], ['S-00003', 'T-00021', 'T-00022', 'T-00023', 'T-00024', 'T-00025', 'AT-00021', 'AT-00022', 'AT-00023', 'AT-00024', 'AT-00025'], ['S-00004', 'T-00031', 'T-00032', 'T-00033', 'T-00034', 'T-00035', 'AT-00031', 'AT-00032', 'AT-00033', 'AT-00034', 'AT-00035']];
        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(client.instanceCreate());

      case 4:
        instance = context$1$0.sent;
        context$1$0.next = 7;
        return _regeneratorRuntime.awrap(instance.digestCreate({
          description: 'Digest for ' + iteration
        }));

      case 7:
        digest = context$1$0.sent;

        if (!_commander2['default'].json) {
          console.log('The digest: ' + digest._links['teamroom-view'].href + '&apiKey=' + client.apiKey);
          console.log('#' + iteration + ': Populating instance ' + client.instanceId + ' (apiKey = ' + client.apiKey + ')');
        }

        n = 0;

      case 10:
        if (!(n < number_of_repo_iterations)) {
          context$1$0.next = 81;
          break;
        }

        inboxNum = 0;
        _iteratorNormalCompletion = true;
        _didIteratorError = false;
        _iteratorError = undefined;
        context$1$0.prev = 15;
        _iterator = _getIterator(inboxesToCreate);

      case 17:
        if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
          context$1$0.next = 64;
          break;
        }

        inboxToCreate = _step.value;
        context$1$0.next = 21;
        return _regeneratorRuntime.awrap(digest.inboxCreate(inboxToCreate));

      case 21:
        inbox = context$1$0.sent;
        workItemGroupNum = inboxNum % 4;
        workItemsGroup = workItemsToMention[workItemGroupNum];
        comma = iteration === 0 && inboxNum === 0 ? '' : ',';

        inboxNum++;
        if (!_commander2['default'].json) {
          console.log('Adding commits to ' + inbox.inboxId + ' of family ' + inbox.family);
          console.log(inbox._links['add-commit'].href + '?apiKey=' + client.apiKey);
        } else console.log(comma + '"' + client.baseUrl + '/' + client.instanceId + '/commits/tags/versionone/workitem?numbers=' + workItemsGroup.join(',') + '&apiKey=' + client.apiKey + '"');
        _iteratorNormalCompletion2 = true;
        _didIteratorError2 = false;
        _iteratorError2 = undefined;
        context$1$0.prev = 30;
        _iterator2 = _getIterator(workItemsGroup);

      case 32:
        if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
          context$1$0.next = 47;
          break;
        }

        workItem = _step2.value;
        mentionNum = 0;

      case 35:
        if (!(mentionNum < number_of_mentions_per_workitem_per_repo)) {
          context$1$0.next = 44;
          break;
        }

        message = workItem + ' mention # ' + mentionNum + ' on ' + iteration + ' in  ' + inbox.inboxId + ' of family = ' + inbox.family;
        context$1$0.next = 39;
        return _regeneratorRuntime.awrap(inbox.commitCreate(message));

      case 39:
        commitAddResponse = context$1$0.sent;

        if (_commander2['default'].debug) {
          console.log(commitAddResponse.message);
        }

      case 41:
        mentionNum++;
        context$1$0.next = 35;
        break;

      case 44:
        _iteratorNormalCompletion2 = true;
        context$1$0.next = 32;
        break;

      case 47:
        context$1$0.next = 53;
        break;

      case 49:
        context$1$0.prev = 49;
        context$1$0.t0 = context$1$0['catch'](30);
        _didIteratorError2 = true;
        _iteratorError2 = context$1$0.t0;

      case 53:
        context$1$0.prev = 53;
        context$1$0.prev = 54;

        if (!_iteratorNormalCompletion2 && _iterator2['return']) {
          _iterator2['return']();
        }

      case 56:
        context$1$0.prev = 56;

        if (!_didIteratorError2) {
          context$1$0.next = 59;
          break;
        }

        throw _iteratorError2;

      case 59:
        return context$1$0.finish(56);

      case 60:
        return context$1$0.finish(53);

      case 61:
        _iteratorNormalCompletion = true;
        context$1$0.next = 17;
        break;

      case 64:
        context$1$0.next = 70;
        break;

      case 66:
        context$1$0.prev = 66;
        context$1$0.t1 = context$1$0['catch'](15);
        _didIteratorError = true;
        _iteratorError = context$1$0.t1;

      case 70:
        context$1$0.prev = 70;
        context$1$0.prev = 71;

        if (!_iteratorNormalCompletion && _iterator['return']) {
          _iterator['return']();
        }

      case 73:
        context$1$0.prev = 73;

        if (!_didIteratorError) {
          context$1$0.next = 76;
          break;
        }

        throw _iteratorError;

      case 76:
        return context$1$0.finish(73);

      case 77:
        return context$1$0.finish(70);

      case 78:
        n++;
        context$1$0.next = 10;
        break;

      case 81:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this, [[15, 66, 70, 78], [30, 49, 53, 61], [54,, 56, 60], [71,, 73, 77]]);
};

var run = function run() {
  var iteration, createInstanceWithSampleData, instanceNum;
  return _regeneratorRuntime.async(function run$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        if (_commander2['default'].json) console.log('[');

        if (!_commander2['default'].sample) {
          context$1$0.next = 8;
          break;
        }

        iteration = new Date().toGMTString();
        createInstanceWithSampleData = _ramda2['default'].pipeP(createInstanceAndDigest, createInbox(iteration), createCommits(realMentions));
        context$1$0.next = 6;
        return _regeneratorRuntime.awrap(createInstanceWithSampleData(iteration));

      case 6:
        context$1$0.next = 15;
        break;

      case 8:
        instanceNum = 0;

      case 9:
        if (!(instanceNum < number_of_instances)) {
          context$1$0.next = 15;
          break;
        }

        context$1$0.next = 12;
        return _regeneratorRuntime.awrap(createInstanceWithFakeData(instanceNum));

      case 12:
        instanceNum++;
        context$1$0.next = 9;
        break;

      case 15:
        if (_commander2['default'].json) console.log(']');

      case 16:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this);
};

try {
  run();
} catch (e) {
  console.log(e);
}
