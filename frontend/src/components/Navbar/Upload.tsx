import React, { useRef, useState, useCallback } from "react";
import { uploadSingleInvoice, uploadSingleInvoiceBase64 } from "../api";
import {
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
  extraction_duration?: number;
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
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentStep, setCurrentStep] = useState<UploadStep>('select');
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
    onStatus(`Processing ${selectedFiles.length} file(s)...`);
    let currentResults: ExtractionResult[] = [];
    onResults([]);
    if (setProcessingFiles) {
      setProcessingFiles(selectedFiles.map(f => f.name));
    }

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
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
