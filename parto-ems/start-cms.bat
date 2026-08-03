@echo off
echo Starting Parto CMS servers...
echo.

echo Starting API server on port 3006...
cd /d d:\projects\parto\parto-cms\apps\api
start "CMS API" cmd /k "npm run dev"

echo Starting Admin server on port 3003...
cd /d d:\projects\parto\parto-cms\apps\admin
start "CMS Admin" cmd /k "npm run dev"

echo.
echo CMS servers starting...
echo - API: http://localhost:3006
echo - Admin: http://localhost:3003