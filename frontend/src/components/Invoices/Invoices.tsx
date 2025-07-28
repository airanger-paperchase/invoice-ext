import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowDown, ArrowUp, Eye } from 'lucide-react';
import { Sidebar } from '../Sidebar/Sidebar';
import { DataDisplayUI } from './InvoiceAnalytics';
import { useNavigate } from 'react-router-dom';


interface Document {
    label: string;
    value: string;
    url: string;
    idfScore: number;
    status: 'Extracted' | 'Completed' | 'Ingested';
}

const getRandomStatus = (): Document['status'] => {
    const statuses: Document['status'][] = ['Extracted', 'Completed', 'Ingested'];
    return statuses[Math.floor(Math.random() * statuses.length)];
};

const getRandomIDFScore = (): number => Math.random() * 10;

export const Invoices: React.FC = () => {
    const [, setDocuments] = useState<Document[]>([]);
    const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [shouldRefresh] = useState(false);
    const [selectedDocument,] = useState<Document | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBlobs = async () => {
            setLoading(true);
            try {
                const response = await axios.get('/api/list-blobs');
                const blobList = response.data;

                const documentOptions = blobList.map((blobUrl: string) => {
                    const filenameRegex = /\/([^\/]+)\?/;
                    const match = blobUrl.match(filenameRegex);
                    const filename = match && match[1] ? match[1] : 'Unknown';

                    return {
                        label: filename,
                        value: filename,
                        url: blobUrl,
                        idfScore: getRandomIDFScore(),
                        status: getRandomStatus(),
                    };
                });

                setDocuments(documentOptions.reverse());
                setFilteredDocuments(documentOptions.reverse());
            } catch (err) {
                setError('Failed to fetch documents');
            } finally {
                setLoading(false);
            }
        };

        fetchBlobs();
    }, [shouldRefresh]);

    const sortDocuments = () => {
        const sorted = [...filteredDocuments].sort((a, b) => {
            return sortOrder === 'asc' ? a.label.localeCompare(b.label) : b.label.localeCompare(a.label);
        });
        setFilteredDocuments(sorted);
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };
    const handleDocumentClick = (doc: { label: string; value: string; url: string }) => {
        console.table(doc)
        navigate(`/document-viewer/${doc.value}`, { state: { selectedDocument: doc } });
    };

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-lg">
                <Sidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto  [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar-track]:bg-gray-100
  [&::-webkit-scrollbar-thumb]:bg-gray-300
  dark:[&::-webkit-scrollbar-track]:bg-neutral-700
  dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 bg-gradient-to-b from-purple-100 to-blue-100 py-14 px-4 sm:px-6 lg:px-8">


                {selectedDocument ? (
                    <DataDisplayUI />
                ) : loading ? (
                    <div className="flex justify-center items-center">
                        {/* Blue spinner */}
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
                    </div>
                ) : error ? (
                    <div className="text-center text-red-600">{error}</div>
                ) : (
                    <div >
                        <h1 className="text-3xl font-bold text-purple-800 mb-6">Invoices</h1>

                        <div className="bg-white rounded-lg shadow-xl overflow-hidden">

                            <div className="px-4 py-5 sm:px-6 flex justify-between items-center bg-purple-600 text-white">
                                <h2 className="text-xl font-semibold">Fetched Invoices</h2>
                                <button
                                    onClick={sortDocuments}
                                    className="flex items-center space-x-1 bg-white text-purple-600 px-3 py-1 rounded-full text-sm font-medium hover:bg-purple-100 transition-colors"
                                >
                                    <span>Sort by Name</span>
                                    {sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                                </button>
                            </div>
                            <ul className="divide-y divide-gray-200">
                                {filteredDocuments.map((doc) => (
                                    <li key={doc.value} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{doc.label}</div>
                                                {/* <div className="text-sm text-gray-500">IDF Score: {doc.idfScore.toFixed(2)}</div> */}
                                            </div>
                                            <div className="flex items-center space-x-4 ">
                                                {/* Status Badge */}
                                                {/* <div
                                                    className={`text-xs font-semibold px-2 py-1 rounded-full
                                                        ${doc.status === 'Extracted'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : doc.status === 'Completed'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}
                                                >
                                                    {doc.status}
                                                </div> */}

                                                {/* Icons */}
                                                <button
                                                    className="text-gray-400 hover:text-purple-600 transition-colors"
                                                    onClick={() => {
                                                        // console.log(doc);
                                                        handleDocumentClick(doc)
                                                    }}
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                {/* <button className="text-gray-400 hover:text-purple-600 transition-colors">
                                                    <Download size={18} />
                                                </button>
                                                <button className="text-gray-400 hover:text-purple-600 transition-colors">
                                                    <MoreHorizontal size={18} />
                                                </button> */}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};
