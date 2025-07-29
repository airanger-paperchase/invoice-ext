#!/bin/bash

echo "🌐 Network Deployment Setup for Invoice Extractor"
echo "=================================================="

# Get server IP address
read -p "Enter the server IP address (e.g., 10.200.7.77): " SERVER_IP
read -p "Enter the backend port (default: 6500): " BACKEND_PORT
BACKEND_PORT=${BACKEND_PORT:-6500}

echo ""
echo "📋 Configuration Summary:"
echo "Server IP: $SERVER_IP"
echo "Backend Port: $BACKEND_PORT"
echo ""

# Update backend .env
if [ -f "backend/.env" ]; then
    echo "🔧 Updating backend configuration..."
    sed -i "s/PORT=.*/PORT=$BACKEND_PORT/" backend/.env
    echo "✅ Backend port updated to $BACKEND_PORT"
else
    echo "⚠️  Backend .env file not found. Please create it first."
fi

# Update frontend .env
if [ -f "frontend/.env" ]; then
    echo "🔧 Updating frontend configuration..."
    sed -i "s|VITE_API_BASE_URL=.*|VITE_API_BASE_URL=http://$SERVER_IP:$BACKEND_PORT|" frontend/.env
    echo "✅ Frontend API URL updated to http://$SERVER_IP:$BACKEND_PORT"
else
    echo "⚠️  Frontend .env file not found. Please create it first."
fi

echo ""
echo "🎉 Network deployment configuration completed!"
echo ""
echo "📋 Next steps:"
echo "1. Start the backend server:"
echo "   cd backend && npm start"
echo ""
echo "2. Start the frontend server:"
echo "   cd frontend && npm run dev"
echo ""
echo "3. Access the application at:"
echo "   http://$SERVER_IP:5173"
echo ""
echo "4. Backend API will be available at:"
echo "   http://$SERVER_IP:$BACKEND_PORT"
echo ""
echo "🔒 Make sure your firewall allows connections on ports $BACKEND_PORT and 5173"