# Invoice Extractor - Docker Deployment Guide

This guide explains how to deploy the Invoice Extractor application using Docker.

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
   - Frontend: http://localhost:6500
   - API Health Check: http://localhost:6500/api/stored-invoices

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

1. **Build the image:**
   ```bash
   docker build -t invoice-extractor:latest .
   ```

2. **Run the container:**
   ```bash
   docker run -d \
     --name invoice-extractor-app \
     -p 6500:6500 \
     --env-file .env \
     -v invoice_data:/app/backend/extracted_invoice_data_json \
     -v markdown_data:/app/backend/markdown\ data \
     --restart unless-stopped \
     invoice-extractor:latest
   ```

## 📁 Container Structure

```
/app/
├── backend/           # Backend Node.js application
│   ├── app.js        # Main server file
│   ├── dataExtract.js # Azure Document Intelligence integration
│   └── static/       # Built frontend files
├── frontend/         # Frontend React application (source)
└── start.sh         # Startup script
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
| `PORT` | Server port (default: 6500) | No |
| `NODE_ENV` | Environment (default: production) | No |

### Volumes

The application uses Docker volumes to persist data:

- `invoice_data`: Stores extracted invoice JSON files
- `markdown_data`: Stores markdown files from document processing

## 🛠️ Management Commands

### View Logs
```bash
docker logs invoice-extractor-app
```

### Stop the Application
```bash
docker stop invoice-extractor-app
```

### Restart the Application
```bash
docker restart invoice-extractor-app
```

### Remove the Container
```bash
docker rm -f invoice-extractor-app
```

### Update the Application
```bash
# Stop and remove existing container
docker stop invoice-extractor-app
docker rm invoice-extractor-app

# Rebuild and run
docker build -t invoice-extractor:latest .
docker run -d --name invoice-extractor-app -p 6500:6500 --env-file .env -v invoice_data:/app/backend/extracted_invoice_data_json -v markdown_data:/app/backend/markdown\ data --restart unless-stopped invoice-extractor:latest
```

## 🔍 Health Check

The container includes a health check that verifies the API is responding:

```bash
# Check container health
docker ps

# Manual health check
curl http://localhost:6500/api/stored-invoices
```

## 🐛 Troubleshooting

### Common Issues

1. **Container fails to start:**
   - Check if port 6500 is available
   - Verify environment variables are set correctly
   - Check Docker logs: `docker logs invoice-extractor-app`

2. **Azure API errors:**
   - Verify Azure credentials in `.env` file
   - Check Azure service quotas and limits
   - Ensure API endpoints are accessible

3. **Frontend not loading:**
   - Verify the frontend was built correctly
   - Check if static files are in `/app/backend/static/`
   - Review build logs during Docker build

### Debug Mode

To run in debug mode with more verbose logging:

```bash
docker run -it --rm \
  --name invoice-extractor-debug \
  -p 6500:6500 \
  --env-file .env \
  -v invoice_data:/app/backend/extracted_invoice_data_json \
  -v markdown_data:/app/backend/markdown\ data \
  invoice-extractor:latest
```

## 📊 Monitoring

### Resource Usage
```bash
docker stats invoice-extractor-app
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
2. **Network Access:** The container exposes port 6500 - ensure firewall rules are appropriate
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

1. Check the Docker logs: `docker logs invoice-extractor-app`
2. Verify environment variables are correct
3. Ensure Azure services are accessible
4. Check the application health endpoint