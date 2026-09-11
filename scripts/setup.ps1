<#
.SYNOPSIS
  One-time setup for myPDFtools: Python virtual environment + dependencies,
  and (unless -SkipNode) the React frontend install.

.EXAMPLE
  .\scripts\setup.ps1
  .\scripts\setup.ps1 -SkipNode   # backend only
#>
[CmdletBinding()]
param([switch]$SkipNode)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$Backend = Join-Path $Root "backend"
$Frontend = Join-Path $Root "frontend"
$Venv = Join-Path $Backend ".venv"
$VenvPython = Join-Path $Venv "Scripts\python.exe"

Write-Host "==> Python backend: $Backend" -ForegroundColor Cyan

# Locate a Python 3.10+ interpreter.
$Python = $null
if (Get-Command python -ErrorAction SilentlyContinue) { $Python = "python" }
elseif (Get-Command py -ErrorAction SilentlyContinue) { $Python = "py" }
if (-not $Python) { throw "Python was not found. Install Python 3.10+ and add it to PATH." }

if (-not (Test-Path $Venv)) {
  Write-Host "Creating virtual environment..." -ForegroundColor Cyan
  & $Python -m venv $Venv
  if ($LASTEXITCODE -ne 0) { throw "Failed to create the virtual environment." }
}
Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
& $VenvPython -m pip install --disable-pip-version-check --upgrade pip
& $VenvPython -m pip install --disable-pip-version-check -r (Join-Path $Backend "requirements.txt")
& $VenvPython -m pip install --disable-pip-version-check -r (Join-Path $Backend "requirements-dev.txt")

if (-not $SkipNode) {
  Write-Host "==> React frontend: $Frontend" -ForegroundColor Cyan
  if (Get-Command npm -ErrorAction SilentlyContinue) {
    Push-Location $Frontend
    try { & npm install }
    finally { Pop-Location }
  } else {
    Write-Warning "npm not found. Frontend dependencies were not installed. Install Node.js LTS and re-run."
  }
}

Write-Host ""
Write-Host "Setup complete." -ForegroundColor Green
Write-Host ""
Write-Host "Run everything:        .\scripts\dev.ps1"
Write-Host "Backend only:          cd backend;  .\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000"
Write-Host "Frontend only:         cd frontend; npm run dev"
Write-Host "Backend tests:         cd backend;  .\.venv\Scripts\python.exe -m pytest"
Write-Host "Frontend typecheck:    cd frontend; npm run typecheck"
Write-Host "API docs (Swagger):    http://localhost:8000/docs"