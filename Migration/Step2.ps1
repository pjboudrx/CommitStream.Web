$esUsr = ''
$esPassword = ''
$esUrl = ''

function getAuthorizationHeader {
  'Basic ' + [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($esUsr+":"+$esPassword))
}

function enrichObject {
  param([Parameter(ValueFromPipeline=$true)]$input)

  $input.digests.PSObject.Properties | % {
    $digestId = $_.Value.digestId
    $_.Value.inboxes.PSObject.Properties | % {
      $inboxId = $_.Value.inboxId
      $_.Value | Add-Member @{ "streamName" =  "inboxCommits-$inboxId" }
      $_.Value | Add-Member @{ "fileName" =  "$digestId.$inboxId.events.json" }
      $_.Value | Add-Member @{ "hasCommits" =  $false }
    }
  }

  $input
}

#TODO: use pipelines properly
$input = Get-Content .\output.json -Raw -Encoding UTF8 `
  | ConvertFrom-Json `
  | enrichObject

Set-Content -Path 'output2.json' -Value (ConvertTo-Json $input -Depth 10)

$input.digests.PSObject.Properties | % {
  $digestId = $_.Value.digestId
  $_.Value.inboxes.PSObject.Properties | % {
    $inboxId = $_.Value.inboxId

    $currentUri = "$esUrl/streams/$($_.Value.streamName)/head/backward/1000?embed=tryharder"

    Try{
      Invoke-WebRequest `
        -Headers @{ "AUTHORIZATION" = (getAuthorizationHeader); "Accept"= "application/json" } `
        -URI $currentUri `
        -TimeoutSec 20 `
        -OutFile $_.Value.fileName `
        -Insecure

      $_.Value.hasCommits = $true
    }
    Catch{
      Write-Host $_.Exception.Message
    }
  }
}

Set-Content -Path 'output2.json' -Value (ConvertTo-Json $input -Depth 10)