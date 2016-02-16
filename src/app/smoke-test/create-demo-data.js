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

_commander2['default'].version('0.0.0').option('-u, --url [url]', 'The base URL for the CommitStream Service API, default: http://localhost:6565/api', 'http://localhost:6565/api').option('-i, --instances [number]', 'Number of instances to create, default: 1', 1).option('-r, --repos [number]', 'Number of repos creation iterations to run (creates one repo per family type during each iteration), default 1', 1).option('-m, --mentions [number]', 'Number of times to post a commit with each mention (one story, 5 tasks, 5 tests in each group of workitems), default 1', 1).option('-d, --debug', 'Show results of each commit, not just summary information').option('-j, --json', 'Log only the JSON output with all the query URLs needed for the performance client').option('-s, --sample', 'Create the commits with sample data that exists in the PR builds', 0).option('--repourl [repourl]', 'Specifies the repository url that is going to be used in the commits').parse(process.argv);

var number_of_instances = parseInt(_commander2['default'].instances);
var number_of_repo_iterations = parseInt(_commander2['default'].repos);
var number_of_mentions_per_workitem_per_repo = parseInt(_commander2['default'].mentions);
var sample_work_items_to_mention = 'sampleWorkItemsToMention.json';
var fake_work_items_to_mention = 'fakeWorkItemsToMention.json';
var v1_inboxes = 'inboxes.json';

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
        return _regeneratorRuntime.awrap(inbox.commitCreate(message, _commander2['default'].repourl));

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
  var i;
  return _regeneratorRuntime.async(function fromZeroTo$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        i = 0;

      case 1:
        if (!(i < top)) {
          context$1$0.next = 7;
          break;
        }

        context$1$0.next = 4;
        return _regeneratorRuntime.awrap(fun(i));

      case 4:
        i++;
        context$1$0.next = 1;
        break;

      case 7:
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
          iteration: iteration,
          digest: digest
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

var mapInboxesAndStories = function mapInboxesAndStories(fun, inboxes) {
  var sampleWorkItemsToMention, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, inbox, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, story;

  return _regeneratorRuntime.async(function mapInboxesAndStories$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return _regeneratorRuntime.awrap(getFromJsonFile(sample_work_items_to_mention));

      case 2:
        sampleWorkItemsToMention = context$1$0.sent;
        _iteratorNormalCompletion3 = true;
        _didIteratorError3 = false;
        _iteratorError3 = undefined;
        context$1$0.prev = 6;
        _iterator3 = _getIterator(inboxes);

      case 8:
        if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
          context$1$0.next = 39;
          break;
        }

        inbox = _step3.value;
        _iteratorNormalCompletion4 = true;
        _didIteratorError4 = false;
        _iteratorError4 = undefined;
        context$1$0.prev = 13;
        _iterator4 = _getIterator(sampleWorkItemsToMention);

      case 15:
        if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
          context$1$0.next = 22;
          break;
        }

        story = _step4.value;
        context$1$0.next = 19;
        return _regeneratorRuntime.awrap(fun(inbox, story));

      case 19:
        _iteratorNormalCompletion4 = true;
        context$1$0.next = 15;
        break;

      case 22:
        context$1$0.next = 28;
        break;

      case 24:
        context$1$0.prev = 24;
        context$1$0.t0 = context$1$0['catch'](13);
        _didIteratorError4 = true;
        _iteratorError4 = context$1$0.t0;

      case 28:
        context$1$0.prev = 28;
        context$1$0.prev = 29;

        if (!_iteratorNormalCompletion4 && _iterator4['return']) {
          _iterator4['return']();
        }

      case 31:
        context$1$0.prev = 31;

        if (!_didIteratorError4) {
          context$1$0.next = 34;
          break;
        }

        throw _iteratorError4;

      case 34:
        return context$1$0.finish(31);

      case 35:
        return context$1$0.finish(28);

      case 36:
        _iteratorNormalCompletion3 = true;
        context$1$0.next = 8;
        break;

      case 39:
        context$1$0.next = 45;
        break;

      case 41:
        context$1$0.prev = 41;
        context$1$0.t1 = context$1$0['catch'](6);
        _didIteratorError3 = true;
        _iteratorError3 = context$1$0.t1;

      case 45:
        context$1$0.prev = 45;
        context$1$0.prev = 46;

        if (!_iteratorNormalCompletion3 && _iterator3['return']) {
          _iterator3['return']();
        }

      case 48:
        context$1$0.prev = 48;

        if (!_didIteratorError3) {
          context$1$0.next = 51;
          break;
        }

        throw _iteratorError3;

      case 51:
        return context$1$0.finish(48);

      case 52:
        return context$1$0.finish(45);

      case 53:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this, [[6, 41, 45, 53], [13, 24, 28, 36], [29,, 31, 35], [46,, 48, 52]]);
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

