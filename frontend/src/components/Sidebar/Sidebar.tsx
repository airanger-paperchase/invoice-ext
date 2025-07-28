import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MenuIcon, XIcon, HomeIcon} from '../Sidebar/SidebarIcons';
import { FileIcon, UploadIcon } from '../Icons';
// import Logo from '../icons/Logo'; // Assuming Logo is an SVG component  
import { UserProfile } from './UserProfile';

export const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 transition-opacity md:hidden z-20"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Toggle Button */}
            <button
                className="fixed top-4 left-4 z-30 md:hidden bg-white p-2 rounded-lg shadow-lg"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <XIcon /> : <MenuIcon />}
            </button>

            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full bg-white shadow-2xl z-30 transition-transform duration-300 ease-in-out w-64 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    } md:translate-x-0 md:static md:h-screen`}
            >
                <div className="p-6">
                    <div className="mb-8">
                        {/* <Logo /> Render the Logo component */}
                    </div>
                    <nav className="space-y-2">
                        <Link
                            to="/"
                            className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-100"
                        >
                            <HomeIcon />
                            <span>Home</span>
                        </Link>
                        <Link
                            to="/stored-invoices"
                            className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-100"
                        >
                            <FileIcon />
                            <span>Stored Invoices</span>
                        </Link>
                        <Link
                            to="/ingestion"
                            className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-100"
                        >
                            <UploadIcon />
                            <span>Ingestion</span>
                        </Link>
                        <Link
                            to="/invoices"
                            className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-100"
                        >
                            <FileIcon />
                            <span>Invoices</span>
                        </Link>


                        {/* <Link
                            to="/analytics"
                            className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-100"
                        >
                            <ChartIcon />
                            <span>Preview</span>
                        </Link> */}

                        {/* <Link
                            to="/settings"
                            className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-100"
                        >
                            <SettingsIcon />
                            <span>Invoice Upload</span>
                        </Link> */}
                    </nav>
                </div>
                <UserProfile />
            </div>
        </>
    );
};
