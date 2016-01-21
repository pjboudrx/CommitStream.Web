'use strict';

import program from 'commander';
import CSApiClient from './lib/cs-api-client';
import R from 'ramda';

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

let client = new CSApiClient(program.url);

if (!program.json) console.log(`Operating against this CommitStream Service API: ${client.baseUrl}`);

let getRealMentions = () => {
  let realMentions = new Map();
  realMentions.set('S-01041', ['AT-01075', 'AT-01076', 'AT-01077', 'AT-01085', 'TK-01078', 'TK-01079', 'TK-01080', 'TK-01098', 'TK-01100']);
  realMentions.set('S-01042', ['AT-01078', 'AT-01079', 'AT-01080', 'AT-01081', 'AT-01082', 'TK-01081', 'TK-01082', 'TK-01083', 'TK-01084']);
  realMentions.set('S-01043', ['AT-01083', 'AT-01084', 'AT-01086', 'AT-01087', 'TK-01086', 'TK-01087', 'TK-01088', 'TK-01089']);
  realMentions.set('S-01064', ['AT-01097', 'TK-01113', 'TK-01114']);
  return realMentions;
}

let workItemsToMention = [
  ['S-00001', 'T-00001', 'T-00002', 'T-00003', 'T-00004', 'T-00005', 'AT-00001', 'AT-00002', 'AT-00003', 'AT-00004', 'AT-00005'],
  ['S-00002', 'T-00011', 'T-00012', 'T-00013', 'T-00014', 'T-00015', 'AT-00011', 'AT-00012', 'AT-00013', 'AT-00014', 'AT-00015'],
  ['S-00003', 'T-00021', 'T-00022', 'T-00023', 'T-00024', 'T-00025', 'AT-00021', 'AT-00022', 'AT-00023', 'AT-00024', 'AT-00025'],
  ['S-00004', 'T-00031', 'T-00032', 'T-00033', 'T-00034', 'T-00035', 'AT-00031', 'AT-00032', 'AT-00033', 'AT-00034', 'AT-00035']
];

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

  let realMentions = getRealMentions();
  let dtoElement = await getAsyncIteratorElement(dtoAsyncIterator);

  while (!dtoElement.done) {
    let inbox = dtoElement.value.inbox;
    realMentions.forEach(async(parentValue, parentKey) => {
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
