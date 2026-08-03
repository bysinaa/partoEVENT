@echo off
cd /d d:\projects\parto

REM Start main website (port 3000)
start "Parto Website" cmd /k "npm run dev"
timeout /t 3

REM Start EMS API server (port 3001)
start "Parto EMS" cmd /k "npm --prefix parto-ems run dev"
timeout /t 3

REM Start Admin CMS (port 3003)
start "Parto Admin" cmd /k "npm --prefix parto-ems run dev -- -p 3003"

echo All servers starting...
echo - Website: http://localhost:3000
echo - EMS API: http://localhost:3001
echo - Admin: http://localhost:3003