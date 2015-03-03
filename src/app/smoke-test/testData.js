(function() {
  module.exports = {
    testData: {
      instances: {
        validInstance1: {
          instanceId: '2ef2b90b-52ae-4a2a-a606-09cb0c4d33c5'
        },
        validInstance2: {
          instanceId: '453fcccd-3717-411d-8f87-3421b9effd79'
        }
      },
      commits: {
        wellFormedCommitsSample1: {
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
        },
        wellFormedCommitsSample2: {
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
      }
    }
  };
}());