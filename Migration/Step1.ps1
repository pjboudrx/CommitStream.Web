. '.\Common.ps1'

$key = ''
$csUrl = ''
$fullUrl = "$csUrl/api/digests?key=$key"

function saveDigests(){
  param($responseDigests, $output)

  $digests = $output.digests = @{}

  $responseDigests | % {
    $d = $digests[$_.digestId] =  @{}
    $d.digestId = $_.digestId
    $d.description = $_.description

    $fullUrl = "$csUrl/api/digests/$($d.digestId)/inboxes?key=$key"
    $response = Invoke-RestMethod -Method Get -ContentType 'application/json' -Uri $fullUrl

    saveInboxes $response._embedded.inboxes $d
  }

}

function saveInboxes(){
  param($responseInboxes, $outputDigest)

  $outputDigest.inboxes = @{}

  $responseInboxes | % {
    $i = $outputDigest.inboxes[$_.inboxId] = @{}

    $i.inboxId = $_.inboxId
    $i.name = $_.name
    $i.url = $_.url
  }

}

$output = @{}
$response = Invoke-RestMethod -Method Get -ContentType $ct -Uri $fullUrl

saveDigests $response._embedded.digests $output

$output | saveJson 'output.json' | Out-Null