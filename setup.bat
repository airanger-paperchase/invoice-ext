@echo off
echo 🚀 Setting up Invoice Extractor Project...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js v18 or higher.
    pause
    exit /b 1
)

echo ✅ Node.js version: 
node --version

REM Backend setup
echo 📦 Setting up backend...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed successfully
cd ..

REM Frontend setup
echo 📦 Setting up frontend...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed successfully
cd ..

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Create .env files in backend/ and frontend/ directories
echo 2. Configure your Azure credentials
echo 3. Run 'npm start' in backend/ directory
echo 4. Run 'npm run dev' in frontend/ directory
echo.
echo 📖 See README.md for detailed instructions
pause 