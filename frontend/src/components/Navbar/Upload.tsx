// // import React, { useState } from 'react';
// // import axios from 'axios';
// // import { Input } from "../ui/input"; // Assuming shadcn/ui is properly installed and configured


// // const Upload: React.FC = () => {
// //     const [error, setError] = useState<string | null>(null);
// //     const [successMessage, setSuccessMessage] = useState<string | null>(null);
// //     const [_, setIsExtracting] = useState<boolean>(false);
// //     const [, setExtractionProgress] = useState<number>(0);

// //     const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
// //         if (e.target.files && e.target.files.length > 0) {
// //             const file = e.target.files[0];

// //             if (!file.name.toLowerCase().endsWith('.pdf')) {
// //                 setError('The file is not a valid PDF.');
// //                 return;
// //             }

// //             setError(null);
// //             setSuccessMessage(null);

// //             const reader = new FileReader();

// //             reader.onload = async () => {
// //                 if (reader.result) {
// //                     const contentBytes = btoa(reader.result as string);
// //                     await uploadToBlob({
// //                         contentBytes,
// //                         name: file.name,
// //                     });
// //                 }
// //             };

// //             reader.onerror = () => {
// //                 setError('Failed to read the file.');
// //             };

// //             reader.readAsBinaryString(file);
// //         }
// //     };

// //     const uploadToBlob = async (attachment: { contentBytes: string; name: string }) => {
// //         const { name, contentBytes } = attachment;

// //         try {
// //             const uploadResponse = await fetch('/api/upload_to_blob', {
// //                 method: 'POST',
// //                 headers: {
// //                     'Content-Type': 'application/json',
// //                 },
// //                 body: JSON.stringify({
// //                     file_name: name,
// //                     file_content: contentBytes,
// //                 }),
// //             });

// //             if (!uploadResponse.ok) {
// //                 const errorData = await uploadResponse.json();
// //                 throw new Error(`Failed to upload file: ${errorData.error || uploadResponse.statusText}`);
// //             }

// //             const uploadResult = await uploadResponse.json();
// //             console.log('Upload successful:', uploadResult);
// //             setSuccessMessage('Upload successful! Extracting data...');

// //             const fileBlob = new Blob([Uint8Array.from(atob(contentBytes), (c) => c.charCodeAt(0))], {
// //                 type: 'application/pdf',
// //             });

// //             await callExtractionAPI(name, fileBlob);
// //         } catch (error: any) {
// //             console.error('Error uploading file:', error);
// //             setError(`Error uploading file: ${error.message}`);
// //         }
// //     };

// //     const callExtractionAPI = async (fileName: string, fileBlob: Blob) => {
// //         setIsExtracting(true);
// //         setExtractionProgress(0);

// //         try {
// //             const formData = new FormData();
// //             formData.append('file', fileBlob, fileName);

// //             const response = await axios.post('/api/extraction', formData);

// //             if (response.status !== 200) {
// //                 const errorData = response.data;
// //                 console.error('Extraction API error response:', errorData);
// //                 throw new Error(errorData.error || 'Failed to extract data from the file');
// //             }

// //             const data = response.data;
// //             console.log('Extraction successful:', data);
// //             setExtractionProgress(100);
// //             setSuccessMessage('Extraction completed successfully!');

// //             setTimeout(() => {
// //                 setIsExtracting(false);
// //                 setExtractionProgress(0);
// //             }, 1000);

// //             return data;
// //         } catch (error) {
// //             console.error('Error during extraction:', error);
// //             setIsExtracting(false);
// //             setExtractionProgress(0);
// //             setError('Error during extraction.');
// //         }
// //     };

// //     return (
// //         <div className="">
// //             {/* Updated heading with bold text, margin, and color */}
// //             <h6 className="font-bold text-lg text-gray-900 mb-4">Upload Invoice Manually</h6>

// //             <Input
// //                 type="file"
// //                 accept=".pdf"
// //                 onChange={handleFileChange}
// //                 className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
// //             />


