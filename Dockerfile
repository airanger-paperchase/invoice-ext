# Use Node.js 18 Alpine as base image for smaller size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Copy package files for both frontend and backend
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies for both frontend and backend
RUN cd backend && npm ci --only=production
RUN cd frontend && npm ci

# Copy source code
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Build frontend (already builds to backend/static)
WORKDIR /app/frontend
RUN npm run build

# Set working directory back to backend
WORKDIR /app/backend

# Create necessary directories
RUN mkdir -p extracted_invoice_data_json markdown\ data

# Expose port for the backend server
EXPOSE 6500

# Create a startup script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'echo "Starting Invoice Extractor Application..."' >> /app/start.sh && \
    echo 'cd /app/backend' >> /app/start.sh && \
    echo 'node app.js' >> /app/start.sh && \
    chmod +x /app/start.sh

# Set environment variables
ENV NODE_ENV=production
ENV PORT=6500

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:6500/api/stored-invoices', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["/app/start.sh"]