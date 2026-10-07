# CampusCopilot One-Click Launcher (PowerShell)
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "🎓 Starting CampusCopilot — AI College Copilot" -ForegroundColor Green
Write-Host "Powered by Nebius Token Factory & NVIDIA Nemotron" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan

$CurrentDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Start Python FastAPI Server
Write-Host "`n[1/2] Starting Backend (FastAPI on http://localhost:8000)..." -ForegroundColor Magenta
$ServerProcess = Start-Process python -ArgumentList "-m uvicorn main:app --host 0.0.0.0 --port 8000 --reload" -WorkingDirectory "$CurrentDir\server" -PassThru

# Wait 2 seconds for server to initialize
Start-Sleep -Seconds 2

# 2. Start Frontend (Vite on http://localhost:5173)
Write-Host "`n[2/2] Starting Frontend (Vite on http://localhost:5173)..." -ForegroundColor Cyan
Set-Location "$CurrentDir\client"
npm run dev
