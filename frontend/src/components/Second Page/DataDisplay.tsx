import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Toast } from 'primereact/toast';
import { Skeleton } from 'primereact/skeleton';
import Swal from 'sweetalert2';

interface DocumentData {
    content?: Record<string, any>[]; // Assuming content is an array of objects
}

interface DataDisplayProps {
    selectedDocument: {
        value: string;
        label: string;
    } | null;
}

const DataDisplay: React.FC<DataDisplayProps> = ({ selectedDocument }) => {
    const [documentData, setDocumentData] = useState<DocumentData | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [updatedData, setUpdatedData] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const toast = useRef<Toast>(null);

    useEffect(() => {
        const fetchDocumentData = async () => {
            if (selectedDocument) {
                setLoading(true);
                try {
                    const response = await axios.get(`/api/invoice/${selectedDocument.value}`);

                    if (response?.data?.content && Array.isArray(response.data.content)) {
                        setUpdatedData(response.data.content[0]); // Use only the first object if array
                    }

                    setDocumentData(response.data);
                } catch (error) {
                    console.error('Error fetching document data:', error);
                    setDocumentData(null);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchDocumentData();
    }, [selectedDocument]);

    const handleInputChange = (keyPath: string[], value: string | string[]) => {
        const updatedContent = { ...updatedData };
        let currentLevel = updatedContent;

        for (let i = 0; i < keyPath.length - 1; i++) {
            if (!currentLevel[keyPath[i]]) {
                currentLevel[keyPath[i]] = {};
            }
            currentLevel = currentLevel[keyPath[i]];
        }

        const lastKey = keyPath[keyPath.length - 1];
        currentLevel[lastKey] = value;
        setUpdatedData(updatedContent);
    };

    const handleSave = async () => {
        if (selectedDocument) {
            try {
                await axios.put(`/api/update-invoice/${selectedDocument.value}`, { content: [updatedData] });
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Document updated successfully',
                    life: 3000,
                });
                setEditMode(false);
            } catch (error) {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to update document',
                    life: 3000,
                });
                console.error('Error updating document:', error);
            }
        }
    };

    const handleClick = async () => {
        if (selectedDocument) {
            try {
                const response = await axios.post(`/api/cosmostocrmupload`, {
                    ID: selectedDocument.value,
                });
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: response.data.message || 'Document ingested successfully',
                    life: 3000,
                });
            } catch (error: any) {
                const errorMessage = error.response
                    ? error.response.data.error || 'An unexpected error occurred'
                    : 'Network error, please try again';
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to ingest document: ' + errorMessage,
                    life: 3000,
                });
            }
        } else {
            toast.current?.show({
                severity: 'warn',
                summary: 'Warning',
                detail: 'No document selected. Please select a document to ingest.',
                life: 3000,
            });
        }
    };

    const isObject = (value: any): value is Record<string, any> =>
        value && typeof value === 'object' && !Array.isArray(value);

    const renderMergedTable = (data: Record<string, any>) => {
        const arraysToRender: Record<string, any[]> = {};

        const traverseData = (obj: Record<string, any>, prefix: string = '') => {
            Object.entries(obj).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    arraysToRender[prefix + key] = value;
                } else if (isObject(value)) {
                    traverseData(value, `${prefix}${key}.`);
                }
            });
        };

        traverseData(data);

        if (Object.keys(arraysToRender).length === 0) return null;

        const maxRows = Math.max(...Object.values(arraysToRender).map((arr) => arr.length));

        return (
            <table className="min-w-full bg-white shadow-md rounded my-4">
                <thead>
                    <tr>
                        {Object.keys(arraysToRender).map((key) => (
                            <th
                                key={key}
                                className="px-4 py-2 bg-gray-200 text-gray-600 font-bold uppercase border-b border-gray-200"
                            >
                                {key}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: maxRows }).map((_, rowIndex) => (
                        <tr key={rowIndex}>
                            {Object.entries(arraysToRender).map(([key, value]) => {
                                const cellKeyPath = key.split('.').concat(String(rowIndex));

                                return (
                                    <td key={`${key}-${rowIndex}`} className="px-4 py-2 border-b">
                                        {editMode ? (
                                            <input
                                                type="text"
                                                className="border border-gray-300 rounded-md p-2 w-full"
                                                value={value[rowIndex]?.toString() || ''}
                                                onChange={(e) =>
                                                    handleInputChange(cellKeyPath, e.target.value)
                                                }
                                            />
                                        ) : (
                                            value[rowIndex] || ''
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    const renderContent = (
        data: Record<string, any>,
        keyPath: string[] = [],
        editMode: boolean = false
    ) => {
        return (
            <div className="mb-4">
                {Object.entries(data).map(([key, value]) => {
                    if (isObject(value)) {
                        return (
                            <div key={key} className="pl-4 border-l-2 border-gray-200">
                                <label className="font-bold text-navyblue mb-1">{key}:</label>
                                {renderContent(value, [...keyPath, key], editMode)}
                            </div>
                        );
                    }
                    return (
                        <div key={key} className="flex flex-col mb-2">
                            <label className="font-bold text-navyblue mb-1">{key}:</label>
                            <input
                                type="text"
                                className="border border-gray-300 rounded-md p-2 w-full"
                                value={value?.toString() || ''}
                                onChange={(e) =>
                                    handleInputChange([...keyPath, key], e.target.value)
                                }
                                readOnly={!editMode}
                            />
                        </div>
                    );
                })}
            </div>
        );
    };

    const confirmIngest = () => {
        Swal.fire({
            text: 'Are you sure you want to ingest this document to ERP?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                handleClick();
            }
        });
    };

    return (
        <div className="flex flex-col space-y-6 p-4">
            <Toast ref={toast} />
            <div className="p-4">
                {loading ? (
                    <Skeleton height="2rem" className="mb-2" />
                ) : documentData && documentData.content ? (
                    <>
                        {renderContent(updatedData, [], editMode)}
                        {renderMergedTable(updatedData)}
                        <div className="flex space-x-4 mt-6">
                            {editMode ? (
                                <>
                                    <button
                                        className="bg-green-500 text-white p-2 rounded"
                                        onClick={handleSave}
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        className="bg-gray-500 text-white p-2 rounded"
                                        onClick={() => setEditMode(false)}
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <button
                                    className="bg-blue-500 text-white p-2 rounded"
                                    onClick={() => setEditMode(true)}
                                >
                                    Edit Document
                                </button>
                            )}
                            <button
                                className="bg-blue-500 text-white p-2 rounded"
                                onClick={confirmIngest}
                            >
                                Ingest to ERP
                            </button>
                        </div>
                    </>
                ) : (
                    <p>No document data available</p>
                )}
            </div>
        </div>
    );
};

export default DataDisplay;
