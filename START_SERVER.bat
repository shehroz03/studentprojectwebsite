@echo off
title BST HUB - Server Launcher
color 0B
cls
echo.
echo  =====================================================
echo   ____  ____  _____   _   _ _   _ ____
echo  ^| __ )/ ___^|^|_   _^| ^| ^| ^| ^| ^| ^| ^| __ )
echo  ^|  _ \\___ \  ^| ^|   ^| ^|_^| ^| ^| ^| ^|  _ \
echo  ^| ^|_) ^|___) ^| ^| ^|   ^|  _  ^| ^|_^| ^| ^|_) ^|
echo  ^|____/^|____/  ^|_^|   ^|_^| ^|_^|\___/^|____/
echo.
echo  =====================================================
echo   Premium Academic Platform - Server Launcher
echo  =====================================================
echo.

:: Kill any existing node on port 8000
echo [1/3] Clearing port 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1

timeout /t 1 /nobreak >nul

:: Start Node.js API Server
echo [2/3] Starting Node.js API on port 8000...
start "BST HUB - API" cmd /k "cd /d %~dp0server && node index.js"

timeout /t 2 /nobreak >nul

:: Start React Frontend
echo [3/3] Starting React Frontend...
start "BST HUB - Frontend" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo  =====================================================
echo   Servers starting up...
echo   API:       http://localhost:8000
echo   Frontend:  http://localhost:5175
echo  =====================================================
echo.
echo  Admin Login:
echo   Email:    miansabmi7@gmail.com
echo   Password: 12345six@
echo  =====================================================
echo.

timeout /t 4 /nobreak >nul
start http://localhost:5175
exit
