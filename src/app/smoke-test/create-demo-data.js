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
  return mention + ' in ' + inbox.inboxId + ' of family = ' + inbox.family;
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

var fromZeroTo = function fromZeroTo(top, fun) {
  for (var i = 0; i < top; i++) {
    fun(i);
  }
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

var createInboxes = function createInboxes(dto) {
  var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, inboxToCreate, inbox;

  return _regeneratorRuntime.async(function createInboxes$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        dto.inboxes = [];
        _iteratorNormalCompletion = true;
        _didIteratorError = false;
        _iteratorError = undefined;
        context$1$0.prev = 4;
        _iterator = _getIterator(dto.inboxesToCreate);

      case 6:
        if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
          context$1$0.next = 15;
          break;
        }

        inboxToCreate = _step.value;
        context$1$0.next = 10;
        return _regeneratorRuntime.awrap(dto.digest.inboxCreate(inboxToCreate));

      case 10:
        inbox = context$1$0.sent;

        dto.inboxes.push(inbox);

      case 12:
        _iteratorNormalCompletion = true;
        context$1$0.next = 6;
        break;

      case 15:
        context$1$0.next = 21;
        break;

      case 17:
        context$1$0.prev = 17;
        context$1$0.t0 = context$1$0['catch'](4);
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
        return context$1$0.abrupt('return', dto);

      case 30:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this, [[4, 17, 21, 29], [22,, 24, 28]]);
};

var createFakeCommits = function createFakeCommits(dto) {
  var inboxNum, workItemsToMention;
  return _regeneratorRuntime.async(function createFakeCommits$(context$1$0) {
    var _this3 = this;

    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        inboxNum = 0;
        context$1$0.next = 3;
        return _regeneratorRuntime.awrap(getFromJsonFile(fake_work_items_to_mention));

      case 3:
        workItemsToMention = context$1$0.sent;

        fromZeroTo(number_of_repo_iterations, function callee$1$0(iteration) {
          return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
            var _this2 = this;

            while (1) switch (context$2$0.prev = context$2$0.next) {
              case 0:
                dto.inboxes.forEach(function (inbox) {
                  var digest = dto.digest;
                  var workItemsGroup = workItemsToMention[inboxNum % 4];
                  var comma = iteration === 0 && inboxNum === 0 ? '' : ',';
                  inboxNum++;
                  if (!_commander2['default'].json) {
                    console.log('Adding commits to ' + inbox.inboxId + ' of family ' + inbox.family);
                    console.log(inbox._links['add-commit'].href + '?apiKey=' + client.apiKey);
                  } else console.log(comma + '"' + client.baseUrl + '/' + client.instanceId + '/commits/tags/versionone/workitem?numbers=' + workItemsGroup.join(',') + '&apiKey=' + client.apiKey + '"');
                  var _iteratorNormalCompletion2 = true;
                  var _didIteratorError2 = false;
                  var _iteratorError2 = undefined;

                  try {
                    var _loop = function () {
                      var workItem = _step2.value;

                      fromZeroTo(number_of_mentions_per_workitem_per_repo, function callee$4$0(mentionNum) {
                        var message;
                        return _regeneratorRuntime.async(function callee$4$0$(context$5$0) {
                          while (1) switch (context$5$0.prev = context$5$0.next) {
                            case 0:
                              message = workItem + ' mention # ' + mentionNum + ' on ' + iteration + ' in  ' + inbox.inboxId + ' of family = ' + inbox.family;
                              context$5$0.next = 3;
                              return _regeneratorRuntime.awrap(createCommit(message, inbox));

                            case 3:
                            case 'end':
                              return context$5$0.stop();
                          }
                        }, null, _this2);
                      });
                    };

                    for (var _iterator2 = _getIterator(workItemsGroup), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                      _loop();
                    }
                  } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                  } finally {
                    try {
                      if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                        _iterator2['return']();
                      }
                    } finally {
                      if (_didIteratorError2) {
                        throw _iteratorError2;
                      }
                    }
                  }
                });

              case 1:
              case 'end':
                return context$2$0.stop();
            }
          }, null, _this3);
        });

      case 5:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this);
};

