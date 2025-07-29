@echo off
echo 🚀 Starting Invoice Extractor Docker Deployment...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    pause
    exit /b 1
)

REM Build the Docker images
echo 📦 Building Docker images...
docker build -t invoice-extractor-backend:latest -f Dockerfile.backend .
docker build -t invoice-extractor-frontend:latest -f Dockerfile.frontend .

if %errorlevel% neq 0 (
    echo ❌ Docker build failed!
    pause
    exit /b 1
)

echo ✅ Docker images built successfully!

REM Stop and remove existing containers if they exist
echo 🔄 Stopping existing containers...
docker stop invoice-extractor-backend invoice-extractor-frontend >nul 2>&1
docker rm invoice-extractor-backend invoice-extractor-frontend >nul 2>&1

REM Run the backend container
echo 🚀 Starting Invoice Extractor Backend...
docker run -d --name invoice-extractor-backend -p 3000:3000 --env-file .env -v invoice_data:/app/backend/extracted_invoice_data_json -v markdown_data:/app/backend/markdown\ data --restart unless-stopped invoice-extractor-backend:latest

REM Run the frontend container
echo 🚀 Starting Invoice Extractor Frontend...
docker run -d --name invoice-extractor-frontend -p 6500:6500 -e VITE_API_BASE_URL=http://localhost:3000 --restart unless-stopped invoice-extractor-frontend:latest

if %errorlevel% equ 0 (
    echo ✅ Invoice Extractor is now running!
    echo 🌐 Frontend: http://localhost:6500
    echo 🔧 Backend API: http://localhost:3000
    echo 📊 Health check endpoint: http://localhost:3000/api/stored-invoices
    echo.
    echo 📋 Useful commands:
    echo   - View backend logs: docker logs invoice-extractor-backend
    echo   - View frontend logs: docker logs invoice-extractor-frontend
    echo   - Stop all: docker stop invoice-extractor-backend invoice-extractor-frontend
    echo   - Restart all: docker restart invoice-extractor-backend invoice-extractor-frontend
    echo   - Remove all: docker rm -f invoice-extractor-backend invoice-extractor-frontend
) else (
    echo ❌ Failed to start the containers!
    pause
    exit /b 1
)

pause