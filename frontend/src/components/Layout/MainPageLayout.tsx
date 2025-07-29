
import FileUpload from '../Navbar/Upload';
import { Navbar } from '../Navbar';
import Results from '../Navbar/Results-table';
import type { ExtractionResult } from '../Navbar/Upload';
import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { uploadSingleInvoice } from '../../components/api';
import React from 'react';

function MainPageLayout() {
    const [results, setResults] = useState<ExtractionResult[]>([]);
    const [status, setStatus] = useState('Ready to upload...');
    const [uploadKey, setUploadKey] = useState(0);
    const [processingFiles, setProcessingFiles] = useState<string[]>([]);
    const setProcessingFilesFn: Dispatch<SetStateAction<string[]>> = setProcessingFiles;

    // Reference to a hidden file input for re-upload
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [reuploadTarget, setReuploadTarget] = useState<string | null>(null);

    // Handler for file input change (re-upload)
    const handleReuploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0 || !reuploadTarget) return;
        const file = Array.from(files).find(f => f.name === reuploadTarget) || files[0];
        setProcessingFiles((prev) => [...prev, file.name]);
        // Remove the failed result from results
        setResults((prev) => prev.filter(r => r.fileName !== file.name));
        try {
            const result = await uploadSingleInvoice(file);
            setResults((prev) => [...prev, result]);
        } catch (err: any) {
            setResults((prev) => [...prev, {
                fileName: file.name,
                success: false,
                error: err.message || 'Upload failed',
            }]);
        } finally {
            setProcessingFiles((prev) => prev.filter(name => name !== file.name));
            setReuploadTarget(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleProcessMore = () => {
        setResults([]);
        setStatus('Ready to upload...');
        setUploadKey((k) => k + 1);
        setProcessingFiles([]);
    };

    // Custom handler to track processing files
    const handleResults = (newResults: ExtractionResult[]) => {
        setResults(newResults);
        // Remove files from processingFiles if they are in results
        setProcessingFiles((prev) => prev.filter(
            (fileName) => !newResults.some(r => r.fileName === fileName)
        ));
    };

    return (
        <div className="min-h-screen flex ">
            <div className="flex-1 flex flex-col">
                <Navbar />
                <main className="flex-1 container mx-auto px-8 space-y-4">
                    {results.length === 0 && (
                        <FileUpload
                            key={uploadKey}
                            onResults={handleResults}
                            onStatus={setStatus}
                            setProcessingFiles={setProcessingFilesFn}
                        />
                    )}
                    <div className="my-4 text-center text-sm text-gray-500">{status}</div>
                    <Results
                      results={results}
                      onProcessMoreClick={handleProcessMore}
                      processingFiles={processingFiles}
                      onReupload={(fileName) => {
                        setReuploadTarget(fileName);
                        if (fileInputRef.current) fileInputRef.current.click();
                      }}
                    />
                    {/* Hidden file input for re-upload */}
                    <input
                      type="file"
                      accept=".pdf"
                      style={{ display: 'none' }}
                      ref={fileInputRef}
                      onChange={handleReuploadFile}
                    />
                </main>
            </div>
        </div>
    );
}

export default MainPageLayout;  