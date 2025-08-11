// dataExtract.js
require('dotenv').config();
const { AzureOpenAI } = require("openai");

// Correct import for @azure-rest/ai-document-intelligence
// The package exports a function directly that acts as the client factory.
const DocumentIntelligence = require('@azure-rest/ai-document-intelligence').default;

// You'll also need to import isUnexpected and getLongRunningPoller as named exports
const { isUnexpected, getLongRunningPoller } = require('@azure-rest/ai-document-intelligence');

const TextTranslationClient = require("@azure-rest/ai-translation-text").default;

const translationApiKey = process.env.AZURE_TRANSLATION_KEY;
const translationEndpoint = process.env.AZURE_TRANSLATION_ENDPOINT;
const translationRegion = process.env.AZURE_TRANSLATION_REGION;


const documentIntelligenceEndpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
const documentIntelligenceKey = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;
const openAIApiVersion = process.env.API_VERSION_GA;

// Service 1 Credentials
const openAIAzureEndpoint1 = process.env.AZURE_OPENAI_ENDPOINT_V1;
const openAIApiKey1 = process.env.AZURE_OPENAI_API_KEY_V1;
const openAIDeployment1 = process.env.AZURE_OPENAI_DEPLOYMENT_V1;

// Service 2 Credentials
const openAIAzureEndpoint2 = process.env.AZURE_OPENAI_ENDPOINT_V2;
const openAIApiKey2 = process.env.AZURE_OPENAI_API_KEY_V2;
const openAIDeployment2 = process.env.AZURE_OPENAI_DEPLOYMENT_V2;

// Service 3 Credentials
const openAIAzureEndpoint3 = process.env.AZURE_OPENAI_ENDPOINT_V3;
const openAIApiKey3 = process.env.AZURE_OPENAI_API_KEY_V3;
const openAIDeployment3 = process.env.AZURE_OPENAI_DEPLOYMENT_V3;

async function extractInvoiceMarkdown(fileBuffer) {
    if (!documentIntelligenceEndpoint || !documentIntelligenceKey) {
        throw new Error("Azure Document Intelligence credentials are not set in .env file.");
    }

    // Correct way to initialize the client using the factory function
    // 'DocumentIntelligence' itself is the function you call to get the client.
    const client = DocumentIntelligence(documentIntelligenceEndpoint, {
        key: documentIntelligenceKey,
    });

    // Convert Buffer to base64 for 'base64Source'
    const base64Source = fileBuffer.toString('base64');

    const initialResponse = await client
        .path("/documentModels/{modelId}:analyze", "prebuilt-layout")
        .post({
            contentType: "application/json", // Important for base64Source
            body: {
                base64Source: base64Source,
            },
            queryParameters: {
                outputContentFormat: "text", // Specify markdown output
            },
        });

    if (isUnexpected(initialResponse)) {
        // Log the full error body for better debugging
        console.error("Document Intelligence API Error:", JSON.stringify(initialResponse.body, null, 2));
        throw new Error(`Error during initial analysis request: ${initialResponse.body?.error?.message || "Unknown error"}`);
    }

    const poller = getLongRunningPoller(client, initialResponse);
    const result = await poller.pollUntilDone();

    // The result structure is different now. The content is under analyzeResult.content
    if (result.body && result.body.analyzeResult && result.body.analyzeResult.content) {
        return result.body.analyzeResult.content;
    } else {
        // Log the full result body if content is missing for debugging
        console.error("Document Intelligence Result Missing Content:", JSON.stringify(result.body, null, 2));
        throw new Error("Could not find markdown content in the Document Intelligence response.");
    }
}

