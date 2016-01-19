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

        return context$1$0.abrupt('return', {
          instance: instance, digest: digest
        });

      case 8:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this);
};

var createInbox = function createInbox(dto) {
  var iteration, inboxToCreate;
  return _regeneratorRuntime.async(function createInbox$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        iteration = dto.iteration;
        inboxToCreate = {
          name: 'GitHub Repo ' + iteration,
          family: 'GitHub'
        };
        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(dto.digest.inboxCreate(inboxToCreate));

      case 4:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 5:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this);
};

var createSampleCommits = function createSampleCommits(inbox) {
  var realMentions;
  return _regeneratorRuntime.async(function createSampleCommits$(context$1$0) {
    var _this3 = this;

    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        realMentions = new _Map();

        realMentions.set('S-01041', ['AT-01075', 'AT-01076', 'AT-01077', 'AT-01085', 'TK-01078', 'TK-01079', 'TK-01080', 'TK-01098', 'TK-01100']);
        realMentions.set('S-01042', ['AT-01078', 'AT-01079', 'AT-01080', 'AT-01081', 'AT-01082', 'TK-01081', 'TK-01082', 'TK-01083', 'TK-01084']);
        realMentions.set('S-01043', ['AT-01083', 'AT-01084', 'AT-01086', 'AT-01087', 'TK-01086', 'TK-01087', 'TK-01088', 'TK-01089']);
        realMentions.set('S-01064', ['AT-01097', 'TK-01113', 'TK-01114']);

        realMentions.forEach(function callee$1$0(parentValue, parentKey) {
          var message;
          return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
            var _this2 = this;

            while (1) switch (context$2$0.prev = context$2$0.next) {
              case 0:
                message = createMessage(parentKey, inbox);
                context$2$0.next = 3;
                return _regeneratorRuntime.awrap(createCommit(message, inbox));

              case 3:
                parentValue.forEach(function callee$2$0(childValue) {
                  var message;
                  return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
                    while (1) switch (context$3$0.prev = context$3$0.next) {
                      case 0:
                        message = createMessage(parentKey + ' ' + childValue, inbox);
                        context$3$0.next = 3;
                        return _regeneratorRuntime.awrap(createCommit(message, inbox));

                      case 3:
                      case 'end':
                        return context$3$0.stop();
                    }
                  }, null, _this2);
                });

              case 4:
              case 'end':
                return context$2$0.stop();
            }
          }, null, _this3);
        });

      case 6:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this);
};

var createMessage = function createMessage(mention, inbox) {
  return mention + ' in  ' + inbox.inboxId + ' of family = ' + inbox.family;
};

var createCommit = function createCommit(message, inbox) {
  var commitAddResponse;
  return _regeneratorRuntime.async(function createCommit$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return _regeneratorRuntime.awrap(inbox.commitCreate(message));

      case 2:
        commitAddResponse = context$1$0.sent;

        if (_commander2['default'].debug) {
          console.log(commitAddResponse.message);
        }

      case 4:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this);
};

var getInboxesToCreate = function getInboxesToCreate(dto) {
  var iteration, inboxesToCreate;
  return _regeneratorRuntime.async(function getInboxesToCreate$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        iteration = dto.iteration;
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

        dto.inboxesToCreate = inboxesToCreate;
        return context$1$0.abrupt('return', dto);

      case 4:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this);
};

var workItemsToMention = [['S-00001', 'T-00001', 'T-00002', 'T-00003', 'T-00004', 'T-00005', 'AT-00001', 'AT-00002', 'AT-00003', 'AT-00004', 'AT-00005'], ['S-00002', 'T-00011', 'T-00012', 'T-00013', 'T-00014', 'T-00015', 'AT-00011', 'AT-00012', 'AT-00013', 'AT-00014', 'AT-00015'], ['S-00003', 'T-00021', 'T-00022', 'T-00023', 'T-00024', 'T-00025', 'AT-00021', 'AT-00022', 'AT-00023', 'AT-00024', 'AT-00025'], ['S-00004', 'T-00031', 'T-00032', 'T-00033', 'T-00034', 'T-00035', 'AT-00031', 'AT-00032', 'AT-00033', 'AT-00034', 'AT-00035']];

