import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
// import Swal from 'sweetalert2';
import { Button } from "@/components/ui/button";
import { Toast } from 'primereact/toast';
import { Skeleton } from 'primereact/skeleton';
import { useLocation } from 'react-router-dom';
import { Sidebar } from '../Sidebar/Sidebar';

interface Document {
    label: string;
    value: string;
    url: string; // Added url property
}

interface DocumentData {
    content?: Record<string, any>[];
}

interface DetailsOfDocument {
    [key: string]: string | number | null | undefined;
}

interface SelectedDocument {
    value: string;
    label: string;
    url: string; // Added url property
}


export const DataDisplayUI: React.FC = () => {
    const [documentData, setDocumentData] = useState<DocumentData | null>(null);
    const [_, setDocuments] = useState<Document[]>([]);
    const location = useLocation();
    const selectedDocument = (location.state as { selectedDocument?: SelectedDocument })?.selectedDocument || null;
    // console.log(selectedDocument?.label)
    const [editMode, setEditMode] = useState(false);
    const [updatedData, setUpdatedData] = useState<{
        invoice?: DetailsOfDocument[];
        [key: string]: any;
    }>({});

    const [loading, setLoading] = useState(true);
    const toast = useRef<Toast>(null);

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const response = await axios.get('/api/list-blobs');
                const blobList = response.data;
                const filenameRegex = /\/([^\/]+)\?/;
                const documentOptions = blobList.map((blobUrl: string) => {
                    const match = blobUrl.match(filenameRegex);
                    const filename = match?.[1] || 'Unknown';
                    return {
                        label: filename,
                        value: filename,
                        url: blobUrl,
                    };
                });
                setDocuments(documentOptions);
            } catch (error) {
                console.error('Error fetching documents:', error);
            }
        };

        fetchDocuments();
    }, []);

    useEffect(() => {
        const fetchDocumentData = async () => {
            if (selectedDocument) {
                setLoading(true);
                try {
                    const response = await axios.get(`/api/invoice/${selectedDocument.value}`);
                    if (response?.data?.content && Array.isArray(response.data.content)) {
                        setUpdatedData(response.data.content[0]);
                        setDocumentData(response.data);
                    }
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

    const handleInputChange = (keyPath: string[], value: string) => {
        const updatedContent = { ...updatedData };
        let currentLevel = updatedContent;
        for (let i = 0; i < keyPath.length - 1; i++) {
            if (!currentLevel[keyPath[i]]) {
                currentLevel[keyPath[i]] = {};
            }
            currentLevel = currentLevel[keyPath[i]];
        }
        currentLevel[keyPath[keyPath.length - 1]] = value;
        setUpdatedData(updatedContent);
    };

    const handleSave = async () => {
        if (selectedDocument) {
            try {
                await axios.put(`/api/update-invoice/${selectedDocument.value}`, { content: [updatedData] });
                toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Document updated successfully', life: 3000 });
                setEditMode(false);
            } catch (error) {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to update document', life: 3000 });
                console.error('Error updating document:', error);
            }
        }
    };

    const handleExportCSV = () => {
        if (!updatedData || !updatedData.invoice) return;

        // const columns = ["Amount_wrt_invoice", "Invoice_Date", "Invoice_number", "Transaction_type", "total_wrt_invoice"];
        // const filteredColumns = columns.filter(header =>
        //     updatedData.invoice?.some(item =>
        //         item[header] !== null && item[header] !== undefined && item[header] !== ''
        //     )
        // );

        const filteredColumns = updatedData.invoice?.length
        ? Object.keys(updatedData.invoice[0]).filter(header =>
            updatedData.invoice?.some(item =>
                item[header] !== null && item[header] !== undefined && item[header] !== ''
            )
            )
        : [];

        const header = filteredColumns.join(",");
        const rows = updatedData.invoice.map(item =>
            filteredColumns.map(key => `"${item[key] ?? ''}"`).join(",")
        );

        const csvContent = [header, ...rows].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${selectedDocument?.label.replace(/\.[^/.]+$/, "")}_data.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-lg">
                <Sidebar />
            </div>
            <Toast ref={toast} />
            <div className="flex-grow p-4 overflow-y-auto">
                <h1 className="text-3xl font-bold text-purple-800 mt-3 mb-6">Invoice Data Display</h1>

                <div className="flex flex-col lg:flex-row bg-white rounded-lg shadow-xl overflow-hidden">
                    <div className="lg:w-1/2 p-4 border-r border-gray-200 ">
                        <h2 className="text-xl font-semibold text-purple-700 mb-4">PDF Preview</h2>
                        <div>
                            {loading ? (
                                <Skeleton width="100%" height="400px" />
                            ) : (
                                <div className="border-2 bg-gray-100 p-4 border-dashed border-gray-300 rounded-lg h-screen flex items-center justify-center">
                                    {selectedDocument ? (
                                        <iframe
                                            src={selectedDocument.url}
                                            width="100%"
                                            height="100%"
                                            frameBorder="2"
                                            title="Document Viewer"
                                            allowFullScreen
                                        ></iframe>
                                    ) : (
                                        <p className="text-gray-500">No document selected.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Extracted Data Section */}
                    <div className="lg:w-1/2 p-4 flex flex-col">
                        <div className="flex-grow overflow-y-auto max-h-[80vh]">
                            <h2 className="text-xl font-semibold text-purple-700 mb-4">Extracted Data</h2>
                            {loading ? (
                                <Skeleton width="100%" height="200px" />
                            ) : documentData && updatedData ? (
                                <div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        {Object.entries(updatedData).map(([key, value], index) => (
                                            key !== "invoice" && value !== '' ? (
                                                <div key={index} className="bg-purple-50 p-3 rounded-lg">
                                                    <h3 className="text-sm font-medium text-purple-600">{key}</h3>
                                                    {typeof value === 'object' && value !== null ? (
                                                        <pre className="bg-gray-100 p-2 rounded text-gray-700 text-sm overflow-auto ">
                                                            {JSON.stringify(value, null, 2)}
                                                        </pre>
                                                    ) : editMode ? (
                                                        <input type="text" className="border border-gray-300 rounded-md p-2 w-full" value={value || ''} onChange={(e) => handleInputChange([key], e.target.value)} />
                                                    ) : (
                                                        <p className="text-gray-800 mt-1">{value}</p>
                                                    )}
                                                </div>
                                            ) : null
                                        ))}
                                    </div>

                                    {/* Line Items Table */}
                                    {updatedData.invoice && updatedData.invoice.length > 0 && (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full border-collapse border border-gray-200">
                                                <thead>
                                                    <tr>
                                                    <th className="border border-gray-300 px-4 py-2 bg-purple-100 text-left">Field</th>
                                                    {updatedData.invoice?.map((_, colIndex) => (
                                                        <th
                                                        key={colIndex}
                                                        className="border border-gray-300 px-4 py-2 bg-purple-100 text-left"
                                                        >
                                                        {/* Entry {colIndex + 1} */}
                                                        Values
                                                        </th>
                                                    ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {updatedData.invoice?.length > 0 &&
                                                    Object.keys(updatedData.invoice[0])
                                                        .filter(header =>
                                                        updatedData.invoice?.some((item: DetailsOfDocument) =>
                                                            item[header] !== null &&
                                                            item[header] !== undefined &&
                                                            item[header] !== ''
                                                        )
                                                        )
                                                        .map((header, rowIndex) => (
                                                        <tr key={rowIndex}>
                                                            <th className="border border-gray-300 px-4 py-2 bg-gray-100 text-left">{header}</th>
                                                            {updatedData.invoice?.map((item: DetailsOfDocument, colIndex: number) => (
                                                            <td key={colIndex} className="border border-gray-300 px-4 py-2">
                                                                {editMode ? (
                                                                <input
                                                                    type="text"
                                                                    className="border border-gray-300 rounded-md p-2 w-full"
                                                                    value={
                                                                    item[header] !== null && item[header] !== undefined
                                                                        ? String(item[header])
                                                                        : ''
                                                                    }
                                                                    onChange={(e) => {
                                                                    const newItem = [...(updatedData.invoice || [])];
                                                                    newItem[colIndex][header] = e.target.value;
                                                                    setUpdatedData(prev => ({ ...prev, invoice: newItem }));
                                                                    }}
                                                                />
                                                                ) : (
                                                                <p>
                                                                    {item[header] !== null && item[header] !== undefined
                                                                    ? String(item[header])
                                                                    : ''}
                                                                </p>
                                                                )}
                                                            </td>
                                                            ))}
                                                        </tr>
                                                        ))}
                                                </tbody>
                                                </table>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-500">No data available.</p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 flex justify-end space-x-4">
                            {editMode ? (
                                <>
                                    <Button variant="outline" className="bg-white text-purple-600" onClick={() => setEditMode(false)}> Cancel </Button>
                                    <Button className="bg-purple-600 text-white" onClick={handleSave}> Save Changes </Button>
                                </>
                            ) : (
                                <>
                                    <Button variant="outline" className="bg-white text-purple-600" onClick={() => setEditMode(true)}> Edit Document </Button>
                                    <Button className="bg-purple-600 text-white" onClick={handleExportCSV}> Export csv</Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};