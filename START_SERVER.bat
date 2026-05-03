@echo off
title BST HUB - Launcher
color 0B
cls
echo.
echo  =====================================================
echo   ____  ____  _____   _   _ _   _ ____
echo  | __ )/ ___||_   _| | | | | | | | __ )
echo  |  _ \\___ \  | |   | |_| | | | |  _ \
echo  | |_) |___) | | |   |  _  | |_| | |_) |
echo  |____/|____/  |_|   |_| |_|\___/|____/
echo.
echo  =====================================================
echo   Premium Academic Platform - Frontend Launcher
echo  =====================================================
echo.

:: Start React Frontend
echo Starting React Frontend...
start "BST HUB - Frontend" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo  =====================================================
echo   Frontend starting up...
echo   URL:  http://localhost:5175
echo  =====================================================
echo.

timeout /t 4 /nobreak >nul
start http://localhost:5175
exit
