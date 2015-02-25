(function(hypermediaResponse) {

  var config = require('../config');

  hypermediaResponse.digests = {};
  hypermediaResponse.digests.POST = function(href, instanceId, digestId) {
    return {
      "_links": {
        "self": {
          "href": href("/api/" + instanceId + "/digests/" + digestId)
        },
        "digests": {
          "href": href("/api/" + instanceId + "/digests")
        },
        "inbox-create": {
          "href": href("/api/" + instanceId + "/digests/" + digestId + "/inboxes"),
          "method": "POST",
          "title": "Endpoint for creating an inbox for a repository on digest " + digestId + "."
        }
      },
      "digestId": digestId
    };
  };

  hypermediaResponse.digestGET = function(href, instanceId, digestId, data) {
    var response = {
      "_links": {
        "self": {
          "href": href("/api/" + instanceId + "/digests/" + digestId)
        },
        "digests": {
          "href": href("/api/" + instanceId + "/digests")
        },
        "inbox-create": {
          "href": href("/api/" + instanceId + "/digests/" + digestId + "/inboxes"),
          "method": "POST",
          "title": "Endpoint for creating an inbox for a repository on digest " + digestId + "."
        },
        "inboxes": {
          "href": href("/api/" + instanceId + "/digests/" + digestId + "/inboxes")
        }
      }
    };

    response.description = data.description;
    response.digestId = data.digestId;

    return response;
  };


  hypermediaResponse.digestsGET = function(href, instanceId, digests) {

    var response = {
      "_links": {
        "self": {
          "href": href("/api/" + instanceId + "/digests")
        }
      },
      "count": digests ? digests.length : 0,
      "_embedded": {
        "digests": []
      }
    }

    function createDigestHyperMediaResult(digest) {
      return {
        "_links": {
          "self": {
            "href": href("/api/" + instanceId + "/digests/" + digest.digestId)
          }
        },
        "digestId": digest.digestId,
        "description": digest.description
      }
    }

    if (digests) {
      digests.forEach(function(d) {
        response._embedded.digests.push(createDigestHyperMediaResult(d));
      });
    }

    return response;
  }

  // These are difficult to name. Here are some ideas
  // For an endpoint like: /api/digests/id/inbox/id
  // hypermediaResponseForADigestAndInbox
  // hypermediaResponse.digests.id.inbox.id

  // Here are some thoughts around the inbox cases of
  // posting to /api/inboxes
  // posting to /api/inboxes/:inboxId
  // geting from /api/inboxes/:inboxId
  // hypermediaResponseInboxCreation
  // hypermediaResponseInboxPost
  // hypermediaResponseInboxInformation
  // hypermediaResponse.inboxes.POST
  // hypermediaResponse.inboxes.id.POST
  // hypermediaResponse.inboxes.id.GET

  // If we were using a hal library, this would probably look something like
  // halResponse.addLink(key, value), which removes the need to name them specifically.

  hypermediaResponse.inboxes = {};
  hypermediaResponse.inboxes.inboxId = {};
  hypermediaResponse.inboxes.inboxId.commits = {};


  hypermediaResponse.inboxes.POST = function(href, instanceId, inboxId) {
    return {
      "_links": {
        "self": {
          "href": href("/api/" + instanceId + "/inboxes/" + inboxId)
        },
        "add-commit": {
          "href": href("/api/" + instanceId + "/inboxes/" + inboxId + "/commits")
        }
      },
      "inboxId": inboxId
    };
  }

  hypermediaResponse.inboxes.inboxId.GET = function(href, instanceId, inbox) {
    return {
      "_links": {
        "self": {
          "href": href("/api/" + instanceId + "/inboxes/" + inbox.inboxId)
        },
        "digest-parent": {
          "href": href("/api/" + instanceId + "/digests/" + inbox.digestId)
        }
      },
      "family": inbox.family,
      "name": inbox.name,
      "url": inbox.url
    };
  }

  hypermediaResponse.inboxes.inboxId.commits.POST = function(href, instanceId, dataObject) {
    return {
      "_links": {
        "self": {
          "href": href("/api/" + instanceId + "/inboxes/" + dataObject.inboxId)
        },
        "digest-parent": {
          "href": href("/api/" + instanceId + "/digests/" + dataObject.digestId)
        },
        "query-digest": {
          "href": href("/api/query?digestId=" + dataObject.digestId + "&workitem=all")
        }
      },
      "message": "Your push event has been queued to be added to CommitStream."
    };
  }

})(module.exports)