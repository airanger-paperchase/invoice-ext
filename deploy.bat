@echo off
echo 🚀 Starting Invoice Extractor Docker Deployment...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    pause
    exit /b 1
)

REM Build the Docker image
echo 📦 Building Docker image...
docker build -t invoice-extractor:latest .

if %errorlevel% neq 0 (
    echo ❌ Docker build failed!
    pause
    exit /b 1
)

echo ✅ Docker image built successfully!

REM Stop and remove existing container if it exists
echo 🔄 Stopping existing container...
docker stop invoice-extractor-app >nul 2>&1
docker rm invoice-extractor-app >nul 2>&1

REM Run the container
echo 🚀 Starting Invoice Extractor application...
docker run -d --name invoice-extractor-app -p 6500:6500 --env-file .env -v invoice_data:/app/backend/extracted_invoice_data_json -v markdown_data:/app/backend/markdown\ data --restart unless-stopped invoice-extractor:latest

if %errorlevel% equ 0 (
    echo ✅ Invoice Extractor is now running!
    echo 🌐 Access the application at: http://localhost:6500
    echo 📊 Health check endpoint: http://localhost:6500/api/stored-invoices
    echo.
    echo 📋 Useful commands:
    echo   - View logs: docker logs invoice-extractor-app
    echo   - Stop app: docker stop invoice-extractor-app
    echo   - Restart app: docker restart invoice-extractor-app
    echo   - Remove app: docker rm -f invoice-extractor-app
) else (
    echo ❌ Failed to start the container!
    pause
    exit /b 1
)

pause