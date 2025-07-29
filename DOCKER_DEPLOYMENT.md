# Invoice Extractor - Docker Deployment Guide

This guide explains how to deploy the Invoice Extractor application using Docker with separate frontend and backend services.

## 📋 Prerequisites

- Docker Desktop installed and running
- Azure Document Intelligence credentials
- Azure OpenAI credentials

## 🚀 Quick Start

### Option 1: Using Docker Compose (Recommended)

1. **Set up environment variables:**
   ```bash
   cp backend/env.example .env
   ```
   
2. **Edit the `.env` file with your Azure credentials:**
   ```env
   AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=your_endpoint
   AZURE_DOCUMENT_INTELLIGENCE_KEY=your_key
   AZURE_OPENAI_ENDPOINT=your_openai_endpoint
   AZURE_OPENAI_API_KEY=your_openai_key
   AZURE_OPENAI_DEPLOYMENT=your_deployment_name
   AZURE_OPENAI_IMAGE_DEPLOYMENT=your_image_deployment
   API_VERSION_GA=your_api_version
   ```

3. **Build and run with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

4. **Access the application:**
   - **Frontend UI:** http://localhost:6500
   - **Backend API:** http://localhost:3000
   - **API Health Check:** http://localhost:3000/api/stored-invoices

### Option 2: Using Deployment Scripts

#### For Linux/Mac:
```bash
chmod +x deploy.sh
./deploy.sh
```

#### For Windows:
```cmd
deploy.bat
```

### Option 3: Manual Docker Commands

1. **Build the images:**
   ```bash
   docker build -t invoice-extractor-backend:latest -f Dockerfile.backend .
   docker build -t invoice-extractor-frontend:latest -f Dockerfile.frontend .
   ```

2. **Run the containers:**
   ```bash
   # Backend
   docker run -d \
     --name invoice-extractor-backend \
     -p 3000:3000 \
     --env-file .env \
     -v invoice_data:/app/backend/extracted_invoice_data_json \
     -v markdown_data:/app/backend/markdown\ data \
     --restart unless-stopped \
     invoice-extractor-backend:latest

   # Frontend
   docker run -d \
     --name invoice-extractor-frontend \
     -p 6500:6500 \
     -e VITE_API_BASE_URL=http://localhost:3000 \
     --restart unless-stopped \
     invoice-extractor-frontend:latest
   ```

## 📁 Container Structure

### Backend Container
```
/app/backend/
├── app.js              # Main server file
├── dataExtract.js      # Azure Document Intelligence integration
├── extracted_invoice_data_json/  # Data persistence
└── markdown data/      # Markdown files
```

### Frontend Container
```
/app/frontend/
├── dist/               # Built React application
└── serve               # Static file server
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT` | Azure Document Intelligence endpoint | Yes |
| `AZURE_DOCUMENT_INTELLIGENCE_KEY` | Azure Document Intelligence API key | Yes |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI endpoint | Yes |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key | Yes |
| `AZURE_OPENAI_DEPLOYMENT` | Azure OpenAI deployment name | Yes |
| `AZURE_OPENAI_IMAGE_DEPLOYMENT` | Azure OpenAI image deployment | Yes |
| `API_VERSION_GA` | Azure API version | Yes |
| `VITE_API_BASE_URL` | Backend API URL (default: http://localhost:3000) | No |

### Ports

- **Frontend:** 6500 (React UI)
- **Backend:** 3000 (API server)

### Volumes

The application uses Docker volumes to persist data:

- `invoice_data`: Stores extracted invoice JSON files
- `markdown_data`: Stores markdown files from document processing

## 🛠️ Management Commands

### View Logs
```bash
# Backend logs
docker logs invoice-extractor-backend

# Frontend logs
docker logs invoice-extractor-frontend
```

### Stop the Application
```bash
docker stop invoice-extractor-backend invoice-extractor-frontend
```

### Restart the Application
```bash
docker restart invoice-extractor-backend invoice-extractor-frontend
```

### Remove the Containers
```bash
docker rm -f invoice-extractor-backend invoice-extractor-frontend
```

### Update the Application
```bash
# Stop and remove existing containers
docker stop invoice-extractor-backend invoice-extractor-frontend
docker rm invoice-extractor-backend invoice-extractor-frontend

# Rebuild and run
docker build -t invoice-extractor-backend:latest -f Dockerfile.backend .
docker build -t invoice-extractor-frontend:latest -f Dockerfile.frontend .
docker run -d --name invoice-extractor-backend -p 3000:3000 --env-file .env -v invoice_data:/app/backend/extracted_invoice_data_json -v markdown_data:/app/backend/markdown\ data --restart unless-stopped invoice-extractor-backend:latest
docker run -d --name invoice-extractor-frontend -p 6500:6500 -e VITE_API_BASE_URL=http://localhost:3000 --restart unless-stopped invoice-extractor-frontend:latest
```

## 🔍 Health Check

The backend container includes a health check that verifies the API is responding:

```bash
# Check container health
docker ps

# Manual health check
curl http://localhost:3000/api/stored-invoices
```

## 🐛 Troubleshooting

### Common Issues

1. **Frontend not loading:**
   - Check if port 6500 is available
   - Verify frontend container is running: `docker logs invoice-extractor-frontend`
   - Check if backend is accessible from frontend

2. **Backend API errors:**
   - Check if port 3000 is available
   - Verify environment variables are set correctly
   - Check Docker logs: `docker logs invoice-extractor-backend`

3. **Azure API errors:**
   - Verify Azure credentials in `.env` file
   - Check Azure service quotas and limits
   - Ensure API endpoints are accessible

### Debug Mode

To run in debug mode with more verbose logging:

```bash
# Backend debug
docker run -it --rm \
  --name invoice-extractor-backend-debug \
  -p 3000:3000 \
  --env-file .env \
  -v invoice_data:/app/backend/extracted_invoice_data_json \
  -v markdown_data:/app/backend/markdown\ data \
  invoice-extractor-backend:latest

# Frontend debug
docker run -it --rm \
  --name invoice-extractor-frontend-debug \
  -p 6500:6500 \
  -e VITE_API_BASE_URL=http://localhost:3000 \
  invoice-extractor-frontend:latest
```

## 📊 Monitoring

### Resource Usage
```bash
docker stats invoice-extractor-backend invoice-extractor-frontend
```

### Disk Usage
```bash
docker system df
```

### Clean Up Unused Resources
```bash
docker system prune -a
```

## 🔒 Security Considerations

1. **Environment Variables:** Never commit `.env` files to version control
2. **Network Access:** 
   - Frontend exposes port 6500
   - Backend exposes port 3000
   - Ensure firewall rules are appropriate
3. **Data Persistence:** Volumes contain sensitive invoice data - secure accordingly
4. **Azure Credentials:** Use Azure Key Vault or similar for production deployments

## 🚀 Production Deployment

For production deployment, consider:

1. **Reverse Proxy:** Use nginx or similar for SSL termination
2. **Load Balancer:** For high availability
3. **Monitoring:** Implement proper logging and monitoring
4. **Backup:** Regular backups of volume data
5. **Updates:** Automated container updates and rollbacks

## 📞 Support

If you encounter issues:

1. Check the Docker logs: `docker logs invoice-extractor-backend` and `docker logs invoice-extractor-frontend`
2. Verify environment variables are correct
3. Ensure Azure services are accessible
4. Check the application health endpoint