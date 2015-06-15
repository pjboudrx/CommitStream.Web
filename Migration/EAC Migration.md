## EAC Migration ##

### Guidelines ###
* Don't do the import all at once so in case of failure we can redo just that particular step.
* Do one customer at a time.
* Make a backup of the ES cluster before any import.

###Three main steps###

1. Read from CS API so we can know the structure of the digests and inboxes.
2. Make use of the previous information so we can read from each stream directly from ES. We should save the events of each stream in separated files. We could name the files with some convention (inboxId.events.js).
3. Import the previously retrieved events into the new ES instance.


####Step 1####

For each customer we need to read the digests and inboxes so we can know from which stream to read and how the inboxes are grouped by digest:
For this we will use the CS API and we will build a json file with the next structure

	{
		"digests": {
			"digest guid": {
				"description": "boo",
				"digestId": "digest guid",
				"inboxes": {
					"inbox guid": {
						"inboxId": "inbox guid",
						"url": "https://github.com/foo/boo",
						"name": "boo"          
					}
				}      
			}
		}
	}

We will start by reading all the digest by querying:

    CS-URL/api/digests?key=

from the response we will extract the digestIds so we can build the inboxes url

    CS-URL/api/digests/digestId/inboxes?key=

from the array of inboxes extract the inbox ids.


####Step 2####

In order for this step to work you will need to install the next PS module [Tunable-SSL-Validator](https://github.com/Jaykul/Tunable-SSL-Validator).

Using the previous generated JSON iterate over all the digests and inboxes. Build the streams names like this: 

	inboxCommits-inboxId 

Read the events from each stream, revert their order and save them in a file with the next convention

    inboxId.events.js

add the name of the file to the JSON object as a new property to the proper inbox.    
    

####Step 3####

**note from meeting: - Group by digest and order so natural insertion
order maintained**


* Create instance per EAC (manually since we are only migrating one EAC at a time).
* Read the JSON once more and based on it create the digests and inboxes.
* Start importing the events one stream/inbox at a time.
* Save the new inbox URL in the JSON file so we can inform the customers.