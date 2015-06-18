. '.\Common.ps1'

$instanceId = ''
$apiKey = ''

$BASEURL = 'http://localhost:6565'
$digestCreateUrl = "$BASEURL/api/$instanceId/digests?apiKey=$apiKey"

function createDigests {
  param([Parameter(ValueFromPipeline=$true)]$input)

  $input.digests.PSObject.Properties | % {
    $body = @{}
    $body.description = $_.Value.description

    $json = $body | ConvertTo-Json

    $_.Value | Add-Member @{ 'created' =  $false }
    $_.Value | Add-Member @{ 'inboxesDictionary' =  @{} }

    Try{
      $r = Invoke-RestMethod `
        -Headers @{ 'Accept'= 'application/json' } `
        -Method Post `
        -ContentType 'application/json' `
        -URI $digestCreateUrl `
        -Body $json `
        -TimeoutSec 30 `
        -Insecure

        $_.Value | Add-Member @{ 'newDigestId' =  $r.digestId }
        $_.Value.created = $true
    }
    Catch{
      Write-Host $_.Exception.Message
    }
  }
  $input
}

function createInboxes {
  param([Parameter(ValueFromPipeline=$true)]$input)

  $input.digests.PSObject.Properties | % {
    $d = $_.Value
    $digestId = $_.Value.newDigestId
    $inboxCreateUrl = "$BASEURL/api/$instanceId/digests/$digestId/inboxes?apiKey=$apiKey"

    $_.Value.inboxes.PSObject.Properties | % {
      $body = @{}
      $body.url = $_.Value.url
      $body.name = $_.Value.name
      $body.family = 'GitHub'

      $json = $body | ConvertTo-Json

      $_.Value | Add-Member @{ 'created' =  $false }

      Try{
        $r = Invoke-RestMethod `
          -Headers @{ 'Accept'= 'application/json' } `
          -Method Post `
          -ContentType 'application/json' `
          -URI $inboxCreateUrl `
          -Body $json `
          -TimeoutSec 30 `
          -Insecure

          $_.Value | Add-Member @{ 'newInboxId' =  $r.inboxId }
          $d.inboxesDictionary[$_.Value.inboxId] = $r.inboxId
          $_.Value.created = $true
      }
      Catch{
        Write-Host $_.Exception.Message
      }
    }
  }
  $input
}

readJson 'output2.json' `
  | createDigests `
  | createInboxes `
  | saveJson 'output3.json' `
  | Out-Null