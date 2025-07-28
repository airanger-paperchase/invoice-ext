import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Skeleton } from 'primereact/skeleton';
import { Dropdown } from 'primereact/dropdown';
// import logo from '../../assets/atQor-Final.png';
import Sidebar from '../Navbar/Sidebar';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

interface Document {
    label: string;
    value: string;
    url: string;
    idfScore: number;
    status: string;
}


// Helper function to generate random IDF score
const getRandomIDFScore = (): number => {
    return Math.floor(Math.random() * (100 - 10 + 1)) + 10; // Random value between 10 and 100
};

// Helper function to generate random status
const getRandomStatus = (): string => {
    const statuses = ['Completed', 'Edited', 'Extracted'];
    return statuses[Math.floor(Math.random() * statuses.length)];
};

// Helper function to display badge based on status
const getStatusBadge = (status: string) => {
    switch (status) {
        case 'Completed':
            return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded border border-green-400">Completed</span>;
        case 'Edited':
            return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded border border-yellow-300">Edited</span>;
        case 'Extracted':
            return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded border border-red-400">Extracted</span>;
        default:
            return null;
    }
};

const FrontPage: React.FC = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [filteredDocuments, setFilteredDocuments] = useState<Document[]>(documents);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [filterOption, setFilterOption] = useState<string | null>(null); // Single state for both filter and sort
    const [blur, setBlur] = useState(false);
    const navigate = useNavigate();
    const shouldRefresh = useSelector((state: RootState) => state.documents.shouldRefresh);

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


    const handleDocumentClick = (doc: { label: string; value: string; url: string }) => {
        navigate(`/document-viewer/${doc.value}`, { state: { selectedDocument: doc } });
    };

    const actionBodyTemplate = (rowData: { label: string; value: string; url: string }) => {
        return (
            <Button
                label="Edit"
                text
                raised
                onClick={() => handleDocumentClick(rowData)}
                aria-label="User"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            />
        );
    };

    // Handle filter and sort change
    const onFilterChange = (e: any) => {
        setFilterOption(e.value);
        filterDocuments(e.value);
    };

    // Filter documents based on selected option
    // Filter documents based on selected option
    const filterDocuments = (option: string | null) => {
        let filtered = [...documents]; // Create a copy to avoid mutating state

        if (option === 'Completed' || option === 'Edited' || option === 'Extracted') {
            filtered = filtered.filter(doc => doc.status === option);
        } else if (option === 'Sort Ascending') {
            filtered.sort((a, b) => a.idfScore - b.idfScore);
        } else if (option === 'Sort Descending') {
            filtered.sort((a, b) => b.idfScore - a.idfScore);
        }

        setFilteredDocuments(filtered);
    };


    // Skeleton loader template for when loading is true
    const skeletonLoader = (
        <div className="w-full">
            <DataTable
                value={Array(5).fill({})} // Create an array of 5 empty objects for the skeleton rows
                paginator
                rows={5}
                stripedRows
                className="mt-4"
                tableClassName="min-w-full table-auto"
            >
                <Column header="Document Name" body={() => <Skeleton width="80%" />} />
                <Column header="IDP Score" body={() => <Skeleton width="40%" />} />
                <Column header="Status" body={() => <Skeleton width="30%" />} />
                <Column header="Actions" body={() => <Skeleton width="30%" />} />
            </DataTable>
        </div>
    );

    // Options for the dropdown (combined status and sorting)
    const filterOptions = [
        { label: 'All', value: null },
        { label: 'Completed', value: 'Completed' },
        { label: 'Edited', value: 'Edited' },
        { label: 'Extracted', value: 'Extracted' },
        { label: 'Sort Ascending', value: 'Sort Ascending' },
        { label: 'Sort Descending', value: 'Sort Descending' },
    ];

    return (
        <div className="flex flex-col items-center justify-center bg-white">
            {/* Sidebar */}
            <Sidebar setBlur={setBlur} />
            <div className={`w-full h-full transition-all duration-300 ${blur ? 'filter blur-sm' : ''}`}>
                {/* <div className="flex flex-col items-center justify-center bg-white"> */}
                <header className="w-full py-2 mx-4">
                    <div className="w-screen flex items-start mt-2">
                        {/* <img
                            src={logo}
                            alt="Logo"
                            className="w-36 h-auto mb-2 ml-4" // Add margin right here
                        /> */}
                        {/* <Navbar />  */}
                    </div>
                    <div className="w-full h-px bg-gray-300 my-2" />
                </header>

                <div className="mt-16 ml-72 w-full max-w-5xl">
                    <div className="flex justify-between items-center mb-4">
                        <label className="block font-bold text-navyblue">Explore Documents</label>
                        <Dropdown
                            options={filterOptions}
                            value={filterOptions.find(option => option.value === filterOption)}
                            onChange={onFilterChange}
                            optionLabel="label"
                            placeholder="Filter & Sort"
                            className="w-48"
                        />
                    </div>

                    {loading ? (
                        skeletonLoader
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : filteredDocuments.length === 0 ? (
                        <p>No documents available</p>
                    ) : (
                        <div className="w-full">
                            <DataTable
                                value={filteredDocuments}
                                paginator
                                rows={5}
                                stripedRows
                                className="mt-4"
                                tableClassName="min-w-full table-auto"
                            >
                                <Column field="label" header="Document Name" className="w-1/4" />
                                <Column header="IDF Score" body={(rowData: { idfScore: number }) => `${rowData.idfScore}%`} className="w-1/4" />
                                <Column header="Status" body={(rowData: { status: string }) => getStatusBadge(rowData.status)} className="w-1/4" />
                                <Column body={actionBodyTemplate} header="Actions" className="w-1/4" />
                            </DataTable>

                        </div>
                    )}
                </div>
                {/* </div> */}
            </div>
        </div>
    );
};

export default FrontPage;