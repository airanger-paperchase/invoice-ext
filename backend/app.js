// // app.js
// const express = require('express');
// const cors = require('cors');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const { extractInvoiceMarkdown, callAzureOpenAIInvoiceFields, fileBufferToBase64, callAzureOpenAIInvoiceFieldsBase64, translateJsonToEnglish } = require('./dataExtract');

// const app = express();
// const port = process.env.PORT || 3000;
// const host = process.env.SERVER_HOST || '0.0.0.0';

// // Enable CORS for frontend - flexible configuration
// const isDevelopment = process.env.NODE_ENV !== 'production';

// // CORS configuration
// const corsOptions = {
//     origin: function (origin, callback) {
//         // Allow requests with no origin (like mobile apps or curl requests)
//         if (!origin) {
//           return callback(null, true);
//         }
        
//         // In development, allow all origins
//         if (isDevelopment) {
//             return callback(null, true);
//         }
        
//         // In production, you can specify allowed origins
//         const allowedOrigins = [
//             'http://localhost:5173',
//             'http://localhost:5174',
//             'http://localhost:3000',
//             'http://localhost:6500',
//             'http://10.200.7.77:6500',
//             'http://10.200.7.77:5173',
//             'http://10.200.7.77:3000',
//             'http://10.200.7.77:6511',
//             'http://10.200.7.77:3000'

//         ];
        
//         if (allowedOrigins.indexOf(origin) !== -1) {
//             callback(null, true);
//         } else {
//             console.log('CORS blocked origin:', origin);
//             callback(new Error('Not allowed by CORS'));
//         }
//     },
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
// };

// app.use(cors(corsOptions));

// // Set up multer for file uploads
// const storage = multer.memoryStorage(); // Store files in memory as buffers
// const upload = multer({ storage: storage });

// // Create a directory for saving JSON results
// const jsonOutputDir = 'extracted_invoice_data_json';
// if (!fs.existsSync(jsonOutputDir)) {
//     fs.mkdirSync(jsonOutputDir);
// }

// // Helper function to extract the first JSON object from a string
// function extractJsonFromString(str) {
//     const firstBrace = str.indexOf('{');
//     const lastBrace = str.lastIndexOf('}');
//     if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
//         return str.substring(firstBrace, lastBrace + 1);
//     }
//     return str;
// }

// // Route for file upload and processing
// app.post('/api/upload', upload.array('invoicePdfs'), async (req, res) => {
//     console.log('POST /api/upload called');
//     const uploadedFiles = req.files;
//     const results = [];
//     // Accept IsEnableOCRForOtherRegion as a form field or query param (default true)
//     let isEnableOCRForOtherRegion = true;
//     if (typeof req.body.IsEnableOCRForOtherRegion !== 'undefined') {
//         isEnableOCRForOtherRegion = req.body.IsEnableOCRForOtherRegion === 'true' || req.body.IsEnableOCRForOtherRegion === true;
//     } else if (typeof req.query.IsEnableOCRForOtherRegion !== 'undefined') {
//         isEnableOCRForOtherRegion = req.query.IsEnableOCRForOtherRegion === 'true' || req.query.IsEnableOCRForOtherRegion === true;
//     }

//     if (!uploadedFiles || uploadedFiles.length === 0) {
//         console.log('No files uploaded');
//         return res.status(400).json({ error: 'No files uploaded.' });
//     }

//     for (const [i, file] of uploadedFiles.entries()) {
//         const fileName = file.originalname;
//         console.log(`Processing file: ${fileName}`);
//         try {
//             // Read file buffer from multer
//             const fileBuffer = file.buffer;

//             // Extract markdown
//             console.log(`Calling extractInvoiceMarkdown for ${fileName}`);
//             const markdownContent = await extractInvoiceMarkdown(fileBuffer);
//             console.log(`Markdown content: ${markdownContent}`);
//             // Ensure the 'markdown data' directory exists
//             const markdownDir = 'markdown data';
//             if (!fs.existsSync(markdownDir)) {
//                 fs.mkdirSync(markdownDir);
//             }
//             // Save the markdownContent to a .md file named after the original file
//             const mdFileName = `${path.parse(fileName).name}.md`;
//             const mdFilePath = path.join(markdownDir, mdFileName);
//             fs.writeFileSync(mdFilePath, markdownContent, 'utf-8');
            
