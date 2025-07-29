// app-simple-cors.js - Simple version with CORS allowing all origins
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { extractInvoiceMarkdown, callAzureOpenAIInvoiceFields, fileBufferToBase64, callAzureOpenAIInvoiceFieldsBase64 } = require('./dataExtract');

const app = express();
const port = process.env.PORT || 3000;

// Simple CORS - Allow all origins (for development/testing only)
app.use(cors({ 
    origin: '*',  // Allows ALL origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Set up multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory as buffers
const upload = multer({ storage: storage });

// Serve static files (HTML, CSS, JS) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Create a directory for saving JSON results
const jsonOutputDir = 'extracted_invoice_data_json';
if (!fs.existsSync(jsonOutputDir)) {
    fs.mkdirSync(jsonOutputDir);
}

// Helper function to extract the first JSON object from a string
function extractJsonFromString(str) {
    const firstBrace = str.indexOf('{');
    const lastBrace = str.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        return str.substring(firstBrace, lastBrace + 1);
    }
    return str;
}

// Route for file upload and processing
app.post('/api/upload', upload.array('invoicePdfs'), async (req, res) => {
    console.log('POST /api/upload called');
    const uploadedFiles = req.files;
    const results = [];

    if (!uploadedFiles || uploadedFiles.length === 0) {
        console.log('No files uploaded');
        return res.status(400).json({ error: 'No files uploaded.' });
    }

    for (const [i, file] of uploadedFiles.entries()) {
        const fileName = file.originalname;
        console.log(`Processing file: ${fileName}`);
        try {
            // Read file buffer from multer
            const fileBuffer = file.buffer;

            // Extract markdown
            console.log(`Calling extractInvoiceMarkdown for ${fileName}`);
            const markdownContent = await extractInvoiceMarkdown(fileBuffer);
            console.log(`Markdown content: ${markdownContent}`);
            // Ensure the 'markdown data' directory exists
            const markdownDir = 'markdown data';
            if (!fs.existsSync(markdownDir)) {
                fs.mkdirSync(markdownDir);
            }
            // Save the markdownContent to a .md file named after the original file
            const mdFileName = `${path.parse(fileName).name}.md`;
            const mdFilePath = path.join(markdownDir, mdFileName);
            fs.writeFileSync(mdFilePath, markdownContent, 'utf-8');
            
            // Call Azure OpenAI
            console.log(`Calling callAzureOpenAIInvoiceFields for ${fileName}`);
            const openaiResultString = await callAzureOpenAIInvoiceFields(markdownContent);
            console.log(`OpenAI result string: ${openaiResultString}`);
            let parsedJsonResult;
            try {
                // Extract JSON from the response string
                const jsonString = extractJsonFromString(openaiResultString);
                parsedJsonResult = JSON.parse(jsonString);
            } catch (jsonParseError) {
                console.error(`Error parsing OpenAI result for ${fileName}:`, jsonParseError);
                parsedJsonResult = { error: "Failed to parse OpenAI response as JSON", rawResponse: openaiResultString };
            }

            // Save JSON to a file
            const jsonFileName = `results_${fileName}.json`;
            const filePath = path.join(jsonOutputDir, jsonFileName);
            fs.writeFileSync(filePath, JSON.stringify(parsedJsonResult, null, 2), 'utf-8');
            console.log(`Saved result to ${filePath}`);

            results.push({
                index: i, // Add index for frontend matching
                fileName: fileName,
                success: true,
                data: parsedJsonResult,
                downloadLink: `/download/${jsonFileName}` // Provide a download link
            });

        } catch (error) {
            console.error(`Error processing ${fileName}:`, error);
            results.push({
                index: i, // Add index for frontend matching
                fileName: fileName,
                success: false,
                error: error.message
            });
        }
    }
    console.log('Sending response for /api/upload', results);
    res.json(results);
});

// Route for file upload and base64 processing
app.post('/api/upload-base64', upload.array('invoicePdfs'), async (req, res) => {
    console.log('POST /api/upload-base64 called');
    const uploadedFiles = req.files;
    const results = [];

    if (!uploadedFiles || uploadedFiles.length === 0) {
        console.log('No files uploaded');
        return res.status(400).json({ error: 'No files uploaded.' });
    }

    for (const [i, file] of uploadedFiles.entries()) {
        const fileName = file.originalname;
        console.log(`Processing file (base64): ${fileName}`);
        try {
            // Read file buffer from multer
            const fileBuffer = file.buffer;
            // Convert to base64
            const base64Content = fileBufferToBase64(fileBuffer);
            // Call Azure OpenAI with base64
            console.log(`Calling callAzureOpenAIInvoiceFieldsBase64 for ${fileName}`);
            const openaiResultString = await callAzureOpenAIInvoiceFieldsBase64(base64Content);
            console.log(`OpenAI result string: ${openaiResultString}`);
            let parsedJsonResult;
            try {
                // Extract JSON from the response string
                const jsonString = extractJsonFromString(openaiResultString);
                parsedJsonResult = JSON.parse(jsonString);
            } catch (jsonParseError) {
                console.error(`Error parsing OpenAI result for ${fileName}:`, jsonParseError);
                parsedJsonResult = { error: "Failed to parse OpenAI response as JSON", rawResponse: openaiResultString };
            }
            // Save JSON to a file
            const jsonFileName = `results_${fileName}.json`;
            const filePath = path.join(jsonOutputDir, jsonFileName);
            fs.writeFileSync(filePath, JSON.stringify(parsedJsonResult, null, 2), 'utf-8');
            console.log(`Saved result to ${filePath}`);
            results.push({
                index: i,
                fileName: fileName,
                success: true,
                data: parsedJsonResult,
                downloadLink: `/download/${jsonFileName}`
            });
        } catch (error) {
            console.error(`Error processing (base64) ${fileName}:`, error);
            results.push({
                index: i,
                fileName: fileName,
                success: false,
                error: error.message
            });
        }
    }
    console.log('Sending response for /api/upload-base64', results);
    res.json(results);
});

// Route to download generated JSON files
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(jsonOutputDir, filename);
    console.log(`GET /download/${filename}`);

    if (fs.existsSync(filePath)) {
        res.download(filePath, (err) => {
            if (err) {
                console.error(`Error downloading file ${filename}:`, err);
                res.status(500).send('Error downloading file.');
            } else {
                console.log(`File ${filename} downloaded successfully.`);
            }
        });
    } else {
        console.log(`File not found: ${filename}`);
        res.status(404).send('File not found.');
    }
});

