$ErrorActionPreference = "Stop"

Write-Host "============================================"
Write-Host "🚀 D-PLOG Edge Node Packaging Started (Windows)"
Write-Host "============================================"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$FrontendDir = Join-Path $Root "frontend_dplog"
$BackendDir = Join-Path $Root "backend_python"

Write-Host "📦 [1/4] Building Next.js Frontend..."
Set-Location $FrontendDir
if (Test-Path "package-lock.json") {
    npm ci
} else {
    npm install
}
$env:NEXT_PUBLIC_API_URL = "http://127.0.0.1:45123"
$env:NEXT_PUBLIC_APP_MODE = "local"
npm run build

Write-Host "📂 [2/4] Copying Static Files to Backend..."
Set-Location $BackendDir
$StaticOut = Join-Path $BackendDir "static_out"
if (Test-Path $StaticOut) {
    Remove-Item $StaticOut -Recurse -Force
}
Copy-Item (Join-Path $FrontendDir "out") $StaticOut -Recurse

Write-Host "🐍 [3/4] Preparing Python Environment..."
if (-not (Test-Path "venv")) {
    py -3 -m venv venv
}
$Python = Join-Path $BackendDir "venv\Scripts\python.exe"
& $Python -m pip install --upgrade pip
& $Python -m pip install -r requirements.txt
& $Python -m pip install nuitka ordered-set zstandard

Write-Host "🔥 [4/4] Compiling with Nuitka..."
$NuitkaArgs = @(
    "--standalone",
    "--onefile",
    "--windows-console-mode=disable",
    "--include-package=playwright",
    "--include-package-data=playwright",
    "--include-data-dir=static_out=static_out",
    "--output-filename=D-PLOG.exe",
    "--output-dir=dist/windows",
    "--remove-output",
    "main.py"
)

if (Test-Path "dplog.db") {
    $NuitkaArgs = @("--include-data-file=dplog.db=dplog.db") + $NuitkaArgs
}

& $Python -m nuitka @NuitkaArgs

Write-Host "============================================"
Write-Host "✅ Build Complete! Windows executable is ready."
Write-Host "📦 Output: backend_python\dist\windows\D-PLOG.exe"
Write-Host "============================================"
