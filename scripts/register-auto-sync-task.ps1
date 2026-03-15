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

Write-Host "Creating scheduled task '$TaskName' to run every $EveryMinutes minute(s)."
$psArgs = "-NoProfile -ExecutionPolicy Bypass -File `"$syncScript`" -Branch `"$Branch`" -Remote `"$Remote`""
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $psArgs
$trigger = New-ScheduledTaskTrigger `
  -Once `
  -At (Get-Date).AddMinutes(1) `
  -RepetitionInterval (New-TimeSpan -Minutes $EveryMinutes) `
  -RepetitionDuration (New-TimeSpan -Days 3650)

Register-ScheduledTask `
  -TaskName $TaskName `
  -Action $action `
  -Trigger $trigger `
  -Description "Auto-sync alan-shared-resources changes" `
  -Force | Out-Null

Write-Host "Scheduled task created successfully."
Write-Host "Use scripts\\unregister-auto-sync-task.ps1 to remove it later."
