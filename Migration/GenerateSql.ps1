. '.\Common.ps1'

$obj = readJson 'output3.json'

Write-Host "DELETE FROM Config WHERE [Type] like 'CommitStream.ConfigGlobal'"
Write-Host @"
INSERT INTO Config (Instance, [Type], MemberID, Value) VALUES
(
  '$($obj.instanceId)',
  'CommitStream.ConfigGlobal',
  NULL,
  '{
    "serviceUrl": "https://commitstream.v1host.com",
    "instanceId": "$($obj.instanceId)",
    "apiKey": "$($obj.apiKey)",
    "globalDigestId": "",
    "configured": true,
    "enabled": true
  }'
)
"@

