@echo off
title HIUHU - Production Server
cd /d C:\hiuhu
set PATH=C:\Users\gatun\nodejs;%PATH%
echo ==============================================
echo   HIUHU Author Folio - Starting Production Mode
echo ==============================================
echo Access in browser: http://localhost:3000
echo.
npm run start
pause
