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

# Stage tracked changes and key source-of-truth folders/files.
Invoke-Git -Args @("add", "-u")
Invoke-Git -Args @("add", "--", "csv", "csv processed", "outputs", "README.md", "STRUCTURE_AUDIT.md")

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

Invoke-Git -Args @("commit", "-m", $Message)
Invoke-Git -Args @("push", $Remote, $Branch)
Write-Host "[$timestamp] Auto-sync complete."
