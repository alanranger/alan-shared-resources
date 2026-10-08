param(
  [string]$Message = "",
  [string]$Branch = "main",
  [string]$Remote = "origin",
  [switch]$SkipPull
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Invoke-Git {
  param(
    [Parameter(Mandatory = $true)]
    [string[]]$Args
  )
  & git -C $repoRoot @Args
  if ($LASTEXITCODE -ne 0) {
    throw "git $($Args -join ' ') failed with exit code $LASTEXITCODE"
  }
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
if ([string]::IsNullOrWhiteSpace($Message)) {
  $Message = "chore(sync): auto-update shared resources ($timestamp)"
}

Write-Host "[$timestamp] Auto-sync start: $repoRoot"

# Self-clean 06: drop 3xx / 404 / 410 / noindex before commit (Squarespace export inventory).
$pruneScript = Join-Path $PSScriptRoot "prune-06-dead-and-noindex.mjs"
$pruneReport = Join-Path $repoRoot "csv processed\06-prune-report-latest.json"
$pruneDropped = @()
$pruneCount = 0
if (Test-Path $pruneScript) {
  Write-Host "[$timestamp] Pruning dead/noindex URLs from csv/06-site-urls.csv..."
  & node $pruneScript
  if (Test-Path $pruneReport) {
    try {
      $pruneObj = Get-Content -Raw $pruneReport | ConvertFrom-Json
      $pruneCount = [int]($pruneObj.dropped)
      if ($pruneObj.sample) {
        $pruneDropped = @($pruneObj.sample | ForEach-Object { "$($_.reason):$($_.url)" })
      }
    } catch { }
  }
}

# Stage tracked changes and key source-of-truth folders/files.
Invoke-Git -Args @("add", "-u")
Invoke-Git -Args @("add", "--", "csv", "csv processed", "outputs", "README.md", "STRUCTURE_AUDIT.md", "scripts")

# Never stage credentials artifacts.
try {
  Invoke-Git -Args @("reset", "--", "csv processed/credentials")
} catch {
  # Non-fatal if folder does not exist.
}

# Exit if nothing to commit.
& git -C $repoRoot diff --cached --quiet
if ($LASTEXITCODE -eq 0) {
  Write-Host "[$timestamp] No staged changes. Nothing to commit."
  exit 0
}

if (-not $SkipPull) {
  # Rebase before push to reduce non-fast-forward failures.
  try {
    Invoke-Git -Args @("pull", "--rebase", $Remote, $Branch)
  } catch {
    Write-Warning "Pull --rebase failed. Attempting to continue with local commit/push."
  }
}

if ($Message -eq "chore(sync): auto-update shared resources ($timestamp)" -and $pruneCount -gt 0) {
  $dropNote = ($pruneDropped | Select-Object -First 8) -join '; '
  $Message = "chore(sync): auto-update shared resources ($timestamp); prune 06 dead/noindex ($pruneCount): $dropNote"
}

Invoke-Git -Args @("commit", "-m", $Message)
Invoke-Git -Args @("push", $Remote, $Branch)
Write-Host "[$timestamp] Auto-sync complete."
