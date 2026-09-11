<#
.SYNOPSIS
  Start the backend (FastAPI on :8000) and frontend (Vite on :5173) for local
  development, then open the app in the browser.

.EXAMPLE
  .\scripts\dev.ps1 -BackendOnly
#>
[CmdletBinding()]
param(
  [switch]$BackendOnly,
  [switch]$FrontendOnly
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$Backend = Join-Path $Root "backend"
$Frontend = Join-Path $Root "frontend"
$VenvPython = Join-Path $Backend ".venv\Scripts\python.exe"
$LogDir = Join-Path $env:TEMP "mypdftools"

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

function Invoke-Backend {
  Write-Host "Starting backend on http://localhost:8000 ..." -ForegroundColor Cyan
  $args = @("-m", "uvicorn", "app.main:app", "--reload", "--port", "8000")
  if (-not (Test-Path $VenvPython)) { throw "Venv not found. Run scripts\setup.ps1 first." }
  Start-Process -FilePath $VenvPython -ArgumentList $args -WorkingDirectory $Backend -WindowStyle Hidden `
    -RedirectStandardOutput (Join-Path $LogDir "uvicorn.log") -RedirectStandardError (Join-Path $LogDir "uvicorn.err")
}

function Invoke-Frontend {
  Write-Host "Starting frontend on http://localhost:5173 ..." -ForegroundColor Cyan
  if (-not (Test-Path (Join-Path $Frontend "node_modules"))) { throw "Frontend deps missing. Run scripts\setup.ps1 first." }
  $npm = (Get-Command npm.cmd -ErrorAction SilentlyContinue).Source
  if (-not $npm) { throw "npm not found." }
  Start-Process -FilePath $npm -ArgumentList @("run", "dev") -WorkingDirectory $Frontend -WindowStyle Hidden `
    -RedirectStandardOutput (Join-Path $LogDir "vite.log") -RedirectStandardError (Join-Path $LogDir "vite.err")
}

if ($BackendOnly) { Invoke-Backend }
elseif ($FrontendOnly) { Invoke-Frontend }
else {
  Invoke-Backend
  Invoke-Frontend
  Start-Sleep -Seconds 6
  Start-Process "http://localhost:5173"
  Write-Host "App: http://localhost:5173   API: http://localhost:8000/docs" -ForegroundColor Green
}

$Log = Join-Path $LogDir "*.log"
Write-Host "Logs are written to $Log (restart with scripts\dev.ps1 to refresh)." -ForegroundColor DarkGray