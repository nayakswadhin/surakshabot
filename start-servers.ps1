# ====================================================================
# SurakshaBot - Start Both Servers Script (Improved)
# ====================================================================
# This script will:
# 1. Check if ports 3000 and 3001 are available
# 2. Kill processes if necessary
# 3. Start backend on port 3000
# 4. Start frontend on port 3001
# ====================================================================

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "🚀 Starting SurakshaBot Servers" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Function to kill process on a specific port
function Kill-ProcessOnPort {
    param([int]$Port)
    
    $process = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    
    if ($process) {
        Write-Host "⚠️  Port $Port is in use by PID $process" -ForegroundColor Yellow
        Write-Host "   Stopping process..." -ForegroundColor Yellow
        Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Write-Host "✓ Process stopped" -ForegroundColor Green
    } else {
        Write-Host "✓ Port $Port is available" -ForegroundColor Green
    }
}

# Check and free ports
Write-Host "📡 Checking ports..." -ForegroundColor Blue
Kill-ProcessOnPort -Port 3000
Kill-ProcessOnPort -Port 3001

Write-Host "`n🔧 Starting Backend Server..." -ForegroundColor Blue
Write-Host "   Location: $PWD" -ForegroundColor Gray
Write-Host "   Port: 3000" -ForegroundColor Gray

# Start backend server in new window
$backendWindow = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host '🚀 Backend Server' -ForegroundColor Green; node main.js" -PassThru -WindowStyle Normal

Start-Sleep -Seconds 3

# Check if backend started successfully
$backendRunning = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($backendRunning) {
    Write-Host "✓ Backend server started successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Backend server failed to start" -ForegroundColor Red
    exit 1
}

Write-Host "`n🎨 Starting Frontend Server..." -ForegroundColor Blue
Write-Host "   Location: $PWD\frontend" -ForegroundColor Gray
Write-Host "   Port: 3001" -ForegroundColor Gray

# Start frontend server in new window
$frontendWindow = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; Write-Host '🎨 Frontend Server' -ForegroundColor Blue; npm run dev" -PassThru -WindowStyle Normal

Start-Sleep -Seconds 5

# Check if frontend started successfully
$frontendRunning = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if ($frontendRunning) {
    Write-Host "✓ Frontend server started successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️  Frontend server may still be starting..." -ForegroundColor Yellow
}

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "✨ Servers Running!" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

Write-Host "`n📊 Server Status:" -ForegroundColor White
Write-Host "   Backend:  http://localhost:3000" -ForegroundColor Gray
Write-Host "   Frontend: http://localhost:3001" -ForegroundColor Gray

Write-Host "`n🌐 Open in browser:" -ForegroundColor White
Write-Host "   http://localhost:3001 (Dashboard)" -ForegroundColor Cyan

Write-Host "`n📝 Tips:" -ForegroundColor White
Write-Host "   • Backend logs in separate window" -ForegroundColor Gray
Write-Host "   • Frontend logs in separate window" -ForegroundColor Gray
Write-Host "   • Test connection in Settings page" -ForegroundColor Gray
Write-Host "   • Press Ctrl+C in each window to stop" -ForegroundColor Gray

Write-Host "`n🧪 Test Connection:" -ForegroundColor White
Write-Host "   Run: node test-connection.js" -ForegroundColor Gray

Write-Host "`n"

# Wait a bit and try to open browser
Start-Sleep -Seconds 2
Write-Host "🌐 Opening browser..." -ForegroundColor Blue
Start-Process "http://localhost:3001"

Write-Host "✨ Setup complete! Servers are running in separate windows." -ForegroundColor Green
Write-Host "`nPress any key to exit this window (servers will continue running)..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