var createStoriesWithTasks = function createStoriesWithTasks(inbox, story) {
  var _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, task, message;

  return _regeneratorRuntime.async(function createStoriesWithTasks$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        _iteratorNormalCompletion5 = true;
        _didIteratorError5 = false;
        _iteratorError5 = undefined;
        context$1$0.prev = 3;
        _iterator5 = _getIterator(story.Tasks);

      case 5:
        if (_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done) {
          context$1$0.next = 13;
          break;
        }

        task = _step5.value;
        message = createMessage(story.StoryId + ' ' + task, inbox);
        context$1$0.next = 10;
        return _regeneratorRuntime.awrap(createCommit(message, inbox));

      case 10:
        _iteratorNormalCompletion5 = true;
        context$1$0.next = 5;
        break;

      case 13:
        context$1$0.next = 19;
        break;

      case 15:
        context$1$0.prev = 15;
        context$1$0.t0 = context$1$0['catch'](3);
        _didIteratorError5 = true;
        _iteratorError5 = context$1$0.t0;

      case 19:
        context$1$0.prev = 19;
        context$1$0.prev = 20;

        if (!_iteratorNormalCompletion5 && _iterator5['return']) {
          _iterator5['return']();
        }

      case 22:
        context$1$0.prev = 22;

        if (!_didIteratorError5) {
          context$1$0.next = 25;
          break;
        }

        throw _iteratorError5;

      case 25:
        return context$1$0.finish(22);

      case 26:
        return context$1$0.finish(19);

      case 27:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this, [[3, 15, 19, 27], [20,, 22, 26]]);
};

var createStoriesWithTests = function createStoriesWithTests(inbox, story) {
  var _iteratorNormalCompletion6, _didIteratorError6, _iteratorError6, _iterator6, _step6, test, message;

  return _regeneratorRuntime.async(function createStoriesWithTests$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        _iteratorNormalCompletion6 = true;
        _didIteratorError6 = false;
        _iteratorError6 = undefined;
        context$1$0.prev = 3;
        _iterator6 = _getIterator(story.Tests);

      case 5:
        if (_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done) {
          context$1$0.next = 13;
          break;
        }

        test = _step6.value;
        message = createMessage(story.StoryId + ' ' + test, inbox);
        context$1$0.next = 10;
        return _regeneratorRuntime.awrap(createCommit(message, inbox));

      case 10:
        _iteratorNormalCompletion6 = true;
        context$1$0.next = 5;
        break;

      case 13:
        context$1$0.next = 19;
        break;

      case 15:
        context$1$0.prev = 15;
        context$1$0.t0 = context$1$0['catch'](3);
        _didIteratorError6 = true;
        _iteratorError6 = context$1$0.t0;

      case 19:
        context$1$0.prev = 19;
        context$1$0.prev = 20;

        if (!_iteratorNormalCompletion6 && _iterator6['return']) {
          _iterator6['return']();
        }

      case 22:
        context$1$0.prev = 22;

        if (!_didIteratorError6) {
          context$1$0.next = 25;
          break;
        }

        throw _iteratorError6;

      case 25:
        return context$1$0.finish(22);

      case 26:
        return context$1$0.finish(19);

      case 27:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this, [[3, 15, 19, 27], [20,, 22, 26]]);
};

