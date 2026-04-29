# Restore a Postgres dump on Windows hosts.
# Usage: pwsh scripts/restore-db.ps1 -DumpFile .\backups\family_meal_planner-20260101T000000Z.sql.gz
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$DumpFile,
  [string]$ComposeFile = "docker-compose.prod.yml"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

if (-not (Test-Path $DumpFile)) {
  Write-Error "Dump file not found: $DumpFile"; exit 1
}
if (-not (Test-Path ".env")) {
  Write-Error ".env not found at $Root"; exit 1
}

Get-Content .env | Where-Object { $_ -and ($_ -notmatch '^\s*#') } | ForEach-Object {
  $kv = $_ -split '=', 2
  if ($kv.Count -eq 2) {
    [Environment]::SetEnvironmentVariable($kv[0].Trim(), $kv[1].Trim(), 'Process')
  }
}

$db = $env:POSTGRES_DB
$user = $env:POSTGRES_USER
if (-not $db -or -not $user) {
  Write-Error "POSTGRES_DB and POSTGRES_USER must be set in .env"; exit 1
}

$confirm = Read-Host "This will overwrite database '$db'. Continue? [y/N]"
if ($confirm -notmatch '^[Yy]$') { Write-Host "Aborted."; exit 0 }

if ($DumpFile -like "*.gz") {
  $tmp = New-TemporaryFile
  try {
    $in = [System.IO.File]::OpenRead($DumpFile)
    $gzip = New-Object System.IO.Compression.GZipStream($in, [System.IO.Compression.CompressionMode]::Decompress)
    $out = [System.IO.File]::Create($tmp.FullName)
    try { $gzip.CopyTo($out) } finally { $out.Dispose(); $gzip.Dispose(); $in.Dispose() }
    Get-Content $tmp.FullName | docker compose -f $ComposeFile exec -T postgres psql -U $user -d $db
  } finally {
    Remove-Item $tmp.FullName -ErrorAction SilentlyContinue
  }
} else {
  Get-Content $DumpFile | docker compose -f $ComposeFile exec -T postgres psql -U $user -d $db
}

Write-Host "Restore complete from $DumpFile"
