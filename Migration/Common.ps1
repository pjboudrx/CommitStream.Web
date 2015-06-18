
function getAuthorizationHeader {
  param($usr, $password)
    'Basic ' + [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($usr+":"+$password))
}

function readJson {
  param([Parameter(ValueFromPipeline=$true)]$file)
  Get-Content -Path $file -Raw -Encoding UTF8 | ConvertFrom-Json
}