param(
  [string]$TaskName = "AlanSharedResourcesAutoSync",
  [int]$EveryMinutes = 10,
  [string]$Branch = "main",
  [string]$Remote = "origin"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if ($EveryMinutes -lt 1) {
  throw "EveryMinutes must be 1 or greater."
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$syncScript = Join-Path $PSScriptRoot "auto-push.ps1"

if (-not (Test-Path $syncScript)) {
  throw "Sync script not found: $syncScript"
}

$psExe = "powershell.exe"
$taskCommand = "$psExe -NoProfile -ExecutionPolicy Bypass -File `"$syncScript`" -Branch `"$Branch`" -Remote `"$Remote`""

Write-Host "Creating scheduled task '$TaskName' to run every $EveryMinutes minute(s)."
Write-Host "Command: $taskCommand"

schtasks /Create `
  /TN "$TaskName" `
  /SC MINUTE `
  /MO $EveryMinutes `
  /TR "$taskCommand" `
  /F | Out-Null

if ($LASTEXITCODE -ne 0) {
  throw "Failed to create scheduled task '$TaskName'."
}

Write-Host "Scheduled task created successfully."
Write-Host "Use scripts\\unregister-auto-sync-task.ps1 to remove it later."