var createInboxes = function createInboxes(dto) {
  var inboxNum, digest;
  return _regeneratorRuntime.async(function createInboxes$(context$1$0) {
    var _this6 = this;

    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        inboxNum = 0;
        digest = dto.digest;

        _ramda2['default'].map(function callee$1$0(iteration) {
          var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _loop, _iterator, _step, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2;

          return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
            var _this5 = this;

            while (1) switch (context$2$0.prev = context$2$0.next) {
              case 0:
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                context$2$0.prev = 3;

                _loop = function callee$2$0() {
                  var inboxToCreate, inbox, workItemsGroup, comma, _loop2;

                  return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
                    var _this4 = this;

                    while (1) switch (context$3$0.prev = context$3$0.next) {
                      case 0:
                        inboxToCreate = _step.value;
                        context$3$0.next = 3;
                        return _regeneratorRuntime.awrap(digest.inboxCreate(inboxToCreate));

                      case 3:
                        inbox = context$3$0.sent;
                        workItemsGroup = workItemsToMention[inboxNum % 4];
                        comma = iteration === 0 && inboxNum === 0 ? '' : ',';

                        inboxNum++;
                        dto.inbox = inbox;
                        if (!_commander2['default'].json) {
                          console.log('Adding commits to ' + inbox.inboxId + ' of family ' + inbox.family);
                          console.log(inbox._links['add-commit'].href + '?apiKey=' + client.apiKey);
                        } else console.log(comma + '"' + client.baseUrl + '/' + client.instanceId + '/commits/tags/versionone/workitem?numbers=' + workItemsGroup.join(',') + '&apiKey=' + client.apiKey + '"');
                        _iteratorNormalCompletion2 = true;
                        _didIteratorError2 = false;
                        _iteratorError2 = undefined;
                        context$3$0.prev = 12;

                        _loop2 = function () {
                          var workItem = _step2.value;

                          _ramda2['default'].map(function callee$4$0(mentionNum) {
                            var message;
                            return _regeneratorRuntime.async(function callee$4$0$(context$5$0) {
                              while (1) switch (context$5$0.prev = context$5$0.next) {
                                case 0:
                                  message = workItem + ' mention # ' + mentionNum + ' on ' + iteration + ' in  ' + inbox.inboxId + ' of family = ' + inbox.family;

                                  createCommit(message, inbox);

                                case 2:
                                case 'end':
                                  return context$5$0.stop();
                              }
                            }, null, _this4);
                          }, _ramda2['default'].range(0, number_of_mentions_per_workitem_per_repo));
                        };

                        for (_iterator2 = _getIterator(workItemsGroup); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                          _loop2();
                        }
                        context$3$0.next = 21;
                        break;

                      case 17:
                        context$3$0.prev = 17;
                        context$3$0.t0 = context$3$0['catch'](12);
                        _didIteratorError2 = true;
                        _iteratorError2 = context$3$0.t0;

                      case 21:
                        context$3$0.prev = 21;
                        context$3$0.prev = 22;

                        if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                          _iterator2['return']();
                        }

                      case 24:
                        context$3$0.prev = 24;

                        if (!_didIteratorError2) {
                          context$3$0.next = 27;
                          break;
                        }

                        throw _iteratorError2;

                      case 27:
                        return context$3$0.finish(24);

                      case 28:
                        return context$3$0.finish(21);

                      case 29:
                      case 'end':
                        return context$3$0.stop();
                    }
                  }, null, _this5, [[12, 17, 21, 29], [22,, 24, 28]]);
                };

                _iterator = _getIterator(dto.inboxesToCreate);

              case 6:
                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                  context$2$0.next = 12;
                  break;
                }

                context$2$0.next = 9;
                return _regeneratorRuntime.awrap(_loop());

              case 9:
                _iteratorNormalCompletion = true;
                context$2$0.next = 6;
                break;

              case 12:
                context$2$0.next = 18;
                break;

              case 14:
                context$2$0.prev = 14;
                context$2$0.t0 = context$2$0['catch'](3);
                _didIteratorError = true;
                _iteratorError = context$2$0.t0;

              case 18:
                context$2$0.prev = 18;
                context$2$0.prev = 19;

                if (!_iteratorNormalCompletion && _iterator['return']) {
                  _iterator['return']();
                }

              case 21:
                context$2$0.prev = 21;

                if (!_didIteratorError) {
                  context$2$0.next = 24;
                  break;
                }

                throw _iteratorError;

              case 24:
                return context$2$0.finish(21);

              case 25:
                return context$2$0.finish(18);

              case 26:
              case 'end':
                return context$2$0.stop();
            }
          }, null, _this6, [[3, 14, 18, 26], [19,, 21, 25]]);
        }, _ramda2['default'].range(0, number_of_repo_iterations));

      case 3:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this);
};

var run = function run() {
  var createInstanceWithSampleData, iteration;
  return _regeneratorRuntime.async(function run$(context$1$0) {
    var _this7 = this;

    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        if (_commander2['default'].json) console.log('[');

        if (!_commander2['default'].sample) {
          context$1$0.next = 9;
          break;
        }

        console.log('Creating instance with sample data');
        createInstanceWithSampleData = _ramda2['default'].pipeP(createInstanceAndDigest, createInbox, createSampleCommits);
        iteration = new Date().toGMTString();
        context$1$0.next = 7;
        return _regeneratorRuntime.awrap(createInstanceWithSampleData(iteration));

      case 7:
        context$1$0.next = 11;
        break;

      case 9:
        console.log('Creating instance with fake data');
        try {
          (function () {
            var createInstanceWithFakeData = _ramda2['default'].pipeP(createInstanceAndDigest, getInboxesToCreate, createInboxes);

            _ramda2['default'].map(function callee$2$0(instanceNumber) {
              return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
                while (1) switch (context$3$0.prev = context$3$0.next) {
                  case 0:
                    context$3$0.next = 2;
                    return _regeneratorRuntime.awrap(createInstanceWithFakeData(instanceNumber));

                  case 2:
                  case 'end':
                    return context$3$0.stop();
                }
              }, null, _this7);
            }, _ramda2['default'].range(0, number_of_instances));
          })();
        } catch (e) {
          // Review exception handling, it seems to be swallowing the errors
          console.log(e);
        }

      case 11:
        if (_commander2['default'].json) console.log(']');

      case 12:
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
