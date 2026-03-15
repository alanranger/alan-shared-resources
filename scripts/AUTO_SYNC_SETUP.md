# Auto Sync Setup (Windows Task Scheduler)

This repo includes automation scripts so changes in shared resources can auto-commit and push without relying on any single app UI.

## What it does

- Detects staged/unstaged changes in:
  - `csv/`
  - `csv processed/`
  - `outputs/`
  - `README.md`
  - `STRUCTURE_AUDIT.md`
- Excludes `csv processed/credentials/`
- Commits and pushes to `origin/main`

## One-time setup

Run in PowerShell from this repo root:

```powershell
powershell -ExecutionPolicy Bypass -File ".\scripts\register-auto-sync-task.ps1" -EveryMinutes 10
```

## Manual run (any time)

```powershell
powershell -ExecutionPolicy Bypass -File ".\scripts\auto-push.ps1"
```

## Remove the scheduler

```powershell
powershell -ExecutionPolicy Bypass -File ".\scripts\unregister-auto-sync-task.ps1"
```

## Notes

- This is a broad source-of-truth sync. If you need narrower scope, adjust `scripts/auto-push.ps1`.
- If a push fails (for example due to remote changes), run a manual sync and resolve conflicts once.
