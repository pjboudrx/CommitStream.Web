. '.\Common.ps1'

$esUsr = ''
$esPassword = ''
$esUrl = ''
$streamsDirectory = ''

function createStreamsDirectory {
  if(-Not (Test-Path $streamsDirectory)) {
    ni $streamsDirectory -type directory
  }
}

function enrichObject {
  param([Parameter(ValueFromPipeline=$true)]$input)

  $input.digests.PSObject.Properties | % {
    $digestId = $_.Value.digestId
    $_.Value | Add-Member @{ 'streamName' =  "digestCommits-$digestId" }
    $_.Value | Add-Member @{ 'fileName' =  "$digestId.json" }
    $_.Value | Add-Member @{ 'hasCommits' =  $false }
  }

  $input
}

function getStreams {
  param([Parameter(ValueFromPipeline=$true)]$input)

  $input.digests.PSObject.Properties | % {
    $digestId = $_.Value.digestId

    #TODO: increase the number
    $currentUri = "$esUrl/streams/$($_.Value.streamName)/head/backward/99999?embed=tryharder"
    Write-Host $currentUri

    Try{
      $r = Invoke-WebRequest `
        -Headers @{ 'Authorization' = (getAuthorizationHeader $esUsr $esPassword); 'Accept'= 'application/json' } `
        -URI $currentUri `
        -TimeoutSec 30 `
        -Insecure

      $json = New-Object -TypeName System.Web.Script.Serialization.JavaScriptSerializer
      $json.MaxJsonLength = 104857600 #100mb as bytes, default is 2mb

      $data = $json.Deserialize($r.Content, [System.Object])
      $json = $null

      $e = $data.entries  
      [array]::Reverse($e)    

      createStreamsDirectory
      $filePath =  Join-Path $streamsDirectory $_.Value.fileName

      Set-Content -Path $filePath -Value (ConvertTo-Json $e -Depth 10)

      $_.Value.hasCommits = $true
    }
    Catch{
      Write-Host $_.Exception.Message
    }
  }
  $input
}

readJson 'output.json' `
  | enrichObject `
  | getStreams `
  | saveJson 'output2.json' `
  | out-null