// //             {error && <p className="text-red-500 mt-2">{error}</p>}
// //             {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}
// //         </div>

// //     );
// // };

// // export default Upload;

// "use client"

// import { useState, useRef, type DragEvent, type ChangeEvent } from "react"
// import { Button } from "@/components/ui/button"
// import { Progress } from "@/components/ui/progress"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { Upload, FileText, X, Loader2 } from "lucide-react"
// import type { ProcessingResult } from "@/app/page"

// interface FileUploadProps {
//   onUploadComplete: (results: ProcessingResult[]) => void
//   onUploadStart: () => void
//   isProcessing: boolean
// }

// export function FileUpload({ onUploadComplete, onUploadStart, isProcessing }: FileUploadProps) {
//   const [selectedFiles, setSelectedFiles] = useState<File[]>([])
//   const [dragActive, setDragActive] = useState(false)
//   const [uploadProgress, setUploadProgress] = useState(0)
//   const [error, setError] = useState<string | null>(null)
//   const fileInputRef = useRef<HTMLInputElement>(null)

//   const handleDrag = (e: DragEvent) => {
//     e.preventDefault()
//     e.stopPropagation()
//     if (e.type === "dragenter" || e.type === "dragover") {
//       setDragActive(true)
//     } else if (e.type === "dragleave") {
//       setDragActive(false)
//     }
//   }

//   const handleDrop = (e: DragEvent) => {
//     e.preventDefault()
//     e.stopPropagation()
//     setDragActive(false)

//     const files = Array.from(e.dataTransfer.files).filter((file) => file.type === "application/pdf")

//     if (files.length === 0) {
//       setError("Please select only PDF files")
//       return
//     }

//     setSelectedFiles((prev) => [...prev, ...files])
//     setError(null)
//   }

//   const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
//     const files = Array.from(e.target.files || []).filter((file) => file.type === "application/pdf")

//     if (files.length === 0) {
//       setError("Please select only PDF files")
//       return
//     }

//     setSelectedFiles((prev) => [...prev, ...files])
//     setError(null)
//   }

//   const removeFile = (index: number) => {
//     setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
//   }

//   const uploadFiles = async () => {
//     if (selectedFiles.length === 0) return

//     onUploadStart()
//     setError(null)
//     setUploadProgress(0)

//     const formData = new FormData()
//     selectedFiles.forEach((file) => {
//       formData.append("invoicePdfs", file)
//     })

//     try {
//       const response = await fetch("http://localhost:3000/api/upload", {
//         method: "POST",
//         body: formData,
//       })

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`)
//       }

//       const results: ProcessingResult[] = await response.json()
//       onUploadComplete(results)
//       setSelectedFiles([])
//       setUploadProgress(100)
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Upload failed")
//     }
//   }

//   return (
//     <div className="space-y-6">
//       {/* Drag and Drop Area */}
//       <div
//         className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
//           dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
//         }`}
//         onDragEnter={handleDrag}
//         onDragLeave={handleDrag}
//         onDragOver={handleDrag}
//         onDrop={handleDrop}
//       >
//         <input
//           ref={fileInputRef}
//           type="file"
//           multiple
//           accept=".pdf"
//           onChange={handleFileSelect}
//           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//         />

//         <div className="space-y-4">
//           <Upload className="mx-auto h-12 w-12 text-gray-400" />
//           <div>
//             <p className="text-lg font-medium text-gray-900">Drop your PDF files here</p>
//             <p className="text-sm text-gray-500">or click to browse your computer</p>
//           </div>
//           <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="mt-4">
//             Select Files
//           </Button>
//         </div>
//       </div>

