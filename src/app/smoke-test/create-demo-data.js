'use strict';

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _this = this;

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _libCsApiClient = require('./lib/cs-api-client');

var _libCsApiClient2 = _interopRequireDefault(_libCsApiClient);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var readFile = _bluebird2['default'].promisify(require("fs").readFile);

_commander2['default'].version('0.0.0').option('-u, --url [url]', 'The base URL for the CommitStream Service API, default: http://localhost:6565/api', 'http://localhost:6565/api').option('-i, --instances [number]', 'Number of instances to create, default: 1', 1).option('-r, --repos [number]', 'Number of repos creation iterations to run (creates one repo per family type during each iteration), default 1', 1).option('-m, --mentions [number]', 'Number of times to post a commit with each mention (one story, 5 tasks, 5 tests in each group of workitems), default 1', 1).option('-d, --debug', 'Show results of each commit, not just summary information').option('-j, --json', 'Log only the JSON output with all the query URLs needed for the performance client').option('-s, --sample', 'Create the commits with sample data that exists in the PR builds', 0).parse(process.argv);

var number_of_instances = parseInt(_commander2['default'].instances);
var number_of_repo_iterations = parseInt(_commander2['default'].repos);
var number_of_mentions_per_workitem_per_repo = parseInt(_commander2['default'].mentions);
var sample_work_items_to_mention = 'sampleWorkItemsToMention.json';
var fake_work_items_to_mention = 'fakeWorkItemsToMention.json';

var client = new _libCsApiClient2['default'](_commander2['default'].url);

if (!_commander2['default'].json) console.log('Operating against this CommitStream Service API: ' + client.baseUrl);

var getFromJsonFile = function getFromJsonFile(fileName) {
  var fileContent;
  return _regeneratorRuntime.async(function getFromJsonFile$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return _regeneratorRuntime.awrap(readFile(fileName, "utf8"));

      case 2:
        fileContent = context$1$0.sent;
        return context$1$0.abrupt('return', JSON.parse(fileContent));

      case 4:
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

// :'( https://github.com/zenparsing/async-iteration/
var getAsyncIteratorElement = function getAsyncIteratorElement(iterator) {
  return _regeneratorRuntime.async(function getAsyncIteratorElement$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return _regeneratorRuntime.awrap(iterator.next());

      case 2:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 3:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this);
};

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
          iteration: iteration, digest: digest
        });

      case 8:
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

var createInboxes = _regeneratorRuntime.mark(function createInboxes(dto) {
  var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, inboxToCreate;

  return _regeneratorRuntime.async(function createInboxes$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        _iteratorNormalCompletion = true;
        _didIteratorError = false;
        _iteratorError = undefined;
        context$1$0.prev = 3;
        _iterator = _getIterator(dto.inboxesToCreate);

      case 5:
        if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
          context$1$0.next = 15;
          break;
        }

        inboxToCreate = _step.value;
        context$1$0.next = 9;
        return _regeneratorRuntime.awrap(dto.digest.inboxCreate(inboxToCreate));

      case 9:
        dto.inbox = context$1$0.sent;
        context$1$0.next = 12;
        return dto;

      case 12:
        _iteratorNormalCompletion = true;
        context$1$0.next = 5;
        break;

      case 15:
        context$1$0.next = 21;
        break;

      case 17:
        context$1$0.prev = 17;
        context$1$0.t0 = context$1$0['catch'](3);
        _didIteratorError = true;
        _iteratorError = context$1$0.t0;

      case 21:
        context$1$0.prev = 21;
        context$1$0.prev = 22;

        if (!_iteratorNormalCompletion && _iterator['return']) {
          _iterator['return']();
        }

      case 24:
        context$1$0.prev = 24;

        if (!_didIteratorError) {
          context$1$0.next = 27;
          break;
        }

        throw _iteratorError;

      case 27:
        return context$1$0.finish(24);

      case 28:
        return context$1$0.finish(21);

      case 29:
      case 'end':
        return context$1$0.stop();
    }
  }, createInboxes, this, [[3, 17, 21, 29], [22,, 24, 28]]);
});

