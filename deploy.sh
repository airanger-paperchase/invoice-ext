#!/bin/bash

# Invoice Extractor Docker Deployment Script

echo "🚀 Starting Invoice Extractor Docker Deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Build the Docker images
echo "📦 Building Docker images..."
docker build -t invoice-extractor-backend:latest -f Dockerfile.backend .
docker build -t invoice-extractor-frontend:latest -f Dockerfile.frontend .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed!"
    exit 1
fi

echo "✅ Docker images built successfully!"

# Stop and remove existing containers if they exist
echo "🔄 Stopping existing containers..."
docker stop invoice-extractor-backend invoice-extractor-frontend 2>/dev/null || true
docker rm invoice-extractor-backend invoice-extractor-frontend 2>/dev/null || true

# Run the backend container
echo "🚀 Starting Invoice Extractor Backend..."
docker run -d \
    --name invoice-extractor-backend \
    -p 10.200.7.77:6511:3000 \
    --env-file .env \
    -e SERVER_HOST=10.200.7.77 \
    -v invoice_data:/app/backend/extracted_invoice_data_json \
    -v markdown_data:/app/backend/markdown\ data \
    --restart unless-stopped \
    invoice-extractor-backend:latest

# Run the frontend container
echo "🚀 Starting Invoice Extractor Frontend..."
docker run -d \
    --name invoice-extractor-frontend \
    -p 10.200.7.77:6500:6500 \
    -e VITE_API_BASE_URL=http://10.200.7.77:6511 \
    --restart unless-stopped \
    invoice-extractor-frontend:latest

if [ $? -eq 0 ]; then
    echo "✅ Invoice Extractor is now running!"
    echo "🌐 Frontend: http://10.200.7.77:6500"
    echo "🔧 Backend API: http://10.200.7.77:6511"
    echo "📊 Health check endpoint: http://10.200.7.77:6511/api/stored-invoices"
    echo ""
    echo "📋 Useful commands:"
    echo "  - View backend logs: docker logs invoice-extractor-backend"
    echo "  - View frontend logs: docker logs invoice-extractor-frontend"
    echo "  - Stop all: docker stop invoice-extractor-backend invoice-extractor-frontend"
    echo "  - Restart all: docker restart invoice-extractor-backend invoice-extractor-frontend"
    echo "  - Remove all: docker rm -f invoice-extractor-backend invoice-extractor-frontend"
else
    echo "❌ Failed to start the containers!"
    exit 1
fi