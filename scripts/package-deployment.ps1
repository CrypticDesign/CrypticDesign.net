$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$standalone = Join-Path $repoRoot ".next\standalone"
$artifacts = Join-Path $repoRoot "artifacts"
$stage = Join-Path $artifacts "cry-320-standalone"
$archive = Join-Path $artifacts "cry-320-standalone.zip"
if (-not (Test-Path -LiteralPath (Join-Path $standalone "server.js"))) { throw "Standalone build not found. Run npm run build first." }
New-Item -ItemType Directory -Force -Path $artifacts | Out-Null
if (Test-Path -LiteralPath $stage) { Remove-Item -LiteralPath $stage -Recurse -Force }
if (Test-Path -LiteralPath $archive) { Remove-Item -LiteralPath $archive -Force }
Copy-Item -LiteralPath $standalone -Destination $stage -Recurse
$sandboxData = Join-Path $stage ".data"
if (Test-Path -LiteralPath $sandboxData) { Remove-Item -LiteralPath $sandboxData -Recurse -Force }
New-Item -ItemType Directory -Force -Path (Join-Path $stage ".next") | Out-Null
Copy-Item -LiteralPath (Join-Path $repoRoot ".next\static") -Destination (Join-Path $stage ".next\static") -Recurse
Copy-Item -LiteralPath (Join-Path $repoRoot "public") -Destination (Join-Path $stage "public") -Recurse
Compress-Archive -Path (Join-Path $stage "*") -DestinationPath $archive
$forbidden = Get-ChildItem -LiteralPath $stage -Recurse -Force | Where-Object {
  $_.Name -like ".env*" -or $_.FullName -like "*\.data\*"
}
if ($forbidden) { throw "Deployment package contains forbidden local environment or sandbox data." }
$hash = Get-FileHash -Algorithm SHA256 -LiteralPath $archive
"{0}  {1}" -f $hash.Hash.ToLowerInvariant(), (Split-Path -Leaf $archive) | Set-Content -Encoding ascii -LiteralPath "$archive.sha256"
Write-Output $archive