var createStoriesWithTestsAndTasks = function createStoriesWithTestsAndTasks(inbox, story) {
  var mention, _iteratorNormalCompletion7, _didIteratorError7, _iteratorError7, _iterator7, _step7, test, _iteratorNormalCompletion8, _didIteratorError8, _iteratorError8, _iterator8, _step8, task;

  return _regeneratorRuntime.async(function createStoriesWithTestsAndTasks$(context$1$0) {
    var _this4 = this;

    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        mention = story.StoryId + ' ';
        _iteratorNormalCompletion7 = true;
        _didIteratorError7 = false;
        _iteratorError7 = undefined;
        context$1$0.prev = 4;

        for (_iterator7 = _getIterator(story.Tests); !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          test = _step7.value;

          mention += test + ' ';
        }
        context$1$0.next = 12;
        break;

      case 8:
        context$1$0.prev = 8;
        context$1$0.t0 = context$1$0['catch'](4);
        _didIteratorError7 = true;
        _iteratorError7 = context$1$0.t0;

      case 12:
        context$1$0.prev = 12;
        context$1$0.prev = 13;

        if (!_iteratorNormalCompletion7 && _iterator7['return']) {
          _iterator7['return']();
        }

      case 15:
        context$1$0.prev = 15;

        if (!_didIteratorError7) {
          context$1$0.next = 18;
          break;
        }

        throw _iteratorError7;

      case 18:
        return context$1$0.finish(15);

      case 19:
        return context$1$0.finish(12);

      case 20:
        _iteratorNormalCompletion8 = true;
        _didIteratorError8 = false;
        _iteratorError8 = undefined;
        context$1$0.prev = 23;
        for (_iterator8 = _getIterator(story.Tasks); !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
          task = _step8.value;

          mention += task + ' ';
        }
        //4 so we pass the 25 mentions
        context$1$0.next = 31;
        break;

      case 27:
        context$1$0.prev = 27;
        context$1$0.t1 = context$1$0['catch'](23);
        _didIteratorError8 = true;
        _iteratorError8 = context$1$0.t1;

      case 31:
        context$1$0.prev = 31;
        context$1$0.prev = 32;

        if (!_iteratorNormalCompletion8 && _iterator8['return']) {
          _iterator8['return']();
        }

      case 34:
        context$1$0.prev = 34;

        if (!_didIteratorError8) {
          context$1$0.next = 37;
          break;
        }

        throw _iteratorError8;

      case 37:
        return context$1$0.finish(34);

      case 38:
        return context$1$0.finish(31);

      case 39:
        context$1$0.next = 41;
        return _regeneratorRuntime.awrap(fromZeroTo(4, function callee$1$0(i) {
          var message;
          return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
              case 0:
                message = createMessage(mention + ' ' + i, inbox);
                context$2$0.next = 3;
                return _regeneratorRuntime.awrap(createCommit(message, inbox));

              case 3:
              case 'end':
                return context$2$0.stop();
            }
          }, null, _this4);
        }));

      case 41:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this, [[4, 8, 12, 20], [13,, 15, 19], [23, 27, 31, 39], [32,, 34, 38]]);
};

var createTests = function createTests(inbox, story) {
  var _iteratorNormalCompletion9, _didIteratorError9, _iteratorError9, _iterator9, _step9, test, message;

  return _regeneratorRuntime.async(function createTests$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        _iteratorNormalCompletion9 = true;
        _didIteratorError9 = false;
        _iteratorError9 = undefined;
        context$1$0.prev = 3;
        _iterator9 = _getIterator(story.Tests);

      case 5:
        if (_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done) {
          context$1$0.next = 13;
          break;
        }

        test = _step9.value;
        message = createMessage('' + test, inbox);
        context$1$0.next = 10;
        return _regeneratorRuntime.awrap(createCommit(message, inbox));

      case 10:
        _iteratorNormalCompletion9 = true;
        context$1$0.next = 5;
        break;

      case 13:
        context$1$0.next = 19;
        break;

      case 15:
        context$1$0.prev = 15;
        context$1$0.t0 = context$1$0['catch'](3);
        _didIteratorError9 = true;
        _iteratorError9 = context$1$0.t0;

      case 19:
        context$1$0.prev = 19;
        context$1$0.prev = 20;

        if (!_iteratorNormalCompletion9 && _iterator9['return']) {
          _iterator9['return']();
        }

      case 22:
        context$1$0.prev = 22;

        if (!_didIteratorError9) {
          context$1$0.next = 25;
          break;
        }

        throw _iteratorError9;

      case 25:
        return context$1$0.finish(22);

      case 26:
        return context$1$0.finish(19);

      case 27:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this, [[3, 15, 19, 27], [20,, 22, 26]]);
};

