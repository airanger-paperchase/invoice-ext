# Invoice Extractor API Documentation

## Overview

This API provides endpoints for uploading and processing invoice PDFs using Azure Document Intelligence and Azure OpenAI services. The API extracts invoice data and returns structured JSON responses

## Endpoints

* 1. Upload and Process Invoice

**Endpoint**: `POST /api/upload`

**Description**: Uploads invoice PDF files, extracts markdown content using Azure Document Intelligence, and processes the data using Azure OpenAI.

**Input Parameters**:

- **Content-Type**: `multipart/form-data`
- **Body**:
  - `invoicePdfs` (array of files): PDF invoice files to process

**Request Example**:

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "invoicePdfs=@invoice1.pdf" \
  -F "invoicePdfs=@invoice2.pdf"
```

**Output Structure**:

```json
[
  {
    "index": 0,
    "fileName": "invoice1.pdf",
    "success": true,
    "data": {
      "header": {
        "vendor_name": "ABC Company Ltd",
        "invoice_number": "INV-2024-001",
        "invoice_date": "2024-01-15",
        "tax_total_amount": "150.00",
        "subtotal_amount": "1000.00",
        "invoice_total": "1150.00"
      },
      "line_items": [
        {
          "product_name": "Office Supplies",
          "product_code": "OS-001",
          "quantity": "10",
          "unit_price": "50.00",
          "unit_of_measurement": "pieces",
          "per_line_item_tax": "25.00",
          "amount": "500.00",
          "vat_tax_amount": "25.00"
        },
        {
          "product_name": "Laptop Computer",
          "product_code": "LT-2024",
          "quantity": "2",
          "unit_price": "1200.00",
          "unit_of_measurement": "units",
          "per_line_item_tax": "120.00",
          "amount": "2400.00",
          "vat_tax_amount": "120.00"
        },
        {
          "product_name": "Software License",
          "product_code": "SW-001",
          "quantity": "5",
          "unit_price": "150.00",
          "unit_of_measurement": "licenses",
          "per_line_item_tax": "37.50",
          "amount": "750.00",
          "vat_tax_amount": "37.50"
        },
        {
          "product_name": "Consulting Services",
          "product_code": "CS-001",
          "quantity": "8",
          "unit_price": "200.00",
          "unit_of_measurement": "hours",
          "per_line_item_tax": "80.00",
          "amount": "1600.00",
          "vat_tax_amount": "80.00"
        },
        {
          "product_name": "Shipping & Handling",
          "product_code": "SH-001",
          "quantity": "1",
          "unit_price": "25.00",
          "unit_of_measurement": "package",
          "per_line_item_tax": "2.50",
          "amount": "25.00",
          "vat_tax_amount": "2.50"
        }
      ]
    },
    "downloadLink": "/download/results_invoice1.pdf.json"
  },
  {
    "index": 1,
    "fileName": "invoice2.pdf",
    "success": false,
    "error": "Error message describing the failure"
  }
]
```

**Response Codes**:

- `200`: Success - Returns array of processing results
- `400`: Bad Request - No files uploaded
- `500`: Internal Server Error - Processing error

### 2. Get All Stored Invoice Data

**Endpoint**: `GET /api/stored-invoices`

**Description**: Retrieves all previously processed invoice data stored as JSON files.

**Input Parameters**: None

**Request Example**:

```bash
curl -X GET http://localhost:3000/api/stored-invoices
```

**Output Structure**:

```json
[
  {
    "fileName": "invoice1.pdf",
    "success": true,
    "data": {
      "header": {
        "vendor_name": "ABC Company Ltd",
        "invoice_number": "INV-2024-001",
        "invoice_date": "2024-01-15",
        "tax_total_amount": "150.00",
        "subtotal_amount": "1000.00",
        "invoice_total": "1150.00"
      },
      "line_items": [
        {
          "product_name": "Office Supplies",
          "product_code": "OS-001",
          "quantity": "10",
          "unit_price": "50.00",
          "unit_of_measurement": "pieces",
          "per_line_item_tax": "25.00",
          "amount": "500.00",
          "vat_tax_amount": "25.00"
        },
        {
          "product_name": "Laptop Computer",
          "product_code": "LT-2024",
          "quantity": "2",
          "unit_price": "1200.00",
          "unit_of_measurement": "units",
          "per_line_item_tax": "120.00",
          "amount": "2400.00",
          "vat_tax_amount": "120.00"
        },
        {
          "product_name": "Software License",
          "product_code": "SW-001",
          "quantity": "5",
          "unit_price": "150.00",
          "unit_of_measurement": "licenses",
          "per_line_item_tax": "37.50",
          "amount": "750.00",
          "vat_tax_amount": "37.50"
        },
        {
          "product_name": "Consulting Services",
          "product_code": "CS-001",
          "quantity": "8",
          "unit_price": "200.00",
          "unit_of_measurement": "hours",
          "per_line_item_tax": "80.00",
          "amount": "1600.00",
          "vat_tax_amount": "80.00"
        },
        {
          "product_name": "Shipping & Handling",
          "product_code": "SH-001",
          "quantity": "1",
          "unit_price": "25.00",
          "unit_of_measurement": "package",
          "per_line_item_tax": "2.50",
          "amount": "25.00",
          "vat_tax_amount": "2.50"
        }
      ]
    },
    "downloadLink": "/download/results_invoice1.pdf.json"
  },
  {
    "fileName": "invoice2.pdf",
    "success": false,
    "error": "Failed to parse JSON file."
  }
]
```

**Response Codes**:

- `200`: Success - Returns array of stored invoice data
- `500`: Internal Server Error - Failed to read directory

---

## Data Structures

### Invoice Header Structure

```json
{
  "vendor_name": "string",
  "invoice_number": "string",
  "invoice_date": "string",
  "tax_total_amount": "string",
  "subtotal_amount": "string",
  "invoice_total": "string"
}
```

### Line Item Structure

```json
{
  "product_name": "string",
  "product_code": "string",
  "quantity": "string",
  "unit_price": "string",
  "unit_of_measurement": "string",
  "per_line_item_tax": "string",
  "amount": "string",
  "vat_tax_amount": "string"
}
```

### Error Response Structure

```json
{
  "error": "string"
}
```

## Environment Variables

The following environment variables are required:

- `AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT`: Azure Document Intelligence service endpoint
- `AZURE_DOCUMENT_INTELLIGENCE_KEY`: Azure Document Intelligence API key
- `AZURE_OPENAI_ENDPOINT`: Azure OpenAI service endpoint
- `AZURE_OPENAI_API_KEY`: Azure OpenAI API key
- `AZURE_OPENAI_DEPLOYMENT`: Azure OpenAI deployment name (default: "o3-mini")
- `AZURE_OPENAI_IMAGE_DEPLOYMENT`: Azure OpenAI image deployment name (default: "gpt-4o")
- `API_VERSION_GA`: Azure OpenAI API version
- `PORT`: Server port (default: 3000)
- `SERVER_HOST`: Server host (default: 0.0.0.0)
- `NODE_ENV`: Environment mode (development/production)

## File Storage

- **Markdown Files**: Stored in `markdown data/` directory
- **JSON Results**: Stored in `extracted_invoice_data_json/` directory
- **File Naming**:
  - Markdown: `[original_filename].md`
  - JSON: `results_[original_filename].json`

## Notes

1. **File Processing**: The API processes files in memory using multer's memory storage
2. **Error Handling**: Each file is processed independently; errors in one file don't affect others
3. **JSON Extraction**: The API includes logic to extract JSON from potentially malformed responses
4. **CORS**: Flexible CORS configuration allows all origins in development mode
5. **File Downloads**: Generated JSON files can be downloaded using the `/download/:filename` endpoint
