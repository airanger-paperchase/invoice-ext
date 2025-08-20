import React, { useState, useEffect } from "react";
import { type ExtractionResult } from "./Upload";
import {
  CheckCircle2,
  XCircle,
  Download,
  FileText,
  Receipt,
  DollarSign,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Timer
} from "lucide-react";
 
interface ResultsProps {
  results: ExtractionResult[];
  onProcessMoreClick?: () => void;
  processingFiles?: string[]; // List of file names still being processed
  onReupload?: (fileName: string) => void;
}
 
interface ExpandedState {
  [key: number]: boolean;
}
 
const Results: React.FC<ResultsProps> = ({ results, onProcessMoreClick, processingFiles = [], onReupload }) => {
  const [expandedResults, setExpandedResults] = useState<ExpandedState>({});
  // Remove viewMode and toggle
  // const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Always expand the first result when results change
  useEffect(() => {
    if (results.length > 0) {
      setExpandedResults((prev) => ({ ...prev, 0: true }));
    }
  }, [results]);
 
  if (!results.length) return null;
 
  const successCount = results.filter(r => r.success).length;
  const errorCount = results.length - successCount;
 
  // Calculate total value from successful results (new schema uses Header.InvoiceTotal as number)
  const totalValue = results
    .filter(r => r.success && r.data?.header?.InvoiceTotal != null)
    .reduce((sum, r) => {
      const amount = Number(r.data.header.InvoiceTotal);
      return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0);

  const totalDuration = results
    .filter(r => r.success && r.data?.extraction_duration)
    .reduce((sum, r) => sum + (r.data?.extraction_duration || 0), 0);
  
  const averageDuration = successCount > 0 ? totalDuration / successCount : 0;
 
  const toggleExpanded = (index: number) => {
    setExpandedResults(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
 
  // Enhanced header info renderer with icons and better styling
  const renderHeaderInfo = (header: Record<string, any>) => {
    if (!header) return null;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 ">
        {Object.entries(header).map(([key, value]) => (
          <div
            key={key}
            className="p-4 rounded-xl shadow-soft animate-fade-in bg-purple-200"
          >
            <div className="flex flex-col">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                {key.replace(/_/g, ' ')}
              </span>
              <span className="text-sm font-bold text-black truncate">
                {value}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };
 
  // Enhanced line items table with better styling
  const renderLineItemsTable = (lineItems: Record<string, any>[]) => {
    if (!lineItems.length) return null;
 
    const headers = Object.keys(lineItems[0]);
   
    return (
      <div className="overflow-hidden rounded-xl border border-border shadow-soft animate-fade-in max-h-96 overflow-y-auto">
        <div className="overflow-x-auto">
          <table className="w-full bg-purple-100">
            <thead>
              <tr className="bg-purple-200 text-black">
                {headers.map((header, index) => {
                  const headerLower = String(header).toLowerCase();
                  return (
                  <th
                    key={header}
                    className={`px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-black ${
                      index === 0 ? 'rounded-tl-xl' : index === headers.length - 1 ? 'rounded-tr-xl' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-2 text-black">
                      {headerLower === 'description' && <FileText className="w-4 h-4 text-black" />}
                      {(headerLower.includes('price') || headerLower.includes('total')) && <DollarSign className="w-4 h-4 text-black" />}
                      <span>{String(header).replace(/_/g, " ")}</span>
                    </div>
                  </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lineItems.map((item, idx) => (
                <tr
                  key={idx}
                  className={`${
                    idx % 2 === 0 ? 'bg-purple-50' : 'bg-purple-100'
                  } hover:bg-primary/5 transition-all duration-300 group animate-fade-in`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {Object.values(item).map((value, i) => {
                    const keyLower = String(headers[i] || '').toLowerCase();
                    const isMoney = keyLower.includes('price') || keyLower.includes('total');
                    const isQuantity = keyLower === 'quantity';
                    return (
                      <td key={i} className="px-6 py-4 text-sm text-black group-hover:text-primary transition-colors duration-300">
                        {isMoney ? (
                          <span className="font-bold text-black bg-success/10 px-2 py-1 rounded-full">
                            {String(value)}
                          </span>
                        ) : isQuantity ? (
                          <span className="font-semibold text-black bg-purple-200 px-2 py-1 rounded-full">
                            {String(value)}
                          </span>
                        ) : (
                          <span className="font-medium text-black">{String(value)}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Process More Files Button */}
      {onProcessMoreClick && (
        <div className="flex justify-end mb-4">
          <button
            onClick={onProcessMoreClick}
            className="px-8 py-3 bg-gradient-to-br from-purple-800 via-purple-900 to-purple-950 shadow-xl text-white rounded-xl font-semibold shadow-medium hover:shadow-strong transition-all duration-300 transform hover:scale-105 "
          >
            Process More Files
          </button>
        </div>
      )}
      {/* Enhanced Summary Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Files */}
        <div className="bg-purple-200 p-6 rounded-2xl border border-border shadow-2xl transition-all duration-300 animate-scale-in hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-foreground">{results.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Files</p>
            </div>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-purple-800 via-purple-900 to-purple-950 shadow-xl transition-transform duration-300"
            >
              <FileText className="w-7 h-7 text-white animate-float transition-transform duration-300 shadow-lg hover:rotate-12 hover:scale-110 cursor-pointer" />
            </div>
          </div>
        </div>
        {/* Successful */}
        <div className="bg-purple-200 p-6 rounded-2xl border border-border shadow-2xl transition-all duration-300 animate-scale-in hover:scale-105" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-success">{successCount}</p>
              <p className="text-sm text-muted-foreground mt-1">Successful</p>
            </div>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-green-400 via-green-500 to-green-600 shadow-xl transition-transform duration-300"
            >
              <CheckCircle2 className="w-7 h-7 text-white animate-bounce-gentle transition-transform duration-300 shadow-lg hover:rotate-12 hover:scale-110 cursor-pointer" />
            </div>
          </div>
        </div>
        {/* Failed */}
        <div className="bg-purple-200 p-6 rounded-2xl border border-border shadow-2xl transition-all duration-300 animate-scale-in hover:scale-105" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-destructive">{errorCount}</p>
              <p className="text-sm text-muted-foreground mt-1">Failed</p>
            </div>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-red-400 via-red-500 to-red-600 shadow-xl transition-transform duration-300"
            >
              <XCircle className="w-7 h-7 text-white animate-swing transition-transform duration-300 shadow-lg hover:rotate-12 hover:scale-110 cursor-pointer" />
            </div>
          </div>
        </div>


        {/* Average Duration */}
        <div className="bg-purple-200 p-6 rounded-2xl border border-border shadow-2xl transition-all duration-300 animate-scale-in hover:scale-105" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-info">{averageDuration.toFixed(2)}s</p>
              <p className="text-sm text-muted-foreground mt-1">Avg. Time</p>
            </div>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-purple-800 via-purple-900 to-purple-950 shadow-xl transition-transform duration-300"
            >
              <Timer className="w-7 h-7 text-white animate-pulse-slow transition-transform duration-300 shadow-lg hover:rotate-12 hover:scale-110 cursor-pointer" />
            </div>
          </div>
        </div>
      </div>

      {/* Individual Results */}
      <div className="space-y-6">
        {/* Show loader cards for files still processing */}
        {processingFiles.map((fileName, idx) => (
          <div
            key={fileName}
            className="rounded-2xl border shadow-medium overflow-hidden transition-all duration-500 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/2 animate-fade-in"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="px-6 py-4 border-b border-primary/20 bg-primary/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 flex items-center justify-center">
                      <span className="inline-block w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{fileName}</h3>
                      <p className="text-sm text-primary">Processing...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 text-center text-primary">
              <span className="inline-flex items-center space-x-2">
                <span className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                <span className="font-medium">Extracting data...</span>
              </span>
            </div>
          </div>
        ))}
        {results.map((result, idx) => {
          const isExpanded = expandedResults[idx];
         
          return (
            <div
              key={idx}
              className={`rounded-2xl border shadow-medium overflow-hidden transition-all duration-500 hover:shadow-strong ${
                result.success
                  ? 'border-success/30 bg-gradient-to-br from-success/5 to-success/2'
                  : 'border-destructive/30 bg-gradient-to-br from-destructive/5 to-destructive/2'
              } animate-fade-in`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Collapsible Header */}
              <div
                className={`px-6 py-4 border-b cursor-pointer transition-all duration-300 ${
                  result.success
                    ? 'border-success/20 bg-success/10 hover:bg-success/15'
                    : 'border-destructive/20 bg-destructive/10 hover:bg-destructive/15'
                }`}
                onClick={() => toggleExpanded(idx)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                    {result.success ? (
                        <CheckCircle2 className="w-6 h-6 text-success animate-pulse-soft" />
                      ) : (
                        <XCircle className="w-6 h-6 text-destructive animate-swing" />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{result.fileName}</h3>
                        <p className={`text-sm ${
                          result.success ? 'text-success' : 'text-destructive'
                        }`}>
                          {result.success ? 'Successfully processed' : 'Processing failed'}
                        </p>
                      </div>
                    </div>
                  </div>
                 
                  <div className="flex items-center space-x-3">
                    {result.success && result.downloadLink && (
                      <a
                        href={result.downloadLink}
                        download={result.fileName.replace(".pdf", ".json")}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-br from-purple-800 via-purple-900 to-purple-950 shadow-xl text-white rounded-lg font-medium shadow-soft hover:shadow-medium transition-all duration-200 transform hover:scale-105"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </a>
                    )}
                   
                    <div className="flex items-center space-x-2">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform duration-300" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-muted-foreground transition-transform duration-300" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
 
              {/* Expandable Content */}
              <div
                className={`transition-all duration-500 ease-in-out ${
                  isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-6">
                  {result.success && result.data ? (
                    <div className="space-y-8">
                      {/* Header Information */}
                      <div>
                        <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2 ">
                          <Receipt className="w-5 h-5 text-primary" />
                          <span>Invoice Details</span>
                        </h4>
                        {renderHeaderInfo(result.data.header)}
      </div>

                      {/* Line Items */}
                      {result.data.invoicelines?.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                            <FileText className="w-5 h-5 text-primary" />
                            <span>Line Items ({result.data.invoicelines.length})</span>
                          </h4>
                          {renderLineItemsTable(result.data.invoicelines)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-start space-x-4 p-6 bg-destructive/5 rounded-xl border border-destructive/20">
                      <XCircle className="w-6 h-6 text-destructive mt-0.5 animate-swing" />
                      <div className="space-y-2">
                        <h4 className="font-semibold text-destructive text-lg">Processing Error</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{result.error}</p>
                        <div className="flex items-center space-x-2 mt-3">
                          <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
                          <span className="text-xs text-destructive font-medium">
                            Try re-uploading the file or check if it's a valid PDF
                          </span>
                        </div>
                        {onReupload && (
                          <button
                            className="mt-4 px-4 py-2 bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white rounded-lg font-medium shadow hover:shadow-lg transition-all duration-200"
                            onClick={() => onReupload(result.fileName)}
                          >
                            Re-upload
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
 
export default Results;
