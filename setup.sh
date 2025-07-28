#!/bin/bash

echo "🚀 Setting up Invoice Extractor Project..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Backend setup
echo "📦 Setting up backend..."
cd backend
npm install
if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed successfully"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi
cd ..

# Frontend setup
echo "📦 Setting up frontend..."
cd frontend
npm install
if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed successfully"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi
cd ..

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Create .env files in backend/ and frontend/ directories"
echo "2. Configure your Azure credentials"
echo "3. Run 'npm start' in backend/ directory"
echo "4. Run 'npm run dev' in frontend/ directory"
echo ""
echo "📖 See README.md for detailed instructions" 