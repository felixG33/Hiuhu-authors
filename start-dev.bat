@echo off
title HIUHU - Development Server
cd /d C:\hiuhu
set PATH=C:\Users\gatun\nodejs;%PATH%
echo ==============================================
echo   HIUHU Author Folio - Starting Development Mode
echo ==============================================
echo Access in browser: http://localhost:3000
echo.
npm run dev
pause
