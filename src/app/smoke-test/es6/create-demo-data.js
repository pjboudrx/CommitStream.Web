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
  return `${mention} in  ${inbox.inboxId} of family = ${inbox.family}`;
}

let createCommit = async(message, inbox) => {
  let commitAddResponse = await inbox.commitCreate(message);
  if (program.debug) {
    console.log(commitAddResponse.message);
  }
}

// :'( https://github.com/zenparsing/async-iteration/
let getAsyncIteratorElement = async iterator => {
  return await iterator.next();
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

let createInboxes = async function*(dto) {
  for (let inboxToCreate of dto.inboxesToCreate) {
    dto.inbox = await dto.digest.inboxCreate(inboxToCreate)
    yield dto;
  }
};

let createSampleCommits = async dtoAsyncIterator => {
  let sampleWorkItemsToMention = await getFromJsonFile(sample_work_items_to_mention);
  let dtoElement = await getAsyncIteratorElement(dtoAsyncIterator);

  while (!dtoElement.done) {
    let inbox = dtoElement.value.inbox;
    sampleWorkItemsToMention.forEach(async(parentValue, parentKey) => {
      let message = createMessage(parentKey, inbox);
      await createCommit(message, inbox);
      parentValue.forEach(async(childValue) => {
        let message = createMessage(`${parentKey} ${childValue}`, inbox)
        await createCommit(message, inbox);
      });
    });

    dtoElement = await getAsyncIteratorElement(dtoAsyncIterator);
  }
}

let createFakeCommits = async dtoAsyncIterator => {
  let inboxNum = 0;
  let dtoElement = await getAsyncIteratorElement(dtoAsyncIterator);
  let workItemsToMention = await getFromJsonFile(fake_work_items_to_mention);

  R.map(async iteration => {
    while (!dtoElement.done) {
      let dto = dtoElement.value;
      let digest = dto.digest;
      let inbox = dto.inbox;
      let workItemsGroup = workItemsToMention[inboxNum % 4];
      let comma = (iteration === 0 && inboxNum === 0) ? '' : ',';
      inboxNum++;
      if (!program.json) {
        console.log(`Adding commits to ${inbox.inboxId} of family ${inbox.family}`);
        console.log(`${inbox._links['add-commit'].href}?apiKey=${client.apiKey}`);
      } else console.log(`${comma}"${client.baseUrl}/${client.instanceId}/commits/tags/versionone/workitem?numbers=${workItemsGroup.join(',')}&apiKey=${client.apiKey}"`);
      for (let workItem of workItemsGroup) {
        R.map(async mentionNum => {
          let message = `${workItem} mention # ${mentionNum} on ${iteration} in  ${inbox.inboxId} of family = ${inbox.family}`;
          createCommit(message, inbox);
        }, R.range(0, number_of_mentions_per_workitem_per_repo));
      }

      dtoElement = await getAsyncIteratorElement(dtoAsyncIterator);
    }
  }, R.range(0, number_of_repo_iterations));
}

let createInstanceWithSampleData = R.pipeP(
  createInstanceAndDigest,
  getInboxesToCreate,
  createInboxes,
  createSampleCommits
);

let createInstanceWithFakeData = R.pipeP(
  createInstanceAndDigest,
  getInboxesToCreate,
  createInboxes,
  createFakeCommits
);

let run = async() => {
  if (program.json) console.log('[');

  if (program.sample) {
    console.log('Creating instance with sample data');
    let iteration = (new Date()).toGMTString();
    await createInstanceWithSampleData(iteration);

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
