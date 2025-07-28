// import './App.css';
// import FrontPage from './components/FrontPage/FrontPage';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import DocumentViewerLayout from './components/Layout/DocumentViewerLayout';
// import Search from './components/Configuration Page/Search';


// function App() {
//   return (
//     <Router>
//       {/* The Routes Component */}
//       <Routes>
//         <Route path="/" element={<FrontPage />} />
//         {/* <Route path="/" element={<Home />} />  */}
//         <Route path="document-viewer/:id" element={<DocumentViewerLayout />} />
//         <Route path="/search" element={<Search />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;




import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPageLayout from './components/Layout/MainPageLayout';
import Search from './components/Configuration Page/Search';
import { Invoices } from './components/Invoices/Invoices';
import { DataDisplayUI } from './components/Invoices/InvoiceAnalytics';
import UploadPage from './components/Upload/UploadPage';
import StoredInvoicesPage from './app/stored-invoices';


function App() {
  return (
    <Router>
      {/* <MainPageLayout /> */}
      {/* Define Routes */}
      <Routes>
        <Route path="/" element={<MainPageLayout />} />
        <Route path="document-viewer/:id" element={< DataDisplayUI />} />
        <Route path="/search" element={<Search />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/ingestion" element={<Search />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/stored-invoices" element={<StoredInvoicesPage />} />


      </Routes>
    </Router>
  );
}

export default App;
