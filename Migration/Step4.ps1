. '.\Common.ps1'

$esUrl = 'http://localhost:2113'
$esUsr = 'admin'
$esPassword = 'changeit'
$eventsDirectory = 'digests'

$data = @{}

function readEvents {
   process {
      $_.digests.PSObject.Properties | % {
          readJson (Join-Path $eventsDirectory $_.Value.fileName)
      }
   }
}

function postStream {
  process {
    $_ | % {
      $body = @{}
      $body.eventId = $_.eventId
      $body.eventType = $_.eventType
      $body.data = $_.data
      $body.metaData = @{}

      $oldDigestId = ($_.metaData | ConvertFrom-Json).digestId
      $body.metaData.digestId = $data.digests."$oldDigestId".newDigestId

      $oldInboxId = ($_.streamId -split 'inboxCommits-')[1].Trim()
      $streamName = $data.digests."$oldDigestId".inboxesDictionary."$oldInboxId"

      $json = $body | ConvertTo-Json
      $json = '[' + $json + ']'

      $currentUri = "$esUrl/streams/inboxCommits-$streamName"
      Write-Host $currentUri

      Try{
        $r = Invoke-WebRequest `
          -Headers @{ 'Authorization' = (getAuthorizationHeader $esUsr $esPassword) } `
          -ContentType 'application/vnd.eventstore.events+json' `
          -URI $currentUri `
          -TimeoutSec 30 `
          -Method Post `
          -Insecure `
          -Body $json
      }
      Catch{
        Write-Host $_.Exception.Message
      }
    }
  }

}

($data = readJson '.\output3.json') `
  | readEvents `
  | postStream