# Invoice Extractor

A full-stack web application for extracting and analyzing invoice data using Azure Document Intelligence and OpenAI services. The application provides a modern React frontend with a Node.js backend for processing PDF invoices and extracting structured data.

## 🚀 Features

- **PDF Invoice Processing**: Upload and process PDF invoices using Azure Document Intelligence
- **AI-Powered Data Extraction**: Extract structured invoice data using Azure OpenAI
- **Modern Web Interface**: React-based frontend with Tailwind CSS and Material-UI
- **Data Analytics**: View extracted invoice data with analytics and visualizations
- **Export Capabilities**: Download extracted data in JSON format
- **Real-time Processing**: Live processing status and progress tracking

## 📋 Prerequisites

Before running this application, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Azure Account** with the following services:
  - Azure Document Intelligence
  - Azure OpenAI Service
- **Python** (3.11+) - for invoice data models

## 🛠️ Installation

### Quick Setup (Recommended)

#### For Windows Users:

```bash
setup.bat
```

#### For Linux/Mac Users:

```bash
chmod +x setup.sh
./setup.sh
```

### Manual Setup

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd invoice_extractor_node
```

#### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

#### 3. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

## ⚙️ Environment Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```bash
# Copy the example file
cp backend/env.example backend/.env
```

Then edit `backend/.env` with your Azure credentials:

```env
# Azure Document Intelligence
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=your_document_intelligence_endpoint
AZURE_DOCUMENT_INTELLIGENCE_KEY=your_document_intelligence_key

# Azure OpenAI
AZURE_OPENAI_ENDPOINT=your_openai_endpoint
AZURE_OPENAI_API_KEY=your_openai_api_key
AZURE_OPENAI_DEPLOYMENT=your_deployment_name
AZURE_OPENAI_IMAGE_DEPLOYMENT=gpt-4o
API_VERSION_GA=2024-02-15-preview
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```bash
# Copy the example file
cp frontend/env.example frontend/.env
```

Then edit `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

## 🚀 Running the Application

### 1. Start the Backend Server

```bash
cd backend
npm start
```

The backend server will start on `http://localhost:3000`

### 2. Start the Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend application will start on `http://localhost:5173`

## 📁 Project Structure

```
invoice_extractor_node/
├── backend/
│   ├── app.js                 # Express server setup
│   ├── dataExtract.js         # Azure services integration
│   ├── invoice_models.py      # Pydantic data models
│   ├── package.json           # Backend dependencies
│   └── extracted_invoice_data_json/  # Generated JSON files
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── app/              # Page components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── redux/            # State management
│   │   └── lib/              # Utility functions
│   ├── package.json          # Frontend dependencies
│   └── vite.config.ts        # Vite configuration
└── README.md
```

## 🔧 API Endpoints

### Backend API

- `POST /api/upload` - Upload and process PDF invoices
- `GET /download/:filename` - Download extracted JSON data
- `GET /api/invoices` - Get list of processed invoices

### Request Format

```javascript
// Upload invoices
const formData = new FormData();
formData.append('invoicePdfs', file);

fetch('http://localhost:3000/api/upload', {
  method: 'POST',
  body: formData
});
```

### Response Format

```json
{
  "index": 0,
  "fileName": "invoice.pdf",
  "success": true,
  "data": {
    "header": {
      "vendor_name": "Company Name",
      "invoice_number": "INV-001",
      "invoice_date": "2024-01-15",
      "tax_total_amount": 100.00,
      "sub_total_amount": 1000.00,
      "invoice_total": 1100.00
    },
    "line_items": [
      {
        "product_name": "Product Name",
        "product_code": "PROD-001",
        "quantity": 1,
        "unit_price": 100.00,
        "unit_of_measurement": "piece",
        "per_line_item_tax": 10.00,
        "amount": 100.00,
        "vat_tax_amount": 10.00
      }
    ]
  },
  "downloadLink": "/download/results_invoice.pdf.json"
}
```

## 🎯 Usage

### 1. Upload Invoices

1. Navigate to the upload page
2. Select PDF invoice files
3. Click "Upload" to process the invoices
4. Monitor the processing progress

### 2. View Results

1. Go to the invoices page to view all processed invoices
2. Click on an invoice to view detailed analytics
3. Download the extracted JSON data

### 3. Analytics

- View invoice statistics and trends
- Analyze vendor information
- Track invoice processing history

## 🔍 Data Models

### Invoice Header

- `vendor_name`: Company name
- `invoice_number`: Unique invoice identifier
- `invoice_date`: Date of invoice
- `tax_total_amount`: Total tax amount
- `sub_total_amount`: Subtotal before tax
- `invoice_total`: Final invoice amount

### Invoice Line Item

- `product_name`: Name of the product/service
- `product_code`: Product identifier
- `quantity`: Quantity ordered
- `unit_price`: Price per unit
- `unit_of_measurement`: Unit type (piece, kg, etc.)
- `per_line_item_tax`: Tax amount for this line
- `amount`: Line item total
- `vat_tax_amount`: VAT/tax amount

## 🛡️ Security Considerations

- Store sensitive API keys in environment variables
- Implement proper CORS configuration
- Validate file uploads
- Sanitize user inputs
- Use HTTPS in production

## 🚀 Deployment

### Backend Deployment

1. Set up environment variables on your hosting platform
2. Install dependencies: `npm install`
3. Start the server: `npm start`

### Frontend Deployment

1. Build the application: `npm run build`
2. Deploy the `dist` folder to your web server
3. Configure the API base URL for production

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the backend CORS configuration matches your frontend URL
2. **Azure API Errors**: Verify your Azure credentials and service endpoints
3. **File Upload Issues**: Check file size limits and supported formats
4. **Environment Variables**: Ensure all required environment variables are set

### Debug Mode

Enable debug logging by setting:

```env
DEBUG=true
```

## 📝 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support and questions, please open an issue in the repository.

---

**Note**: This application requires Azure Document Intelligence and Azure OpenAI services. Make sure you have the necessary Azure subscriptions and service configurations before running the application.
