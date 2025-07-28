import React from 'react';
import InvoiceDetails from '../Second Page/InvoiceDetails';
import DataDisplay from '../Second Page/DataDisplay';
import { useLocation } from 'react-router-dom';
import { BreadCrumb } from 'primereact/breadcrumb';
// import logo from '../../assets/atQor-Final.png';
import { ScrollPanel } from 'primereact/scrollpanel';

// Update the interface to include 'url'
interface SelectedDocument {
    value: string;
    label: string;
    url: string; // Added url property
}

const DocumentViewerLayout: React.FC = () => {
    const location = useLocation();
    const selectedDocument = (location.state as { selectedDocument?: SelectedDocument })?.selectedDocument || null;

    const breadcrumbItems = [
        { label: 'Home', url: '/' },
        { label: 'Edit' },
    ];

    return (
        <>
            {/* Sticky header */}
            <div className="w-screen flex justify-between items-center mt-2 sticky top-0 bg-white z-10">
                {/* <img src={logo} alt="Logo" className="w-36 h-auto mb-2 ml-6 mt-2" /> */}
                <div className="mr-12">
                    <BreadCrumb model={breadcrumbItems} />
                </div>
            </div>
            <div className="w-full h-px bg-gray-300 my-2" />
            <div className="grid grid-cols-2 gap-8 pt-4">
                <ScrollPanel className="overflow-auto max-h-screen"> {/* Adjust height as needed */}
                    <InvoiceDetails selectedDocument={selectedDocument} onDocumentSelect={() => { }} />
                </ScrollPanel>
                <ScrollPanel className=" max-h-screen"> {/* Adjust height as needed */}
                    <DataDisplay selectedDocument={selectedDocument} />
                </ScrollPanel>
            </div>
        </>
    );
};

export default DocumentViewerLayout;