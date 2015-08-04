var chai = require('chai'),
  should = chai.should(),
  sinon = require('sinon'),
  sinonChai = require('sinon-chai'),
  _ = require('underscore'),
  rp = require('request-promise'),
  base = require('./lib/base');

base.enableLogging(true);
_.extend(global, base);
_.extend(global, require('./testData'));

chai.use(sinonChai);
chai.config.includeStack = true;

var testCases = [{
  name: 'Create first valid instance and push commits to an inbox',
  instance: testData.instances.validInstance1,
  digest: {
    description: 'My new digest'
  },
  inbox: {
    'name': 'PrettyCool.Code',
    'family': 'GitHub'
  },
  commits: testData.commits.wellFormedCommitsSample1,
  expectedMessage: 'The commits have been added to the CommitStream inbox.',
  workItemToQueryFor: 'S-11111'
}, {
  name: 'Create second valid instance and push commits to an inbox',
  instance: testData.instances.validInstance2,
  digest: {
    description: 'My new digest (on different instance)'
  },
  inbox: {
    'name': 'PrettyCool.CodeUnderMyOwnAccount',
    'family': 'GitHub'
  },
  commits: testData.commits.wellFormedCommitsSample2,
  expectedMessage: 'The commits have been added to the CommitStream inbox.',
  workItemToQueryFor: 'S-11111'
}];

// TODO use Chai as Promised to finish this...

function instanceTest(testCase, it) {
  it(testCase.name, async function(done) {
    try {
      let instance = await post('/instances', testCase.instance);
      let digest = await postToLink2(instance, 'digest-create', testCase.digest);
      let inbox = await postToLink2(digest, 'inbox-create', testCase.inbox);
      let addCommitResponse = await postToLink2(inbox, 'add-commit', testCase.commits, {'x-github-event': 'push'});

      addCommitResponse.message.should.equal(testCase.expectedMessage);
      console.log('```json\n' + JSON.stringify(addCommitResponse.message, ' ', 2) + '\n```\n\n');

      let queryLink = getLink(addCommitResponse, "instance-query");
      queryLink = get(queryLink.replace(":workitems", testCase.workItemToQueryFor) + '?apiKey=' + getApiKey(), true);
      let queryResponse = await rp(queryLink);
      console.log('```json\n' + JSON.stringify(queryResponse, ' ', 2) + '\n```\n\n');

      var firstMessage = queryResponse.commits[0].message;
      firstMessage.should.equal(testCase.commits.commits[0].message);
      console.log("Here is the first commit:");
      console.log(firstMessage);
      console.log("\n");
    } catch (err) {
      console.error("Caught an error:");
      console.error(err);
    } finally {
      done();
    }
  });
}

describe("Smoke test", function() {
  testCases.forEach(function(testCase) {
    instanceTest(testCase, it);
  });
});