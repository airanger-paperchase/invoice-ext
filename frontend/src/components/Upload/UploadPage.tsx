import React, { useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import { motion } from 'framer-motion';
import { Upload, Image as ImageIcon, FileText, AlertCircle, CheckCircle } from 'lucide-react';
const UploadPage: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('sessionId');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            const imageFiles = selectedFiles.filter((file) =>
                ['image/jpeg', 'image/png'].includes(file.type)
            );
            if (imageFiles.length !== selectedFiles.length) {
                setError('Only JPEG and PNG files are allowed.');
                return;
            }
            setFiles(imageFiles);
            const urls = imageFiles.map((file) => URL.createObjectURL(file));
            setPreviewUrls(urls);
            setError(null);
        }
    };
    const createPdfFromImages = async () => {
        if (files.length === 0) {
            setError('No images selected to convert to PDF.');
            return;
        }
        setIsProcessing(true);
        const pdf = new jsPDF();
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const imageUrl = URL.createObjectURL(file);
            const img = new Image();
            img.src = imageUrl;
            await new Promise((resolve) => {
                img.onload = () => {
                    const imgWidth = 210; // A4 width in mm
                    const imgHeight = (img.height / img.width) * imgWidth;
                    if (i > 0) pdf.addPage();
                    pdf.addImage(img, 'JPEG', 0, 0, imgWidth, imgHeight);
                    resolve(true);
                };
            });
        }
        const pdfBlob = pdf.output('blob');
        const pdfFile = new File([pdfBlob], `scannedPdf:${sessionId}`, { type: 'application/pdf' });
        const reader = new FileReader();
        reader.onload = async () => {
            if (reader.result) {
                const contentBytes = btoa(reader.result as string); // Base64 encoding
                await uploadToBlob({
                    contentBytes,
                    name: pdfFile.name,
                });
            }
        };
        reader.onerror = () => {
            setError('Failed to read the file for upload.');
        };
        reader.readAsBinaryString(pdfFile);
    };
    const uploadToBlob = async (attachment: { contentBytes: string; name: string }) => {
        const { name, contentBytes } = attachment;
        try {
            const uploadResponse = await fetch('/api/upload_to_blob', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    file_name: name,
                    file_content: contentBytes,
                }),
            });
            if (uploadResponse.status !== 201) {
                throw new Error('Failed to upload file to blob.');
            }
            setSuccessMessage('Upload successful! Extracting data...');
            const fileBlob = new Blob([Uint8Array.from(atob(contentBytes), (c) => c.charCodeAt(0))], {
                type: 'application/pdf',
            });
            await callExtractionAPI(name, fileBlob);
        } catch (error: any) {
            setIsProcessing(false);
            console.error('Error uploading file:', error);
            setError(`Error uploading file: ${error.message}`);
        }
    };
    const callExtractionAPI = async (fileName: string, fileBlob: Blob) => {
        try {
            const formData = new FormData();
            formData.append('file', fileBlob, fileName);
            const response = await axios.post('/api/extraction', formData);
            if (response.status !== 200) {
                throw new Error('Failed to extract data from the file.');
            }
            const data = response.data;
            console.log('Extraction successful:', data);
            setSuccessMessage('Extraction completed successfully!');
            setIsProcessing(false);
        } catch (error) {
            setIsProcessing(false);
            console.error('Error during extraction:', error);
            setError('Error during extraction.');
        }
    };
    const handleRemove = (url: any) => {
        const newFiles = files.filter((file) => URL.createObjectURL(file) !== url);
        const newUrls = previewUrls.filter((previewUrl) => previewUrl !== url);
        setFiles(newFiles);
        setPreviewUrls(newUrls);
    }
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-lg p-8"
                >
                    {/* Header Section */}
                    <div className="text-center mb-8">
                        <Upload className="mx-auto h-12 w-12 text-indigo-600" />
                        <h2 className="mt-4 text-3xl font-bold text-gray-900">Image to PDF Converter</h2>
                        <p className="mt-2 text-gray-600">Upload images to convert them into a PDF document</p>
                        {sessionId && (
                            <div className="mt-2 inline-flex items-center px-4 py-2 bg-gray-100 rounded-full">
                                <span className="text-sm text-gray-600">Session ID: </span>
                                <code className="ml-2 font-mono text-sm text-indigo-600">{sessionId}</code>
                            </div>
                        )}
                    </div>
                    {/* Camera Capture Button */}
                    <div className="flex justify-center items-center mt-4 mb-8">
                        <button
                            onClick={() => document.getElementById('cameraInput')?.click()}
                            className="flex justify-center items-center px-4 py-3 rounded-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <ImageIcon className="mr-2 h-5 w-5" />
                            Capture Image
                        </button>
                        <input
                            id="cameraInput"
                            type="file"
                            accept="image/png, image/jpeg"
                            capture="environment"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>
                    {/* Upload Section */}
                    <div className="space-y-6">
                        <label className="relative flex justify-center items-center h-64 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 transition-colors cursor-pointer group">
                            <div className="space-y-2 text-center">
                                <ImageIcon className="mx-auto h-12 w-12 text-gray-400 group-hover:text-indigo-500" />
                                <div className="text-gray-600">
                                    <span className="font-medium text-indigo-600 hover:text-indigo-500">
                                        Click to upload
                                    </span>{' '}
                                    or drag and drop
                                </div>
                                <p className="text-sm text-gray-500">PNG, JPG up to 10MB each</p>
                            </div>
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                accept="image/png, image/jpeg"
                                multiple
                                onChange={handleFileChange}
                            />
                        </label>
                        {/* Preview Section */}
                        {previewUrls.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {previewUrls.map((url, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="relative aspect-square rounded-lg overflow-hidden border border-gray-200"
                                        >
                                            <div className='bg-red-50 absolute top-2 right-2  rounded-full'>
                                                <button className='p-1' onClick={() => handleRemove(url)}>X</button>
                                            </div>

                                            <img
                                                src={url}
                                                alt={`preview-${index}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* Status Messages */}
                        {error && (
                            <div className="flex items-center p-4 bg-red-50 rounded-lg">
                                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                                <span className="text-sm text-red-800">{error}</span>
                            </div>
                        )}

                        {successMessage && (
                            <div className="flex items-center p-4 bg-green-50 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                                <span className="text-sm text-green-800">{successMessage}</span>
                            </div>
                        )}
                        {/* Action Button */}
                        <button
                            onClick={createPdfFromImages}
                            disabled={files.length === 0 || isProcessing}
                            className={`w-full flex justify-center items-center px-4 py-3 rounded-md text-sm font-semibold text-white 
                ${files.length === 0 || isProcessing
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                }`}
                        >
                            {isProcessing ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                        />
                                    </svg>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <FileText className="mr-2 h-5 w-5" />
                                    Convert to PDF and Upload
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
export default UploadPage;