var mapInboxesAndStories = function mapInboxesAndStories(fun, dto) {
  var sampleWorkItemsToMention;
  return _regeneratorRuntime.async(function mapInboxesAndStories$(context$1$0) {
    var _this5 = this;

    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return _regeneratorRuntime.awrap(getFromJsonFile(sample_work_items_to_mention));

      case 2:
        sampleWorkItemsToMention = context$1$0.sent;

        dto.inboxes.forEach(function callee$1$0(inbox) {
          return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
            var _this4 = this;

            while (1) switch (context$2$0.prev = context$2$0.next) {
              case 0:
                sampleWorkItemsToMention.forEach(function callee$2$0(story) {
                  return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
                    while (1) switch (context$3$0.prev = context$3$0.next) {
                      case 0:
                        context$3$0.next = 2;
                        return _regeneratorRuntime.awrap(fun(inbox, story));

                      case 2:
                      case 'end':
                        return context$3$0.stop();
                    }
                  }, null, _this4);
                });

              case 1:
              case 'end':
                return context$2$0.stop();
            }
          }, null, _this5);
        });

      case 4:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this);
};

var createStories = function createStories(inbox, story) {
  var message;
  return _regeneratorRuntime.async(function createStories$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        message = createMessage(story.StoryId, inbox);
        context$1$0.next = 3;
        return _regeneratorRuntime.awrap(createCommit(message, inbox));

      case 3:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this);
};

var createStorieWithTask = function createStorieWithTask(inbox, story) {
  return _regeneratorRuntime.async(function createStorieWithTask$(context$1$0) {
    var _this6 = this;

    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        story.Tasks.forEach(function callee$1$0(task) {
          var message;
          return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
              case 0:
                message = createMessage(story.StoryId + ' ' + task, inbox);
                context$2$0.next = 3;
                return _regeneratorRuntime.awrap(createCommit(message, inbox));

              case 3:
              case 'end':
                return context$2$0.stop();
            }
          }, null, _this6);
        });

      case 1:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this);
};

var createStorieWithTest = function createStorieWithTest(inbox, story) {
  return _regeneratorRuntime.async(function createStorieWithTest$(context$1$0) {
    var _this7 = this;

    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        story.Tests.forEach(function callee$1$0(test) {
          var message;
          return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
              case 0:
                message = createMessage(story.StoryId + ' ' + test, inbox);
                context$2$0.next = 3;
                return _regeneratorRuntime.awrap(createCommit(message, inbox));

              case 3:
              case 'end':
                return context$2$0.stop();
            }
          }, null, _this7);
        });

      case 1:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this);
};

var createTestsCommits = function createTestsCommits(inbox, story) {
  return _regeneratorRuntime.async(function createTestsCommits$(context$1$0) {
    var _this8 = this;

    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        story.Tests.forEach(function callee$1$0(test) {
          var message;
          return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
              case 0:
                message = createMessage('' + test, inbox);
                context$2$0.next = 3;
                return _regeneratorRuntime.awrap(createCommit(message, inbox));

              case 3:
              case 'end':
                return context$2$0.stop();
            }
          }, null, _this8);
        });

      case 1:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this);
};

var createTasksCommits = function createTasksCommits(inbox, story) {
  return _regeneratorRuntime.async(function createTasksCommits$(context$1$0) {
    var _this9 = this;

    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        story.Tasks.forEach(function callee$1$0(task) {
          var message;
          return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
              case 0:
                message = createMessage('' + task, inbox);
                context$2$0.next = 3;
                return _regeneratorRuntime.awrap(createCommit(message, inbox));

              case 3:
              case 'end':
                return context$2$0.stop();
            }
          }, null, _this9);
        });

      case 1:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this);
};

