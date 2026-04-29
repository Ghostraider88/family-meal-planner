# Postgres backup for Windows hosts.
# Reads POSTGRES_USER and POSTGRES_DB from .env in the repository root.
[CmdletBinding()]
param(
  [string]$ComposeFile = "docker-compose.prod.yml",
  [string]$BackupDir = "backups"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

if (-not (Test-Path ".env")) {
  Write-Error ".env not found at $Root"
  exit 1
}

# Load .env
Get-Content .env | Where-Object { $_ -and ($_ -notmatch '^\s*#') } | ForEach-Object {
  $kv = $_ -split '=', 2
  if ($kv.Count -eq 2) {
    [Environment]::SetEnvironmentVariable($kv[0].Trim(), $kv[1].Trim(), 'Process')
  }
}

$db = $env:POSTGRES_DB
$user = $env:POSTGRES_USER
if (-not $db -or -not $user) {
  Write-Error "POSTGRES_DB and POSTGRES_USER must be set in .env"
  exit 1
}

if (-not (Test-Path $BackupDir)) { New-Item -ItemType Directory -Path $BackupDir | Out-Null }

$timestamp = (Get-Date -AsUTC).ToString("yyyyMMddTHHmmssZ")
$outFile = Join-Path $BackupDir ("$db-$timestamp.sql")

Write-Host "Dumping $db -> $outFile"
docker compose -f $ComposeFile exec -T postgres pg_dump --clean --if-exists --no-owner --no-acl -U $user $db | Out-File -Encoding UTF8 -FilePath $outFile

# Compress
$gz = "$outFile.gz"
& {
  $in = [System.IO.File]::OpenRead($outFile)
  $out = [System.IO.File]::Create($gz)
  $gzip = New-Object System.IO.Compression.GZipStream($out, [System.IO.Compression.CompressionLevel]::Optimal)
  try { $in.CopyTo($gzip) } finally { $gzip.Dispose(); $out.Dispose(); $in.Dispose() }
}
Remove-Item $outFile

Write-Host "Backup complete: $gz"