var createTasks = function createTasks(inbox, story) {
  var _iteratorNormalCompletion10, _didIteratorError10, _iteratorError10, _iterator10, _step10, task, message;

  return _regeneratorRuntime.async(function createTasks$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        _iteratorNormalCompletion10 = true;
        _didIteratorError10 = false;
        _iteratorError10 = undefined;
        context$1$0.prev = 3;
        _iterator10 = _getIterator(story.Tasks);

      case 5:
        if (_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done) {
          context$1$0.next = 13;
          break;
        }

        task = _step10.value;
        message = createMessage('' + task, inbox);
        context$1$0.next = 10;
        return _regeneratorRuntime.awrap(createCommit(message, inbox));

      case 10:
        _iteratorNormalCompletion10 = true;
        context$1$0.next = 5;
        break;

      case 13:
        context$1$0.next = 19;
        break;

      case 15:
        context$1$0.prev = 15;
        context$1$0.t0 = context$1$0['catch'](3);
        _didIteratorError10 = true;
        _iteratorError10 = context$1$0.t0;

      case 19:
        context$1$0.prev = 19;
        context$1$0.prev = 20;

        if (!_iteratorNormalCompletion10 && _iterator10['return']) {
          _iterator10['return']();
        }

      case 22:
        context$1$0.prev = 22;

        if (!_didIteratorError10) {
          context$1$0.next = 25;
          break;
        }

        throw _iteratorError10;

      case 25:
        return context$1$0.finish(22);

      case 26:
        return context$1$0.finish(19);

      case 27:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this, [[3, 15, 19, 27], [20,, 22, 26]]);
};

var createMultipleTests = function createMultipleTests(inbox, story) {
  var previousTests, _iteratorNormalCompletion11, _didIteratorError11, _iteratorError11, _iterator11, _step11, test, message;

  return _regeneratorRuntime.async(function createMultipleTests$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        previousTests = '';
        _iteratorNormalCompletion11 = true;
        _didIteratorError11 = false;
        _iteratorError11 = undefined;
        context$1$0.prev = 4;
        _iterator11 = _getIterator(story.Tests);

      case 6:
        if (_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done) {
          context$1$0.next = 15;
          break;
        }

        test = _step11.value;

        previousTests += test + ' ';
        message = createMessage('' + previousTests, inbox);
        context$1$0.next = 12;
        return _regeneratorRuntime.awrap(createCommit(message, inbox));

      case 12:
        _iteratorNormalCompletion11 = true;
        context$1$0.next = 6;
        break;

      case 15:
        context$1$0.next = 21;
        break;

      case 17:
        context$1$0.prev = 17;
        context$1$0.t0 = context$1$0['catch'](4);
        _didIteratorError11 = true;
        _iteratorError11 = context$1$0.t0;

      case 21:
        context$1$0.prev = 21;
        context$1$0.prev = 22;

        if (!_iteratorNormalCompletion11 && _iterator11['return']) {
          _iterator11['return']();
        }

      case 24:
        context$1$0.prev = 24;

        if (!_didIteratorError11) {
          context$1$0.next = 27;
          break;
        }

        throw _iteratorError11;

      case 27:
        return context$1$0.finish(24);

      case 28:
        return context$1$0.finish(21);

      case 29:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this, [[4, 17, 21, 29], [22,, 24, 28]]);
};