// Full Extraction System Prompt (used by parallel models)
const extractionSystemPrompt = `You are an advanced invoice parsing AI. Your task is to extract data from a chunk of an invoice provided in Markdown format. You must respond with a JSON object ONLY.

**CRITICAL INSTRUCTIONS:**
1.  **JSON ONLY:** Your entire response must be a single, valid JSON object. Do not include any text, explanations, or markdown formatting before or after the JSON.
2.  **STRICT SCHEMA:** The JSON object must follow this exact structure and use these exact 'snake_case' field names.
3.  **NULL FOR MISSING DATA:** If you cannot find a value for a field within your chunk of the document, you MUST include the key in the JSON with a value of 'null'. DO NOT omit any keys.


**Invoice Header Fields**:
- VendorName
- VendorTaxId
- CustomerName
- InvoiceId
- InvoiceDate
- DueDate
- SubTotal
- TotalTax
- InvoiceTotal
- PaymentTerm
- PurchaseOrder

**Line Items** (For each item listed on the invoice, extract the following details):
- Product name
- ProductCode
- Description
- Quantity
- UnitPrice
- Unit of measurement
- Per line item tax
- Amount
- VAT/TAX amount

# MOST IMPORTANT:
- DO NOT MISS ANY DATA FROM THE INVOICE.
- CONSIDER ALL THE DATA FROM THE INVOICE.
- The data should be in the same sequence as it is in the invoice.
- The data should be in the same format as it is in the invoice.
- The data should be in English language if data is in another language then translate it into english and keep it as it is in the invoice.
- The data should be in the same currency as it is in the invoice.
- The data should be in the same date format as it is in the invoice.
- The data should be in the same time format as it is in the invoice.
- The data should be in the same number format as it is in the invoice.

### Guidelines:
- Accurately analyze and understand the invoice data, regardless of its format or structure, while maintaining high precision in extraction and classification.
- Whenever a value includes units in a format like "XX x XX unit" (e.g., "2x2 US gal", "66x76 m", "2 punnet", "2.05 Kilo", "5 Bunch"), extract and store the full expression (both values and unit) in the **Unit of Measurement (UOM)** field. This applies to any field where measurement data is present.
- Do not skip any data or leave any fields blank unless they are explicitly missing from the input. Your comprehension and handling of invoices must be thorough, and the extracted data must be accurate and complete.

### Precision and Output:
- Return only the result as a valid JSON object containing and  keep teh sequence of the data as it is:
- A 'header' dictionary with the key-value pairs for the header fields.
- A 'line_items' list, where each item is a dictionary containing the extracted line item details.
- Do not include comments, explanations, or any text outside the JSON object.
- Ensure the JSON is properly formatted, with no trailing commas or invalid syntax. Each field should have a value, even if it is null or an empty string when data is unavailable.

### Key Considerations:
- Account for varying invoice layouts and data arrangements. Extract all the information provided without omitting any detail.
- Maintain high accuracy in understanding and assigning invoice data to the correct fields. Misclassification or omission is unacceptable.

**JSON STRUCTURE:**
{
  "header": {
    "VendorName": "string or null",
    "VendorTaxId": "string or null",
    "CustomerName": "string or null",
    "InvoiceId": "string or null",
    "InvoiceDate": "string or null",
    "DueDate": "string or null",
    "SubTotal": "string or null",
    "TotalTax": "string or null",
    "InvoiceTotal": "string or null",
    "PaymentTerm": "string or null",
    "PurchaseOrder": "string or null"

  },
  "line_items": [
    {
      "ProductName": "string or null",
      "ProductCode": "string or null",
      "Description": "string or null",
      "Quantity": "number or null",
      "UnitPrice": "string or null",
      "unit_of_measurement": "string or null",
      "per_line_item_tax": "string or null",
      "Amount": "string or null",
      "Tax": "string or null"
    }
  ]
}
# Notes:
- Your role is critical in accurately processing financial documents, and precision is non-negotiable.
- Always verify that the extracted data adheres to the required structure and includes all necessary details.

Extract all information you can from the provided text chunk. Remember to preserve the original currency, date formats, and numerical precision.`;

/**
 * NEW APPROACH: Orchestrates parallel processing of invoice data.
 * 1. Splits the markdown content into 3 parts.
 * 2. Sends each part to a separate OpenAI model instance for parallel extraction.
 * 3. Combines the 3 partial JSON results in the code.
 * @param {string} markdownContent - The full markdown content from Document Intelligence.
 * @returns {string} - The final, combined JSON string.
 */
