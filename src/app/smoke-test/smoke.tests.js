var chai = require('chai'),
  should = chai.should(),
  sinon = require('sinon'),
  sinonChai = require('sinon-chai'),
  _ = require('underscore'),
  request = require('request'),
  uuid = require('uuid-v4'),
  EventStore = require('eventstore-client');

chai.use(sinonChai);
chai.config.includeStack = true;


var commit = {
  "ref": "refs/heads/master",
  "commits": [{
    "id": "d31d174f0495feaf876e92573a2121700fd81e7a",
    "distinct": true,
    "message": "S-11111 Modified!",
    "timestamp": "2014-10-03T15:57:14-03:00",
    "url": "https://github.com/kunzimariano/CommitService.DemoRepo/commit/d31d174f0495feaf876e92573a2121700fd81e7a",
    "author": {
      "name": "kunzimariano",
      "email": "kunzi.mariano@gmail.com",
      "username": "kunzimariano"
    },
    "committer": {
      "name": "kunzimariano",
      "email": "kunzi.mariano@gmail.com",
      "username": "kunzimariano"
    },
    "added": [],
    "removed": [],
    "modified": ["README.md"]
  }],
  "repository": {
    "id": 23355501,
    "name": "CommitService.DemoRepo"
  }
};

describe('api/query after POST', function() {
  it('should accept a valid payload and returns commits for the specified workitem.', function(done) {
    this.timeout(5000);

    setTimeout(function () {
      request({
        uri: "http://localhost:6565/api/query?key=32527e4a-e5ac-46f5-9bad-2c9b7d607bd7&workitem=S-11111",
          method: "GET"
        }, function(err, res, body) {
        should.not.exist(err);
        res.statusCode.should.equal(200);
        res.body.should.equal("{\"commits\":[{\"commitDate\":\"2014-10-03T15:57:14-03:00\",\"timeFormatted\":\"3 months ago\",\"author\":\"kunzimariano\",\"sha1Partial\":\"d31d17\",\"action\":\"committed\",\"message\":\"S-11111 Modified!\",\"commitHref\":\"https://github.com/kunzimariano/CommitService.DemoRepo/commit/d31d174f0495feaf876e92573a2121700fd81e7a\",\"repo\":\"kunzimariano/CommitService.DemoRepo\",\"branch\":\"master\",\"branchHref\":\"https://github.com/kunzimariano/CommitService.DemoRepo/tree/master\",\"repoHref\":\"https://github.com/kunzimariano/CommitService.DemoRepo\"}]}");
        done();
      });
    }, 3000);
  });

  it('should return empty commits when request is made with correct key but incorrect workitem.', function(done) {
    request({
      uri: "http://localhost:6565/api/query?key=32527e4a-e5ac-46f5-9bad-2c9b7d607bd7&workitem=11111",
        method: "GET"
      }, function(err, res, body) {
      should.not.exist(err);
      res.statusCode.should.equal(200);
      res.body.should.equal('{"commits":[]}');
      done();
    })
  });

  it('should return error message when request is made with correct key but no workitem.', function(done) {
    request({
      uri: "http://localhost:6565/api/query?key=32527e4a-e5ac-46f5-9bad-2c9b7d607bd7",
        method: "GET"
      }, function(err, res, body) {
      should.not.exist(err);
      res.statusCode.should.equal(400);
      res.body.should.equal('{"error":"Parameter workitem is required"}');
      done();
    })
  });

});
