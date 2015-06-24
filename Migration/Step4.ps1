. '.\Common.ps1'

$esUrl = 'http://localhost:2113'
$esUsr = 'admin'
$esPassword = 'changeit'
$eventsDirectory = 'digests'

$data = @{}

function readEvents {
   process {
      $_.digests.PSObject.Properties | % {
          #TODO: make this work on common
          $content = Get-Content -Path (Join-Path $eventsDirectory $_.Value.fileName) -Raw -Encoding UTF8
          $json = New-Object -TypeName System.Web.Script.Serialization.JavaScriptSerializer
          $json.MaxJsonLength = 104857600 #100mb as bytes, default is 2mb

          $data = $json.Deserialize($content, [System.Object])
          $json = $null
          $data
      }
   }
}

function postToStream {
  process {
    $_ | % {
      $body = @{}
      $body.eventId = $_.eventId
      $body.eventType = $_.eventType
      $body.data = $_.data
      $body.metaData = @{}

      $body.metaData.instanceId = $data.instanceId

      $oldDigestId = ($_.metaData | ConvertFrom-Json).digestId
      $body.metaData.digestId = $data.digests."$oldDigestId".newDigestId

      $oldInboxId = ($_.streamId -split 'inboxCommits-')[1].Trim()
      $streamName = $data.digests."$oldDigestId".inboxesDictionary."$oldInboxId"

      $digest = $data.digests."$oldDigestId"
      $body.metaData.inboxId = $digest.inboxes."$oldInboxId".newInboxId

      $json = $body | ConvertTo-Json
      $json = '[' + $json + ']'

      $currentUri = "$esUrl/streams/inboxCommits-$streamName"
      Write-Host $currentUri
      Write-Host $body.eventId

      invokeRequest $currentUri $json 0
    }
  }
}

function invokeRequest {
  param($uri, $body, $retry)
  Try{
    $r = Invoke-WebRequest `
      -Headers @{ 'Authorization' = (getAuthorizationHeader $esUsr $esPassword) } `
      -ContentType 'application/vnd.eventstore.events+json' `
      -URI $uri `
      -TimeoutSec 30 `
      -Method Post `
      -Insecure `
      -Body $body
  }
  Catch{
    Write-Host $_.Exception.Message
    $retry++
    if($retry -lt 3){
      Write-Host "Retry number $retry"
      invokeRequest $uri $body $retry
    }
    else{
      Write-Host $body
      break
    }
  }
}

($data = readJson '.\output3.json') `
  | readEvents `
  | postToStream