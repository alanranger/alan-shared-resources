# 4 Nov 2026: a node step that never exits must not hold auto-push (and every later sync) for hours.
# Loads Invoke-NodeStep from auto-push.ps1 itself (no copy) and runs it on a node script that never ends.
#   powershell -NoProfile -ExecutionPolicy Bypass -File scripts/test-auto-push-node-timeout.ps1
$ErrorActionPreference = 'Stop'
$tokens = $null; $errs = $null
$ast = [System.Management.Automation.Language.Parser]::ParseFile((Join-Path $PSScriptRoot 'auto-push.ps1'), [ref]$tokens, [ref]$errs)
$fn = $ast.FindAll({ param($n) $n -is [System.Management.Automation.Language.FunctionDefinitionAst] -and $n.Name -eq 'Invoke-NodeStep' }, $true) | Select-Object -First 1
if (-not $fn) { throw 'Invoke-NodeStep not found in auto-push.ps1' }
. ([scriptblock]::Create($fn.Extent.Text))
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

$dir = Join-Path $env:TEMP ("node-step-test-" + [guid]::NewGuid().ToString('N').Substring(0, 8))
New-Item -ItemType Directory -Path $dir | Out-Null
$hang = Join-Path $dir 'hang.mjs'
Set-Content -Path $hang -Value 'setInterval(() => {}, 1000);'
$ok = Join-Path $dir 'ok.mjs'
Set-Content -Path $ok -Value 'process.exit(3);'

$failures = @()
$sw = [Diagnostics.Stopwatch]::StartNew()
$code = Invoke-NodeStep -Script $hang -TimeoutSec 3
$sw.Stop()
if ($code -ne -1) { $failures += "hung step: expected -1, got $code" }
if ($sw.Elapsed.TotalSeconds -gt 15) { $failures += "hung step: took $([math]::Round($sw.Elapsed.TotalSeconds)) s" }
Start-Sleep -Milliseconds 500
$left = Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Where-Object { $_.CommandLine -like "*$hang*" }
if ($left) { $failures += "hung step: node still running (pid $($left.ProcessId))" }
$code2 = Invoke-NodeStep -Script $ok -TimeoutSec 30
if ($code2 -ne 3) { $failures += "normal step: expected exit code 3, got $code2" }
Remove-Item -Recurse -Force $dir

if ($failures.Count) { $failures | ForEach-Object { Write-Host "FAIL $_" }; exit 1 }
Write-Host "PASS hung node step stopped after the limit ($([math]::Round($sw.Elapsed.TotalSeconds, 1)) s), process gone; normal step's exit code kept"
exit 0
