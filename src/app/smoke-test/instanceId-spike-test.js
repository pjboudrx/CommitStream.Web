var chai = require('chai'),
  should = chai.should(),
  sinon = require('sinon'),
  sinonChai = require('sinon-chai'),
  _ = require('underscore'),
  rp = require('request-promise');

chai.use(sinonChai);
chai.config.includeStack = true;

var apiKeyForAddingInstance = '?apiKey=32527e4a-e5ac-46f5-9bad-2c9b7d607bd7';

function href(path) {
  return 'http://localhost:6565/api' + path;
}

var instances = [
  {
    instanceId: '2ef2b90b-52ae-4a2a-a606-09cb0c4d33c5',
    apiKey: undefined,
    digestCreateUri: undefined,
    digest: {
      description: 'First instance digest'
    },  
    inbox1: {
      name: 'CommitStream.Web',
      family: 'GitHub'
    },
    inboxCommits: {
      "ref": "refs/heads/master",
      "commits": [{
        "id": "b42c285e1506edac965g92573a2121700fc92f8b",
        "distinct": true,
        "message": "S-11111 Updated Happy Path Validations!",
        "timestamp": "2014-10-03T15:57:14-03:00",
        "url": "https://github.com/kunzimariano/CommitService.DemoRepo/commit/b42c285e1506edac965g92573a2121700fc92f8b",
        "author": {
          "name": "shawnmarie",
          "email": "shawn.abbott@versionone.com",
          "username": "shawnmarie"
        },
        "committer": {
          "name": "shawnmarie",
          "email": "shawn.abbott@versionone.com",
          "username": "shawnmarie"
        },
        "added": [],
        "removed": [],
        "modified": ["README.md"]
      }],
      "repository": {
        "id": 23355501,
        "name": "CommitService.DemoRepo"
      }
    }
  },
  // second instance:
  {
    instanceId: '453fcccd-3717-411d-8f87-3421b9effd79',
    apiKey: undefined,
    digestCreateUri: undefined,
    digest: {
      description: 'Second instance digest'
    },
    inbox1: {
      name: 'psake-tools',
      family: 'GitHub'
    },
    inboxCommits: {
      "ref": "refs/heads/master",
      "commits": [{
        "id": "b42c285e1506edac965g92573a2121700fc92f8b",
        "distinct": true,
        "message": "S-11111 Hey all this stuff broke today, what's wrong?",
        "timestamp": "2014-10-03T15:57:14-03:00",
        "url": "https://github.com/kunzimariano/CommitService.DemoRepo/commit/b42c285e1506edac965g92573a2121700fc92f8b",
        "author": {
          "name": "marieshawn",
          "email": "abbott.shawn@versionone.com",
          "username": "shawnmarie"
        },
        "committer": {
          "name": "marieshawn",
          "email": "abbott.shawn@versionone.com",
          "username": "marieshawn"
        },
        "added": [],
        "removed": [],
        "modified": ["README.md"]
      }],
      "repository": {
        "id": 23355501,
        "name": "CommitService.DemoRepo"
      }
    }
  }
];

function post(uri, data, extraHeaders) {
  var headers = {
    "Content-Type": "application/json"
  };

  if (extraHeaders) headers = _.extend(headers, extraHeaders);

  return {
    uri: uri,
    method: 'POST',
    headers: headers,
    transform: function(body) { return JSON.parse(body); },
    body: JSON.stringify(data)
  };
}

function post1(path, data) {
  return post(href(path), data);
}

function get(uri) {
  return {
    uri: href(uri),
    method: 'GET',
    transform: function(body) { return JSON.parse(body); },
    headers: {
        "Content-Type": "application/json"
    }
  }
}

function getLink(obj, relName) {
  return obj._links[relName].href;
}

var sep = '---------------';

describe('/api/instances (and more)', function() {
  function instanceTest(instance, done) {
    rp(post1(
      '/instances' + apiKeyForAddingInstance,
      {
        instanceId: instance.instanceId
      }
    ))
    .then(function(instanceCreated) {
      instance.apiKey = instanceCreated.apiKey;      
      instance.digestCreateUri = getLink(instanceCreated, 'digest-create') + '?apiKey=' + instance.apiKey;
      console.log('Created instance: ' + instanceCreated.instanceId);
      console.log('digest-create: ' + getLink(instanceCreated, 'digest-create'));
      console.log(sep);      
    })    
    .then(function() {      
      return rp(post(instance.digestCreateUri, instance.digest));
    })
    .then(function(digest) {
      var inboxCreateUri = getLink(digest, 'inbox-create') + '?apiKey=' + instance.apiKey;
      console.log('Created digest: ' + digest.digestId);
      console.log('inbox-create: ' + getLink(digest, 'inbox-create'));
      console.log(sep);
      return rp(post(inboxCreateUri, {
        name: 'CommitStream.Web',
        family: 'GitHub'
      }));
    })
    .then(function(inbox) {
      var inboxPostCommitsUri = getLink(inbox, 'add-commit') + '?apiKey=' + instance.apiKey;
      console.log('Created inbox: ' + inbox.inboxId);
      console.log('add-commit: ' + getLink(inbox, 'add-commit'));
      console.log(sep);
      return rp(post(inboxPostCommitsUri, instance.inboxCommits, 
        {
        'x-github-event': 'push'
        })
      );
    })
    .then(function(message) {
      console.log('Commits added: ' + message.message);
      message.message.should.equal('Your push event has been queued to be added to CommitStream.');
      console.log(sep);      
      return rp(get('/' + instance.instanceId + '/query?workitem=S-11111&apiKey=' + instance.apiKey));
    })
    .then(function(queryResponse) {
      var firstMessage = queryResponse.commits[0].message;
      firstMessage.should.equal(instance.inboxCommits.commits[0].message); 
      console.log("JUST ONE COMMIT:");
      console.log(firstMessage);
      console.log("\n");
    })
    .catch(console.error)
    .finally(done);
  }    

  it('Has isolated data for instance1.', function(done) {    
    instanceTest(instances[0], done);
  });

  it('Has isolated data for instance2.', function(done) {    
    instanceTest(instances[1], done);
  });

});