async function callAzureOpenAIInvoiceFields(markdownContent) {
    // --- Step 1: Check for all necessary credentials and deployments ---
    if (!openAIAzureEndpoint1 || !openAIApiKey1 || !openAIDeployment1 ||
        !openAIAzureEndpoint2 || !openAIApiKey2 || !openAIDeployment2 ||
        !openAIAzureEndpoint3 || !openAIApiKey3 || !openAIDeployment3) {
        throw new Error("One or more Azure OpenAI service credentials (endpoint, key, deployment) for parallel processing are not set in the .env file.");
    }

    // --- Step 2: Split markdown content into three chunks ---
    const totalLength = markdownContent.length;
    const partLength = Math.ceil(totalLength / 3);
    const chunks = [
        markdownContent.substring(0, partLength),
        markdownContent.substring(partLength, 2 * partLength),
        markdownContent.substring(2 * partLength)
    ];

    // --- Step 3: Create clients for each service and process chunks in parallel ---
    const clients = [
        new AzureOpenAI({ endpoint: openAIAzureEndpoint1, apiKey: openAIApiKey1, apiVersion: openAIApiVersion }),
        new AzureOpenAI({ endpoint: openAIAzureEndpoint2, apiKey: openAIApiKey2, apiVersion: openAIApiVersion }),
        new AzureOpenAI({ endpoint: openAIAzureEndpoint3, apiKey: openAIApiKey3, apiVersion: openAIApiVersion })
    ];
    const deployments = [openAIDeployment1, openAIDeployment2, openAIDeployment3];
    const endpoints = [openAIAzureEndpoint1, openAIAzureEndpoint2, openAIAzureEndpoint3];

        console.log('Starting parallel extraction...');
    const totalStartTime = Date.now();
    try {
        const extractionPromises = chunks.map(async (chunk, index) => { // Make the callback async
            const startTime = Date.now();
            const client = clients[index];
            const deployment = deployments[index];
            const endpoint = endpoints[index];
            console.log(`Sending chunk ${index + 1} to deployment ${deployment} on endpoint ${endpoint} at ${new Date(startTime).toISOString()}`);
            try {
                const result = await client.chat.completions.create({
                model: deployment,
                messages: [
                    { role: "system", content: extractionSystemPrompt },
                    { role: "user", content: chunk }
                ],
                max_completion_tokens: 16384, // Adjusted for partial data
                response_format: { type: "json_object" } // Enforce JSON output
                });
                const endTime = Date.now();
                console.log(`--- Response from ${deployments[index]} (Chunk ${index + 1}) ---`);
                console.log(`Duration: ${(endTime - startTime) / 1000}s`);
                console.log('Response Content:', result.choices[0].message.content);
                console.log(`----------------------------------------------------`);
                return result;
            } catch (error) {
                const endTime = Date.now();
                console.error(`Error for chunk ${index + 1} from ${deployments[index]}. Duration: ${(endTime - startTime) / 1000}s`, error);
                throw error; // Re-throw to let Promise.all fail
            }
        });

                const partialResults = await Promise.all(extractionPromises);
        const totalEndTime = Date.now();
        console.log(`All parallel extractions finished. Total duration: ${(totalEndTime - totalStartTime) / 1000}s`);

        const partialJSONs = partialResults.map(result => result.choices[0].message.content);
        console.log('Parallel extraction successful. Received partial JSONs.');

        // --- Step 4: Combine JSON results in code ---
        console.log('Combining partial JSONs in code...');
        const combinedResult = {
            header: {},
            line_items: []
        };

        for (const jsonString of partialJSONs) {
            try {
                const parsedJson = JSON.parse(jsonString);

                // Intelligently merge header data, giving precedence to the first non-null value found.
                if (parsedJson.header) {
                    for (const [key, value] of Object.entries(parsedJson.header)) {
                        if (value !== null && (combinedResult.header[key] === undefined || combinedResult.header[key] === null)) {
                            combinedResult.header[key] = value;
                        }
                    }
                }

                // Concatenate line items that are not empty
                if (parsedJson.line_items && Array.isArray(parsedJson.line_items)) {
                    const filteredLineItems = parsedJson.line_items.filter(item => 
                        Object.values(item).some(v => v !== null && v !== '')
                    );
                    if (filteredLineItems.length > 0) {
                        combinedResult.line_items.push(...filteredLineItems);
                    }
                }
            } catch (e) {
                console.error("Error parsing or merging partial JSON, skipping this part:", jsonString, e);
            }
        }

        console.log('JSON combination successful.');
        const totalDuration = (totalEndTime - totalStartTime) / 1000;
        combinedResult.extraction_duration = totalDuration;

        return JSON.stringify(combinedResult, null, 2); // Return pretty-printed JSON string

    } catch (error) {
        console.error('An error occurred during the parallel processing workflow:', error);
        // Optional: Add a fallback to a single-model approach here if needed
        throw new Error('Failed to process invoice using parallel method.');
    }
}

/**
 * Recursively translate all string fields in a JSON object to English using Azure Translation Service.
 * Only translates if detected language is not English.
 * @param {object} jsonObj - The JSON object to translate.
 * @returns {object} - The translated JSON object.
 */
async function translateJsonToEnglish(jsonObj) {
    if (!translationApiKey || !translationEndpoint || !translationRegion) {
        throw new Error("Azure Translation Service credentials are not set in .env file.");
    }
    const translationClient = new TextTranslationClient(translationEndpoint, {
        key: translationApiKey,
        region: translationRegion,
    });

    // Helper to translate a single string if not English
    async function translateIfNeeded(text) {
        if (!text || typeof text !== 'string' || text.trim() === '') return text;
        // Detect language first
        const detectResponse = await translationClient.path("/detect").post({
            body: [{ text }],
        });
        const detectedLang = detectResponse.body[0]?.language || 'en';
        if (detectedLang === 'en') return text;
        // Translate to English
        const translateResponse = await translationClient.path("/translate").post({
            body: [{ text }],
            queryParameters: {
                to: "en",
                from: detectedLang,
            },
        });
        return translateResponse.body[0]?.translations[0]?.text || text;
    }

    // Recursively walk the object and translate all string fields
    async function walk(obj) {
        if (Array.isArray(obj)) {
            return Promise.all(obj.map(walk));
        } else if (obj && typeof obj === 'object') {
            const result = {};
            for (const key of Object.keys(obj)) {
                result[key] = await walk(obj[key]);
            }
            return result;
        } else if (typeof obj === 'string') {
            return await translateIfNeeded(obj);
        } else {
            return obj;
        }
    }
    return await walk(jsonObj);
}


// Utility function to convert a file buffer (PDF or image) to base64
function fileBufferToBase64(fileBuffer) {
    if (!fileBuffer) {
        throw new Error("No file buffer provided for base64 conversion.");
    }
    return fileBuffer.toString('base64');
}

module.exports = {
    extractInvoiceMarkdown,
    callAzureOpenAIInvoiceFields,
    fileBufferToBase64,
    translateJsonToEnglish,
};