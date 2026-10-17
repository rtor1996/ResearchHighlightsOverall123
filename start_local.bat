@echo off
setlocal
cd /d "%~dp0"
echo Starting the NIT Trichy Research Highlights dashboard...
echo Keep this window open while using the dashboard.
echo Open this address in your browser: http://localhost:8000
where py >nul 2>nul
if %errorlevel%==0 (
  py -m http.server 8000
  goto :end
)
where python >nul 2>nul
if %errorlevel%==0 (
  python -m http.server 8000
  goto :end
)
echo.
echo Python was not found. Install Python from https://www.python.org/downloads/ and select "Add Python to PATH", then run this file again.
pause
:end
endlocal
