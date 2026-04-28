$ErrorActionPreference = "Stop"

Write-Host "============================================"
Write-Host "🚀 D-PLOG Desktop Simulation (Windows)"
Write-Host "============================================"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$FrontendDir = Join-Path $Root "frontend_dplog"
$BackendDir = Join-Path $Root "backend_python"

Write-Host "📦 [1/3] Building Next.js Frontend..."
Set-Location $FrontendDir
$env:NEXT_PUBLIC_API_URL = "http://127.0.0.1:45123"
$env:NEXT_PUBLIC_APP_MODE = "local"
npm run build

Write-Host "📂 [2/3] Copying Static Files to Backend..."
Set-Location $BackendDir
$StaticOut = Join-Path $BackendDir "static_out"
if (Test-Path $StaticOut) {
    Remove-Item $StaticOut -Recurse -Force
}
Copy-Item (Join-Path $FrontendDir "out") $StaticOut -Recurse

Write-Host "🐍 [3/3] Running Python Backend..."
$Python = Join-Path $BackendDir "venv\Scripts\python.exe"
if (Test-Path $Python) {
    & $Python main.py
} else {
    python main.py
}