var createMultipleTests = function createMultipleTests(inbox, story) {
  var previousTests;
  return _regeneratorRuntime.async(function createMultipleTests$(context$1$0) {
    var _this10 = this;

    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        previousTests = '';

        story.Tests.forEach(function callee$1$0(test) {
          var message;
          return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
              case 0:
                previousTests += test + ' ';
                message = createMessage('' + previousTests, inbox);
                context$2$0.next = 4;
                return _regeneratorRuntime.awrap(createCommit(message, inbox));

              case 4:
              case 'end':
                return context$2$0.stop();
            }
          }, null, _this10);
        });

      case 2:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this);
};

var createMultipleTasks = function createMultipleTasks(inbox, story) {
  var previousTasks;
  return _regeneratorRuntime.async(function createMultipleTasks$(context$1$0) {
    var _this11 = this;

    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        previousTasks = '';

        story.Tasks.forEach(function callee$1$0(task) {
          var message;
          return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
              case 0:
                previousTasks += task + ' ';
                message = createMessage('' + previousTasks, inbox);
                context$2$0.next = 4;
                return _regeneratorRuntime.awrap(createCommit(message, inbox));

              case 4:
              case 'end':
                return context$2$0.stop();
            }
          }, null, _this11);
        });

      case 2:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this);
};

var create25PerAsset = function create25PerAsset(inbox, story) {
  return _regeneratorRuntime.async(function create25PerAsset$(context$1$0) {
    var _this13 = this;

    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        console.log('Creating 25 commits per asset.');
        fromZeroTo(25, function callee$1$0(i) {
          var message;
          return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
            var _this12 = this;

            while (1) switch (context$2$0.prev = context$2$0.next) {
              case 0:
                message = createMessage(story.StoryId + ' on iteration ' + i, inbox);
                context$2$0.next = 3;
                return _regeneratorRuntime.awrap(createCommit(message, inbox));

              case 3:

                story.Tests.forEach(function callee$2$0(test) {
                  var message;
                  return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
                    while (1) switch (context$3$0.prev = context$3$0.next) {
                      case 0:
                        message = createMessage(test + ' on iteration ' + i, inbox);
                        context$3$0.next = 3;
                        return _regeneratorRuntime.awrap(createCommit(message, inbox));

                      case 3:
                      case 'end':
                        return context$3$0.stop();
                    }
                  }, null, _this12);
                });

                story.Tasks.forEach(function callee$2$0(task) {
                  var message;
                  return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
                    while (1) switch (context$3$0.prev = context$3$0.next) {
                      case 0:
                        message = createMessage(task + ' on iteration ' + i, inbox);
                        context$3$0.next = 3;
                        return _regeneratorRuntime.awrap(createCommit(message, inbox));

                      case 3:
                      case 'end':
                        return context$3$0.stop();
                    }
                  }, null, _this12);
                });

              case 5:
              case 'end':
                return context$2$0.stop();
            }
          }, null, _this13);
        });

      case 2:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this);
};

var createInstanceWithFakeData = _ramda2['default'].pipeP(createInstanceAndDigest, getInboxesToCreate, createInboxes, createFakeCommits);

var createInstanceForSample = _ramda2['default'].pipeP(createInstanceAndDigest, getInboxesToCreate, createInboxes);

var run = function run() {
  var dto;
  return _regeneratorRuntime.async(function run$(context$1$0) {
    var _this14 = this;

    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        if (_commander2['default'].json) console.log('[');

        if (!_commander2['default'].sample) {
          context$1$0.next = 9;
          break;
        }

        console.log('Creating instance with sample data');
        context$1$0.next = 5;
        return _regeneratorRuntime.awrap(createInstanceForSample('Sample'));

      case 5:
        dto = context$1$0.sent;

        //    mapInboxesAndStories(createStorieWithTask, dto);
        mapInboxesAndStories(create25PerAsset, dto);

        context$1$0.next = 11;
        break;

      case 9:
        console.log('Creating instance with fake data');
        try {
          fromZeroTo(number_of_instances, function callee$1$0(instanceNumber) {
            return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
              while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                  context$2$0.next = 2;
                  return _regeneratorRuntime.awrap(createInstanceWithFakeData(instanceNumber));

                case 2:
                case 'end':
                  return context$2$0.stop();
              }
            }, null, _this14);
          });
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
