import React, { useState, useRef } from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { triggerRefresh } from '../../redux/slices/documentSlice';
import { Sidebar } from '../Sidebar/Sidebar';
import { Input } from "../ui/input"; // Assuming shadcn/ui is properly installed and configured


const Search: React.FC = () => {
    const [error, setError] = useState<string | null>(null);
    const [_, setExtractionProgress] = useState<number>(0);
    const toast = useRef<Toast | null>(null);
    const dispatch = useDispatch();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string | null>(null);





    const showError = (message: string) => {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: message });
    };


    const showSuccess = (message: string) => {
        toast.current?.show({ severity: 'success', summary: 'Success', detail: message });
    };


    const uploadToBlob = async (attachment: { contentBytes: string; name: string }) => {
        const { name, contentBytes } = attachment;

        setLoadingMessage('Uploading ....')
        setIsLoading(true);
        

        if (!name.toLowerCase().endsWith('.pdf')) {
            showError('The file is not a valid PDF.');
            return;
        }

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

            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json();
                throw new Error(`Failed to upload file: ${errorData.error || uploadResponse.statusText}`);
            }

            const uploadResult = await uploadResponse.json();
            console.log('Upload successful:', uploadResult);
            showSuccess('Upload successful')
            setIsLoading(false);
            const fileBlob = new Blob([Uint8Array.from(atob(contentBytes), c => c.charCodeAt(0))], { type: 'application/pdf' });

            await callExtractionAPI(name, fileBlob);
        } catch (error: any) {
            console.error('Error uploading file:', error);
            showError(`Error uploading file: ${error.message}`);
            setIsLoading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files.length > 0) {
                const file = e.target.files[0];
    
                if (!file.name.toLowerCase().endsWith('.pdf')) {
                    setError('The file is not a valid PDF.');
                    return;
                }
    
                // setError(null);
                // setSuccessMessage(null);
    
                const reader = new FileReader();
    
                reader.onload = async () => {
                    if (reader.result) {
                        const contentBytes = btoa(reader.result as string);
                        await uploadToBlob({
                            contentBytes,
                            name: file.name,
                        });
                    }
                };
    
                reader.onerror = () => {
                    setError('Failed to read the file.');
                };
    
                reader.readAsBinaryString(file);
            }
        };

        

    const callExtractionAPI = async (fileName: string, fileBlob: Blob) => {

        setLoadingMessage('Extracting....')
        setIsLoading(true);
        setExtractionProgress(0);

        try {
            const formData = new FormData();
            formData.append("file", fileBlob, fileName);

            const response = await axios.post('/api/extraction', formData);

            if (response.status !== 200) {
                const errorData = response.data;
                console.error('Extraction API error response:', errorData);
                throw new Error(errorData.error || 'Failed to extract data from the file');
            }

            const data = response.data;
            console.log('Extraction successful:', data);
            setExtractionProgress(100);
            showSuccess("Extraction completed successfully!");

            dispatch(triggerRefresh());

            setTimeout(() => {
                setExtractionProgress(0);
            }, 1000);

            setIsLoading(false);

            return data;
        } catch (error) {
            console.error('Error during extraction:', error);
            setIsLoading(false);
            setExtractionProgress(0);
            throw error;
        }
    };





    return (
        <>
            <Toast ref={toast} />

            {/* Full-screen overlay loader */}
            {isLoading && (
                <div className="fixed inset-0 z-50 bg-white bg-opacity-80 flex flex-col items-center justify-center">
                    <ProgressSpinner style={{ width: '60px', height: '60px' }} />
                    {loadingMessage && <p className="mt-4 text-gray-700 text-lg font-medium">{loadingMessage}</p>}
                </div>
            )}

            <div className="flex h-screen w-full bg-gray-50">
                {/* Sidebar for larger screens */}
                <div className="hidden lg:flex w-64 bg-white shadow-lg">
                    <Sidebar />
                </div>

                {/* Main content */}
                <div className="flex-1 overflow-y-auto p-4">
                    <h1 className="font-bold text-navyblue text-center mb-5 mt-20">Upload Invoice</h1>
                    <div className="max-w-2xl mx-auto">
                        <Input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                        />
                    </div>


                    <div className="mt-4">
                        {error && <p className="text-red-500">{error}</p>}
                        
                    </div>

                   
                </div>
            </div>


        </>
    );
};

export default Search;