var createMultipleTasks = function createMultipleTasks(inbox, story) {
  var previousTasks, _iteratorNormalCompletion12, _didIteratorError12, _iteratorError12, _iterator12, _step12, task, message;

  return _regeneratorRuntime.async(function createMultipleTasks$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        previousTasks = '';
        _iteratorNormalCompletion12 = true;
        _didIteratorError12 = false;
        _iteratorError12 = undefined;
        context$1$0.prev = 4;
        _iterator12 = _getIterator(story.Tasks);

      case 6:
        if (_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done) {
          context$1$0.next = 15;
          break;
        }

        task = _step12.value;

        previousTasks += task + ' ';
        message = createMessage('' + previousTasks, inbox);
        context$1$0.next = 12;
        return _regeneratorRuntime.awrap(createCommit(message, inbox));

      case 12:
        _iteratorNormalCompletion12 = true;
        context$1$0.next = 6;
        break;

      case 15:
        context$1$0.next = 21;
        break;

      case 17:
        context$1$0.prev = 17;
        context$1$0.t0 = context$1$0['catch'](4);
        _didIteratorError12 = true;
        _iteratorError12 = context$1$0.t0;

      case 21:
        context$1$0.prev = 21;
        context$1$0.prev = 22;

        if (!_iteratorNormalCompletion12 && _iterator12['return']) {
          _iterator12['return']();
        }

      case 24:
        context$1$0.prev = 24;

        if (!_didIteratorError12) {
          context$1$0.next = 27;
          break;
        }

        throw _iteratorError12;

      case 27:
        return context$1$0.finish(24);

      case 28:
        return context$1$0.finish(21);

      case 29:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this, [[4, 17, 21, 29], [22,, 24, 28]]);
};

var create25PerAsset = function create25PerAsset(inbox, story) {
  return _regeneratorRuntime.async(function create25PerAsset$(context$1$0) {
    var _this5 = this;

    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        console.log('Creating 25 commits per asset.');
        context$1$0.next = 3;
        return _regeneratorRuntime.awrap(fromZeroTo(25, function callee$1$0(i) {
          var _iteratorNormalCompletion13, _didIteratorError13, _iteratorError13, _iterator13, _step13, test, message, _iteratorNormalCompletion14, _didIteratorError14, _iteratorError14, _iterator14, _step14, task;

          return _regeneratorRuntime.async(function callee$1$0$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
              case 0:
                _iteratorNormalCompletion13 = true;
                _didIteratorError13 = false;
                _iteratorError13 = undefined;
                context$2$0.prev = 3;
                _iterator13 = _getIterator(story.Tests);

              case 5:
                if (_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done) {
                  context$2$0.next = 13;
                  break;
                }

                test = _step13.value;
                message = createMessage(test + ' on iteration ' + i, inbox);
                context$2$0.next = 10;
                return _regeneratorRuntime.awrap(createCommit(message, inbox));

              case 10:
                _iteratorNormalCompletion13 = true;
                context$2$0.next = 5;
                break;

              case 13:
                context$2$0.next = 19;
                break;

              case 15:
                context$2$0.prev = 15;
                context$2$0.t0 = context$2$0['catch'](3);
                _didIteratorError13 = true;
                _iteratorError13 = context$2$0.t0;

              case 19:
                context$2$0.prev = 19;
                context$2$0.prev = 20;

                if (!_iteratorNormalCompletion13 && _iterator13['return']) {
                  _iterator13['return']();
                }

              case 22:
                context$2$0.prev = 22;

                if (!_didIteratorError13) {
                  context$2$0.next = 25;
                  break;
                }

                throw _iteratorError13;

              case 25:
                return context$2$0.finish(22);

              case 26:
                return context$2$0.finish(19);

              case 27:
                _iteratorNormalCompletion14 = true;
                _didIteratorError14 = false;
                _iteratorError14 = undefined;
                context$2$0.prev = 30;
                _iterator14 = _getIterator(story.Tasks);

              case 32:
                if (_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done) {
                  context$2$0.next = 40;
                  break;
                }

                task = _step14.value;
                message = createMessage(task + ' on iteration ' + i, inbox);
                context$2$0.next = 37;
                return _regeneratorRuntime.awrap(createCommit(message, inbox));

              case 37:
                _iteratorNormalCompletion14 = true;
                context$2$0.next = 32;
                break;

              case 40:
                context$2$0.next = 46;
                break;

              case 42:
                context$2$0.prev = 42;
                context$2$0.t1 = context$2$0['catch'](30);
                _didIteratorError14 = true;
                _iteratorError14 = context$2$0.t1;

              case 46:
                context$2$0.prev = 46;
                context$2$0.prev = 47;

                if (!_iteratorNormalCompletion14 && _iterator14['return']) {
                  _iterator14['return']();
                }

              case 49:
                context$2$0.prev = 49;

                if (!_didIteratorError14) {
                  context$2$0.next = 52;
                  break;
                }

                throw _iteratorError14;

              case 52:
                return context$2$0.finish(49);

              case 53:
                return context$2$0.finish(46);

              case 54:
                ;

              case 55:
              case 'end':
                return context$2$0.stop();
            }
          }, null, _this5, [[3, 15, 19, 27], [20,, 22, 26], [30, 42, 46, 54], [47,, 49, 53]]);
        }));

      case 3:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this);
};