//             // Call Azure OpenAI
//             console.log(`Calling callAzureOpenAIInvoiceFields for ${fileName}`);
//             const openaiResultString = await callAzureOpenAIInvoiceFields(markdownContent);
//             console.log(`OpenAI result string: ${openaiResultString}`);
//             let parsedJsonResult;
//             try {
//                 // Extract JSON from the response string
//                 const jsonString = extractJsonFromString(openaiResultString);
//                 parsedJsonResult = JSON.parse(jsonString);
//             } catch (jsonParseError) {
//                 console.error(`Error parsing OpenAI result for ${fileName}:`, jsonParseError);
//                 parsedJsonResult = { error: "Failed to parse OpenAI response as JSON", rawResponse: openaiResultString };
//             }
//             // If enabled, translate all string fields to English (if not already English)
//             if (isEnableOCRForOtherRegion && !parsedJsonResult.error) {
//                 try {
//                     parsedJsonResult = await translateJsonToEnglish(parsedJsonResult);
//                 } catch (translationError) {
//                     console.error(`Translation error for ${fileName}:`, translationError);
//                     // Optionally, add a flag or error message to the result
//                     parsedJsonResult.translationError = translationError.message;
//                 }
//             }

//             // Save JSON to a file
//             const jsonFileName = `results_${fileName}.json`;
//             const filePath = path.join(jsonOutputDir, jsonFileName);
//             fs.writeFileSync(filePath, JSON.stringify(parsedJsonResult, null, 2), 'utf-8');
//             console.log(`Saved result to ${filePath}`);

//             results.push({
//                 index: i, // Add index for frontend matching
//                 fileName: fileName,
//                 success: true,
//                 data: parsedJsonResult,
//                 downloadLink: `/download/${jsonFileName}` // Provide a download link
//             });

//         } catch (error) {
//             console.error(`Error processing ${fileName}:`, error);
//             results.push({
//                 index: i, // Add index for frontend matching
//                 fileName: fileName,
//                 success: false,
//                 error: error.message
//             });
//         }
//     }
//     console.log('Sending response for /api/upload', results);
//     res.json(results);
// });

// // Route for file upload and base64 processing
// app.post('/api/upload-base64', upload.array('invoicePdfs'), async (req, res) => {
//     console.log('POST /api/upload-base64 called');
//     const uploadedFiles = req.files;
//     const results = [];

//     if (!uploadedFiles || uploadedFiles.length === 0) {
//         console.log('No files uploaded');
//         return res.status(400).json({ error: 'No files uploaded.' });
//     }

//     for (const [i, file] of uploadedFiles.entries()) {
//         const fileName = file.originalname;
//         console.log(`Processing file (base64): ${fileName}`);
//         try {
//             // Read file buffer from multer
//             const fileBuffer = file.buffer;
//             // Convert to base64
//             const base64Content = fileBufferToBase64(fileBuffer);
//             // Call Azure OpenAI with base64
//             console.log(`Calling callAzureOpenAIInvoiceFieldsBase64 for ${fileName}`);
//             const openaiResultString = await callAzureOpenAIInvoiceFieldsBase64(base64Content);
//             console.log(`OpenAI result string: ${openaiResultString}`);
//             let parsedJsonResult;
//             try {
//                 // Extract JSON from the response string
//                 const jsonString = extractJsonFromString(openaiResultString);
//                 parsedJsonResult = JSON.parse(jsonString);
//             } catch (jsonParseError) {
//                 console.error(`Error parsing OpenAI result for ${fileName}:`, jsonParseError);
//                 parsedJsonResult = { error: "Failed to parse OpenAI response as JSON", rawResponse: openaiResultString };
//             }
//             // Save JSON to a file
//             const jsonFileName = `results_${fileName}.json`;
//             const filePath = path.join(jsonOutputDir, jsonFileName);
//             fs.writeFileSync(filePath, JSON.stringify(parsedJsonResult, null, 2), 'utf-8');
//             console.log(`Saved result to ${filePath}`);
//             results.push({
//                 index: i,
//                 fileName: fileName,
//                 success: true,
//                 data: parsedJsonResult,
//                 downloadLink: `/download/${jsonFileName}`
//             });
//         } catch (error) {
//             console.error(`Error processing (base64) ${fileName}:`, error);
//             results.push({
//                 index: i,
//                 fileName: fileName,
//                 success: false,
//                 error: error.message
//             });
//         }
//     }
//     console.log('Sending response for /api/upload-base64', results);
//     res.json(results);
// });

