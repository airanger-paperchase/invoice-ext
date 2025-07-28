// dataExtract.js
require('dotenv').config();
const { AzureOpenAI } = require("openai");

// Correct import for @azure-rest/ai-document-intelligence
// The package exports a function directly that acts as the client factory.
const DocumentIntelligence = require('@azure-rest/ai-document-intelligence').default;

// You'll also need to import isUnexpected and getLongRunningPoller as named exports
const { isUnexpected, getLongRunningPoller } = require('@azure-rest/ai-document-intelligence');


const documentIntelligenceEndpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
const documentIntelligenceKey = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;
const openAIAzureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
const openAIApiKey = process.env.AZURE_OPENAI_API_KEY;
const openAIDeployment = process.env.AZURE_OPENAI_DEPLOYMENT || "o3-mini";
const openAIImageDeployment = process.env.AZURE_OPENAI_IMAGE_DEPLOYMENT || "gpt-4o";
const openAIApiVersion = process.env.API_VERSION_GA;

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

async function callAzureOpenAIInvoiceFields(markdownContent) {
    if (!openAIAzureEndpoint || !openAIApiKey || !openAIDeployment) {
        throw new Error("Azure OpenAI credentials or deployment name are not set in .env file.");
    }

    const client = new AzureOpenAI({
        azureEndpoint: openAIAzureEndpoint,
        apiKey: openAIApiKey,
        apiVersion: openAIApiVersion,
        deployment: openAIDeployment, 
    });

    const systemPrompt = (
        `You are an advanced invoice parsing expert with extensive knowledge of various invoice formats and structures. Given the input invoice content in Markdown, extract and correctly categorize all relevant data fields with utmost accuracy. Your task is to precisely interpret the data without missing or misclassifying any elements and ensure every detail is mapped to its appropriate field. Extract the following fields:

        **Header Information**:
        - Vendor name
        - Invoice number
        - Invoice date
        - Tax total amount
        - Subtotal amount
        - Invoice total
        
        **Line Items** (For each item listed on the invoice, extract the following details):
        - Product name
        - Product code
        - Quantity
        - Unit price
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
        
        # Output Format:
        A valid, well-structured JSON object containing:
        - 'header': A dictionary with header information.
        - 'line_items': A list of dictionaries, each representing one line item and containing the extracted fields.
        
        # Notes:
        - Your role is critical in accurately processing financial documents, and precision is non-negotiable.
        - Always verify that the extracted data adheres to the required structure and includes all necessary details.`
        
    );

    const response = await client.chat.completions.create({  
        max_completion_tokens: 16384, 
        model: openAIDeployment,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: markdownContent },
        ],
    });
    return response.choices[0].message.content;
}

async function callAzureOpenAIInvoiceFieldsBase64(base64Content) {
    if (!openAIAzureEndpoint || !openAIApiKey || !openAIImageDeployment) {
        throw new Error("Azure OpenAI credentials or deployment name are not set in .env file.");
    }

    const client = new AzureOpenAI({
        azureEndpoint: openAIAzureEndpoint,
        apiKey: openAIApiKey,
        apiVersion: openAIApiVersion,
        deployment: openAIImageDeployment, 
    });

    const systemPrompt = (
        `You are an advanced invoice parsing expert with extensive knowledge of various invoice formats and structures. Given the input invoice content in Markdown, extract and correctly categorize all relevant data fields with utmost accuracy. Your task is to precisely interpret the data without missing or misclassifying any elements and ensure every detail is mapped to its appropriate field. Extract the following fields:

        **Header Information**:
        - Vendor name
        - Invoice number
        - Invoice date
        - Tax total amount
        - Subtotal amount
        - Invoice total
        
        **Line Items** (For each item listed on the invoice, extract the following details):
        - Product name
        - Product code
        - Quantity
        - Unit price
        - Unit of measurement
        - Per line item tax
        - Amount
        - VAT/TAX amount
        
        ### Guidelines:
        - Accurately analyze and understand the invoice data, regardless of its format or structure, while maintaining high precision in extraction and classification.
        - Whenever a value includes units in a format like "XX x XX unit" (e.g., "2x2 US gal", "66x76 m", "2 punnet", "2.05 Kilo", "5 Bunch"), extract and store the full expression (both values and unit) in the **Unit of Measurement (UOM)** field. This applies to any field where measurement data is present.
        - Do not skip any data or leave any fields blank unless they are explicitly missing from the input. Your comprehension and handling of invoices must be thorough, and the extracted data must be accurate and complete.
        
        ### Precision and Output:
        - Return only the result as a valid JSON object containing:
        - A 'header' dictionary with the key-value pairs for the header fields.
        - A 'line_items' list, where each item is a dictionary containing the extracted line item details.
        - Do not include comments, explanations, or any text outside the JSON object.
        - Ensure the JSON is properly formatted, with no trailing commas or invalid syntax. Each field should have a value, even if it is null or an empty string when data is unavailable.
        
        ### Key Considerations:
        - Account for varying invoice layouts and data arrangements. Extract all the information provided without omitting any detail.
        - Maintain high accuracy in understanding and assigning invoice data to the correct fields. Misclassification or omission is unacceptable.
        
        # Output Format:
        A valid, well-structured JSON object containing:
        - 'header': A dictionary with header information.
        - 'line_items': A list of dictionaries, each representing one line item and containing the extracted fields.
        
        # Notes:
        - Your role is critical in accurately processing financial documents, and precision is non-negotiable.
        - Always verify that the extracted data adheres to the required structure and includes all necessary details.`
    );
    const response = await client.chat.completions.create({  
        max_completion_tokens: 16384, 
        model: openAIImageDeployment,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: base64Content },
        ],
    });
    return response.choices[0].message.content;
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
    fileBufferToBase64, // Export the new function
    callAzureOpenAIInvoiceFieldsBase64 // Export the new function
};