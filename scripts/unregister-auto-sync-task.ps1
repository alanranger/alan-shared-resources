param(
  [string]$TaskName = "AlanSharedResourcesAutoSync"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "Removing scheduled task '$TaskName'..."
schtasks /Delete /TN "$TaskName" /F | Out-Null

if ($LASTEXITCODE -ne 0) {
  throw "Failed to remove scheduled task '$TaskName'."
}

Write-Host "Scheduled task removed."