// // Route to download generated JSON files
// app.get('/download/:filename', (req, res) => {
//     const {filename} = req.params;
//     const filePath = path.join(jsonOutputDir, filename);
//     console.log(`GET /download/${filename}`);

//     if (fs.existsSync(filePath)) {
//         res.download(filePath, (err) => {
//             if (err) {
//                 console.error(`Error downloading file ${filename}:`, err);
//                 res.status(500).send('Error downloading file.');
//             } else {
//                 console.log(`File ${filename} downloaded successfully.`);
//             }
//         });
//     } else {
//         console.log(`File not found: ${filename}`);
//         res.status(404).send('File not found.');
//     }
// });

// // New endpoint: Get all stored invoice data
// app.get('/api/stored-invoices', (req, res) => {
//     const dir = path.join(__dirname, jsonOutputDir);
//     fs.readdir(dir, (err, files) => {
//         if (err) {
//             console.error('Error reading stored invoices directory:', err);
//             return res.status(500).json({ error: 'Failed to read stored invoices.' });
//         }
//         const jsonFiles = files.filter(f => f.endsWith('.json'));
//         const results = [];
//         for (const file of jsonFiles) {
//             try {
//                 const filePath = path.join(dir, file);
//                 const content = fs.readFileSync(filePath, 'utf-8');
//                 const data = JSON.parse(content);
//                 results.push({
//                     fileName: file.replace(/^results_/, '').replace(/\.json$/, ''),
//                     success: !data.error,
//                     data: data.error ? undefined : data,
//                     error: data.error || undefined,
//                     downloadLink: `/download/${file}`
//                 });
//             } catch (e) {
//                 results.push({
//                     fileName: file.replace(/^results_/, '').replace(/\.json$/, ''),
//                     success: false,
//                     error: 'Failed to parse JSON file.'
//                 });
//             }
//         }
//         res.json(results);
//     });
// });

// app.listen(port, host, () => {
//     console.log(`Server listening at http://${host}:${port}`);
//     console.log(`CORS: Environment-based configuration active`);
// });
// app.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { extractInvoiceMarkdown, callAzureOpenAIInvoiceFields, fileBufferToBase64, callAzureOpenAIInvoiceFieldsBase64, translateJsonToEnglish } = require('./dataExtract');

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.SERVER_HOST || '0.0.0.0';

