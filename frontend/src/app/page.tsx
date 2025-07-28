"use client"

import { useState } from "react"
import { FileUpload } from "@/components/Navbar/Upload"
import { ResultsTable } from "@/components/Navbar/Results-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export interface ProcessingResult {
  fileName: string
  success: boolean
  data?: any
  error?: string
  downloadLink?: string
}

export default function Home() {
  const [results, setResults] = useState<ProcessingResult[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const handleUploadComplete = (newResults: ProcessingResult[]) => {
    setResults((prev) => {
      const updatedResults = [...prev, ...newResults];
      console.log("Upload Complete. Results:", updatedResults);
      return updatedResults;
    });
    setIsProcessing(false)
  }

  const handleUploadStart = () => {
    setIsProcessing(true)
  }

  const clearResults = () => {
    setResults([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <h1 className="text-4xl font-bold text-gray-900">Invoice Data Processor</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your invoice PDFs and extract structured data using AI-powered processing
          </p>
        </div>

        {/* File Upload Section */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Upload Invoices
            </CardTitle>
            <CardDescription>Select or drag and drop your invoice PDF files to process them</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              onUploadComplete={handleUploadComplete}
              onUploadStart={handleUploadStart}
              isProcessing={isProcessing}
            />
          </CardContent>
        </Card>

        {/* Results Section */}
        {results.length > 0 && (
          <>
            <Separator className="my-8" />
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Processing Results
                  </CardTitle>
                  <CardDescription>Extracted invoice data and processing status</CardDescription>
                </div>
                <button onClick={clearResults} className="text-sm text-gray-500 hover:text-gray-700 underline">
                  Clear Results
                </button>
              </CardHeader>
              <CardContent>
                <ResultsTable results={results} />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
