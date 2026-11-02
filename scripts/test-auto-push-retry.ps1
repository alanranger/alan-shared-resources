# Batch 8 task 14: auto-push.ps1 captures git's error and retries add / commit / push once.
# Runs auto-push against a throwaway repo with a local bare remote (no heartbeat, no site checks):
#   1. a temporary .git/index.lock removed during the retry wait  -> state ok, "recovered on retry", pushed
#   2. a lock that stays                                          -> state failed + ALERT, git's stderr included
#   powershell -NoProfile -ExecutionPolicy Bypass -File scripts/test-auto-push-retry.ps1
$ErrorActionPreference = 'Stop'
$autoPush = Join-Path $PSScriptRoot 'auto-push.ps1'
$base = Join-Path $env:TEMP ("auto-push-test-" + [guid]::NewGuid().ToString('N').Substring(0, 8))
$failures = @()

function New-TestRepo {
  param([string]$Name)
  $bare = Join-Path $base "$Name-remote.git"
  $work = Join-Path $base "$Name-work"
  git init -q --bare $bare
  git init -q -b main $work
  git -C $work config user.email 'test@example.invalid'
  git -C $work config user.name 'auto-push test'
  foreach ($d in 'csv', 'csv processed', 'outputs', 'scripts') { New-Item -ItemType Directory -Force -Path (Join-Path $work $d) | Out-Null }
  foreach ($f in 'README.md', 'STRUCTURE_AUDIT.md', '.gitignore', 'csv\a.csv', 'csv processed\b.csv', 'outputs\keep.txt', 'scripts\keep.txt') { Set-Content -Path (Join-Path $work $f) -Value 'x' }
  git -C $work add -A
  git -C $work commit -q -m init
  git -C $work remote add origin $bare
  git -C $work push -q origin main 2>$null
  Add-Content -Path (Join-Path $work 'csv\a.csv') -Value "change $Name"
  return $work
}

function Invoke-AutoPush {
  param([string]$Work, [int]$Wait)
  $status = Join-Path $base "$(Split-Path $Work -Leaf)-status.json"
  $alert = Join-Path $base "$(Split-Path $Work -Leaf)-ALERT.md"
  $job = Start-Job -ScriptBlock {
    param($p, $w, $s, $a, $t)
    powershell -NoProfile -ExecutionPolicy Bypass -File $p -RepoRoot $w -StatusPath $s -AlertPath $a -RetryWaitSeconds $t -NoHeartbeat -SkipSiteChecks -SkipPull 2>&1 | Out-String
  } -ArgumentList $autoPush, $Work, $status, $alert, $Wait
  return [pscustomobject]@{ Job = $job; Status = $status; Alert = $alert }
}

New-Item -ItemType Directory -Force -Path $base | Out-Null
try {
  # 1. recovers on retry
  $w1 = New-TestRepo -Name 'recover'
  $lock1 = Join-Path $w1 '.git\index.lock'
  Set-Content -Path $lock1 -Value ''
  $run1 = Invoke-AutoPush -Work $w1 -Wait 8
  Start-Sleep -Seconds 4
  Remove-Item -Force $lock1
  Receive-Job -Job $run1.Job -Wait | Out-Null
  $s1 = Get-Content -Raw $run1.Status | ConvertFrom-Json
  $pushed = git -C $w1 rev-list --count origin/main..HEAD
  if ($s1.state -ne 'ok') { $failures += "recover: state $($s1.state)" }
  if (-not (@($s1.recovered_on_retry) -join ' ' -match 'recovered on retry: git add .*index\.lock')) { $failures += "recover: no 'recovered on retry' with git's text ($($s1.detail))" }
  if ([int]$pushed -ne 0) { $failures += "recover: not pushed ($pushed ahead)" }
  if (Test-Path $run1.Alert) { $failures += 'recover: ALERT written' }

  # 2. persistent lock fails with stderr in status + ALERT
  $w2 = New-TestRepo -Name 'persist'
  Set-Content -Path (Join-Path $w2 '.git\index.lock') -Value ''
  $run2 = Invoke-AutoPush -Work $w2 -Wait 2
  Receive-Job -Job $run2.Job -Wait | Out-Null
  $s2 = Get-Content -Raw $run2.Status | ConvertFrom-Json
  if ($s2.state -ne 'failed') { $failures += "persist: state $($s2.state)" }
  if ($s2.detail -notmatch 'index\.lock' -or $s2.detail -notmatch 'retry failed') { $failures += "persist: stderr/retry missing in detail ($($s2.detail))" }
  if (-not (Test-Path $run2.Alert)) { $failures += 'persist: no ALERT' }
  elseif ((Get-Content -Raw $run2.Alert) -notmatch 'index\.lock') { $failures += 'persist: ALERT lacks stderr' }
} finally {
  Get-Job | Remove-Job -Force -ErrorAction SilentlyContinue
  Remove-Item -Recurse -Force $base -ErrorAction SilentlyContinue
}

if ($failures.Count) { Write-Output "FAIL"; $failures | ForEach-Object { Write-Output "  $_" }; exit 1 }
Write-Output "PASS: recovered on retry (lock removed during the wait); persistent lock -> failed + ALERT with git's stderr"
