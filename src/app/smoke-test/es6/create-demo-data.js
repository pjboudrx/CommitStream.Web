'use strict';

import program from 'commander';
import CSApiClient from './lib/cs-api-client';
import R from 'ramda';
import Promise from 'bluebird';
let readFile = Promise.promisify(require("fs").readFile);

program
  .version('0.0.0')
  .option('-u, --url [url]', 'The base URL for the CommitStream Service API, default: http://localhost:6565/api', 'http://localhost:6565/api')
  .option('-i, --instances [number]', 'Number of instances to create, default: 1', 1)
  .option('-r, --repos [number]', 'Number of repos creation iterations to run (creates one repo per family type during each iteration), default 1', 1)
  .option('-m, --mentions [number]', 'Number of times to post a commit with each mention (one story, 5 tasks, 5 tests in each group of workitems), default 1', 1)
  .option('-d, --debug', 'Show results of each commit, not just summary information')
  .option('-j, --json', 'Log only the JSON output with all the query URLs needed for the performance client')
  .option('-s, --sample', 'Create the commits with sample data that exists in the PR builds', 0)
  .parse(process.argv);

const number_of_instances = parseInt(program.instances);
const number_of_repo_iterations = parseInt(program.repos);
const number_of_mentions_per_workitem_per_repo = parseInt(program.mentions);
const sample_work_items_to_mention = 'sampleWorkItemsToMention.json';
const fake_work_items_to_mention = 'fakeWorkItemsToMention.json';

let client = new CSApiClient(program.url);

if (!program.json) console.log(`Operating against this CommitStream Service API: ${client.baseUrl}`);

let getFromJsonFile = async(fileName) => {
  let fileContent = await readFile(fileName, "utf8");
  return JSON.parse(fileContent);
}

let createMessage = (mention, inbox) => {
  return `${mention} in ${inbox.inboxId} of family = ${inbox.family}`;
}

let createCommit = async(message, inbox) => {
  let commitAddResponse = await inbox.commitCreate(message);
  if (program.debug) {
    console.log(commitAddResponse.message);
  }
}

let fromZeroTo = (top, fun) => {
  for (let i = 0; i < top; i++) {
    fun(i);
  }
}

let createInstanceAndDigest = async(iteration) => {
  let instance = await client.instanceCreate();
  let digest = await instance.digestCreate({
    description: `Digest for ${iteration}`
  });

  if (!program.json) {
    console.log(`The digest: ${digest._links['teamroom-view'].href}&apiKey=${client.apiKey}`);
    console.log(`#${iteration}: Populating instance ${client.instanceId} (apiKey = ${client.apiKey})`);
  }

  return {
    iteration, digest
  };
};

let getInboxesToCreate = async dto => {
  let iteration = dto.iteration
  let inboxesToCreate = [{
    name: `GitHub Repo ${iteration}`,
    family: 'GitHub'
  }, {
    name: `GitLab Repo ${iteration}`,
    family: 'GitLab'
  }, {
    name: `Bitbucket Repo ${iteration}`,
    family: 'Bitbucket'
  }, {
    name: `VsoGit Repo ${iteration}`,
    family: 'VsoGit'
  }];
  dto.inboxesToCreate = inboxesToCreate;
  return dto;
}

let createInboxes = async dto => {
  dto.inboxes = [];
  for (let inboxToCreate of dto.inboxesToCreate) {
    let inbox = await dto.digest.inboxCreate(inboxToCreate);
    dto.inboxes.push(inbox);
  }
  return dto;
};

let createFakeCommits = async dto => {
  let inboxNum = 0;
  let workItemsToMention = await getFromJsonFile(fake_work_items_to_mention);

  fromZeroTo(number_of_repo_iterations, async iteration => {
    dto.inboxes.forEach(inbox => {
      let digest = dto.digest;
      let workItemsGroup = workItemsToMention[inboxNum % 4];
      let comma = (iteration === 0 && inboxNum === 0) ? '' : ',';
      inboxNum++;
      if (!program.json) {
        console.log(`Adding commits to ${inbox.inboxId} of family ${inbox.family}`);
        console.log(`${inbox._links['add-commit'].href}?apiKey=${client.apiKey}`);
      } else console.log(`${comma}"${client.baseUrl}/${client.instanceId}/commits/tags/versionone/workitem?numbers=${workItemsGroup.join(',')}&apiKey=${client.apiKey}"`);
      for (let workItem of workItemsGroup) {
        fromZeroTo(number_of_mentions_per_workitem_per_repo, async mentionNum => {
          let message = `${workItem} mention # ${mentionNum} on ${iteration} in  ${inbox.inboxId} of family = ${inbox.family}`;
          await createCommit(message, inbox);
        });
      }
    });

  });

}

let mapInboxesAndStories = async(fun, dto) => {
  let sampleWorkItemsToMention = await getFromJsonFile(sample_work_items_to_mention);

  dto.inboxes.forEach(async inbox => {
    sampleWorkItemsToMention.forEach(async(story) => {
      await fun(inbox, story);
    });
  });
}

let createStories = async(inbox, story) => {
  let message = createMessage(story.StoryId, inbox);
  await createCommit(message, inbox);
}

let createStorieWithTask = async(inbox, story) => {
  story.Tasks.forEach(async(task) => {
    let message = createMessage(`${story.StoryId} ${task}`, inbox)
    await createCommit(message, inbox);
  });
}

let createStorieWithTest = async(inbox, story) => {
  story.Tests.forEach(async(test) => {
    let message = createMessage(`${story.StoryId} ${test}`, inbox)
    await createCommit(message, inbox);
  });
}

let createTestsCommits = async(inbox, story) => {
  story.Tests.forEach(async(test) => {
    let message = createMessage(`${test}`, inbox)
    await createCommit(message, inbox);
  });
}

let createTasksCommits = async(inbox, story) => {
  story.Tasks.forEach(async(task) => {
    let message = createMessage(`${task}`, inbox)
    await createCommit(message, inbox);
  });
}

let createMultipleTests = async(inbox, story) => {
  let previousTests = '';
  story.Tests.forEach(async(test) => {
    previousTests += test + ' ';
    let message = createMessage(`${previousTests}`, inbox)
    await createCommit(message, inbox);
  });
}

let createMultipleTasks = async (inbox,story) => {
  let previousTasks = '';
  story.Tasks.forEach(async(task) => {
    previousTasks += task + ' ';
    let message = createMessage(`${previousTasks}`, inbox)
    await createCommit(message, inbox);
  });
}

let createInstanceWithFakeData = R.pipeP(
  createInstanceAndDigest,
  getInboxesToCreate,
  createInboxes,
  createFakeCommits
);

let createInstanceForSample = R.pipeP(
  createInstanceAndDigest,
  getInboxesToCreate,
  createInboxes
);

let run = async() => {
  if (program.json) console.log('[');

  if (program.sample) {
    console.log('Creating instance with sample data');
    let dto = await createInstanceForSample('Sample');
    mapInboxesAndStories(createStorieWithTask, dto);



  } else {
    console.log('Creating instance with fake data');
    try {
      R.map(async(instanceNumber) => {
        await createInstanceWithFakeData(instanceNumber);
      }, R.range(0, number_of_instances));

    } catch (e) {
      // Review exception handling, it seems to be swallowing the errors
      console.log(e);
    }

  }
  if (program.json) console.log(']');
}

try {
  run();
} catch (e) {
  console.log(e);
}