//       {/* Selected Files */}
//       {selectedFiles.length > 0 && (
//         <div className="space-y-3">
//           <h3 className="font-medium text-gray-900">Selected Files ({selectedFiles.length})</h3>
//           <div className="space-y-2 max-h-40 overflow-y-auto">
//             {selectedFiles.map((file, index) => (
//               <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                 <div className="flex items-center space-x-3">
//                   <FileText className="h-5 w-5 text-red-500" />
//                   <div>
//                     <p className="text-sm font-medium text-gray-900">{file.name}</p>
//                     <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
//                   </div>
//                 </div>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={() => removeFile(index)}
//                   className="text-gray-400 hover:text-gray-600"
//                 >
//                   <X className="h-4 w-4" />
//                 </Button>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Upload Progress */}
//       {isProcessing && (
//         <div className="space-y-2">
//           <div className="flex items-center justify-between">
//             <span className="text-sm font-medium text-gray-700">Processing files...</span>
//             <span className="text-sm text-gray-500">{uploadProgress}%</span>
//           </div>
//           <Progress value={uploadProgress} className="w-full" />
//         </div>
//       )}

//       {/* Error Message */}
//       {error && (
//         <Alert variant="destructive">
//           <AlertDescription>{error}</AlertDescription>
//         </Alert>
//       )}

//       {/* Upload Button */}
//       <div className="flex justify-end">
//         <Button onClick={uploadFiles} disabled={selectedFiles.length === 0 || isProcessing} className="min-w-32">
//           {isProcessing ? (
//             <>
//               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//               Processing...
//             </>
//           ) : (
//             <>
//               <Upload className="mr-2 h-4 w-4" />
//               Process Files
//             </>
//           )}
//         </Button>
//       </div>
//     </div>
//   )
// }

 
import React, { useRef, useState, useCallback } from "react";
import { uploadInvoices, uploadSingleInvoice, uploadSingleInvoiceBase64 } from "../api";
import {
  Upload,
  FileText,
  CheckCircle2,
  X,
  ZapIcon,
  Sparkles,
  ArrowRight,
  CloudUpload,
  ScanLine,
  Brain
} from "lucide-react";
 
export interface ExtractionResult {
  fileName: string;
  success: boolean;
  data?: any;
  error?: string;
  downloadLink?: string;
}

interface FileUploadProps {
  onResults: (results: ExtractionResult[]) => void;
  onStatus: (status: string) => void;
  setProcessingFiles?: (files: string[]) => void;
}
 
type UploadStep = 'select' | 'preview' | 'processing' | 'complete';
type ExtractionMethod = 'markdown' | 'base64';
 
