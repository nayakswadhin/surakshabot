@echo off
echo ========================================
echo Starting SurakshaBot - 1930 Cyber Helpline
echo ========================================
echo.

echo Starting Backend Server (Port 3000)...
start "SurakshaBot Backend" cmd /k "npm start"

timeout /t 3 /nobreak >nul

echo Starting Frontend Dashboard (Port 3001)...
start "SurakshaBot Frontend" cmd /k "cd frontend && npm run dev -- -p 3001"

echo.
echo Both servers are starting...
echo.
echo Backend API: http://localhost:3000
echo Frontend Dashboard: http://localhost:3001
echo.
pause
