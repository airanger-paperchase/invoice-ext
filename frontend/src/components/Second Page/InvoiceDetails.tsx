import axios from 'axios';
import React, { useEffect, useState } from 'react';

interface Document {
  label: string;
  value: string;
  url: string;
}

interface InvoiceDetailsProps {
  selectedDocument: Document | null;
  onDocumentSelect: (document: Document) => void; // Adjusted type
}

const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({ selectedDocument, onDocumentSelect }) => {
  const [documents, setDocuments] = useState<Document[]>([]);

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

  const handleDocumentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDoc = documents.find(doc => doc.value === e.target.value);
    if (selectedDoc) {
      onDocumentSelect(selectedDoc);
    }
  };

  return (
    <div className="flex flex-col space-y-6 p-4">
      <div className="flex flex-col mb-6">
        <label className="font-bold text-navyblue mb-1">Select Document</label>
        <select
          title='select'
          className="border border-gray-300 rounded-md p-2 w-full max-w-xs"
          value={selectedDocument?.value || ''}
          onChange={handleDocumentChange}
        >
          <option value="" disabled></option>
          {documents.map(doc => (
            <option key={doc.value} value={doc.value}>{doc.label}</option>
          ))}
        </select>
      </div>

      <div className="border border-gray-300 rounded-md p-4 h-full">
        {selectedDocument ? (
          <iframe
            src={selectedDocument.url}
            width="100%"
            height="1000px"
            frameBorder="1"
            title="Document Viewer"
            allowFullScreen
          ></iframe>
        ) : (
          <p className="text-gray-500">No document selected.</p>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetails;
