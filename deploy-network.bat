@echo off
echo 🌐 Network Deployment Setup for Invoice Extractor
echo ==================================================

REM Get server IP address
set /p SERVER_IP="Enter the server IP address (e.g., 10.200.7.77): "
set /p BACKEND_PORT="Enter the backend port (default: 6500): "

REM Set default port if empty
if "%BACKEND_PORT%"=="" set BACKEND_PORT=6500

echo.
echo 📋 Configuration Summary:
echo Server IP: %SERVER_IP%
echo Backend Port: %BACKEND_PORT%
echo.

REM Update backend .env
if exist "backend\.env" (
    echo 🔧 Updating backend configuration...
    powershell -Command "(Get-Content 'backend\.env') -replace 'PORT=.*', 'PORT=%BACKEND_PORT%' | Set-Content 'backend\.env'"
    powershell -Command "(Get-Content 'backend\.env') -replace 'SERVER_HOST=.*', 'SERVER_HOST=%SERVER_IP%' | Set-Content 'backend\.env'"
    echo ✅ Backend port updated to %BACKEND_PORT%
    echo ✅ Backend server host updated to %SERVER_IP%
) else (
    echo ⚠️  Backend .env file not found. Please create it first.
)

REM Update frontend .env
if exist "frontend\.env" (
    echo 🔧 Updating frontend configuration...
    powershell -Command "(Get-Content 'frontend\.env') -replace 'VITE_API_BASE_URL=.*', 'VITE_API_BASE_URL=http://%SERVER_IP%:%BACKEND_PORT%' | Set-Content 'frontend\.env'"
    echo ✅ Frontend API URL updated to http://%SERVER_IP%:%BACKEND_PORT%
) else (
    echo ⚠️  Frontend .env file not found. Please create it first.
)

echo.
echo 🎉 Network deployment configuration completed!
echo.
echo 📋 Next steps:
echo 1. Start the backend server:
echo    cd backend ^&^& npm start
echo.
echo 2. Start the frontend server:
echo    cd frontend ^&^& npm run dev
echo.
echo 3. Access the application at:
echo    http://%SERVER_IP%:5173
echo.
echo 4. Backend API will be available at:
echo    http://%SERVER_IP%:%BACKEND_PORT%
echo.
echo 🔒 Make sure your firewall allows connections on ports %BACKEND_PORT% and 5173
pause