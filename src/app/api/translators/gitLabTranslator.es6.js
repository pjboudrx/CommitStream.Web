/*
{
  "object_kind":"push",
  "before":"fbc141a8fdd012d8a2a2db597214882b3f53b212",
  "after":"5bcf98ef0e07d9de75b6a141e454667466c9f764",
  "ref":"refs/heads/master",
  "checkout_sha":"5bcf98ef0e07d9de75b6a141e454667466c9f764",
  "message":null,
  "user_id":97154,
  "user_name":"Josh Gough",
  "user_email":"jsgough@gmail.com",
  "project_id":164288,
  "repository":{
    "name":"SpaceMiner",
    "url":"git@gitlab.com:JogoShugh/SpaceMiner.git",
    "description":"SpaceMiner",
    "homepage":"https://gitlab.com/JogoShugh/SpaceMiner",
    "git_http_url":"https://gitlab.com/JogoShugh/SpaceMiner.git",
    "git_ssh_url":"git@gitlab.com:JogoShugh/SpaceMiner.git",
    "visibility_level":0
  },
  "commits":[
    {
      "id":"5bcf98ef0e07d9de75b6a141e454667466c9f764",
      "message":"Commited S-11111\n",
      "timestamp":"2015-05-07T11:00:13-04:00",
      "url":"https://gitlab.com/JogoShugh/SpaceMiner/commit/5bcf98ef0e07d9de75b6a141e454667466c9f764",
      "author":{
        "name":"Josh Gough",
        "email":"jsgough@gmail.com"
      }
    }
  ],
  "total_commits_count":1
}
*/


/*
* Classes : for Translator plugins
* Arrow functions : for callbacks and small filter type functions
* Templated strings : "to avoid  " + "doing " + "this"
* Generators for middleware handlers, but KOA does this far better than Express
* Spread operator where we do some of the validations "...args"
* Default arguments
* async / await where using promises : Note that this is still experimental ES7
* 
*/

(gitLabTranslator => {
  var _ = require('underscore'),
    uuid = require('uuid-v4'),
    csError = require('../../middleware/csError');

  // QUESTION: for ES6, can we use the => operator in place of function for the callback, and still
  // have 'this' be what it was??
  gitLabTranslator.GitLabCommitMalformedError = csError.createCustomError('GitLabCommitMalformedError', function(error, pushEvent) {
    this.originalError = error;
    var errors = [error.toString()];
    this.pushEvent = pushEvent;
    gitLabTranslator.GitLabCommitMalformedError.prototype.constructor.call(this, errors, 400);
  });

  // gitLabTranslator.validate = function(req) {
  //   // TODO what is there to do here?
  //   return true;
  // };


  gitLabTranslator.validate = req => true;
  
  gitLabTranslator.hasCommits = req => true;

  gitLabTranslator.respondToNonCommitsMessage = (req, res) => {
    // TODO what about this?
    res.json({
      message: 'No GitLab commits found'
    });    
  };  

  gitLabTranslator.translatePush = (pushEvent, instanceId, digestId, inboxId) => {
    try {
      var branch = pushEvent.ref.split('/').pop();
      var repository = {
        id: pushEvent.repository.name, // there is no id
        name: pushEvent.repository.name
      };

      var events = _.map(pushEvent.commits, aCommit => {
        var commit = {
          sha: aCommit.id,
          commit: {
            author: {
              name: aCommit.author.name,
              email: aCommit.author.email
            },
            committer: {
              name: aCommit.author.name,
              email: aCommit.author.email,
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
          eventType: 'GitLabCommitReceived',
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
      var otherEx = new gitLabTranslator.GitLabCommitMalformedError(ex, pushEvent);
      throw otherEx;
    }
  };
  
}(module.exports));