var createSampleCommits = function createSampleCommits(dtoAsyncIterator) {
  var sampleWorkItemsToMention, dtoElement, _loop;

  return _regeneratorRuntime.async(function createSampleCommits$(context$1$0) {
    var _this4 = this;

    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return _regeneratorRuntime.awrap(getFromJsonFile(sample_work_items_to_mention));

      case 2:
        sampleWorkItemsToMention = context$1$0.sent;
        context$1$0.next = 5;
        return _regeneratorRuntime.awrap(getAsyncIteratorElement(dtoAsyncIterator));

      case 5:
        dtoElement = context$1$0.sent;

        _loop = function callee$1$0() {
          var inbox;
          return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
            var _this3 = this;

            while (1) switch (context$2$0.prev = context$2$0.next) {
              case 0:
                inbox = dtoElement.value.inbox;

                sampleWorkItemsToMention.forEach(function callee$2$0(parentValue, parentKey) {
                  var message;
                  return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
                    var _this2 = this;

                    while (1) switch (context$3$0.prev = context$3$0.next) {
                      case 0:
                        message = createMessage(parentKey, inbox);
                        context$3$0.next = 3;
                        return _regeneratorRuntime.awrap(createCommit(message, inbox));

                      case 3:
                        parentValue.forEach(function callee$3$0(childValue) {
                          var message;
                          return _regeneratorRuntime.async(function callee$3$0$(context$4$0) {
                            while (1) switch (context$4$0.prev = context$4$0.next) {
                              case 0:
                                message = createMessage(parentKey + ' ' + childValue, inbox);
                                context$4$0.next = 3;
                                return _regeneratorRuntime.awrap(createCommit(message, inbox));

                              case 3:
                              case 'end':
                                return context$4$0.stop();
                            }
                          }, null, _this2);
                        });

                      case 4:
                      case 'end':
                        return context$3$0.stop();
                    }
                  }, null, _this3);
                });

                context$2$0.next = 4;
                return _regeneratorRuntime.awrap(getAsyncIteratorElement(dtoAsyncIterator));

              case 4:
                dtoElement = context$2$0.sent;

              case 5:
              case 'end':
                return context$2$0.stop();
            }
          }, null, _this4);
        };

      case 7:
        if (dtoElement.done) {
          context$1$0.next = 12;
          break;
        }

        context$1$0.next = 10;
        return _regeneratorRuntime.awrap(_loop());

      case 10:
        context$1$0.next = 7;
        break;

      case 12:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this);
};

