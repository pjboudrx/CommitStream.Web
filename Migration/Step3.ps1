$CT = 'application/json'

$instanceId = ''
$apiKey = ''

$BASEURL = 'http://localhost:6565'
$digestCreateUrl = "$BASEURL/api/$instanceId/digests?apiKey=$apiKey"

function readFile {
  Get-Content .\output2.json -Raw -Encoding UTF8 | ConvertFrom-Json
}

function saveFile {
  param([Parameter(ValueFromPipeline=$true)]$input)
  Set-Content -Path 'output3.json' -Value (ConvertTo-Json $input -Depth 10)
  $input
}

function createDigests {
  param([Parameter(ValueFromPipeline=$true)]$input)

  $input.digests.PSObject.Properties | % {
    $body = @{}
    $body.description = $_.Value.description

    $json = $body | ConvertTo-Json

    $_.Value | Add-Member @{ "created" =  $false }
    $_.Value | Add-Member @{ "inboxesDictionary" =  @{} }

    Try{
      $r = Invoke-RestMethod `
        -Headers @{ "Accept"= "application/json" } `
        -Method Post `
        -ContentType $CT `
        -URI $digestCreateUrl `
        -Body $json `
        -TimeoutSec 30 `
        -Insecure

        $_.Value | Add-Member @{ "newDigestId" =  $r.digestId }
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

      $_.Value | Add-Member @{ "created" =  $false }

      Try{
        $r = Invoke-RestMethod `
          -Headers @{ "Accept"= "application/json" } `
          -Method Post `
          -ContentType $CT `
          -URI $inboxCreateUrl `
          -Body $json `
          -TimeoutSec 30 `
          -Insecure

          $_.Value | Add-Member @{ "newInboxId" =  $r.inboxId }
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

readFile `
  | createDigests `
  | createInboxes `
  | saveFile `
  | Out-Null