var createInstanceWithFakeData = _ramda2['default'].pipeP(createInstanceAndDigest, getInboxesToCreate, createInboxes, createFakeCommits);

var getV1Inboxes = function getV1Inboxes() {
  var inboxes;
  return _regeneratorRuntime.async(function getV1Inboxes$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return _regeneratorRuntime.awrap(getFromJsonFile(v1_inboxes));

      case 2:
        inboxes = context$1$0.sent;

        inboxes = _ramda2['default'].map(function (i) {
          console.log('About to push commmits into: ');
          console.log(i._links['add-commit'].href);
          return client.getInbox(i);
        }, inboxes);
        return context$1$0.abrupt('return', inboxes);

      case 5:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this);
};

var run = function run() {
  var inboxes;
  return _regeneratorRuntime.async(function run$(context$1$0) {
    var _this6 = this;

    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.prev = 0;

        if (_commander2['default'].json) console.log('[');

        if (!_commander2['default'].sample) {
          context$1$0.next = 25;
          break;
        }

        console.log('Creating instance with sample data');
        context$1$0.next = 6;
        return _regeneratorRuntime.awrap(getV1Inboxes());

      case 6:
        inboxes = context$1$0.sent;
        context$1$0.next = 9;
        return _regeneratorRuntime.awrap(mapInboxesAndStories(createStories, inboxes));

      case 9:
        context$1$0.next = 11;
        return _regeneratorRuntime.awrap(mapInboxesAndStories(createStoriesWithTasks, inboxes));

      case 11:
        context$1$0.next = 13;
        return _regeneratorRuntime.awrap(mapInboxesAndStories(createStoriesWithTests, inboxes));

      case 13:
        context$1$0.next = 15;
        return _regeneratorRuntime.awrap(mapInboxesAndStories(createStoriesWithTestsAndTasks, inboxes));

      case 15:
        context$1$0.next = 17;
        return _regeneratorRuntime.awrap(mapInboxesAndStories(createTasks, inboxes));

      case 17:
        context$1$0.next = 19;
        return _regeneratorRuntime.awrap(mapInboxesAndStories(createTests, inboxes));

      case 19:
        context$1$0.next = 21;
        return _regeneratorRuntime.awrap(mapInboxesAndStories(createMultipleTests, inboxes));

      case 21:
        context$1$0.next = 23;
        return _regeneratorRuntime.awrap(mapInboxesAndStories(createMultipleTasks, inboxes));

      case 23:
        context$1$0.next = 27;
        break;

      case 25:
        console.log('Creating instance with fake data');
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
          }, null, _this6);
        });

      case 27:
        if (_commander2['default'].json) console.log(']');
        context$1$0.next = 33;
        break;

      case 30:
        context$1$0.prev = 30;
        context$1$0.t0 = context$1$0['catch'](0);

        console.log(context$1$0.t0);

      case 33:
      case 'end':
        return context$1$0.stop();
    }
  }, null, _this, [[0, 30]]);
};

run();