var createFakeCommits = function createFakeCommits(dtoAsyncIterator) {
  var inboxNum, dtoElement, workItemsToMention;
  return _regeneratorRuntime.async(function createFakeCommits$(context$1$0) {
    var _this7 = this;

    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        inboxNum = 0;
        context$1$0.next = 3;
        return _regeneratorRuntime.awrap(getAsyncIteratorElement(dtoAsyncIterator));

      case 3:
        dtoElement = context$1$0.sent;
        context$1$0.next = 6;
        return _regeneratorRuntime.awrap(getFromJsonFile(fake_work_items_to_mention));

      case 6:
        workItemsToMention = context$1$0.sent;

        _ramda2['default'].map(function callee$1$0(iteration) {
          var _loop2, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2;

          return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
            var _this6 = this;

            while (1) switch (context$2$0.prev = context$2$0.next) {
              case 0:
                _loop2 = function callee$2$0() {
                  var dto, digest, inbox, workItemsGroup, comma, _loop3;

                  return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
                    var _this5 = this;

                    while (1) switch (context$3$0.prev = context$3$0.next) {
                      case 0:
                        dto = dtoElement.value;
                        digest = dto.digest;
                        inbox = dto.inbox;
                        workItemsGroup = workItemsToMention[inboxNum % 4];
                        comma = iteration === 0 && inboxNum === 0 ? '' : ',';

                        inboxNum++;
                        if (!_commander2['default'].json) {
                          console.log('Adding commits to ' + inbox.inboxId + ' of family ' + inbox.family);
                          console.log(inbox._links['add-commit'].href + '?apiKey=' + client.apiKey);
                        } else console.log(comma + '"' + client.baseUrl + '/' + client.instanceId + '/commits/tags/versionone/workitem?numbers=' + workItemsGroup.join(',') + '&apiKey=' + client.apiKey + '"');
                        _iteratorNormalCompletion2 = true;
                        _didIteratorError2 = false;
                        _iteratorError2 = undefined;
                        context$3$0.prev = 10;

                        _loop3 = function () {
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
                            }, null, _this5);
                          }, _ramda2['default'].range(0, number_of_mentions_per_workitem_per_repo));
                        };

                        for (_iterator2 = _getIterator(workItemsGroup); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                          _loop3();
                        }

                        context$3$0.next = 19;
                        break;

                      case 15:
                        context$3$0.prev = 15;
                        context$3$0.t0 = context$3$0['catch'](10);
                        _didIteratorError2 = true;
                        _iteratorError2 = context$3$0.t0;

                      case 19:
                        context$3$0.prev = 19;
                        context$3$0.prev = 20;

                        if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                          _iterator2['return']();
                        }

                      case 22:
                        context$3$0.prev = 22;

                        if (!_didIteratorError2) {
                          context$3$0.next = 25;
                          break;
                        }

                        throw _iteratorError2;

                      case 25:
                        return context$3$0.finish(22);

                      case 26:
                        return context$3$0.finish(19);

                      case 27:
                        context$3$0.next = 29;
                        return _regeneratorRuntime.awrap(getAsyncIteratorElement(dtoAsyncIterator));

                      case 29:
                        dtoElement = context$3$0.sent;

                      case 30:
                      case 'end':
                        return context$3$0.stop();
                    }
                  }, null, _this6, [[10, 15, 19, 27], [20,, 22, 26]]);
                };

              case 1:
                if (dtoElement.done) {
                  context$2$0.next = 6;
                  break;
                }

                context$2$0.next = 4;
                return _regeneratorRuntime.awrap(_loop2());

              case 4:
                context$2$0.next = 1;
                break;

              case 6:
              case 'end':
                return context$2$0.stop();
            }
          }, null, _this7);
        }, _ramda2['default'].range(0, number_of_repo_iterations));

      case 8:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this);
};

var createInstanceWithSampleData = _ramda2['default'].pipeP(createInstanceAndDigest, getInboxesToCreate, createInboxes, createSampleCommits);

var createInstanceWithFakeData = _ramda2['default'].pipeP(createInstanceAndDigest, getInboxesToCreate, createInboxes, createFakeCommits);

var run = function run() {
  var iteration;
  return _regeneratorRuntime.async(function run$(context$1$0) {
    var _this8 = this;

    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        if (_commander2['default'].json) console.log('[');

        if (!_commander2['default'].sample) {
          context$1$0.next = 8;
          break;
        }

        console.log('Creating instance with sample data');
        iteration = new Date().toGMTString();
        context$1$0.next = 6;
        return _regeneratorRuntime.awrap(createInstanceWithSampleData(iteration));

      case 6:
        context$1$0.next = 10;
        break;

      case 8:
        console.log('Creating instance with fake data');
        try {
          _ramda2['default'].map(function callee$1$0(instanceNumber) {
            return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
              while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                  context$2$0.next = 2;
                  return _regeneratorRuntime.awrap(createInstanceWithFakeData(instanceNumber));

                case 2:
                case 'end':
                  return context$2$0.stop();
              }
            }, null, _this8);
          }, _ramda2['default'].range(0, number_of_instances));
        } catch (e) {
          // Review exception handling, it seems to be swallowing the errors
          console.log(e);
        }

      case 10:
        if (_commander2['default'].json) console.log(']');

      case 11:
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