// Enable CORS for frontend - flexible configuration
const isDevelopment = process.env.NODE_ENV !== 'production';

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
          return callback(null, true);
        }
        
        // In development, allow all origins
        if (isDevelopment) {
            return callback(null, true);
        }
        
        // // In production, you can specify allowed origins
        // const allowedOrigins = [
        //     'http://localhost:5173',
        //     'http://localhost:5174',
        //     'http://localhost:3000',
        //     'http://localhost:6500',
        //     'http://10.200.7.77:6500',
        //     'http://10.200.7.77:5173',
        //     'http://10.200.7.77:3000',
        //     'http://10.200.7.77:6511',
        //     'http://10.200.7.77:3000'

        // ];
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Set up multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory as buffers
const upload = multer({ storage: storage });

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
// Route for file upload and processing
app.post('/api/upload', upload.array('invoicePdfs'), async (req, res) => {
    console.log('POST /api/upload called');
    const uploadedFiles = req.files;
    const results = [];
    // Accept IsEnableOCRForOtherRegion as a form field or query param (default true)
    let isEnableOCRForOtherRegion = true;
    if (typeof req.body.IsEnableOCRForOtherRegion !== 'undefined') {
        isEnableOCRForOtherRegion = req.body.IsEnableOCRForOtherRegion === 'true' || req.body.IsEnableOCRForOtherRegion === true;
    } else if (typeof req.query.IsEnableOCRForOtherRegion !== 'undefined') {
        isEnableOCRForOtherRegion = req.query.IsEnableOCRForOtherRegion === 'true' || req.query.IsEnableOCRForOtherRegion === true;
    }

    // NEW: accept temperature as form field or query param (default 0.0)
    let temperature = 0.0;
    const tempInput = (typeof req.body.temperature !== 'undefined') ? req.body.temperature : req.query.temperature;
    if (typeof tempInput !== 'undefined') {
        const parsedTemp = parseFloat(tempInput);
        if (!isNaN(parsedTemp)) {
            // clamp between 0 and 1
            temperature = Math.max(0, Math.min(1, parsedTemp));
        }
    }

    if (!uploadedFiles || uploadedFiles.length === 0) {
        console.log('No files uploaded');
        return res.status(400).json({ error: 'No files uploaded.' });
    }

    // Make sure jsonOutputDir exists (ensure this variable is defined elsewhere)
    if (!global.jsonOutputDir) {
        // if you use a local variable, replace with your actual jsonOutputDir var
        global.jsonOutputDir = path.join(__dirname, 'results'); 
    }
    if (!fs.existsSync(global.jsonOutputDir)) fs.mkdirSync(global.jsonOutputDir, { recursive: true });

    for (const [i, file] of uploadedFiles.entries()) {
        const originalFileName = file.originalname || `file_${i}`;
        // sanitize file name for disk (remove path separators, etc.)
        const safeFileName = originalFileName.replace(/[^a-zA-Z0-9._-]/g, '_');
        console.log(`Processing file: ${originalFileName}`);
        try {
            // Read file buffer from multer
            const fileBuffer = file.buffer;

            // Extract markdown
            console.log(`Calling extractInvoiceMarkdown for ${originalFileName}`);
            const markdownContent = await extractInvoiceMarkdown(fileBuffer);
            console.log('Extracted Markdown Content:', markdownContent);
            console.log(`Markdown content length: ${markdownContent ? markdownContent.length : 0}`);
            

            // Save markdown to file (optional)
            const markdownDir = path.join(__dirname, 'markdown_data');
            if (!fs.existsSync(markdownDir)) fs.mkdirSync(markdownDir, { recursive: true });
            const mdFileName = `${path.parse(safeFileName).name}.md`;
            const mdFilePath = path.join(markdownDir, mdFileName);
            fs.writeFileSync(mdFilePath, markdownContent, 'utf-8');

            // Call Azure OpenAI with temperature passed in
            console.log(`Calling callAzureOpenAIInvoiceFields for ${originalFileName} with temperature=${temperature}`);
            const openaiResultString = await callAzureOpenAIInvoiceFields(markdownContent, { temperature });

            // Parse the result robustly
            let parsedJsonResult;
            try {
                if (typeof openaiResultString === 'object' && openaiResultString !== null) {
                    parsedJsonResult = openaiResultString; // already an object
                } else if (typeof openaiResultString === 'string') {
                    // Try plain JSON.parse first (our function returns JSON string)
                    parsedJsonResult = JSON.parse(openaiResultString);
                } else {
                    // Fallback: attempt to extract JSON substring then parse
                    const jsonString = extractJsonFromString(String(openaiResultString));
                    parsedJsonResult = JSON.parse(jsonString);
                }
            } catch (jsonParseError) {
                console.error(`Error parsing OpenAI result for ${originalFileName}:`, jsonParseError);
                // Fallback: try extractJsonFromString if not already used
                try {
                    const maybeJson = extractJsonFromString(String(openaiResultString));
                    parsedJsonResult = JSON.parse(maybeJson);
                } catch (secondParseError) {
                    console.error('Second attempt to parse JSON failed', secondParseError);
                    parsedJsonResult = { error: "Failed to parse OpenAI response as JSON", rawResponse: openaiResultString };
                }
            }

            // If enabled, translate all string fields to English (if not already English)
            if (isEnableOCRForOtherRegion && !parsedJsonResult.error) {
                try {
                    parsedJsonResult = await translateJsonToEnglish(parsedJsonResult);
                } catch (translationError) {
                    console.error(`Translation error for ${originalFileName}:`, translationError);
                    parsedJsonResult.translationError = translationError.message;
                }
            }

            // Save JSON to a file
            const jsonFileName = `results_${path.parse(safeFileName).name}.json`;
            const filePath = path.join(global.jsonOutputDir, jsonFileName);
            fs.writeFileSync(filePath, JSON.stringify(parsedJsonResult, null, 2), 'utf-8');
            console.log(`Saved result to ${filePath}`);

            results.push({
                index: i, // Add index for frontend matching
                fileName: originalFileName,
                success: true,
                data: parsedJsonResult,
                downloadLink: `/download/${jsonFileName}` // Provide a download link
            });

        } catch (error) {
            console.error(`Error processing ${originalFileName}:`, error);
            results.push({
                index: i, // Add index for frontend matching
                fileName: originalFileName,
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
    const {filename} = req.params;
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

app.listen(port, host, () => {
    console.log(`Server listening at http://${host}:${port}`);
    console.log(`CORS: Environment-based configuration active`);
});