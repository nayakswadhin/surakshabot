@echo off
echo ================================================
echo Starting SurakshaBot - Frontend and Backend
echo ================================================
echo.

echo [1/3] Checking requirements...
where node >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found! Please install Node.js first.
    pause
    exit /b 1
)
echo    * Node.js: Found

where npm >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm not found! Please install npm first.
    pause
    exit /b 1
)
echo    * npm: Found
echo.

echo [2/3] Starting Backend Server (Port 3000)...
start "SurakshaBot - Backend" cmd /k "cd /d %~dp0 && echo Starting Backend Server... && node main.js"
timeout /t 3 >nul
echo    * Backend started in separate window
echo.

echo [3/3] Starting Frontend Server (Port 3001)...
start "SurakshaBot - Frontend" cmd /k "cd /d %~dp0frontend && echo Starting Frontend Server... && npm run dev"
timeout /t 3 >nul
echo    * Frontend started in separate window
echo.

echo ================================================
echo   Servers Started Successfully!
echo ================================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:3001
echo.
echo Dashboard will open in your browser in 5 seconds...
echo.

timeout /t 5 >nul
start http://localhost:3001

echo ================================================
echo   Setup Complete!
echo ================================================
echo.
echo Both servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
echo Press any key to exit this window...
pause >nul
