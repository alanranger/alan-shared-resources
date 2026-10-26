param(
  [string]$Message = "",
  [string]$Branch = "main",
  [string]$Remote = "origin",
  [switch]$SkipPull
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$statusPath = Join-Path $repoRoot "outputs\AUTO-SYNC-STATUS-LATEST.json"
$alertPath = "C:\Users\alan\Google Drive\Claude shared resources\Cursor Outputs for Claude\ALERT-alan-shared-resources-autosync-FAILED-LATEST.md"

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

function Write-SyncStatus {
  param(
    [Parameter(Mandatory = $true)][ValidateSet('ok', 'failed', 'noop')][string]$State,
    [string]$Detail = ""
  )
  $ahead = 0
  try {
    $ahead = [int](& git -C $repoRoot rev-list --count "$Remote/$Branch..HEAD" 2>$null)
  } catch { $ahead = -1 }
  $obj = [ordered]@{
    state       = $State
    checked_at  = (Get-Date).ToString('o')
    timestamp   = $timestamp
    ahead_of_origin = $ahead
    detail      = $Detail
  }
  $dir = Split-Path $statusPath -Parent
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  ($obj | ConvertTo-Json) | Set-Content -Path $statusPath -Encoding utf8

  if ($State -eq 'failed') {
    $md = @"
# ALERT: alan-shared-resources AutoSync FAILED

- **When:** $timestamp
- **Ahead of origin:** $ahead commit(s)
- **Detail:** $Detail

Local Dropbox may look fine while GitHub is stale. Fix push, then re-run ``scripts/auto-push.ps1``.
"@
    $alertDir = Split-Path $alertPath -Parent
    if (Test-Path $alertDir) {
      $md | Set-Content -Path $alertPath -Encoding utf8
    }
  } elseif (Test-Path $alertPath) {
    Remove-Item -Force $alertPath -ErrorAction SilentlyContinue
  }
}

function Get-AheadCount {
  try {
    return [int](& git -C $repoRoot rev-list --count "$Remote/$Branch..HEAD" 2>$null)
  } catch {
    return 0
  }
}

try {
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

  # Self-grow 06: add newly published live pages (blog feed + sitemap) so they join the audit list.
  $addScript = Join-Path $PSScriptRoot "add-06-new-urls.mjs"
  $addReport = Join-Path $repoRoot "csv processed\06-add-report-latest.json"
  $addedUrls = @()
  if (Test-Path $addScript) {
    Write-Host "[$timestamp] Adding new live URLs to csv/06-site-urls.csv..."
    & node $addScript
    if (Test-Path $addReport) {
      try {
        $addObj = Get-Content -Raw $addReport | ConvertFrom-Json
        $addedUrls = @($addObj.addedUrls)
      } catch { }
    }
  }

  # Stage tracked changes and key source-of-truth folders/files.
  Invoke-Git -Args @("add", "-u")
  Invoke-Git -Args @("add", "--", "csv", "csv processed", "outputs", "README.md", "STRUCTURE_AUDIT.md", "scripts", ".gitignore")

  # Never stage credentials artifacts (also gitignored; belt-and-braces).
  try {
    Invoke-Git -Args @("reset", "-q", "--", "csv processed/credentials")
    Invoke-Git -Args @("rm", "-r", "--cached", "--ignore-unmatch", "--", "csv processed/credentials")
  } catch {
    # Non-fatal if folder does not exist.
  }
  $stagedCreds = & git -C $repoRoot diff --cached --name-only -- "csv processed/credentials"
  if ($stagedCreds) {
    $credList = @($stagedCreds) -join [Environment]::NewLine
    throw "Refusing to commit: credentials still staged:`n$credList"
  }

  # Exit if nothing to commit - but still recover a stuck unpushed tip.
  & git -C $repoRoot diff --cached --quiet
  if ($LASTEXITCODE -eq 0) {
    $ahead = Get-AheadCount
    if ($ahead -gt 0) {
      Write-Warning "[$timestamp] Nothing new to commit, but HEAD is $ahead commit(s) ahead of $Remote/$Branch - retrying push."
      Invoke-Git -Args @("push", $Remote, $Branch)
      Write-SyncStatus -State 'ok' -Detail "Recovered stuck tip: pushed $ahead existing commit(s)."
      Write-Host "[$timestamp] Auto-sync complete (stuck tip pushed)."
      exit 0
    }
    Write-SyncStatus -State 'noop' -Detail 'No staged changes; branch not ahead.'
    Write-Host "[$timestamp] No staged changes. Nothing to commit."
    exit 0
  }

  if (-not $SkipPull) {
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
  Write-SyncStatus -State 'ok' -Detail $Message
  Write-Host "[$timestamp] Auto-sync complete."
} catch {
  Write-SyncStatus -State 'failed' -Detail $_.Exception.Message
  Write-Error "[$timestamp] Auto-sync FAILED: $($_.Exception.Message)"
  exit 1
}
