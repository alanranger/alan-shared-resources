param(
  [string]$Message = "Update shared resources (auto)"
)

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

# Stage tracked changes first
git add -u

# Stage common content folders
git add "csv" "outputs" "README.md" "STRUCTURE_AUDIT.md" 2>$null

# Avoid staging credential artifacts
git reset "csv processed/credentials" 2>$null

# Exit if nothing to commit
git diff --cached --quiet
if ($LASTEXITCODE -eq 0) {
  Write-Host "No changes to commit."
  exit 0
}

git commit -m "$Message"
git push
