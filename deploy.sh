#!/bin/bash

# Invoice Extractor Docker Deployment Script

echo "🚀 Starting Invoice Extractor Docker Deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Build the Docker image
echo "📦 Building Docker image..."
docker build -t invoice-extractor:latest .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed!"
    exit 1
fi

echo "✅ Docker image built successfully!"

# Stop and remove existing container if it exists
echo "🔄 Stopping existing container..."
docker stop invoice-extractor-app 2>/dev/null || true
docker rm invoice-extractor-app 2>/dev/null || true

# Run the container
echo "🚀 Starting Invoice Extractor application..."
docker run -d \
    --name invoice-extractor-app \
    -p 6500:6500 \
    --env-file .env \
    -v invoice_data:/app/backend/extracted_invoice_data_json \
    -v markdown_data:/app/backend/markdown\ data \
    --restart unless-stopped \
    invoice-extractor:latest

if [ $? -eq 0 ]; then
    echo "✅ Invoice Extractor is now running!"
    echo "🌐 Access the application at: http://localhost:6500"
    echo "📊 Health check endpoint: http://localhost:6500/api/stored-invoices"
    echo ""
    echo "📋 Useful commands:"
    echo "  - View logs: docker logs invoice-extractor-app"
    echo "  - Stop app: docker stop invoice-extractor-app"
    echo "  - Restart app: docker restart invoice-extractor-app"
    echo "  - Remove app: docker rm -f invoice-extractor-app"
else
    echo "❌ Failed to start the container!"
    exit 1
fi