// New endpoint: Get all stored invoice data
app.get('/api/stored-invoices', (req, res) => {
    const dir = path.join(__dirname, jsonOutputDir);
    fs.readdir(dir, (err, files) => {
        if (err) {
            console.error('Error reading stored invoices directory:', err);
            return res.status(500).json({ error: 'Failed to read stored invoices.' });
        }
        const jsonFiles = files.filter(f => f.endsWith('.json'));
        const results = [];
        for (const file of jsonFiles) {
            try {
                const filePath = path.join(dir, file);
                const content = fs.readFileSync(filePath, 'utf-8');
                const data = JSON.parse(content);
                results.push({
                    fileName: file.replace(/^results_/, '').replace(/\.json$/, ''),
                    success: !data.error,
                    data: data.error ? undefined : data,
                    error: data.error || undefined,
                    downloadLink: `/download/${file}`
                });
            } catch (e) {
                results.push({
                    fileName: file.replace(/^results_/, '').replace(/\.json$/, ''),
                    success: false,
                    error: 'Failed to parse JSON file.'
                });
            }
        }
        res.json(results);
    });
});

app.listen(port, () => {
    const serverAddress = process.env.SERVER_HOST || 'localhost';
    console.log(`Server listening at http://${serverAddress}:${port}`);
    console.log(`CORS: All origins allowed (development mode)`);
});