param(
  [string]$TaskName = "AlanSharedResourcesAutoSync"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "Removing scheduled task '$TaskName'..."
$existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if (-not $existing) {
  Write-Host "Scheduled task not found. Nothing to remove."
  exit 0
}

Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false

Write-Host "Scheduled task removed."