const FileUpload: React.FC<FileUploadProps> = ({ onResults, onStatus, setProcessingFiles }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  // const [ setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentStep, setCurrentStep] = useState<UploadStep>('select');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [extractionMethod, setExtractionMethod] = useState<ExtractionMethod>('markdown');
 
  const handleFiles = useCallback((files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files).filter(file => file.type === 'application/pdf');
      setSelectedFiles(fileArray);
      setCurrentStep('preview');
     
      if (fileArray.length !== files.length) {
        onStatus("Only PDF files are supported. Non-PDF files have been filtered out.");
      } else {
        onStatus(`${fileArray.length} PDF file(s) selected and ready for processing.`);
      }
    }
  }, [onStatus]);
 
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);
 
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);
 
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);
 
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  }, [handleFiles]);

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    if (newFiles.length === 0) {
      setCurrentStep('select');
      onStatus("Ready to upload...");
    }
  };
 
  const startProcessing = async () => {
    if (selectedFiles.length === 0) return;

    setCurrentStep('processing');
    setProcessingProgress(0);
    setProcessedCount(0);
    onStatus(`Processing ${selectedFiles.length} file(s)...`);
    let currentResults: ExtractionResult[] = [];
    onResults([]);
    if (setProcessingFiles) {
      setProcessingFiles(selectedFiles.map(f => f.name));
    }

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setProcessingProgress(Math.round(((i) / selectedFiles.length) * 100));
        setProcessedCount(i);
        try {
          let result;
          if (extractionMethod === 'base64') {
            result = await uploadSingleInvoiceBase64(file);
          } else {
            result = await uploadSingleInvoice(file);
          }
          currentResults = [...currentResults, result];
          onResults(currentResults);
          if (setProcessingFiles) {
            // Remove file.name from the current processing files
            setProcessingFiles(
              (prev => prev.filter((name) => name !== file.name))(
                typeof setProcessingFiles === 'function' ? [] : []
              )
            );
          }
        } catch (err: any) {
          currentResults = [...currentResults, {
            fileName: file.name,
            success: false,
            error: err.message || 'Upload failed',
          }];
          onResults(currentResults);
          if (setProcessingFiles) {
            setProcessingFiles(
              (prev => prev.filter((name) => name !== file.name))(
                typeof setProcessingFiles === 'function' ? [] : []
              )
            );
          }
        }
      }
      setProcessingProgress(100);
      setProcessedCount(selectedFiles.length);
      setCurrentStep('complete');
      const successCount = currentResults.filter(r => r.success).length;
      onStatus(`Processing complete! ${successCount}/${currentResults.length} files processed successfully.`);
    } catch (error: any) {
      onStatus(`Error during upload: ${error.message}`);
    }
  };
 
  const resetUpload = () => {
    setSelectedFiles([]);
    setCurrentStep('select');
    setProcessingProgress(0);
    setProcessedCount(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onStatus("Ready to upload...");
    onResults([]);
  };
 
  const renderSelectStep = () => (
    <div className="animate-scale-in border-2 border-purple-300 rounded-2xl">
      <div
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-500 transform cursor-pointer ${
          dragOver
            ? 'border-primary bg-primary/20 shadow-glow scale-105'
            : 'border-border hover:border-primary/50 hover:bg-primary/5 hover:scale-102'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        style={{ color: '#1a202c' }} // text-gray-900
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary/10 rounded-full animate-float"></div>
          <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-success/10 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-warning/10 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
 
        <div className="relative z-10 space-y-6">
          {/* Main Upload Icon */}
          <div className="relative">
            <div className="w-24 h-24  rounded-full flex items-center justify-center mx-auto shadow-glow animate-pulse-soft">
              <CloudUpload className="w-12 h-12 text-gray-900" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-success rounded-full flex items-center justify-center animate-bounce-gentle">
              <Sparkles className="w-4 h-4 text-success-foreground" />
            </div>
          </div>
 
          {/* Content */}
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-gray-900">
              Drop your invoices here
            </h3>
            <p className="text-gray-900 max-w-md mx-auto">
              Drag and drop your PDF invoices, or click to browse. Our AI will extract all the important data instantly.
            </p>
          </div>
 
          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <div className="flex items-center space-x-2 bg-orange-200 text-primary px-3 py-1.5 rounded-full text-sm font-medium shadow-md">
              <ZapIcon className="w-4 h-4" />
              <span>Lightning Fast</span>
            </div>
            <div className="flex items-center space-x-2 bg-blue-200 text-success px-3 py-1.5 rounded-full text-sm font-medium shadow-md">
              <Brain className="w-4 h-4" />
              <span>AI Powered</span>
            </div>
          </div>
        </div>
 
        {/* Hidden file input */}
        <input
          type="file"
          accept=".pdf"
          multiple
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          tabIndex={-1}
        />
      </div>
    </div>
  );
 
  const renderPreviewStep = () => (
    <div className="space-y-6 animate-slide-in-right bg-gradient-to-b from-gray-50 to-gray-100 h-full w-full p-10 border-dotted border-2 border-gray-400 rounded-xl">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-gradient-success rounded-full flex items-center justify-center mx-auto animate-scale-in">
          <CheckCircle2 className="w-8 h-8 text-success-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">
          {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} ready for processing
        </h3>
      </div>

      {/* File List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
            {selectedFiles.map((file, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-gradient-card rounded-xl border shadow-soft animate-fade-in hover:shadow-medium transition-all duration-300"
            style={{ animationDelay: `${index * 100}ms` }}
          >
                <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                  </div>
                </div>
            <button
                  onClick={() => removeFile(index)}
              className="w-8 h-8 rounded-full bg-destructive/10 hover:bg-destructive/20 text-destructive flex items-center justify-center transition-colors duration-200"
                >
              <X className="w-4 h-4" />
            </button>
              </div>
            ))}
      </div>
 
      {/* Action Buttons */}
      <div className="flex justify-between pt-3">
        <button
          onClick={resetUpload}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-br from-purple-800 via-purple-900 to-purple-950 shadow-xl text-white rounded-lg font-medium shadow-soft hover:shadow-medium transition-all duration-200 transform hover:scale-105"
        >
          Start Over
        </button>
       
        <button
          onClick={startProcessing}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-br from-purple-800 via-purple-900 to-purple-950 shadow-xl text-white rounded-lg font-medium shadow-soft hover:shadow-medium transition-all duration-200 transform hover:scale-105"
        >
          <ScanLine className="w-5 h-5 text-white" />
          <span className="text-white">Process Files</span>
          <ArrowRight className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
 
  // Remove renderProcessingStep and replace with a simple loader
  const renderProcessingStep = () => (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <div className="w-12 h-12 border-4 border-gray-300 border-t-primary rounded-full animate-spin mb-4"></div>
      <div className="text-lg font-semibold text-gray-700">Processing...</div>
    </div>
  );
 
  const renderCompleteStep = () => (
    <div className="text-center space-y-6 animate-scale-in">
      <div className="w-20 h-20 bg-gradient-success rounded-full flex items-center justify-center mx-auto animate-bounce-gentle">
        <CheckCircle2 className="w-10 h-10 text-success-foreground" />
      </div>
     
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Processing Complete!
        </h3>
        <p className="text-muted-foreground">
          Your invoice data has been extracted successfully.
        </p>
      </div>
 
      <button
        onClick={resetUpload}
        className="px-8 py-3 bg-gradient-primary text-black rounded-xl font-semibold shadow-medium hover:shadow-strong transition-all duration-300 transform hover:scale-105"
      >
        Process More Files
      </button>
    </div>
  );
 
  // Extraction method selector UI
  const renderExtractionMethodSelector = () => (
    <div className="flex items-center space-x-6 mb-6">
      <label className="flex items-center space-x-2">
        <input
          type="radio"
          name="extractionMethod"
          value="markdown"
          checked={extractionMethod === 'markdown'}
          onChange={() => setExtractionMethod('markdown')}
        />
        <span>Extract via Markdown (default)</span>
      </label>
      {/* <label className="flex items-center space-x-2">
        <input
          type="radio"
          name="extractionMethod"
          value="base64"
          checked={extractionMethod === 'base64'}
          onChange={() => setExtractionMethod('base64')}
        />
        <span>Extract via Base64</span>
      </label> */}
    </div>
  );
 
  // Remove the outer div and only render step content if not complete
  if (currentStep === 'complete') return null;

  return (
    <>
      {renderExtractionMethodSelector()}
      {/* Step Indicator */}
      <div className="flex items-center justify-center space-x-2 mb-8 ">
        {(['select', 'preview', 'processing'] as UploadStep[]).map((step, index) => {
          const isActive = currentStep === step;
          const isCompleted = (['select', 'preview', 'processing'] as UploadStep[]).indexOf(currentStep) > index;
          return (
            <React.Fragment key={step}>
              <div
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  isActive ? 'bg-primary animate-pulse-soft' :
                  isCompleted ? 'bg-success' : 'bg-muted'
                }`}
              />
              {index < 2 && (
                <div className={`w-8 h-0.5 transition-all duration-300 ${
                  isCompleted ? 'bg-success' : 'bg-muted'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
      {/* Step Content */}
      <div className="min-h-[400px] flex items-center justify-center">
        {currentStep === 'select' && renderSelectStep()}
        {currentStep === 'preview' && renderPreviewStep()}
        {currentStep === 'processing' && renderProcessingStep()}
      </div>
    </>
  );
};
 
export default FileUpload;
