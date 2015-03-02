$adminKey = '32527e4a-e5ac-46f5-9bad-2c9b7d607bd7'
$csUrl = 'http://localhost:6565'
$ct = 'application/json'

function createInstance() {
  param($instanceId)

  $body = @{}
  $body.instanceId = $instanceId

  $response = Invoke-RestMethod -Method Post `
    -ContentType $ct `
    -Body (ConvertTo-Json $body) `
    -Uri $csUrl/api/instances?apiKey=$adminKey

  $response
}

function createDigest() {
  param($digestUrl, $description)

  $body = @{}
  $body.description = $description

  $response = Invoke-RestMethod -Method Post `
    -ContentType $ct `
    -Body (ConvertTo-Json $body) `
    -Uri $digestUrl

  $response
}

function createInbox() {
  param($inboxesUrl, $inboxName, $repoUrl)

  $body = @{}
  $body.family = 'GitHub'
  $body.name = $inboxName
  $body.url = $repoUrl

  $response = Invoke-RestMethod -Method Post `
  -ContentType $ct `
  -Body (ConvertTo-Json $body) `
  -Uri $inboxesUrl

  $response
}

$instanceId = [guid]::NewGuid()
$response = createInstance $instanceId

$instanceApiKey = $response.apiKey
$digestsUrl = $response._links.digests.href + "?apiKey=$instanceApiKey"

$response = createDigest $digestsUrl 'Some random digest'

$inboxesUrl = $response._links.'inbox-create'.href + "?apiKey=$instanceApiKey"

createInbox $inboxesUrl 'Some Inbox Name' 'https://github.com/fakeuser/fakerepo'